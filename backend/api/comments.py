from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from typing import List
from datetime import datetime

from core.database import get_session
from models.models import Comment, ReportType, AccountScamReport, WebsiteScamReport, SystemSettings
from schemas.schemas import CommentCreate, CommentResponse

router = APIRouter()


@router.post("/{report_type}/{report_id}", response_model=CommentResponse, status_code=201)
def create_comment(
    report_type: ReportType,
    report_id: int,
    comment: CommentCreate,
    db: Session = Depends(get_session)
):
    """
    TẠO BÌNH LUẬN cho một báo cáo (CHỈ POST - KHÔNG XÓA/SỬA)
    """
    # Kiểm tra xem báo cáo có tồn tại không
    if report_type == ReportType.ACCOUNT_SCAM:
        report = db.get(AccountScamReport, report_id)
        if not report:
            raise HTTPException(status_code=404, detail="Không tìm thấy báo cáo tài khoản")
        
        # Tăng số lượng bình luận
        report.comment_count += 1
        report.updated_at = datetime.utcnow()
        db.add(report)
        
    elif report_type == ReportType.WEBSITE_SCAM:
        report = db.get(WebsiteScamReport, report_id)
        if not report:
            raise HTTPException(status_code=404, detail="Không tìm thấy báo cáo website")
        report.updated_at = datetime.utcnow()
        db.add(report)
    else:
        raise HTTPException(status_code=400, detail="Loại báo cáo không hợp lệ")
    
    # Tạo bình luận mới
    now = datetime.utcnow()
    new_comment = Comment(
        report_type=report_type,
        report_id=report_id,
        author_name=comment.author_name,
        content=comment.content,
        created_at=now
    )
    
    # Tăng tổng số bình luận trong SystemSettings
    settings = db.exec(select(SystemSettings)).first()
    if settings:
        settings.total_comments += 1
        settings.updated_at = datetime.utcnow()
        db.add(settings)

    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    
    return new_comment


@router.get("/{report_type}/{report_id}", response_model=List[CommentResponse])
def get_comments(
    report_type: ReportType,
    report_id: int,
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_session)
):
    """
    LẤY DANH SÁCH BÌNH LUẬN cho một báo cáo (CHỈ GET)
    """
    query = (
        select(Comment)
        .where(Comment.report_type == report_type)
        .where(Comment.report_id == report_id)
        .order_by(Comment.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    
    comments = db.exec(query).all()
    return comments