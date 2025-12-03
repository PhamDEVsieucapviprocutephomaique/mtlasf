from sqlmodel import SQLModel, create_engine, Session
import os
from dotenv import load_dotenv
from datetime import datetime  # <--- ĐÃ THÊM: Import datetime để dùng cho default_factory

load_dotenv()

# DATABASE_URL - Cập nhật theo thông tin của bạn
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "mysql+pymysql://scam_user:your_password@localhost:3306/checkscam_db"
)

print(f"DEBUG: DATABASE_URL = {DATABASE_URL}")

# CẤU HÌNH MYSQL
engine = create_engine(
    DATABASE_URL,
    echo=True,  # Log SQL queries (tắt ở production)
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
    """
    Tạo tất cả tables trong database MySQL
    """
    try:
        SQLModel.metadata.create_all(engine)
        print("✅ Đã tạo tables thành công trong MySQL!")
    except Exception as e:
        print(f"❌ Lỗi khi tạo tables: {e}")
        raise


def get_session():
    """
    Dependency để lấy database session
    """
    with Session(engine) as session:
        yield session


def init_default_data(session: Session):
    """
    Khởi tạo dữ liệu mặc định cho hệ thống
    """
    from models.models import SystemSettings
    from sqlmodel import select
    
    # Kiểm tra xem đã có settings chưa
    settings = session.exec(select(SystemSettings)).first()
    
    if not settings:
        print("🔧 Khởi tạo cài đặt hệ thống mặc định...")
        # ĐÃ SỬA LỖI: Gán giá trị thủ công cho updated_at 
        # để tránh lỗi ValueError khi SQLModel gọi default_factory
        settings = SystemSettings(
            # total_account_scams, total_fb_scams, total_comments, pending_reports 
            # sẽ tự động là 0 vì đã có Field(default=0) trong models/models.py
            updated_at=datetime.utcnow() 
        )
        session.add(settings)
        session.commit()
        print("✅ Đã tạo cài đặt hệ thống mặc định!")