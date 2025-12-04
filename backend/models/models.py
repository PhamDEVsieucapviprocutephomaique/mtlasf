from sqlmodel import SQLModel, Field, Column
from typing import List, Optional
from datetime import datetime
from sqlalchemy import Text, JSON
from sqlalchemy.dialects.mysql import JSON as MYSQL_JSON
from enum import Enum


# === ENUMS ===
class ReportStatus(str, Enum):
    PENDING = "pending"  # Chờ duyệt
    APPROVED = "approved"  # Đã duyệt
    REJECTED = "rejected"  # Từ chối


class ReportType(str, Enum):
    ACCOUNT_SCAM = "account_scam"  # Tố cáo STK
    WEBSITE_SCAM = "website_scam"  # Tố cáo website/link


class ScamCategory(str, Enum):
    """Thể loại lừa đảo cho website/link"""
    GDTG_MMO = "GDTG MMO"
    FREE_FIRE = "Free Fire"
    LIEN_QUAN = "Liên Quân"
    ROBLOX = "Roblox"
    FC_ONLINE = "FC Online"
    VALORANT = "Valorant"
    ZING_SPEED = "Zing Speed"
    NRO = "NRO"
    PR_STORY = "Pr Story"
    NAP_GAME = "Nạp game"
    MUA_GACH_THE = "Mua, gạch thẻ"
    DV_GOOGLE = "Dv.Google"
    DV_TIKTOK = "Dv.Tiktok"
    DV_YOUTUBE = "Dv.Youtube"
    DV_FACEBOOK = "Dv.Facebook"
    DV_WECHAT = "Dv.Wechat"
    FANPAGE_GROUP = "Fanpage, group"
    PAYPAL = "Paypal, payoner..."
    PUBG_MOBILE = "Pubg Mobile"
    GAME_PASS = "Game Pass"
    CHAT_GPT = "Tk Chat GPT - Canva Pro"
    CAY_THUE_GAME = "Cày thuê Game"
    TIEN_DIEN_TU = "Mua bán tiền điện tử"
    RUT_VI_TRA_SAU = "Rút ví trả sau"
    THIET_KE_WEB = "Thiết kế, Code web"
    HOSTING_VPS = "Hosting, vps, domain, Proxy"
    THANH_TOAN_CUOC = "Thanh toán cước, vocher"
    TK_NETFLIX = "Tk Netflix, YouTube, Spotify…"
    THE_PLAYERDUO = "Thẻ playerduo, code steam, tinder.."
    CHUYEN_TIEN_QT = "Chuyển tiền quốc tế"
    TAI_KHOAN_SIM = "Tài khoản, sim số đẹp"


# === 1. BÁO CÁO TÀI KHOẢN SCAM ===
class AccountScamReport(SQLModel, table=True):
    """Bảng tố cáo tài khoản scam (STK, SĐT)"""
    __tablename__ = "account_scam_reports"
    
    id: int = Field(default=None, primary_key=True)
    
    # Thông tin tài khoản scam
    account_number: str = Field(max_length=50, index=True)  # STK hoặc SĐT
    account_name: str = Field(max_length=255)  # Tên chủ TK
    bank_name: Optional[str] = Field(default=None, max_length=100)  # Tên ngân hàng
    facebook_link: Optional[str] = Field(default=None, max_length=500, index=True)  # Link FB
    zalo_link: Optional[str] = Field(default=None, max_length=500, index=True)  # Link Zalo
    phone_number: Optional[str] = Field(default=None, max_length=20, index=True)  # SĐT
    
    # Bằng chứng
    evidence_images: List[str] = Field(sa_column=Column(MYSQL_JSON), default=[])  # Danh sách URL ảnh
    
    # Nội dung tố cáo
    content: str = Field(sa_column=Column(Text))  # Nội dung chi tiết
    
    # Người gửi tố cáo
    reporter_name: str = Field(max_length=255)  # Họ tên người tố cáo
    reporter_zalo: str = Field(max_length=20)  # Zalo liên hệ
    is_victim: bool = Field(default=False)  # Có phải nạn nhân không
    is_proxy_report: bool = Field(default=False)  # Đăng hộ trên group
    
    # Trạng thái
    status: ReportStatus = Field(default=ReportStatus.PENDING)  # pending/approved/rejected
    
    # Thống kê
    view_count: int = Field(default=0)  # Số lượt xem
    comment_count: int = Field(default=0)  # Số bình luận
    search_count: int = Field(default=0)  # Số lần được tìm kiếm
    report_count: int = Field(default=1)  # Số lần bị tố cáo (đếm theo người)
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    approved_at: Optional[datetime] = Field(default=None)  # Thời gian duyệt


