import aiohttp
import asyncio
import re
import json
from urllib.parse import urlparse, unquote

# ============================================================
# PHƯƠNG PHÁP 1: SCRAPING (KHÔNG CẦN API KEY)
# Ưu: Free, không cần setup
# Nhược: Dễ bị block, không stable
# ============================================================

async def method_scraping(username: str) -> str | None:
    """Scrape từ mbasic - endpoint đơn giản nhất"""
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept-Language": "en-US,en;q=0.9",
        }
        
        connector = aiohttp.TCPConnector(ssl=False, limit=10)
        timeout = aiohttp.ClientTimeout(total=15)
        
        async with aiohttp.ClientSession(connector=connector, timeout=timeout) as session:
            
            # TRY 1: mbasic (best for scraping)
            url = f"https://mbasic.facebook.com/{username}"
            try:
                async with session.get(url, headers=headers) as resp:
                    if resp.status == 200:
                        html = await resp.text()
                        
                        patterns = [
                            r'profile\.php\?id=(\d{10,})',
                            r'owner_id=(\d{10,})',
                            r'entity_id=(\d{10,})',
                            r'profile_id=(\d{10,})',
                            r'/save/confirm/\?id=(\d{10,})',
                        ]
                        
                        for pattern in patterns:
                            match = re.search(pattern, html)
                            if match:
                                uid = match.group(1)
                                if int(uid) > 100000000:
                                    return uid
            except:
                pass
            
            # TRY 2: mobile redirect
            url = f"https://m.facebook.com/{username}"
            try:
                async with session.get(url, headers=headers, allow_redirects=True) as resp:
                    final_url = str(resp.url)
                    match = re.search(r'profile\.php\?id=(\d{10,})', final_url)
                    if match:
                        return match.group(1)
                    
                    if resp.status == 200:
                        html = await resp.text()
                        patterns = [
                            r'"userID":"(\d{10,})"',
                            r'"pageID":"(\d{10,})"',
                            r'fb://profile/(\d{10,})',
                            r'fb://page/(\d{10,})',
                        ]
                        
                        for pattern in patterns:
                            match = re.search(pattern, html)
                            if match:
                                return match.group(1)
            except:
                pass
        
        return None
    except:
        return None

# ============================================================
# PHƯƠNG PHÁP 2: GRAPH API (CẦN ACCESS TOKEN)
# Ưu: Stable, chính thức, reliable
# Nhược: Cần setup app, có rate limit
# ============================================================

async def method_graph_api(username: str, access_token: str = None) -> str | None:
    """
    Dùng Facebook Graph API
    
    CÁCH LẤY ACCESS TOKEN (FREE):
    1. Vào https://developers.facebook.com/
    2. Tạo app mới (chọn "Other" > "Business")
    3. Vào Tools > Graph API Explorer
    4. Chọn app vừa tạo
    5. Copy "Access Token"
    
    Note: Token này hết hạn sau vài giờ
    Muốn token lâu dài cần extend token hoặc dùng app token
    """
    
    if not access_token:
        # Thử không có token (chỉ work cho Page public)
        url = f"https://graph.facebook.com/v19.0/{username}"
    else:
        url = f"https://graph.facebook.com/v19.0/{username}?access_token={access_token}"
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    return data.get('id')
                else:
                    error = await resp.json()
                    return None
    except:
        return None

# ============================================================
# PHƯƠNG PHÁP 3: LOOKUP SERVICE API (DỰ PHÒNG)
# Ưu: Không cần setup, có thể work
# Nhược: Dựa vào dịch vụ third-party
# ============================================================

