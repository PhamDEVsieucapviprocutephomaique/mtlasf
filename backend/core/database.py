from sqlmodel import SQLModel, create_engine, Session
from datetime import datetime

# HARDCODE DATABASE URL - KHÔNG DÙNG .ENV
DATABASE_URL = "mysql+pymysql://rvcavnufhosting_user:123456aA%40@202.92.5.48:3306/rvcavnufhosting_checkscam"

print(f"🔗 Connecting to database: {DATABASE_URL}")

# CẤU HÌNH MYSQL
engine = create_engine(
    DATABASE_URL,
    echo=False,  # Tắt log SQL queries ở production
    pool_pre_ping=True,  # Kiểm tra kết nối trước khi sử dụng
    pool_recycle=3600,  # Recycle connection sau 1 giờ
    pool_size=10,  # Số connection tối đa
    max_overflow=20,  # Số connection thêm khi pool đầy
    connect_args={
        "charset": "utf8mb4",
        "use_unicode": True,
        "autocommit": False
    }
)


def create_db_and_tables():
    """Tạo tất cả tables trong database MySQL"""
    try:
        SQLModel.metadata.create_all(engine)
        print("✅ Đã tạo tables thành công trong MySQL!")
    except Exception as e:
        print(f"❌ Lỗi khi tạo tables: {e}")
        raise


def get_session():
    """Dependency để lấy database session"""
    with Session(engine) as session:
        yield session


def init_default_data(session: Session):
    """Khởi tạo dữ liệu mặc định cho hệ thống"""
    from models.models import SystemSettings
    from sqlmodel import select
    
    # Kiểm tra xem đã có settings chưa
    settings = session.exec(select(SystemSettings)).first()
    
    if not settings:
        print("🔧 Khởi tạo cài đặt hệ thống mặc định...")
        settings = SystemSettings(
            total_account_scams=0,
            total_fb_scams=0,
            total_comments=0,
            pending_reports=0,
            updated_at=datetime.utcnow()
        )
        session.add(settings)
        session.commit()
        print("✅ Đã tạo cài đặt hệ thống mặc định!")