from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
import uuid
import ftplib
from PIL import Image
import io

router = APIRouter()


class FTPClient:
    """Client để upload ảnh lên FTP server (HARDCODE - KHÔNG DÙNG .ENV)"""
    
    def __init__(self):
        self.host = "202.92.5.48"
        self.port = 21
        self.username = "rvcavnufhosting_uploadanh"
        self.password = "123456aA@"
        self.ftp_upload_dir = "/"
        self.web_access_url = "http://image.checkgdtg.vn/"
    
    async def optimize_image(self, file: UploadFile) -> tuple[bytes, str]:
        """Tối ưu ảnh: resize + compress + convert WebP"""
        try:
            image_data = await file.read()
            image = Image.open(io.BytesIO(image_data))
            
            # Xoay ảnh đúng hướng nếu có EXIF
            from PIL import ImageOps
            image = ImageOps.exif_transpose(image)
            
            # Resize nếu ảnh quá lớn (max 1200px)
            max_size = 1200
            if max(image.size) > max_size:
                image.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
            
            # Convert sang WebP và compress
            output = io.BytesIO()
            image.save(output, format='WEBP', quality=80, optimize=True)
            
            return output.getvalue(), 'webp'
            
        except Exception as e:
            print(f"⚠️ Image optimization error: {e}")
            await file.seek(0)
            return await file.read(), file.filename.split('.')[-1]
    
    async def upload_image(self, file: UploadFile) -> str:
        """Upload ảnh lên FTP server"""
        try:
            print("🖼️ Optimizing image...")
            optimized_data, ext = await self.optimize_image(file)
            
            print("📡 Connecting to FTP...")
            ftp = ftplib.FTP()
            ftp.connect(self.host, self.port)
            ftp.login(self.username, self.password)
            ftp.cwd(self.ftp_upload_dir)
            
            # Tạo tên file unique
            filename = f"scam_{uuid.uuid4()}.{ext}"
            print(f"⬆️ Uploading optimized image: {filename}")
            
            # Upload
            bio = io.BytesIO(optimized_data)
            ftp.storbinary(f"STOR {filename}", bio)
            ftp.quit()
            
            image_url = f"{self.web_access_url}{filename}"
            print(f"✅ Upload successful: {image_url}")
            return image_url
            
        except Exception as e:
            print(f"❌ FTP Upload error: {e}")
            raise e


@router.post("/single")
async def upload_single_image(file: UploadFile = File(...)):
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