async def method_lookup_service(url: str) -> str | None:
    """
    Dùng các service công khai (findmyfbid.com API)
    Note: Không chính thức, có thể ngừng hoạt động bất cứ lúc nào
    """
    try:
        # Service 1: findids.net API
        async with aiohttp.ClientSession() as session:
            lookup_url = f"https://findids.net/api/get?url={url}"
            async with session.get(lookup_url, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    if data.get('id'):
                        return str(data['id'])
    except:
        pass
    
    return None

# ============================================================
# HÀM CHÍNH - KẾT HỢP TẤT CẢ PHƯƠNG PHÁP
# ============================================================

async def get_facebook_uid(url: str, access_token: str = None) -> dict:
    """
    Kết hợp nhiều phương pháp để tăng success rate
    
    Returns:
        {
            'uid': str hoặc None,
            'method': tên phương pháp thành công,
            'success': bool
        }
    """
    
    url = url.strip()
    
    # Parse URL
    if not url.startswith(('http://', 'https://')):
        url = 'https://' + url
    
    # Extract UID trực tiếp từ URL
    direct_patterns = [
        r'profile\.php\?id=(\d{10,})',
        r'[\?&]id=(\d{10,})',
        r'facebook\.com/(\d{10,})/?',
        r'people/[^/]+/(\d{10,})',
    ]
    
    for pattern in direct_patterns:
        match = re.search(pattern, url, re.IGNORECASE)
        if match:
            return {
                'uid': match.group(1),
                'method': 'url_parse',
                'success': True
            }
    
    # Extract username
    username_match = re.search(r'facebook\.com/([^/?&]+)', url, re.IGNORECASE)
    if not username_match:
        return {'uid': None, 'method': None, 'success': False}
    
    username = username_match.group(1)
    
    # Skip các path đặc biệt
    if username in ['profile.php', 'groups', 'events', 'watch', 'pages']:
        return {'uid': None, 'method': None, 'success': False}
    
    # Thử các phương pháp theo thứ tự
    
    # 1. Graph API (nếu có token) - Ưu tiên vì stable nhất
    if access_token:
        print(" Trying Graph API...", end=' ', flush=True)
        uid = await method_graph_api(username, access_token)
        if uid:
            return {'uid': uid, 'method': 'graph_api', 'success': True}
        print("❌")
    
    # 2. Scraping
    print("Trying scraping...", end=' ', flush=True)
    uid = await method_scraping(username)
    if uid:
        print("✅")
        return {'uid': uid, 'method': 'scraping', 'success': True}
    print("❌")
    
    # 3. Lookup service (backup)
    print("🔍 Trying lookup service...", end=' ', flush=True)
    uid = await method_lookup_service(url)
    if uid:
        print("✅")
        return {'uid': uid, 'method': 'lookup_service', 'success': True}
    print("❌")
    
    return {'uid': None, 'method': None, 'success': False}

# ============================================================
# CLI INTERFACE
# ============================================================

async def main():
    print("=" * 70)
    print("FACEBOOK UID EXTRACTOR - MULTI-METHOD")
    print("=" * 70)
    print("\n HƯỚNG DẪN:")
    print("   • Nhập link Facebook (profile hoặc page)")
    print("   • Gõ 'token' để nhập Graph API token (tăng success rate)")
    print("   • Gõ 'help' để xem cách lấy token")
    print("   • Gõ 'exit' để thoát\n")
    
    access_token = None
    
    while True:
        user_input = input(">>> ").strip()
        
        if user_input.lower() in ['exit', 'quit', 'q']:
            print("\n Bye!")
            break
        
        if user_input.lower() == 'token':
            token = input("Nhập access token: ").strip()
            if token:
                access_token = token
                print(" Token đã lưu!\n")
            continue
        
        if user_input.lower() == 'help':
            print("\n" + "=" * 70)
            print("CÁCH LẤY FACEBOOK GRAPH API TOKEN (MIỄN PHÍ):")
            print("=" * 70)
            print("1. Vào: https://developers.facebook.com/")
            print("2. Đăng nhập > My Apps > Create App")
            print("3. Chọn 'Other' > 'Business' > Đặt tên app")
            print("4. Vào Tools > Graph API Explorer")
            print("5. Chọn app vừa tạo ở dropdown")
            print("6. Copy 'Access Token' và paste vào đây")
            print("\n Token này:")
            print("   • MIỄN PHÍ 100%")
            print("   • Hết hạn sau 1-2 giờ (có thể extend)")
            print("   • Rate limit: ~200 requests/hour")
            print("   • Chỉ lấy được public info\n")
            continue
        
        if not user_input:
            continue
        
        print()
        result = await get_facebook_uid(user_input, access_token)
        
        if result['success']:
            print(f"\nTHÀNH CÔNG!")
            print(f"   UID: {result['uid']}")
            print(f"   Method: {result['method']}")
            print(f"   Profile: https://facebook.com/{result['uid']}")
            
            if result['method'] == 'graph_api':
                print(f"    Dùng Graph API - Độ chính xác cao!")
            elif result['method'] == 'scraping':
                print(f"   ⚠️  Dùng scraping - Có thể bị block nếu spam")
            
        else:
            print(f"\n KHÔNG TÌM THẤY UID")
            print(f"\n Gợi ý:")
            print(f"   • Link có thể sai hoặc bị private")
            print(f"   • Thử dùng Graph API token (gõ 'token')")
            print(f"   • Facebook có thể đang block IP của bạn")
            print(f"   • Thử link khác (mobile/desktop version)")
        
        print()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\n  Đã dừng!")
    except Exception as e:
        print(f"\n Lỗi: {e}")