# === 2. BÁO CÁO WEBSITE/LINK SCAM ===
class WebsiteScamReport(SQLModel, table=True):
    """Bảng tố cáo website/link lừa đảo"""
    __tablename__ = "website_scam_reports"
    
    id: int = Field(default=None, primary_key=True)
    
    # Thông tin website/link
    url: str = Field(max_length=1000, index=True)  # URL website scam
    category: ScamCategory = Field(index=True)  # Thể loại lừa đảo
    
    # Bằng chứng
    evidence_images: List[str] = Field(sa_column=Column(MYSQL_JSON), default=[])
    
    # Nội dung mô tả
    description: str = Field(sa_column=Column(Text))
    
    # Email liên hệ
    reporter_email: str = Field(max_length=255)
    
    # Trạng thái
    status: ReportStatus = Field(default=ReportStatus.PENDING)
    
    # Thống kê
    view_count: int = Field(default=0)
    search_count: int = Field(default=0)  # Số lần được tìm kiếm
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    approved_at: Optional[datetime] = Field(default=None)


# === 3. BÌNH LUẬN ===
class Comment(SQLModel, table=True):
    """Bảng bình luận cho các báo cáo"""
    __tablename__ = "comments"
    
    id: int = Field(default=None, primary_key=True)
    
    # Liên kết với báo cáo
    report_type: ReportType  # account_scam hoặc website_scam
    report_id: int = Field(index=True)  # ID báo cáo
    
    # Nội dung
    author_name: str = Field(max_length=255)
    content: str = Field(sa_column=Column(Text))
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)


# === 4. QUỸ BẢO HIỂM CS (ADMIN TRUNG GIAN) ===
class InsuranceAdmin(SQLModel, table=True):
    """Bảng quản lý admin trung gian (Quỹ bảo hiểm CS)"""
    __tablename__ = "insurance_admins"
    
    id: int = Field(default=None, primary_key=True)
    order_number: int = Field(unique=True, index=True)  # Số thứ tự admin
    
    # Thông tin cá nhân
    full_name: str = Field(max_length=255)
    avatar_url: Optional[str] = Field(default=None, max_length=500)
    
    # Liên hệ
    fb_main: Optional[str] = Field(default=None, max_length=100, index=True)  # FB chính
    fb_backup: Optional[str] = Field(default=None, max_length=100)  # FB phụ
    zalo: Optional[str] = Field(default=None, max_length=20, index=True)
    phone: Optional[str] = Field(default=None, max_length=20, index=True)  # SĐT
    website: Optional[str] = Field(default=None, max_length=500)
    
    # Thông tin quỹ
    insurance_amount: float = Field(default=0)  # Số tiền quỹ bảo hiểm
    insurance_start_date: Optional[datetime] = Field(default=None)
    
    # Dịch vụ cung cấp
    services: List[str] = Field(sa_column=Column(MYSQL_JSON), default=[])
    
    # Thông tin tài khoản ngân hàng
    bank_accounts: List[dict] = Field(sa_column=Column(MYSQL_JSON), default=[])
    # Format: [{"bank": "VCB", "account_number": "xxx", "account_name": "yyy"}]
    
    # Trạng thái
    is_active: bool = Field(default=True)
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# === 5. THỐNG KÊ TÌM KIẾM ===
class SearchLog(SQLModel, table=True):
    """Bảng log tìm kiếm để thống kê"""
    __tablename__ = "search_logs"
    
    id: int = Field(default=None, primary_key=True)
    search_query: str = Field(max_length=500, index=True)  # Từ khóa tìm kiếm
    search_date: datetime = Field(default_factory=datetime.utcnow, index=True)
    ip_address: Optional[str] = Field(default=None, max_length=50)
    found_results: bool = Field(default=False)  # Có tìm thấy kết quả không
    result_count: int = Field(default=0)  # Số kết quả tìm được


# === 6. CÀI ĐẶT HỆ THỐNG ===
class SystemSettings(SQLModel, table=True):
    """Bảng cài đặt hệ thống"""
    __tablename__ = "system_settings"
    
    id: int = Field(default=None, primary_key=True)
    
    # Thống kê tổng quan
    total_account_scams: int = Field(default=0)  # Tổng số STK/SĐT lừa đảo
    total_fb_scams: int = Field(default=0)  # Tổng số FB lừa đảo
    total_comments: int = Field(default=0)  # Tổng số bình luận
    pending_reports: int = Field(default=0)  # Số cảnh báo chờ duyệt
    
    # Liên kết mạng xã hội
    facebook_group: Optional[str] = Field(default=None, max_length=500)
    discord_link: Optional[str] = Field(default=None, max_length=500)
    telegram_link: Optional[str] = Field(default=None, max_length=500)
    
    updated_at: datetime = Field(default_factory=datetime.utcnow)