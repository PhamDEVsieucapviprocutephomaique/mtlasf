from pydantic import BaseModel, EmailStr, HttpUrl, validator
from typing import List, Optional
from datetime import datetime
from models.models import ReportStatus, ScamCategory


# === SCHEMAS CHO TỐ CÁO TÀI KHOẢN SCAM ===

class AccountScamReportCreate(BaseModel):
    """Schema tạo tố cáo tài khoản scam"""
    account_number: str
    account_name: str
    bank_name: Optional[str] = None
    facebook_link: Optional[str] = None
    evidence_images: List[str] = []
    content: str
    reporter_name: str
    reporter_zalo: str
    is_victim: bool = False
    is_proxy_report: bool = False


class AccountScamReportResponse(BaseModel):
    """Schema trả về tố cáo tài khoản scam"""
    id: int
    account_number: str
    account_name: str
    bank_name: Optional[str]
    facebook_link: Optional[str]
    evidence_images: List[str]
    content: str
    reporter_name: str
    reporter_zalo: str
    is_victim: bool
    is_proxy_report: bool
    status: ReportStatus
    view_count: int
    comment_count: int
    created_at: datetime
    approved_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class AccountScamReportUpdate(BaseModel):
    """Schema cập nhật trạng thái tố cáo"""
    status: Optional[ReportStatus] = None


# === SCHEMAS CHO TỐ CÁO WEBSITE SCAM ===

class WebsiteScamReportCreate(BaseModel):
    """Schema tạo tố cáo website scam"""
    url: str
    category: ScamCategory
    evidence_images: List[str] = []
    description: str
    reporter_email: EmailStr


class WebsiteScamReportResponse(BaseModel):
    """Schema trả về tố cáo website scam"""
    id: int
    url: str
    category: ScamCategory
    evidence_images: List[str]
    description: str
    reporter_email: str
    status: ReportStatus
    view_count: int
    created_at: datetime
    approved_at: Optional[datetime]
    
    class Config:
        from_attributes = True


# === SCHEMAS CHO BÌNH LUẬN ===

class CommentCreate(BaseModel):
    """Schema tạo bình luận"""
    author_name: str
    content: str


class CommentResponse(BaseModel):
    """Schema trả về bình luận"""
    id: int
    report_type: str
    report_id: int
    author_name: str
    content: str
    created_at: datetime
    
    class Config:
        from_attributes = True


# === SCHEMAS CHO QUỸ BẢO HIỂM CS ===

class BankAccountInfo(BaseModel):
    """Thông tin tài khoản ngân hàng"""
    bank: str
    account_number: str
    account_name: str


class InsuranceAdminCreate(BaseModel):
    """Schema tạo admin quỹ bảo hiểm CS"""
    order_number: int
    full_name: str
    avatar_url: Optional[str] = None
    fb_main: Optional[str] = None
    fb_backup: Optional[str] = None
    zalo: Optional[str] = None
    website: Optional[str] = None
    insurance_amount: float = 0
    insurance_start_date: Optional[datetime] = None
    services: List[str] = []
    bank_accounts: List[BankAccountInfo] = []


class InsuranceAdminResponse(BaseModel):
    """Schema trả về admin quỹ bảo hiểm CS"""
    id: int
    order_number: int
    full_name: str
    avatar_url: Optional[str]
    fb_main: Optional[str]
    fb_backup: Optional[str]
    zalo: Optional[str]
    website: Optional[str]
    insurance_amount: float
    insurance_start_date: Optional[datetime]
    services: List[str]
    bank_accounts: List[dict]
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class InsuranceAdminUpdate(BaseModel):
    """Schema cập nhật admin"""
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    fb_main: Optional[str] = None
    fb_backup: Optional[str] = None
    zalo: Optional[str] = None
    website: Optional[str] = None
    insurance_amount: Optional[float] = None
    insurance_start_date: Optional[datetime] = None
    services: Optional[List[str]] = None
    bank_accounts: Optional[List[BankAccountInfo]] = None
    is_active: Optional[bool] = None


# === SCHEMAS CHO TÌM KIẾM ===

class SearchRequest(BaseModel):
    """Schema yêu cầu tìm kiếm"""
    query: str
    
    @validator('query')
    def validate_query(cls, v):
        if not v or len(v.strip()) < 3:
            raise ValueError('Từ khóa tìm kiếm phải có ít nhất 3 ký tự')
        return v.strip()


class SearchResult(BaseModel):
    """Schema kết quả tìm kiếm"""
    account_scams: List[AccountScamReportResponse]
    website_scams: List[WebsiteScamReportResponse]
    total_results: int


# === SCHEMAS CHO THỐNG KÊ ===

class DashboardStats(BaseModel):
    """Schema thống kê trang chủ"""
    total_account_scams: int
    total_fb_scams: int
    total_comments: int
    pending_reports: int
    today_reports_count: int
    top_scammers_7days: List[dict]  # Top scammer 7 ngày
    top_searches_today: List[dict]  # Top tìm kiếm hôm nay


class TopScammer(BaseModel):
    """Schema top scammer"""
    account_number: str
    account_name: str
    report_count: int
    view_count: int


# === SCHEMAS CHO SETTINGS ===

class SystemSettingsResponse(BaseModel):
    """Schema trả về cài đặt hệ thống"""
    total_account_scams: int
    total_fb_scams: int
    total_comments: int
    pending_reports: int
    facebook_group: Optional[str]
    discord_link: Optional[str]
    telegram_link: Optional[str]
    updated_at: datetime
    
    class Config:
        from_attributes = True


class SystemSettingsUpdate(BaseModel):
    """Schema cập nhật cài đặt"""
    facebook_group: Optional[str] = None
    discord_link: Optional[str] = None
    telegram_link: Optional[str] = None