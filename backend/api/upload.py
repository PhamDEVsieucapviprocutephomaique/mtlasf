from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
from core.ftp_client import FTPClient

router = APIRouter()

@router.post("/")
async def upload_image(file: UploadFile = File(...)):
    """Upload một ảnh lên FTP server"""
    if not file.content_type.startswith('image/'):
        raise HTTPException(400, "Chỉ chấp nhận file ảnh")
    
    try:
        ftp_client = FTPClient()
        image_url = await ftp_client.upload_image(file)
        
        return {
            "success": True, 
            "url": image_url,
            "filename": image_url.split("/")[-1]
        }
    except Exception as e:
        raise HTTPException(500, f"Upload thất bại: {str(e)}")


@router.post("/multiple")
async def upload_multiple_images(files: List[UploadFile] = File(...)):
    """Upload nhiều ảnh cùng lúc lên FTP server"""
    if not files:
        raise HTTPException(400, "Vui lòng chọn ít nhất 1 ảnh")
    
    # Giới hạn số lượng ảnh
    if len(files) > 10:
        raise HTTPException(400, "Chỉ được upload tối đa 10 ảnh")
    
    uploaded_urls = []
    errors = []
    
    ftp_client = FTPClient()
    
    for file in files:
        if not file.content_type.startswith('image/'):
            errors.append(f"{file.filename}: Không phải file ảnh")
            continue
        
        try:
            image_url = await ftp_client.upload_image(file)
            uploaded_urls.append({
                "filename": file.filename,
                "url": image_url
            })
        except Exception as e:
            errors.append(f"{file.filename}: {str(e)}")
    
    return {
        "success": len(uploaded_urls) > 0,
        "uploaded": uploaded_urls,
        "total_uploaded": len(uploaded_urls),
        "errors": errors if errors else None
    }