import aiohttp
import asyncio
import re
import json
from urllib.parse import urlparse, unquote

class FacebookUIDExtractor:
    def __init__(self, access_token: str = None):
        self.session = None
        self.access_token = access_token
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    # ============================================================
    # PHẦN 1: XỬ LÝ USERNAME LINKS (TỪ CODE 2)
    # ============================================================
    
    async def method_scraping(self, username: str) -> str | None:
        """Scrape từ mbasic - endpoint đơn giản nhất"""
        try:
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Accept-Language": "en-US,en;q=0.9",
            }
            
            # TRY 1: mbasic (best for scraping)
            url = f"https://mbasic.facebook.com/{username}"
            try:
                async with self.session.get(url, headers=headers) as resp:
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
                async with self.session.get(url, headers=headers, allow_redirects=True) as resp:
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
    
    async def method_graph_api(self, username: str) -> str | None:
        """Dùng Facebook Graph API"""
        if not self.access_token:
            # Thử không có token (chỉ work cho Page public)
            url = f"https://graph.facebook.com/v19.0/{username}"
        else:
            url = f"https://graph.facebook.com/v19.0/{username}?access_token={self.access_token}"
        
        try:
            async with self.session.get(url) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    return data.get('id')
                else:
                    return None
        except:
            return None
    
    async def method_lookup_service(self, url: str) -> str | None:
        """Dùng các service công khai"""
        try:
            # Service 1: findids.net API
            lookup_url = f"https://findids.net/api/get?url={url}"
            async with self.session.get(lookup_url, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    if data.get('id'):
                        return str(data['id'])
        except:
            pass
        
        return None
    
    # ============================================================
    # PHẦN 2: XỬ LÝ POST/SHARE LINKS (TỪ CODE 1)
    # ============================================================
    
    def extract_post_id_from_url(self, url: str) -> str | None:
        """Trích xuất post ID từ share link"""
        patterns = [
            r'share/([A-Za-z0-9_-]+)',
            r'posts/([A-Za-z0-9_-]+)',
            r'story\.php\?story_fbid=(\d+)',
            r'fbid=(\d+)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        return None
    
    async def get_uid_from_post_web(self, post_url: str) -> str | None:
        """Scrape từ web version của post"""
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml',
            }
            
            async with self.session.get(post_url, headers=headers, allow_redirects=True, timeout=15) as resp:
                html = await resp.text()
                
                # Tìm JSON-LD data
                json_ld_pattern = r'<script type="application/ld\+json">(.*?)</script>'
                matches = re.findall(json_ld_pattern, html, re.DOTALL)
                
                for match in matches:
                    try:
                        data = json.loads(match)
                        if 'author' in data and 'identifier' in data['author']:
                            return str(data['author']['identifier'])
                    except:
                        pass
                
                # Tìm trong meta tags
                meta_patterns = [
                    r'<meta property="al:android:url" content="fb://profile/(\d{10,})"',
                    r'<meta property="al:ios:url" content="fb://profile/(\d{10,})"',
                    r'<meta property="fb:app_id".*?content="(\d+)"',
                ]
                
                for pattern in meta_patterns:
                    match = re.search(pattern, html)
                    if match:
                        return match.group(1)
        
        except:
            pass
        
        return None
    
    async def get_uid_from_post_mobile(self, post_url: str) -> str | None:
        """Scrape từ mobile version của post"""
        try:
            # Chuyển sang mobile URL
            mobile_url = post_url.replace("www.facebook.com", "m.facebook.com")
            
            headers = {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
                'Accept': 'text/html,application/xhtml+xml',
                'Accept-Language': 'vi-VN,vi;q=0.9',
            }
            
            async with self.session.get(mobile_url, headers=headers, allow_redirects=True, timeout=15) as resp:
                final_url = str(resp.url)
                html = await resp.text()
                
                # Tìm trong URL
                patterns_url = [
                    r'profile\.php\?id=(\d{10,})',
                    r'/(\d{10,})/?$',
                    r'story_fbid=(\d+)&id=(\d{10,})',
                ]
                
                for pattern in patterns_url:
                    match = re.search(pattern, final_url)
                    if match:
                        for group in match.groups():
                            if group and len(group) >= 10:
                                return group
                
                # Tìm trong HTML
                patterns_html = [
                    r'"actorID":"(\d{10,})"',
                    r'"userID":"(\d{10,})"',
                    r'owner_id=(\d{10,})',
                ]
                
                for pattern in patterns_html:
                    matches = re.findall(pattern, html, re.DOTALL)
                    for match in matches:
                        if isinstance(match, tuple):
                            for item in match:
                                if item and len(item) >= 10:
                                    return item
                        elif match and len(match) >= 10:
                            return match
        
        except Exception as e:
            pass
        
        return None
    
    # ============================================================
    # HÀM CHÍNH - KẾT HỢP TẤT CẢ
    # ============================================================
    
    async def get_facebook_uid(self, url: str) -> dict:
        """
        Lấy UID từ mọi loại link Facebook
        Kết hợp cả 2 phương pháp từ code 1 và code 2
        """
        try:
            url = url.strip()
            
            # Xử lý URL có text thừa
            if "link pc" in url.lower() or "link mobile" in url.lower():
                match = re.search(r'(https?://[^\s]+)', url)
                if match:
                    url = match.group(0)
            
            if not url.startswith(('http://', 'https://')):
                url = 'https://' + url
            
            print(f"📱 Đang xử lý: {url}")
            
            # ============================================
            # BƯỚC 1: KIỂM TRA ID TRỰC TIẾP TRONG URL
            # ============================================
            
            direct_patterns = [
                r'profile\.php\?id=(\d{10,})',
                r'[\?&]id=(\d{10,})',
                r'facebook\.com/(\d{10,})/?$',
                r'fb\.com/(\d{10,})/?$',
                r'people/[^/]+/(\d{10,})',
            ]
            
            for pattern in direct_patterns:
                match = re.search(pattern, url, re.IGNORECASE)
                if match:
                    return {
                        'uid': match.group(1),
                        'method': 'direct_url_id',
                        'success': True,
                        'url': url
                    }
            
            # ============================================
            # BƯỚC 2: KIỂM TRA POST/SHARE LINKS (CODE 1)
            # ============================================
            
            post_id = self.extract_post_id_from_url(url)
            if post_id:
                print(f"🔍 Phát hiện post/share link: {post_id}")
                
                # Thử các phương pháp cho post
                methods = [
                    ('web_scrape', self.get_uid_from_post_web),
                    ('mobile_scrape', self.get_uid_from_post_mobile),
                ]
                
                for method_name, method_func in methods:
                    print(f"  🔄 Thử {method_name}...")
                    uid = await method_func(url)
                    if uid:
                        return {
                            'uid': uid,
                            'method': method_name,
                            'post_id': post_id,
                            'success': True,
                            'url': url
                        }
                    print(f"  ❌ {method_name} thất bại")
            
            # ============================================
            # BƯỚC 3: KIỂM TRA USERNAME LINKS (CODE 2)
            # ============================================
            
            username_match = re.search(r'facebook\.com/([^/?&]+)', url, re.IGNORECASE)
            if username_match:
                username = username_match.group(1)
                
                # Bỏ qua các path không phải username
                if username in ['profile.php', 'pages', 'groups', 'events', 'marketplace', 'watch', 'share']:
                    return {
                        'uid': None,
                        'error': 'URL không phải profile username',
                        'success': False,
                        'url': url
                    }
                
                print(f"🔍 Phát hiện username: {username}")
                
                # Thử các phương pháp cho username
                methods = [
                    ('graph_api', self.method_graph_api),
                    ('scraping', self.method_scraping),
                    ('lookup_service', self.method_lookup_service),
                ]
                
                for method_name, method_func in methods:
                    print(f"  🔄 Thử {method_name}...")
                    
                    if method_name == 'lookup_service':
                        uid = await method_func(url)
                    else:
                        uid = await method_func(username)
                    
                    if uid:
                        return {
                            'uid': uid,
                            'method': method_name,
                            'username': username,
                            'success': True,
                            'url': url
                        }
                    print(f"  ❌ {method_name} thất bại")
            
            # ============================================
            # BƯỚC 4: PHÂN TÍCH CHUNG
            # ============================================
            
            try:
                headers = {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                }
                
                async with self.session.get(url, headers=headers, allow_redirects=True, timeout=15) as resp:
                    final_url = str(resp.url)
                    html = await resp.text()
                    
                    # Tìm ID trong final URL
                    for pattern in direct_patterns:
                        match = re.search(pattern, final_url, re.IGNORECASE)
                        if match:
                            return {
                                'uid': match.group(1),
                                'method': 'final_url_id',
                                'success': True,
                                'url': url
                            }
                    
                    # Tìm trong HTML
                    html_patterns = [
                        r'"userID":"(\d{10,})"',
                        r'"actorID":"(\d{10,})"',
                        r'"pageID":"(\d{10,})"',
                        r'fb://profile/(\d{10,})',
                        r'owner_id=(\d{10,})',
                        r'entity_id=(\d{10,})',
                    ]
                    
                    for pattern in html_patterns:
                        match = re.search(pattern, html)
                        if match:
                            return {
                                'uid': match.group(1),
                                'method': 'html_parse',
                                'success': True,
                                'url': url
                            }
            except:
                pass
            
            return {
                'uid': None,
                'error': 'Không thể xác định loại URL hoặc không lấy được UID',
                'success': False,
                'url': url
            }
            
        except Exception as e:
            return {
                'uid': None,
                'error': f'Lỗi hệ thống: {str(e)}',
                'success': False,
                'url': url if 'url' in locals() else 'unknown'
            }

# ============================================================
# CLI INTERFACE
# ============================================================

async def main():
    print("=" * 80)
    print("FACEBOOK UID EXTRACTOR - COMBINED VERSION")
    print("=" * 80)
    print("\nHỗ trợ TẤT CẢ loại link:")
    print("  ✅ Share links: facebook.com/share/xxxxx/")
    print("  ✅ Post links: facebook.com/posts/xxxxx/")
    print("  ✅ Usernames: facebook.com/username")
    print("  ✅ Profile IDs: profile.php?id=xxxx")
    print("  ✅ Mobile links: m.facebook.com/...")
    print("  ✅ Với text: link pc https://facebook.com/...")
    print()
    
    access_token = None
    use_token = input("🤖 Bạn có muốn dùng Graph API token không? (y/n): ").lower()
    
    if use_token == 'y':
        token = input("🔑 Nhập access token: ").strip()
        if token:
            access_token = token
            print("✅ Token đã lưu!")
    
    print("\n" + "=" * 80)
    
    async with FacebookUIDExtractor(access_token) as extractor:
        while True:
            print("\n" + "=" * 80)
            user_input = input("🔗 Nhập link Facebook (hoặc 'exit' để thoát): ").strip()
            
            if user_input.lower() in ['exit', 'quit', 'q']:
                print("👋 Thoát!")
                break
            
            if not user_input:
                continue
            
            print("\n🔄 Đang xử lý...")
            result = await extractor.get_facebook_uid(user_input)
            
            print("\n" + "=" * 80)
            print("📊 KẾT QUẢ:")
            print("=" * 80)
            
            if result['success']:
                print(f"✅ THÀNH CÔNG!")
                print(f"   🆔 UID: {result['uid']}")
                print(f"   📝 Phương pháp: {result['method']}")
                print(f"   🔗 Link gốc: {result['url'][:80]}...")
                
                if 'post_id' in result:
                    print(f"   📄 Post/Share ID: {result['post_id']}")
                if 'username' in result:
                    print(f"   📛 Username: {result['username']}")
                
                print(f"\n   🔗 Profile link: https://facebook.com/{result['uid']}")
                
                # Kiểm tra loại ID
                if result['uid'].startswith('615'):
                    print(f"   ℹ️  Đây là Page ID (bắt đầu bằng 615)")
                elif len(result['uid']) >= 15:
                    print(f"   ℹ️  Đây có thể là Page ID (độ dài {len(result['uid'])})")
                else:
                    print(f"   ℹ️  Đây là User ID (độ dài {len(result['uid'])})")
                    
            else:
                print(f"❌ THẤT BẠI")
                print(f"   Link: {result['url'][:80]}...")
                print(f"   Lỗi: {result.get('error', 'Không xác định')}")
                
                print(f"\n💡 GỢI Ý KHẮC PHỤC:")
                print(f"   1. Kiểm tra link có đúng không")
                print(f"   2. Đảm bảo post/profile là public")
                print(f"   3. Thử link mobile version: m.facebook.com/...")
                print(f"   4. Dùng Graph API token để tăng tỉ lệ thành công")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\n🔴 Đã dừng!")
    except Exception as e:
        print(f"\n❌ Lỗi hệ thống: {e}")