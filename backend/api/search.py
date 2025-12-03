from fastapi import APIRouter, Depends, Query, Request
from sqlmodel import Session, select, or_, func
from typing import List
from datetime import datetime, timedelta

from core.database import get_session
from models.models import (
    AccountScamReport,
    WebsiteScamReport,
    ReportStatus,
    SearchLog
)
from schemas.schemas import SearchResult

router = APIRouter()


@router.get("/", response_model=SearchResult)
def search_reports(
    q: str = Query(..., min_length=3, description="Từ khóa tìm kiếm"),
    request: Request = None,
    db: Session = Depends(get_session)
):
    """
    Tìm kiếm trong cả tố cáo tài khoản và website
    Hỗ trợ tìm theo: STK, SĐT, tên, link FB, URL website
    """
    search_query = q.strip()
    
    # Log tìm kiếm
    search_log = SearchLog(
        search_query=search_query,
        ip_address=request.client.host if request else None
    )
    db.add(search_log)
    
    # Tìm kiếm trong AccountScamReport
    account_query = (
        select(AccountScamReport)
        .where(AccountScamReport.status == ReportStatus.APPROVED)
        .where(
            or_(
                AccountScamReport.account_number.contains(search_query),
                AccountScamReport.account_name.contains(search_query),
                AccountScamReport.bank_name.contains(search_query),
                AccountScamReport.facebook_link.contains(search_query)
            )
        )
        .order_by(AccountScamReport.created_at.desc())
        .limit(50)
    )
    
    account_scams = db.exec(account_query).all()
    
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
    
    db.commit()
    
    return SearchResult(
        account_scams=account_scams,
        website_scams=website_scams,
        total_results=len(account_scams) + len(website_scams)
    )


@router.get("/top/today", response_model=List[dict])
def get_top_searches_today(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_session)
):
    """
    Lấy top từ khóa tìm kiếm nhiều nhất trong ngày hôm nay
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


@router.get("/check/{account_number}")
def quick_check_account(
    account_number: str,
    db: Session = Depends(get_session)
):
    """
    Kiểm tra nhanh 1 STK/SĐT có trong danh sách scam không
    """
    report = db.exec(
        select(AccountScamReport)
        .where(AccountScamReport.status == ReportStatus.APPROVED)
        .where(AccountScamReport.account_number == account_number)
    ).first()
    
    if report:
        return {
            "is_scam": True,
            "report_count": db.exec(
                select(func.count(AccountScamReport.id))
                .where(AccountScamReport.status == ReportStatus.APPROVED)
                .where(AccountScamReport.account_number == account_number)
            ).one(),
            "warning": f"⚠️ Tài khoản {account_number} đã bị tố cáo lừa đảo!",
            "latest_report": {
                "id": report.id,
                "account_name": report.account_name,
                "bank_name": report.bank_name,
                "created_at": report.created_at.isoformat()
            }
        }
    
    return {
        "is_scam": False,
        "message": f"✅ Chưa có báo cáo nào về tài khoản {account_number}"
    }