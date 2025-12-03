from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select, func
from typing import List, Optional
from datetime import datetime, timedelta # <--- SỬA LỖI: Cần import datetime

from core.database import get_session
from models.models import AccountScamReport, ReportStatus, ReportType, SystemSettings
from schemas.schemas import (
    AccountScamReportCreate,
    AccountScamReportResponse,
    AccountScamReportUpdate
)

router = APIRouter()


@router.post("/", response_model=AccountScamReportResponse, status_code=201)
def create_account_report(
    report: AccountScamReportCreate,
    db: Session = Depends(get_session)
):
    """
    Tạo tố cáo tài khoản scam mới
    """
    now = datetime.utcnow() # <--- SỬA LỖI: Lấy thời gian hiện tại
    
    new_report = AccountScamReport(
        account_number=report.account_number,
        account_name=report.account_name,
        bank_name=report.bank_name,
        facebook_link=report.facebook_link,
        evidence_images=report.evidence_images,
        content=report.content,
        reporter_name=report.reporter_name,
        reporter_zalo=report.reporter_zalo,
        is_victim=report.is_victim,
        is_proxy_report=report.is_proxy_report,
        status=ReportStatus.PENDING,
        created_at=now,  # <--- SỬA LỖI: Gán thủ công
        updated_at=now   # <--- SỬA LỖI: Gán thủ công
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


@router.get("/", response_model=List[AccountScamReportResponse])
def get_account_reports(
    status: Optional[ReportStatus] = Query(None, description="Lọc theo trạng thái"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    today_only: bool = Query(False, description="Chỉ lấy báo cáo trong hôm nay"),
    db: Session = Depends(get_session)
):
    """
    Lấy danh sách các tố cáo tài khoản scam
    """
    query = select(AccountScamReport).order_by(AccountScamReport.created_at.desc())
    
    if status:
        query = query.where(AccountScamReport.status == status)
    
    if today_only:
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        query = query.where(AccountScamReport.created_at >= today_start)

    query = query.offset(offset).limit(limit)
    
    reports = db.exec(query).all()
    return reports


@router.get("/{report_id}", response_model=AccountScamReportResponse)
def get_account_report(
    report_id: int,
    db: Session = Depends(get_session)
):
    """
    Lấy chi tiết một tố cáo tài khoản scam và tăng lượt xem
    """
    report = db.get(AccountScamReport, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Không tìm thấy báo cáo")
    
    # Tăng lượt xem (không commit ngay, để commit chung với updated_at)
    report.view_count += 1
    report.updated_at = datetime.utcnow()
    db.add(report)
    db.commit()
    db.refresh(report)
    
    return report


@router.put("/{report_id}", response_model=AccountScamReportResponse)
def update_account_report(
    report_id: int,
    report_update: AccountScamReportUpdate,
    db: Session = Depends(get_session)
):
    """
    Cập nhật trạng thái/thông tin của tố cáo (Admin)
    """
    report = db.get(AccountScamReport, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Không tìm thấy báo cáo")

    old_status = report.status
    
    update_data = report_update.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(report, field, value)

    # Cập nhật thời gian duyệt nếu chuyển sang APPROVED
    if report_update.status == ReportStatus.APPROVED and not report.approved_at:
        # Tăng tổng số lượng scam
        settings = db.exec(select(SystemSettings)).first()
        if settings:
            settings.total_account_scams += 1
            # Nếu có link FB thì tăng tổng số FB scam
            if report.facebook_link:
                settings.total_fb_scams += 1
            db.add(settings)
            
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
def delete_account_report(
    report_id: int,
    db: Session = Depends(get_session)
):
    """
    Xóa tố cáo tài khoản scam
    """
    report = db.get(AccountScamReport, report_id)
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


@router.get("/top/scammers", response_model=List[dict])
def get_top_scammers(
    days: int = Query(7, ge=1, le=30, description="Số ngày gần đây"),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_session)
):
    """
    Lấy danh sách top scammers trong N ngày gần đây
    """
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    
    # Subquery: đếm số báo cáo cho mỗi account_number
    query = (
        select(
            AccountScamReport.account_number,
            AccountScamReport.account_name,
            func.count(AccountScamReport.id).label('report_count')
        )
        .where(AccountScamReport.status == ReportStatus.APPROVED)
        .where(AccountScamReport.created_at >= cutoff_date)
        .group_by(AccountScamReport.account_number, AccountScamReport.account_name)
        .order_by(func.count(AccountScamReport.id).desc())
        .limit(limit)
    )
    
    results = db.exec(query).all()
    
    return [
        {
            "account_number": r.account_number,
            "account_name": r.account_name,
            "report_count": r.report_count
        }
        for r in results
    ]