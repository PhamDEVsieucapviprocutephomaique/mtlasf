import aiohttp
import asyncio
import re
import json

_cache = {}
_uid_cache = {}

class FacebookUIDExtractor:
    def __init__(self, proxy_list=None):
        self.session = None
        self.proxy_list = proxy_list or []
        self.current_proxy_index = 0
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    def get_next_proxy(self):
        if not self.proxy_list:
            return None
        proxy = self.proxy_list[self.current_proxy_index]
        self.current_proxy_index = (self.current_proxy_index + 1) % len(self.proxy_list)
        return proxy
    
    async def get_uid_from_post_web(self, post_url: str):
        try:
            proxy = self.get_next_proxy()
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            }
            
            async with self.session.get(post_url, headers=headers, proxy=proxy, 
                                      allow_redirects=True, timeout=30) as resp:
                html = await resp.text()
                
                json_ld_pattern = r'<script type="application/ld\+json">(.*?)</script>'
                matches = re.findall(json_ld_pattern, html, re.DOTALL)
                
                for match in matches:
                    try:
                        data = json.loads(match)
                        if 'author' in data and 'identifier' in data['author']:
                            return str(data['author']['identifier'])
                    except:
                        pass
                
                meta_patterns = [
                    r'<meta property="al:android:url" content="fb://profile/(\d{10,})"',
                    r'<meta property="al:ios:url" content="fb://profile/(\d{10,})"',
                ]
                
                for pattern in meta_patterns:
                    match = re.search(pattern, html)
                    if match:
                        return match.group(1)
        except:
            pass
        return None
    
    async def get_uid_from_post_mobile(self, post_url: str):
        try:
            proxy = self.get_next_proxy()
            mobile_url = post_url.replace("www.facebook.com", "m.facebook.com")
            
            headers = {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
            }
            
            async with self.session.get(mobile_url, headers=headers, proxy=proxy,
                                      allow_redirects=True, timeout=30) as resp:
                final_url = str(resp.url)
                html = await resp.text()
                
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
        except:
            pass
        return None
    
    async def get_uid_from_username_mbasic(self, username: str):
        try:
            proxy = self.get_next_proxy()
            url = f"https://mbasic.facebook.com/{username}"
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            }
            
            async with self.session.get(url, headers=headers, proxy=proxy, timeout=30) as resp:
                if resp.status == 200:
                    html = await resp.text()
                    
                    patterns = [
                        r'profile\.php\?id=(\d{10,})',
                        r'owner_id=(\d{10,})',
                        r'entity_id=(\d{10,})',
                        r'profile_id=(\d{10,})',
                    ]
                    
                    for pattern in patterns:
                        match = re.search(pattern, html)
                        if match:
                            uid = match.group(1)
                            if int(uid) > 100000000:
                                return uid
        except:
            pass
        return None
    
    def _save_to_cache(self, url: str, result: dict):
        if result.get('success') and result.get('uid'):
            uid = result['uid']
            _cache[url] = result
            _uid_cache[uid] = result
    
    async def get_facebook_uid(self, url: str):
        if url in _cache:
            return _cache[url]
        
        try:
            url = url.strip()
            if not url.startswith(('http://', 'https://')):
                url = 'https://' + url
            
            # Check direct URL patterns
            direct_patterns = [
                r'profile\.php\?id=(\d{10,})',
                r'[\?&]id=(\d{10,})',
                r'facebook\.com/(\d{10,})/?$',
                r'fb\.com/(\d{10,})/?$',
            ]
            
            for pattern in direct_patterns:
                match = re.search(pattern, url, re.IGNORECASE)
                if match:
                    uid = match.group(1)
                    if uid in _uid_cache:
                        result = _uid_cache[uid].copy()
                        result['url'] = url
                        _cache[url] = result
                        return result
                    
                    result = {
                        'uid': uid,
                        'method': 'direct_url_id',
                        'success': True,
                        'url': url
                    }
                    self._save_to_cache(url, result)
                    return result
            
            # Check post/share links
            post_patterns = [
                r'share/([A-Za-z0-9_-]+)',
                r'posts/([A-Za-z0-9_-]+)',
                r'story\.php\?story_fbid=(\d+)',
                r'fbid=(\d+)',
            ]
            
            is_post_link = False
            for pattern in post_patterns:
                if re.search(pattern, url):
                    is_post_link = True
                    break
            
            if is_post_link:
                methods = [
                    self.get_uid_from_post_web,
                    self.get_uid_from_post_mobile,
                ]
                
                for method_func in methods:
                    uid = await method_func(url)
                    if uid:
                        if uid in _uid_cache:
                            result = _uid_cache[uid].copy()
                            result['url'] = url
                            _cache[url] = result
                            return result
                        
                        result = {
                            'uid': uid,
                            'method': 'post_scrape',
                            'success': True,
                            'url': url
                        }
                        self._save_to_cache(url, result)
                        return result
            
            # Check username links
            username_match = re.search(r'facebook\.com/([^/?&]+)', url, re.IGNORECASE)
            if username_match:
                username = username_match.group(1)
                
                if username in ['profile.php', 'pages', 'groups', 'events', 'marketplace', 'watch', 'share']:
                    return {
                        'uid': None,
                        'error': 'URL không phải profile',
                        'success': False,
                        'url': url
                    }
                
                uid = await self.get_uid_from_username_mbasic(username)
                if uid:
                    if uid in _uid_cache:
                        result = _uid_cache[uid].copy()
                        result['url'] = url
                        result['username'] = username
                        _cache[url] = result
                        return result
                    
                    result = {
                        'uid': uid,
                        'method': 'username_scrape',
                        'username': username,
                        'success': True,
                        'url': url
                    }
                    self._save_to_cache(url, result)
                    return result
            
            # Final fallback
            try:
                proxy = self.get_next_proxy()
                headers = {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                }
                
                async with self.session.get(url, headers=headers, proxy=proxy,
                                          allow_redirects=True, timeout=30) as resp:
                    final_url = str(resp.url)
                    html = await resp.text()
                    
                    for pattern in direct_patterns:
                        match = re.search(pattern, final_url, re.IGNORECASE)
                        if match:
                            uid = match.group(1)
                            if uid in _uid_cache:
                                result = _uid_cache[uid].copy()
                                result['url'] = url
                                _cache[url] = result
                                return result
                            
                            result = {
                                'uid': uid,
                                'method': 'final_url_id',
                                'success': True,
                                'url': url
                            }
                            self._save_to_cache(url, result)
                            return result
                    
                    html_patterns = [
                        r'"userID":"(\d{10,})"',
                        r'"actorID":"(\d{10,})"',
                        r'"pageID":"(\d{10,})"',
                        r'fb://profile/(\d{10,})',
                        r'owner_id=(\d{10,})',
                    ]
                    
                    for pattern in html_patterns:
                        match = re.search(pattern, html)
                        if match:
                            uid = match.group(1)
                            if uid in _uid_cache:
                                result = _uid_cache[uid].copy()
                                result['url'] = url
                                _cache[url] = result
                                return result
                            
                            result = {
                                'uid': uid,
                                'method': 'html_parse',
                                'success': True,
                                'url': url
                            }
                            self._save_to_cache(url, result)
                            return result
            except:
                pass
            
            return {
                'uid': None,
                'error': 'Không tìm thấy UID',
                'success': False,
                'url': url
            }
            
        except Exception as e:
            return {
                'uid': None,
                'error': f'Lỗi: {str(e)}',
                'success': False,
                'url': url if 'url' in locals() else 'unknown'
            }


async def main():
    username = "lkdckjko"
    password = "ca4zm4tdm4vt"
    
    proxy_list = [
        f"http://{username}:{password}@142.111.48.253:7030",
        f"http://{username}:{password}@31.59.20.176:6754",
        f"http://{username}:{password}@23.95.150.145:6114",
        f"http://{username}:{password}@198.23.239.134:6540",
        f"http://{username}:{password}@107.172.163.27:6543",
        f"http://{username}:{password}@198.105.121.200:6462",
        f"http://{username}:{password}@64.137.96.74:6641",
        f"http://{username}:{password}@84.247.60.125:6095",
    ]
    
    async with FacebookUIDExtractor(proxy_list=proxy_list) as extractor:
        while True:
            user_input = input("\nNhập link Facebook: ").strip()
            
            if user_input.lower() in ['exit', 'quit', 'q']:
                break
            
            if not user_input:
                continue
            
            result = await extractor.get_facebook_uid(user_input)
            
            if result['success']:
                print(f"{result['uid']}")
            else:
                print("Không tìm thấy UID")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass