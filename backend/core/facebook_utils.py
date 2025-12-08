import asyncio
import aiohttp
import re
from typing import Optional

# Import FacebookUIDExtractor từ xxxx.py
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from xxxx import FacebookUIDExtractor



async def normalize_facebook_link(url: Optional[str]) -> Optional[str]:
    """
    Chuẩn hóa link Facebook về dạng https://facebook.com/{UID}
    
    Args:
        url: Link Facebook bất kỳ (share, post, username, profile.php?id=...)
        
    Returns:
        - https://facebook.com/{UID} nếu tìm được UID
        - Link gốc nếu không tìm được UID
        - None nếu input là None hoặc rỗng
    """
    if not url:
        return url
    
    url = url.strip()
    
    # Nếu không phải link Facebook, return nguyên
    if not any(domain in url.lower() for domain in ['facebook.com', 'fb.com', 'fb.me']):
        return url
    
    try:
        # Sử dụng FacebookUIDExtractor để lấy UID
        async with FacebookUIDExtractor() as extractor:
            result = await extractor.get_facebook_uid(url)
            
            if result['success'] and result['uid']:
                # Trả về link chuẩn
                normalized = f"https://facebook.com/{result['uid']}"
                print(f"✅ Normalized FB link: {url[:50]}... → {normalized}")
                return normalized
            else:
                # Không tìm được UID, giữ nguyên
                print(f"⚠️ Cannot normalize FB link, keep original: {url[:50]}...")
                return url
                
    except Exception as e:
        print(f"❌ Error normalizing FB link: {e}")
        # Lỗi thì giữ nguyên link gốc
        return url


def is_facebook_link(url: Optional[str]) -> bool:
    """Kiểm tra xem có phải link Facebook không"""
    if not url:
        return False
    return any(domain in url.lower() for domain in ['facebook.com', 'fb.com', 'fb.me'])


# Helper function đồng bộ (wrapper cho async)
def normalize_facebook_link_sync(url: Optional[str]) -> Optional[str]:
    """
    Version đồng bộ của normalize_facebook_link
    Dùng cho trường hợp không thể dùng async
    """
    if not url or not is_facebook_link(url):
        return url
    
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            # Nếu loop đang chạy, tạo task mới
            return asyncio.ensure_future(normalize_facebook_link(url))
        else:
            # Nếu không có loop, chạy bình thường
            return loop.run_until_complete(normalize_facebook_link(url))
    except Exception as e:
        print(f"❌ Sync normalize error: {e}")
        return url