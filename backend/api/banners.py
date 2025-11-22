from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from models.models import Banner

router = APIRouter()


class BannerCreate(BaseModel):
    """Schema để tạo banner mới"""
    title: Optional[str] = None
    content: Optional[str] = None
    image_url: str


class BannerResponse(BaseModel):
    """Schema trả về banner"""
    id: int
    title: Optional[str]
    content: Optional[str]
    image_url: str
    created_at: str

    class Config:
        from_attributes = True


def get_session():
    from core.database import engine
    with Session(engine) as session:
        yield session


@router.post("/", response_model=BannerResponse)
def create_banner(banner: BannerCreate, db: Session = Depends(get_session)):
    """
    Tạo banner mới
    """
    new_banner = Banner(
        title=banner.title,
        content=banner.content,
        image_url=banner.image_url
    )
    
    db.add(new_banner)
    db.commit()
    db.refresh(new_banner)
    
    return BannerResponse(
        id=new_banner.id,
        title=new_banner.title,
        content=new_banner.content,
        image_url=new_banner.image_url,
        created_at=new_banner.created_at.isoformat()
    )


@router.get("/", response_model=List[BannerResponse])
def get_banners(db: Session = Depends(get_session)):
    """
    Lấy tất cả banners
    """
    banners = db.exec(select(Banner).order_by(Banner.created_at.desc())).all()
    
    return [
        BannerResponse(
            id=b.id,
            title=b.title,
            content=b.content,
            image_url=b.image_url,
            created_at=b.created_at.isoformat()
        )
        for b in banners
    ]


@router.get("/{banner_id}", response_model=BannerResponse)
def get_banner(banner_id: int, db: Session = Depends(get_session)):
    """
    Lấy chi tiết 1 banner
    """
    banner = db.get(Banner, banner_id)
    if not banner:
        raise HTTPException(status_code=404, detail="Banner không tồn tại")
    
    return BannerResponse(
        id=banner.id,
        title=banner.title,
        content=banner.content,
        image_url=banner.image_url,
        created_at=banner.created_at.isoformat()
    )


@router.delete("/{banner_id}")
def delete_banner(banner_id: int, db: Session = Depends(get_session)):
    """
    Xóa banner
    """
    banner = db.get(Banner, banner_id)
    if not banner:
        raise HTTPException(status_code=404, detail="Banner không tồn tại")
    
    db.delete(banner)
    db.commit()
    
    return {"success": True, "message": f"Xóa banner ID {banner_id} thành công"}