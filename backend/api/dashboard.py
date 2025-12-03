from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select, func
from datetime import datetime, timedelta

from core.database import get_session
from models.models import (
    SystemSettings,
    AccountScamReport,
    WebsiteScamReport,
    ReportStatus,
    SearchLog
)
from schemas.schemas import DashboardStats, SystemSettingsResponse, SystemSettingsUpdate

router = APIRouter()


@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_session)
):
    """
    Lấy thống kê tổng quan cho trang chủ
    """
    settings = db.exec(select(SystemSettings)).first()
    
    if not settings:
        # Tạo settings mặc định nếu chưa có
        settings = SystemSettings()
        db.add(settings)
        db.commit()
        db.refresh(settings)
    
    # Đếm số báo cáo hôm nay
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + timedelta(days=1)
    
    today_account_reports = db.exec(
        select(func.count(AccountScamReport.id))
        .where(AccountScamReport.created_at >= today_start)
        .where(AccountScamReport.created_at < today_end)
    ).one()
    
    today_website_reports = db.exec(
        select(func.count(WebsiteScamReport.id))
        .where(WebsiteScamReport.created_at >= today_start)
        .where(WebsiteScamReport.created_at < today_end)
    ).one()
    
    # Top scammers 7 ngày
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    
    top_scammers_query = (
        select(
            AccountScamReport.account_number,
            AccountScamReport.account_name,
            func.count(AccountScamReport.id).label('report_count')
        )
        .where(AccountScamReport.status == ReportStatus.APPROVED)
        .where(AccountScamReport.created_at >= seven_days_ago)
        .group_by(AccountScamReport.account_number, AccountScamReport.account_name)
        .order_by(func.count(AccountScamReport.id).desc())
        .limit(6)
    )
    
    top_scammers = db.exec(top_scammers_query).all()
    
    # Top tìm kiếm hôm nay
    top_searches_query = (
        select(
            SearchLog.search_query,
            func.count(SearchLog.id).label('search_count')
        )
        .where(SearchLog.search_date >= today_start)
        .where(SearchLog.search_date < today_end)
        .group_by(SearchLog.search_query)
        .order_by(func.count(SearchLog.id).desc())
        .limit(3)
    )
    
    top_searches = db.exec(top_searches_query).all()
    
    return DashboardStats(
        total_account_scams=settings.total_account_scams,
        total_fb_scams=settings.total_fb_scams,
        total_comments=settings.total_comments,
        pending_reports=settings.pending_reports,
        today_reports_count=today_account_reports + today_website_reports,
        top_scammers_7days=[
            {
                "account_number": s.account_number,
                "account_name": s.account_name,
                "report_count": s.report_count
            }
            for s in top_scammers
        ],
        top_searches_today=[
            {
                "query": s.search_query,
                "count": s.search_count
            }
            for s in top_searches
        ]
    )


@router.get("/settings", response_model=SystemSettingsResponse)
def get_system_settings(
    db: Session = Depends(get_session)
):
    """
    Lấy cài đặt hệ thống
    """
    settings = db.exec(select(SystemSettings)).first()
    
    if not settings:
        settings = SystemSettings()
        db.add(settings)
        db.commit()
        db.refresh(settings)
    
    return settings


@router.put("/settings", response_model=SystemSettingsResponse)
def update_system_settings(
    settings_update: SystemSettingsUpdate,
    db: Session = Depends(get_session)
):
    """
    Cập nhật cài đặt hệ thống (link mạng xã hội)
    """
    settings = db.exec(select(SystemSettings)).first()
    
    if not settings:
        settings = SystemSettings()
    
    update_data = settings_update.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(settings, field, value)
    
    settings.updated_at = datetime.utcnow()
    
    db.add(settings)
    db.commit()
    db.refresh(settings)
    
    return settings


@router.post("/refresh-stats")
def refresh_system_stats(
    db: Session = Depends(get_session)
):
    """
    Làm mới thống kê hệ thống (đếm lại tất cả)
    """
    settings = db.exec(select(SystemSettings)).first()
    
    if not settings:
        settings = SystemSettings()
    
    # Đếm lại tổng số STK/SĐT scam đã duyệt
    total_account = db.exec(
        select(func.count(AccountScamReport.id))
        .where(AccountScamReport.status == ReportStatus.APPROVED)
    ).one()
    
    # Đếm lại tổng số FB scam
    total_fb = db.exec(
        select(func.count(AccountScamReport.id))
        .where(AccountScamReport.status == ReportStatus.APPROVED)
        .where(AccountScamReport.facebook_link.isnot(None))
    ).one()
    
    # Đếm lại tổng số bình luận
    from models.models import Comment
    total_comments = db.exec(select(func.count(Comment.id))).one()
    
    # Đếm số báo cáo chờ duyệt
    pending_account = db.exec(
        select(func.count(AccountScamReport.id))
        .where(AccountScamReport.status == ReportStatus.PENDING)
    ).one()
    
    pending_website = db.exec(
        select(func.count(WebsiteScamReport.id))
        .where(WebsiteScamReport.status == ReportStatus.PENDING)
    ).one()
    
    settings.total_account_scams = total_account
    settings.total_fb_scams = total_fb
    settings.total_comments = total_comments
    settings.pending_reports = pending_account + pending_website
    settings.updated_at = datetime.utcnow()
    
    db.add(settings)
    db.commit()
    db.refresh(settings)
    
    return {
        "success": True,
        "message": "Đã làm mới thống kê hệ thống",
        "stats": {
            "total_account_scams": settings.total_account_scams,
            "total_fb_scams": settings.total_fb_scams,
            "total_comments": settings.total_comments,
            "pending_reports": settings.pending_reports
        }
    }