from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select, func
from typing import List, Optional
from datetime import datetime, timedelta

from core.database import get_session
from core.facebook_utils import normalize_facebook_link  # ← THÊM IMPORT
from models.models import AccountScamReport, ReportStatus, SystemSettings
from schemas.schemas import (
    AccountScamReportCreate,
    AccountScamReportResponse,
    AccountScamReportUpdate
)

router = APIRouter()


@router.post("/", response_model=AccountScamReportResponse, status_code=201)
async def create_account_report(  # ← ĐỔI THÀNH async
    report: AccountScamReportCreate,
    db: Session = Depends(get_session)
):
    """
    TẠO TỐ CÁO TÀI KHOẢN SCAM MỚI
    """
    now = datetime.utcnow()
    
    # ← NORMALIZE FACEBOOK LINK TRƯỚC KHI LƯU
    facebook_link = await normalize_facebook_link(report.facebook_link)
    zalo_link = await normalize_facebook_link(report.zalo_link)  # Zalo link cũng có thể là FB
    
    new_report = AccountScamReport(
        account_number=report.account_number,
        account_name=report.account_name,
        bank_name=report.bank_name,
        facebook_link=facebook_link,  # ← DÙNG LINK ĐÃ CHUẨN HÓA
        zalo_link=zalo_link,  # ← DÙNG LINK ĐÃ CHUẨN HÓA
        phone_number=report.phone_number,
        evidence_images=report.evidence_images,
        content=report.content,
        reporter_name=report.reporter_name,
        reporter_zalo=report.reporter_zalo,
        is_victim=report.is_victim,
        is_proxy_report=report.is_proxy_report,
        status=ReportStatus.PENDING,
        created_at=now,
        updated_at=now
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
    LẤY DANH SÁCH TỐ CÁO TÀI KHOẢN SCAM
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
    LẤY CHI TIẾT MỘT TỐ CÁO và tăng lượt xem
    """
    report = db.get(AccountScamReport, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Không tìm thấy báo cáo")
    
    # Tăng lượt xem
    report.view_count += 1
    report.updated_at = datetime.utcnow()
    db.add(report)
    db.commit()
    db.refresh(report)
    
    return report


@router.get("/by-person/{account_number}", response_model=List[AccountScamReportResponse])
async def get_reports_by_person(  # ← ĐỔI THÀNH async
    account_number: str,
    db: Session = Depends(get_session)
):
    """
    LẤY TẤT CẢ BÁO CÁO CỦA 1 NGƯỜI (theo STK/SĐT/FB Link)
    """
    # ← NORMALIZE NẾU LÀ FACEBOOK LINK
    normalized_account = await normalize_facebook_link(account_number)
    
    reports = db.exec(
        select(AccountScamReport)
        .where(AccountScamReport.account_number == normalized_account)
        .where(AccountScamReport.status == ReportStatus.APPROVED)
        .order_by(AccountScamReport.created_at.desc())
    ).all()
    
    return reports


@router.put("/{report_id}", response_model=AccountScamReportResponse)
async def update_account_report(  # ← ĐỔI THÀNH async
    report_id: int,
    report_update: AccountScamReportUpdate,
    db: Session = Depends(get_session)
):
    """
    CẬP NHẬT TRẠNG THÁI TỐ CÁO (Admin)
    """
    report = db.get(AccountScamReport, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Không tìm thấy báo cáo")

    old_status = report.status
    
    update_data = report_update.dict(exclude_unset=True)
    
    # ← NORMALIZE FACEBOOK LINK NẾU CÓ TRONG UPDATE
    if 'facebook_link' in update_data and update_data['facebook_link']:
        update_data['facebook_link'] = await normalize_facebook_link(update_data['facebook_link'])
    
    if 'zalo_link' in update_data and update_data['zalo_link']:
        update_data['zalo_link'] = await normalize_facebook_link(update_data['zalo_link'])
    
    for field, value in update_data.items():
        setattr(report, field, value)

    # Cập nhật thời gian duyệt nếu chuyển sang APPROVED
    if report_update.status == ReportStatus.APPROVED and not report.approved_at:
        settings = db.exec(select(SystemSettings)).first()
        if settings:
            settings.total_account_scams += 1
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
    XÓA TỐ CÁO TÀI KHOẢN SCAM
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