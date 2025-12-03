from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from typing import List, Optional
from datetime import datetime # <--- SỬA LỖI: Cần import datetime

from core.database import get_session
from models.models import InsuranceAdmin
from schemas.schemas import (
    InsuranceAdminCreate,
    InsuranceAdminResponse,
    InsuranceAdminUpdate
)

router = APIRouter()


@router.post("/", response_model=InsuranceAdminResponse, status_code=201)
def create_insurance_admin(
    admin: InsuranceAdminCreate,
    db: Session = Depends(get_session)
):
    """
    Thêm admin vào Quỹ Bảo Hiểm CS
    """
    # Kiểm tra xem order_number đã tồn tại chưa
    existing = db.exec(
        select(InsuranceAdmin).where(InsuranceAdmin.order_number == admin.order_number)
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Số thứ tự {admin.order_number} đã tồn tại"
        )
    
    # Chuyển đổi bank_accounts từ Pydantic models sang dict
    bank_accounts_dict = [acc.dict() for acc in admin.bank_accounts]
    
    now = datetime.utcnow() # <--- SỬA LỖI: Lấy thời gian hiện tại
    new_admin = InsuranceAdmin(
        order_number=admin.order_number,
        full_name=admin.full_name,
        avatar_url=admin.avatar_url,
        fb_main=admin.fb_main,
        fb_backup=admin.fb_backup,
        zalo=admin.zalo,
        website=admin.website,
        insurance_amount=admin.insurance_amount,
        insurance_start_date=admin.insurance_start_date,
        services=admin.services,
        bank_accounts=bank_accounts_dict,
        is_active=admin.is_active,
        created_at=now,  # <--- SỬA LỖI: Gán thủ công
        updated_at=now   # <--- SỬA LỖI: Gán thủ công
    )
    
    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)
    
    return new_admin


@router.get("/", response_model=List[InsuranceAdminResponse])
def get_insurance_admins(
    is_active: Optional[bool] = Query(None, description="Lọc theo trạng thái hoạt động"),
    db: Session = Depends(get_session)
):
    """
    Lấy danh sách admin trong Quỹ Bảo Hiểm CS
    """
    query = select(InsuranceAdmin).order_by(InsuranceAdmin.order_number)
    
    if is_active is not None:
        query = query.where(InsuranceAdmin.is_active == is_active)
        
    admins = db.exec(query).all()
    return admins


@router.get("/{admin_id}", response_model=InsuranceAdminResponse)
def get_insurance_admin_by_id(
    admin_id: int,
    db: Session = Depends(get_session)
):
    """
    Lấy thông tin chi tiết của một admin theo ID
    """
    admin = db.get(InsuranceAdmin, admin_id)
    if not admin:
        raise HTTPException(status_code=404, detail="Không tìm thấy admin")
    
    return admin


@router.get("/order/{order_number}", response_model=InsuranceAdminResponse)
def get_insurance_admin_by_order(
    order_number: int,
    db: Session = Depends(get_session)
):
    """
    Lấy thông tin chi tiết của một admin theo Số Thứ Tự
    """
    admin = db.exec(
        select(InsuranceAdmin).where(InsuranceAdmin.order_number == order_number)
    ).first()
    
    if not admin:
        raise HTTPException(status_code=404, detail="Không tìm thấy admin")
    
    return admin


@router.put("/{admin_id}", response_model=InsuranceAdminResponse)
def update_insurance_admin(
    admin_id: int,
    admin_update: InsuranceAdminUpdate,
    db: Session = Depends(get_session)
):
    """
    Cập nhật thông tin admin
    """
    admin = db.get(InsuranceAdmin, admin_id)
    if not admin:
        raise HTTPException(status_code=404, detail="Không tìm thấy admin")
    
    # Cập nhật các trường nếu có giá trị mới
    update_data = admin_update.dict(exclude_unset=True)
    
    # Xử lý riêng bank_accounts
    if "bank_accounts" in update_data and update_data["bank_accounts"]:
        update_data["bank_accounts"] = [acc.dict() for acc in update_data["bank_accounts"]]
    
    for field, value in update_data.items():
        setattr(admin, field, value)
    
    admin.updated_at = datetime.utcnow()
    
    db.add(admin)
    db.commit()
    db.refresh(admin)
    
    return admin


@router.delete("/{admin_id}")
def delete_insurance_admin(
    admin_id: int,
    db: Session = Depends(get_session)
):
    """
    Xóa admin khỏi Quỹ Bảo Hiểm CS
    """
    admin = db.get(InsuranceAdmin, admin_id)
    if not admin:
        raise HTTPException(status_code=404, detail="Không tìm thấy admin")
    
    db.delete(admin)
    db.commit()
    
    return {"success": True, "message": f"Đã xóa admin ID {admin_id}"}