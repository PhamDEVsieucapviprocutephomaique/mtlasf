from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from typing import List
from datetime import datetime # <--- SỬA LỖI: Cần import datetime

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
    Tạo bình luận cho một báo cáo
    """
    # Kiểm tra xem báo cáo có tồn tại không
    if report_type == ReportType.ACCOUNT_SCAM:
        report = db.get(AccountScamReport, report_id)
        if not report:
            raise HTTPException(status_code=404, detail="Không tìm thấy báo cáo tài khoản")
        
        # Tăng số lượng bình luận
        report.comment_count += 1
        db.add(report)
        
    elif report_type == ReportType.WEBSITE_SCAM:
        report = db.get(WebsiteScamReport, report_id)
        if not report:
            raise HTTPException(status_code=404, detail="Không tìm thấy báo cáo website")
    else:
        raise HTTPException(status_code=400, detail="Loại báo cáo không hợp lệ")
    
    # Tạo bình luận mới
    now = datetime.utcnow() # <--- SỬA LỖI: Lấy thời gian hiện tại
    new_comment = Comment(
        report_type=report_type,
        report_id=report_id,
        author_name=comment.author_name,
        content=comment.content,
        created_at=now # <--- SỬA LỖI: Gán thủ công
    )
    
    # Tăng tổng số bình luận trong SystemSettings
    settings = db.exec(select(SystemSettings)).first()
    if settings:
        settings.total_comments += 1
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
    Lấy danh sách bình luận cho một báo cáo
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


@router.delete("/{comment_id}")
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_session)
):
    """
    Xóa bình luận (dành cho admin)
    """
    comment = db.get(Comment, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Không tìm thấy bình luận")
    
    # Giảm số lượng bình luận trong báo cáo
    if comment.report_type == ReportType.ACCOUNT_SCAM:
        report = db.get(AccountScamReport, comment.report_id)
        if report and report.comment_count > 0:
            report.comment_count -= 1
            report.updated_at = datetime.utcnow()
            db.add(report)
    
    # Giảm tổng số bình luận trong SystemSettings
    settings = db.exec(select(SystemSettings)).first()
    if settings and settings.total_comments > 0:
        settings.total_comments -= 1
        settings.updated_at = datetime.utcnow()
        db.add(settings)
        
    db.delete(comment)
    db.commit()
    
    return {"success": True, "message": f"Đã xóa bình luận ID {comment_id}"}