from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session
import uvicorn

# Import database
from core.database import create_db_and_tables, engine, init_default_data

# Import routers
from api.account_reports import router as account_reports_router
from api.website_reports import router as website_reports_router
from api.comments import router as comments_router
from api.insurance_admins import router as insurance_admins_router
from api.search import router as search_router
from api.dashboard import router as dashboard_router
from api.upload import router as upload_router

# Khởi tạo FastAPI app
app = FastAPI(
    title="CheckScam API - Hệ Thống Kiểm Tra & Tố Cáo Lừa Đảo",
    description="""
    ## API đầy đủ cho hệ thống CheckScam
    
    ### Tính năng chính:
    - ✅ Tố cáo tài khoản scam (STK, SĐT, FB, Zalo)
    - ✅ Tố cáo website/link scam
    - ✅ Bình luận đơn giản (chỉ POST + GET)
    - ✅ Quản lý quỹ bảo hiểm CS (FULL CRUD)
    - ✅ Tìm kiếm nâng cao (STK, SĐT, FB, Zalo)
    - ✅ Tìm kiếm admin quỹ bảo hiểm
    - ✅ Top tìm kiếm hôm nay
    - ✅ Top người bị tố cáo 7 ngày
    - ✅ Báo cáo hôm nay
    - ✅ Upload ảnh lên FTP
    """,
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# === CORS Configuration ===
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Cho phép tất cả domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === Include Routers ===
app.include_router(
    account_reports_router,
    prefix="/api/account-reports",
    tags=["📋 Tố Cáo Tài Khoản Scam"]
)

app.include_router(
    website_reports_router,
    prefix="/api/website-reports",
    tags=["🌐 Tố Cáo Website Scam"]
)

app.include_router(
    comments_router,
    prefix="/api/comments",
    tags=["💬 Bình Luận (Đơn Giản)"]
)

app.include_router(
    insurance_admins_router,
    prefix="/api/insurance-admins",
    tags=["🛡️ Quỹ Bảo Hiểm CS (FULL CRUD)"]
)

app.include_router(
    search_router,
    prefix="/api/search",
    tags=["🔍 Tìm Kiếm Nâng Cao"]
)

app.include_router(
    dashboard_router,
    prefix="/api/dashboard",
    tags=["📊 Dashboard & Thống Kê"]
)

app.include_router(
    upload_router,
    prefix="/api/upload",
    tags=["📤 Upload Ảnh FTP"]
)


# === Startup Event ===
@app.on_event("startup")
def on_startup():
    """Khởi động ứng dụng: tạo tables và dữ liệu mặc định"""
    print("=" * 60)
    print("🚀 KHỞI ĐỘNG CHECKSCAM API v2.0")
    print("=" * 60)
    
    print("📊 Tạo database tables...")
    create_db_and_tables()
    
    print("🔧 Khởi tạo dữ liệu mặc định...")
    with Session(engine) as session:
        init_default_data(session)
    
    print("✅ HỆ THỐNG ĐÃ SẴN SÀNG!")
    print("📚 Docs: http://localhost:8000/docs")
    print("=" * 60)


# === Root Endpoints ===
@app.get("/")
def root():
    """API Root - Thông tin hệ thống"""
    return {
        "message": "CheckScam API v2.0 - Hệ Thống Kiểm Tra & Tố Cáo Lừa Đảo",
        "version": "2.0.0",
        "status": "running",
        "docs": "/docs",
        "redoc": "/redoc",
        "features": {
            "account_reports": "Tố cáo tài khoản scam (1 người nhiều bài)",
            "website_reports": "Tố cáo website/link scam",
            "comments": "Bình luận đơn giản (POST + GET only)",
            "insurance_admins": "Quản lý quỹ bảo hiểm CS (FULL CRUD)",
            "search": "Tìm kiếm nâng cao (STK, SĐT, FB, Zalo)",
            "search_admin": "Tìm kiếm admin quỹ bảo hiểm",
            "top_searches": "Top 10 tìm kiếm hôm nay",
            "top_reported": "Top 10 người bị tố cáo 7 ngày",
            "reports_today": "Tất cả báo cáo hôm nay",
            "upload": "Upload ảnh lên FTP"
        },
        "endpoints": {
            "account_reports": "/api/account-reports",
            "website_reports": "/api/website-reports",
            "comments": "/api/comments",
            "insurance_admins": "/api/insurance-admins",
            "search": "/api/search",
            "search_admin": "/api/search/admin/find",
            "top_searches": "/api/search/top/searches-today",
            "top_reported": "/api/search/top/reported-7days",
            "reports_today": "/api/search/reports/today",
            "quick_check": "/api/search/check/{identifier}",
            "dashboard": "/api/dashboard",
            "upload": "/api/upload"
        }
    }


@app.get("/health")
def health_check():
    """Health Check Endpoint"""
    return {
        "status": "healthy",
        "service": "CheckScam API v2.0",
        "database": "connected"
    }

# === Run Application ===
if __name__ == "__main__":


    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True  # Auto-reload khi code thay đổi
    )