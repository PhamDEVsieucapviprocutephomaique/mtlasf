from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from typing import List, Optional
from datetime import datetime # <--- SỬA LỖI: Cần import datetime

from core.database import get_session
from models.models import WebsiteScamReport, ReportStatus, ScamCategory, SystemSettings
from schemas.schemas import (
    WebsiteScamReportCreate,
    WebsiteScamReportResponse,
    AccountScamReportUpdate  # Dùng chung schema update
)

router = APIRouter()


@router.post("/", response_model=WebsiteScamReportResponse, status_code=201)
def create_website_report(
    report: WebsiteScamReportCreate,
    db: Session = Depends(get_session)
):
    """
    Tạo tố cáo website/link scam mới
    """
    now = datetime.utcnow() # <--- SỬA LỖI: Lấy thời gian hiện tại
    new_report = WebsiteScamReport(
        url=report.url,
        category=report.category,
        evidence_images=report.evidence_images,
        description=report.description,
        reporter_email=report.reporter_email,
        status=ReportStatus.PENDING,
        created_at=now, # <--- SỬA LỖI: Gán thủ công
        updated_at=now  # <--- SỬA LỖI: Gán thủ công
    )
    
    db.add(new_report)
    
    # Cập nhật số lượng báo cáo chờ duyệt
    settings = db.exec(select(SystemSettings)).first()
    if settings:
        settings.pending_reports += 1
        db.add(settings)
    
    db.commit()
    db.refresh(new_report)
    
    return new_report


@router.get("/", response_model=List[WebsiteScamReportResponse])
def get_website_reports(
    status: Optional[ReportStatus] = Query(None, description="Lọc theo trạng thái"),
    category: Optional[ScamCategory] = Query(None, description="Lọc theo thể loại"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_session)
):
    """
    Lấy danh sách các tố cáo website scam
    """
    query = select(WebsiteScamReport).order_by(WebsiteScamReport.created_at.desc())
    
    if status:
        query = query.where(WebsiteScamReport.status == status)
    
    if category:
        query = query.where(WebsiteScamReport.category == category)

    query = query.offset(offset).limit(limit)
    
    reports = db.exec(query).all()
    return reports


@router.get("/categories/list")
def get_website_categories():
    """
    Lấy danh sách tất cả các thể loại scam cho website
    """
    return [category.value for category in ScamCategory]


@router.get("/{report_id}", response_model=WebsiteScamReportResponse)
def get_website_report(
    report_id: int,
    db: Session = Depends(get_session)
):
    """
    Lấy chi tiết một tố cáo website scam và tăng lượt xem
    """
    report = db.get(WebsiteScamReport, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Không tìm thấy báo cáo")
    
    # Tăng lượt xem (không commit ngay, để commit chung với updated_at)
    report.view_count += 1
    report.updated_at = datetime.utcnow()
    db.add(report)
    db.commit()
    db.refresh(report)
    
    return report


@router.put("/{report_id}", response_model=WebsiteScamReportResponse)
def update_website_report(
    report_id: int,
    report_update: AccountScamReportUpdate, # Dùng chung schema update
    db: Session = Depends(get_session)
):
    """
    Cập nhật trạng thái của tố cáo website (Admin)
    """
    report = db.get(WebsiteScamReport, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Không tìm thấy báo cáo")

    old_status = report.status
    
    update_data = report_update.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(report, field, value)

    # Cập nhật thời gian duyệt
    if report_update.status == ReportStatus.APPROVED and not report.approved_at:
        report.approved_at = datetime.utcnow()
    
    # Cập nhật số báo cáo chờ duyệt
    if old_status == ReportStatus.PENDING and report.status != ReportStatus.PENDING:
        settings = db.exec(select(SystemSettings)).first()
        if settings and settings.pending_reports > 0:
            settings.pending_reports -= 1
            db.add(settings)
    
    report.updated_at = datetime.utcnow()
    db.add(report)
    db.commit()
    db.refresh(report)
    
    return report


@router.delete("/{report_id}")
def delete_website_report(
    report_id: int,
    db: Session = Depends(get_session)
):
    """
    Xóa tố cáo website scam
    """
    report = db.get(WebsiteScamReport, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Không tìm thấy báo cáo")
    
    # Nếu đang pending, giảm số lượng chờ duyệt
    if report.status == ReportStatus.PENDING:
        settings = db.exec(select(SystemSettings)).first()
        if settings and settings.pending_reports > 0:
            settings.pending_reports -= 1
            db.add(settings)
    
    db.delete(report)
    db.commit()
    
    return {"success": True, "message": f"Đã xóa báo cáo ID {report_id}"}