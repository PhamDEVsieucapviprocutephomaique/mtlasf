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
    title="CheckScam API",
    description="API hệ thống kiểm tra & tố cáo lừa đảo",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# === CORS Configuration ===
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Cho phép tất cả domain (production nên giới hạn)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === Include Routers ===
app.include_router(
    account_reports_router,
    prefix="/api/account-reports",
    tags=["Tố Cáo Tài Khoản Scam"]
)

app.include_router(
    website_reports_router,
    prefix="/api/website-reports",
    tags=["Tố Cáo Website Scam"]
)

app.include_router(
    comments_router,
    prefix="/api/comments",
    tags=["Bình Luận"]
)

app.include_router(
    insurance_admins_router,
    prefix="/api/insurance-admins",
    tags=["Quỹ Bảo Hiểm CS"]
)

app.include_router(
    search_router,
    prefix="/api/search",
    tags=["Tìm Kiếm"]
)

app.include_router(
    dashboard_router,
    prefix="/api/dashboard",
    tags=["Dashboard & Thống Kê"]
)

app.include_router(
    upload_router,
    prefix="/api/upload",
    tags=["Upload Ảnh"]
)


# === Startup Event ===
@app.on_event("startup")
def on_startup():
    """
    Khởi động ứng dụng: tạo tables và dữ liệu mặc định
    """
    print("🚀 Khởi động CheckScam API...")
    
    print("📊 Tạo database tables...")
    create_db_and_tables()
    
    print("🔧 Khởi tạo dữ liệu mặc định...")
    with Session(engine) as session:
        init_default_data(session)
    
    print("✅ Hệ thống đã sẵn sàng!")


# === Root Endpoints ===
@app.get("/")
def root():
    """
    API Root - Thông tin hệ thống
    """
    return {
        "message": "CheckScam API - Hệ thống kiểm tra & tố cáo lừa đảo",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
        "endpoints": {
            "account_reports": "/api/account-reports",
            "website_reports": "/api/website-reports",
            "comments": "/api/comments",
            "insurance_admins": "/api/insurance-admins",
            "search": "/api/search",
            "dashboard": "/api/dashboard",
            "upload": "/api/upload"
        }
    }


@app.get("/health")
def health_check():
    """
    Health Check Endpoint
    """
    return {
        "status": "healthy",
        "service": "CheckScam API"
    }


# === Run Application ===
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True  # Auto-reload khi code thay đổi (chỉ dùng development)
    )