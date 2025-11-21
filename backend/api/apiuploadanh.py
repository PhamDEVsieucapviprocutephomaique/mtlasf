from fastapi import APIRouter, UploadFile, File, HTTPException
from google.oauth2 import service_account
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
import requests
import os

router = APIRouter()

# Đường dẫn đến file service-account-key.json
SERVICE_ACCOUNT_FILE = os.path.join(os.path.dirname(__file__), '..', 'service-account-key.json')
SCOPES = ['https://www.googleapis.com/auth/photoslibrary']

def get_photos_service():
    try:
        credentials = service_account.Credentials.from_service_account_file(
            SERVICE_ACCOUNT_FILE, scopes=SCOPES
        )
        
        # Refresh token nếu cần
        if not credentials.valid:
            credentials.refresh(Request())
            
        service = build('photoslibrary', 'v1', credentials=credentials, static_discovery=False)
        return service, credentials
    except Exception as e:
        print(f"❌ Lỗi xác thực: {e}")
        return None, None

@router.post("/upload")
async def upload_image(image: UploadFile = File(...)):
    try:
        print(f"📨 Nhận file: {image.filename}, type: {image.content_type}")
        
        # Đọc file
        image_data = await image.read()
        print(f"📏 File size: {len(image_data)} bytes")
        
        # Lấy service
        service, credentials = get_photos_service()
        if not service:
            raise HTTPException(status_code=500, detail="Không thể xác thực với Google")
        
        print("🔑 Đã xác thực với Google")
        print(f"📧 Service Account: {credentials.service_account_email}")
        
        # Upload để lấy token
        upload_url = 'https://photoslibrary.googleapis.com/v1/uploads'
        headers = {
            'Authorization': f'Bearer {credentials.token}',
            'Content-Type': 'application/octet-stream',
            'X-Goog-Upload-Content-Type': image.content_type,
            'X-Goog-Upload-Protocol': 'raw',
        }
        
        print("⬆️ Đang upload ảnh lên Google...")
        upload_response = requests.post(upload_url, headers=headers, data=image_data)
        
        print(f"📤 Upload response: {upload_response.status_code}")
        if upload_response.status_code != 200:
            error_detail = f"Upload failed: {upload_response.status_code} - {upload_response.text}"
            print(f"❌ {error_detail}")
            raise HTTPException(status_code=500, detail=error_detail)
        
        upload_token = upload_response.text
        print(f"✅ Upload token: {upload_token[:50]}...")
        
        # Tạo media item
        media_item_body = {
            'newMediaItems': [{
                'description': image.filename,
                'simpleMediaItem': {'uploadToken': upload_token}
            }]
        }
        
        print("🖼️ Đang tạo media item...")
        media_response = service.mediaItems().batchCreate(body=media_item_body).execute()
        
        if 'newMediaItemResults' not in media_response:
            raise HTTPException(status_code=500, detail="Media creation failed")
        
        media_item = media_response['newMediaItemResults'][0]['mediaItem']
        print(f"🎉 Upload thành công: {media_item['filename']}")
        
        return {
            "success": True,
            "imageUrl": media_item['baseUrl'],
            "productUrl": media_item['productUrl'],
            "filename": image.filename
        }
        
    except Exception as e:
        print(f"💥 Lỗi tổng: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))