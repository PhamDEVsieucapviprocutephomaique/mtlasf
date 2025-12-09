from fastapi import APIRouter, Depends, Query, Request
from sqlmodel import Session, select, or_, func
from typing import List, Dict, Any
from datetime import datetime, timedelta

from core.database import get_session
from models.models import (
    AccountScamReport,
    WebsiteScamReport,
    InsuranceAdmin,
    ReportStatus,
    SearchLog
)
from schemas.schemas import SearchResult, InsuranceAdminResponse

router = APIRouter()


@router.get("/", response_model=SearchResult)
def search_reports(
    q: str = Query(..., min_length=1, description="Từ khóa tìm kiếm"),
    request: Request = None,
    db: Session = Depends(get_session)
):
    """
    Tìm kiếm nâng cao: STK, SĐT, tên, link FB, link Zalo
    Tự động lưu lịch sử tìm kiếm (kể cả không có kết quả)
    """
    search_query = q.strip()
    
    # Tìm kiếm trong AccountScamReport
    account_query = (
        select(AccountScamReport)
        .where(AccountScamReport.status == ReportStatus.APPROVED)
        .where(
            or_(
                AccountScamReport.account_number.contains(search_query),
                AccountScamReport.account_name.contains(search_query),
                AccountScamReport.bank_name.contains(search_query),
                AccountScamReport.facebook_link.contains(search_query),
                AccountScamReport.zalo_link.contains(search_query),
                AccountScamReport.phone_number.contains(search_query)
            )
        )
        .order_by(AccountScamReport.created_at.desc())
        .limit(50)
    )
    
    account_scams = db.exec(account_query).all()
    
    # Tăng search_count cho các báo cáo tìm được
    for report in account_scams:
        report.search_count += 1
        db.add(report)
    
    # Tìm kiếm trong WebsiteScamReport
    website_query = (
        select(WebsiteScamReport)
        .where(WebsiteScamReport.status == ReportStatus.APPROVED)
        .where(
            or_(
                WebsiteScamReport.url.contains(search_query),
                WebsiteScamReport.description.contains(search_query)
            )
        )
        .order_by(WebsiteScamReport.created_at.desc())
        .limit(50)
    )
    
    website_scams = db.exec(website_query).all()
    
    # Tăng search_count cho các báo cáo website tìm được
    for report in website_scams:
        report.search_count += 1
        db.add(report)
    
    total_results = len(account_scams) + len(website_scams)
    
    # Log tìm kiếm (LƯU KỂ CẢ KHÔNG CÓ KẾT QUẢ)
    search_log = SearchLog(
        search_query=search_query,
        search_date=datetime.utcnow(), 
        ip_address=request.client.host if request else None,
        found_results=(total_results > 0),
        result_count=total_results
    )
    db.add(search_log)
    
    db.commit()
    
    return SearchResult(
        account_scams=account_scams,
        website_scams=website_scams,
        total_results=total_results
    )


@router.get("/top/searches-today")
def get_top_searches_today(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_session)
) -> List[Dict[str, Any]]:
    """
    TOP 10 TÌM KIẾM TRONG HÔM NAY (theo số lần tìm)
    """
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + timedelta(days=1)
    
    query = (
        select(
            SearchLog.search_query,
            func.count(SearchLog.id).label('search_count')
        )
        .where(SearchLog.search_date >= today_start)
        .where(SearchLog.search_date < today_end)
        .group_by(SearchLog.search_query)
        .order_by(func.count(SearchLog.id).desc())
        .limit(limit)
    )
    
    results = db.exec(query).all()
    
    return [
        {
            "query": r.search_query,
            "count": r.search_count
        }
        for r in results
    ]


@router.get("/top/reported-7days")
def get_top_reported_7days(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_session)
) -> List[Dict[str, Any]]:
    """
    TOP 10 NGƯỜI BỊ TỐ CÁO NHIỀU NHẤT TRONG 7 NGÀY GẦN ĐÂY
    (Đếm theo số lượng bài tố cáo của cùng 1 người)
    """
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    
    # Group theo account_number để đếm số bài tố cáo
    query = (
        select(
            AccountScamReport.account_number,
            AccountScamReport.account_name,
            AccountScamReport.bank_name,
            func.count(AccountScamReport.id).label('report_count'),
            func.sum(AccountScamReport.search_count).label('total_searches')
        )
        .where(AccountScamReport.status == ReportStatus.APPROVED)
        .where(AccountScamReport.created_at >= seven_days_ago)
        .group_by(
            AccountScamReport.account_number,
            AccountScamReport.account_name,
            AccountScamReport.bank_name
        )
        .order_by(func.count(AccountScamReport.id).desc())
        .limit(limit)
    )
    
    results = db.exec(query).all()
    
    return [
        {
            "account_number": r.account_number,
            "account_name": r.account_name,
            "bank_name": r.bank_name,
            "report_count": r.report_count,
            "total_searches": r.total_searches or 0
        }
        for r in results
    ]


