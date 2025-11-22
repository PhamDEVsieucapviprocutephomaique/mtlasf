from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from pydantic import BaseModel
from typing import List
from datetime import datetime
from models.models import News

router = APIRouter()


class NewsCreate(BaseModel):
    """Schema để tạo tin tức mới"""
    title: str
    content: str
    images: List[str] = []


class NewsResponse(BaseModel):
    """Schema trả về tin tức"""
    id: int
    title: str
    content: str
    images: List[str]
    created_at: str

    class Config:
        from_attributes = True


class NewsUpdate(BaseModel):
    """Schema để cập nhật tin tức"""
    title: str = None
    content: str = None
    images: List[str] = None


def get_session():
    from core.database import engine
    with Session(engine) as session:
        yield session


@router.post("/", response_model=NewsResponse)
def create_news(news: NewsCreate, db: Session = Depends(get_session)):
    """
    Tạo tin tức mới
    """
    new_news = News(
        title=news.title,
        content=news.content,
        images=news.images
    )
    
    db.add(new_news)
    db.commit()
    db.refresh(new_news)
    
    return NewsResponse(
        id=new_news.id,
        title=new_news.title,
        content=new_news.content,
        images=new_news.images,
        created_at=new_news.created_at.isoformat()
    )


@router.get("/", response_model=List[NewsResponse])
def get_all_news(db: Session = Depends(get_session)):
    """
    Lấy tất cả tin tức
    """
    news_list = db.exec(select(News).order_by(News.created_at.desc())).all()
    
    return [
        NewsResponse(
            id=n.id,
            title=n.title,
            content=n.content,
            images=n.images,
            created_at=n.created_at.isoformat()
        )
        for n in news_list
    ]


@router.get("/{news_id}", response_model=NewsResponse)
def get_news(news_id: int, db: Session = Depends(get_session)):
    """
    Lấy chi tiết 1 tin tức
    """
    news = db.get(News, news_id)
    if not news:
        raise HTTPException(status_code=404, detail="Tin tức không tồn tại")
    
    return NewsResponse(
        id=news.id,
        title=news.title,
        content=news.content,
        images=news.images,
        created_at=news.created_at.isoformat()
    )


@router.put("/{news_id}", response_model=NewsResponse)
def update_news(
    news_id: int,
    news_update: NewsUpdate,
    db: Session = Depends(get_session)
):
    """
    Cập nhật tin tức
    """
    news = db.get(News, news_id)
    if not news:
        raise HTTPException(status_code=404, detail="Tin tức không tồn tại")
    
    if news_update.title is not None:
        news.title = news_update.title
    if news_update.content is not None:
        news.content = news_update.content
    if news_update.images is not None:
        news.images = news_update.images
    
    db.add(news)
    db.commit()
    db.refresh(news)
    
    return NewsResponse(
        id=news.id,
        title=news.title,
        content=news.content,
        images=news.images,
        created_at=news.created_at.isoformat()
    )


@router.delete("/{news_id}")
def delete_news(news_id: int, db: Session = Depends(get_session)):
    """
    Xóa tin tức
    """
    news = db.get(News, news_id)
    if not news:
        raise HTTPException(status_code=404, detail="Tin tức không tồn tại")
    
    db.delete(news)
    db.commit()
    
    return {"success": True, "message": f"Xóa tin tức ID {news_id} thành công"}