@router.get("/reports/today")
def get_reports_today(
    db: Session = Depends(get_session)
) -> Dict[str, Any]:
    """
    TẤT CẢ BÁO CÁO BỊ TỐ CÁO TRONG HÔM NAY
    """
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + timedelta(days=1)
    
    # Báo cáo tài khoản hôm nay
    account_reports = db.exec(
        select(AccountScamReport)
        .where(AccountScamReport.created_at >= today_start)
        .where(AccountScamReport.created_at < today_end)
        .order_by(AccountScamReport.created_at.desc())
    ).all()
    
    # Báo cáo website hôm nay
    website_reports = db.exec(
        select(WebsiteScamReport)
        .where(WebsiteScamReport.created_at >= today_start)
        .where(WebsiteScamReport.created_at < today_end)
        .order_by(WebsiteScamReport.created_at.desc())
    ).all()
    
    return {
        "date": today_start.date().isoformat(),
        "total_reports": len(account_reports) + len(website_reports),
        "account_reports": account_reports,
        "website_reports": website_reports
    }


@router.get("/check/{identifier}")
def quick_check_scam(
    identifier: str,
    db: Session = Depends(get_session)
) -> Dict[str, Any]:
    """
    KIỂM TRA NHANH: STK/SĐT/Link FB/Link Zalo có trong danh sách scam không
    """
    # Tìm tất cả báo cáo phù hợp
    reports = db.exec(
        select(AccountScamReport)
        .where(AccountScamReport.status == ReportStatus.APPROVED)
        .where(
            or_(
                AccountScamReport.account_number == identifier,
                AccountScamReport.phone_number == identifier,
                AccountScamReport.facebook_link.contains(identifier),
                AccountScamReport.zalo_link.contains(identifier)
            )
        )
        .order_by(AccountScamReport.created_at.desc())
    ).all()
    
    if reports:
        # Tăng search_count
        for report in reports:
            report.search_count += 1
            db.add(report)
        db.commit()
        
        return {
            "is_scam": True,
            "report_count": len(reports),
            "warning": f"⚠️ {identifier} đã bị tố cáo lừa đảo {len(reports)} lần!",
            "reports": [
                {
                    "id": r.id,
                    "account_number": r.account_number,
                    "account_name": r.account_name,
                    "bank_name": r.bank_name,
                    "facebook_link": r.facebook_link,
                    "zalo_link": r.zalo_link,
                    "phone_number": r.phone_number,
                    "created_at": r.created_at.isoformat(),
                    "search_count": r.search_count
                }
                for r in reports
            ]
        }
    
    return {
        "is_scam": False,
        "message": f"✅ Chưa có báo cáo nào về {identifier}"
    }


@router.get("/admin/find", response_model=List[InsuranceAdminResponse])
def search_insurance_admin(
    q: str = Query(..., min_length=1, description="Tìm admin: SĐT/STK/Zalo/FB"),
    db: Session = Depends(get_session)
):
    """
    TÌM KIẾM ADMIN QUỸ BẢO HIỂM theo SĐT, STK, Zalo, Facebook
    """
    search_query = q.strip()
    
    # Tìm theo phone, zalo, fb_main
    query = (
        select(InsuranceAdmin)
        .where(InsuranceAdmin.is_active == True)
        .where(
            or_(
                InsuranceAdmin.phone.contains(search_query),
                InsuranceAdmin.zalo.contains(search_query),
                InsuranceAdmin.fb_main.contains(search_query),
                InsuranceAdmin.fb_backup.contains(search_query),
                InsuranceAdmin.full_name.contains(search_query)
            )
        )
    )
    
    admins = db.exec(query).all()
    
    # Tìm theo số tài khoản ngân hàng (trong JSON)
    if not admins:
        all_admins = db.exec(
            select(InsuranceAdmin).where(InsuranceAdmin.is_active == True)
        ).all()
        
        for admin in all_admins:
            for bank_acc in admin.bank_accounts:
                if search_query in bank_acc.get("account_number", ""):
                    admins.append(admin)
                    break
    
    return admins