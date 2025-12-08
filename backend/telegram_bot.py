import os
import logging
import re
import asyncio
import aiohttp
from datetime import datetime
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes

# ================= CẤU HÌNH =================
TELEGRAM_TOKEN = "8423379891:AAHFzSxShCG-w5KOuXq5Y3SCknFDDBLh0V8"
API_BASE_URL = "http://localhost:8000"

# ================= LOGGING =================
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# ================= KIỂM TRA ĐỊNH DẠNG =================
def is_valid_search_query(text: str) -> bool:
    """Kiểm tra có phải thông tin hợp lệ không"""
    text = text.strip().lower()
    
    # Kiểm tra số điện thoại
    phone_pattern = r'^(0|\+84)(3[2-9]|5[6-9]|7[0-9]|8[1-9]|9[0-9])\d{7}$'
    if re.match(phone_pattern, text.replace(' ', '')):
        return True
    
    # Kiểm tra số tài khoản
    if re.match(r'^\d{8,16}$', text.replace(' ', '')):
        return True
    
    # Kiểm tra link
    if any(x in text for x in ['facebook.com/', 'fb.com/', 'zalo.me/', 'zalo.vn/', 'zalo.com/']):
        return True
    
    # Kiểm tra từ khóa
    keywords = ['admin', 'quỹ', 'bảo hiểm', 'cs', 'zalo', 'sđt', 'stk', 'phone', 'bank']
    return any(keyword in text for keyword in keywords)

# ================= API CALLS =================
async def search_admin(query: str):
    """Tìm kiếm admin theo query"""
    try:
        async with aiohttp.ClientSession() as session:
            url = f"{API_BASE_URL}/api/search/admin/find?q={query}"
            async with session.get(url) as response:
                if response.status == 200:
                    return await response.json()
    except Exception as e:
        logger.error(f"Error searching admin: {e}")
    return []

async def get_all_admins():
    """Lấy danh sách tất cả admin"""
    try:
        async with aiohttp.ClientSession() as session:
            url = f"{API_BASE_URL}/api/insurance-admins/"
            async with session.get(url) as response:
                if response.status == 200:
                    return await response.json()
    except Exception as e:
        logger.error(f"Error getting admins: {e}")
    return []

# ================= HANDLERS =================
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handler cho lệnh /start"""
    welcome_text = """
✨ **Welcome to CheckGDTG.vn Admin Finder!** ✨

🔎 *Tìm kiếm Admin Quỹ Bảo Hiểm CS*

📌 **Gửi các thông tin sau để tìm admin:**
• Số điện thoại (SĐT)
• Số tài khoản ngân hàng (STK) 
• Link Facebook
• Link Zalo/Số Zalo
• Tên admin
• Số thứ tự admin

📋 **LỆNH HỆ THỐNG:**
/start - Hướng dẫn sử dụng
/admins - Xem danh sách admin
/help - Trợ giúp

🔗 **Website:** https://checkgdtg.vn
📞 **Hỗ trợ:** Liên hệ admin qua kết quả tìm kiếm
"""
    await update.message.reply_text(welcome_text, parse_mode='Markdown')

async def admins_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Lệnh /admins - Hiển thị tất cả admin (RÚT GỌN)"""
    try:
        admins = await get_all_admins()
        if admins:
            # Chỉ hiển thị 3 admin đầu
            text = "👥 **DANH SÁCH ADMIN QUỸ BẢO HIỂM**\n\n"
            
            for admin in admins[:3]:
                text += f"━━━━━━━━━━━━━━━━━━━━━━\n"
                text += f"👑 **ADMIN #{admin['order_number']}**\n"
                text += f"📛 **Tên:** {admin['full_name']}\n"
                
                if admin.get('zalo'):
                    text += f"💚 **Zalo:** `{admin['zalo']}`\n"
                if admin.get('phone'):
                    text += f"📞 **SĐT:** `{admin['phone']}`\n"
                
                # Quỹ bảo hiểm
                insurance = admin.get('insurance_amount', 0)
                if insurance > 0:
                    text += f"💰 **Quỹ:** {insurance:,.0f} VNĐ\n"
                
                # Tài khoản ngân hàng
                if admin.get('bank_accounts'):
                    text += "🏦 **TK ngân hàng:** "
                    banks = []
                    for acc in admin['bank_accounts'][:2]:
                        banks.append(f"{acc.get('bank', '')}: `{acc.get('account_number', '')}`")
                    text += ", ".join(banks) + "\n"
                
                text += "\n"
            
            if len(admins) > 3:
                text += f"📋 ...và **{len(admins) - 3}** admin khác.\n"
            
            text += "\n🔗 **Website:** https://checkgdtg.vn"
            
            # Kiểm tra độ dài tin nhắn
            if len(text) > 4000:
                text = text[:4000] + "...\n\n⚠️ Tin nhắn quá dài, vui lòng tìm kiếm cụ thể hơn."
            
            await update.message.reply_text(text, parse_mode='Markdown')
        else:
            await update.message.reply_text("❌ Không tìm thấy admin nào trong hệ thống!")
    except Exception as e:
        logger.error(f"Error: {e}")
        await update.message.reply_text("❌ Lỗi hệ thống!")

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Lệnh /help"""
    help_text = """
🆘 **TRỢ GIÚP TÌM KIẾM ADMIN**

📌 **CÁCH TÌM KIẾM:**
Gửi: SĐT, STK, Facebook, Zalo, Tên, Số admin

📋 **VÍ DỤ:**
• 0912345678
• 0123456789
• zalo.me/0912345678
• facebook.com/admin.name
• Nguyễn Văn A
• Admin #1

🔗 **Website:** https://checkgdtg.vn
"""
    await update.message.reply_text(help_text, parse_mode='Markdown')

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Xử lý tin nhắn tìm kiếm admin"""
    user_input = update.message.text.strip()
    
    # Kiểm tra nếu là tin nhắn thông thường
    if not is_valid_search_query(user_input):
        return  # Không xử lý
    
    # Hiển thị "Đang tìm kiếm..."
    searching_msg = await update.message.reply_text(
        f"🔍 **Đang tìm kiếm admin...**", 
        parse_mode='Markdown'
    )
    
    try:
        # Tìm kiếm admin
        admins = await search_admin(user_input)
        
        if admins and len(admins) > 0:
            # Format kết quả - RÚT GỌN
            result_text = f"""
✅ **TÌM THẤY ADMIN** ({len(admins)} kết quả)
"""
            
            for i, admin in enumerate(admins[:2], 1):  # Chỉ 2 kết quả
                result_text += f"\n━━━━━━━━━━━━━━━━━━\n"
                result_text += f"👑 **ADMIN #{admin['order_number']}**\n"
                result_text += f"📛 **Tên:** {admin['full_name']}\n"
                
                if admin.get('zalo'):
                    result_text += f"💚 **Zalo:** `{admin['zalo']}`\n"
                if admin.get('phone'):
                    result_text += f"📞 **SĐT:** `{admin['phone']}`\n"
                if admin.get('fb_main'):
                    fb = admin['fb_main']
                    if len(fb) > 30:
                        fb = fb[:27] + "..."
                    result_text += f"📘 **FB:** {fb}\n"
                
                # Quỹ bảo hiểm
                insurance = admin.get('insurance_amount', 0)
                if insurance > 0:
                    result_text += f"💰 **Quỹ:** {insurance:,.0f} VNĐ\n"
                
                # Tài khoản ngân hàng
                if admin.get('bank_accounts'):
                    result_text += "🏦 **TKNH:** "
                    banks = []
                    for acc in admin['bank_accounts'][:2]:
                        banks.append(f"{acc.get('bank', '')}: `{acc.get('account_number', '')}`")
                    result_text += ", ".join(banks) + "\n"
            
            if len(admins) > 2:
                result_text += f"\n📋 ...và **{len(admins) - 2}** admin khác.\n"
            
            result_text += """
💡 **LỜI KHUYÊN:**
• Kiểm tra kỹ thông tin trước khi giao dịch
• Liên hệ trực tiếp với admin để xác minh

🔗 **Website:** https://checkgdtg.vn
📋 **Xem tất cả:** /admins
"""
            
            # Kiểm tra độ dài
            if len(result_text) > 4000:
                result_text = result_text[:4000] + "..."
            
            await searching_msg.edit_text(result_text, parse_mode='Markdown')
            
        else:
            await searching_msg.edit_text(
                f"""
❌ **KHÔNG TÌM THẤY**

Không tìm thấy admin nào cho: `{user_input}`

💡 **Thử:**
• Kiểm tra lại thông tin
• Thử tìm bằng số điện thoại/zalo
• Xem tất cả admin: /admins

🔗 **Website:** https://checkgdtg.vn
""",
                parse_mode='Markdown'
            )
            
    except Exception as e:
        logger.error(f"Error: {e}")
        await searching_msg.edit_text("❌ **Lỗi hệ thống!**", parse_mode='Markdown')

# ================= MAIN =================
def main():
    """Khởi động bot"""
    print("🤖 Telegram bot starting...")
    print("📌 Bot chỉ tìm kiếm ADMIN Quỹ Bảo Hiểm CS")
    
    # Tạo application
    application = Application.builder().token(TELEGRAM_TOKEN).build()
    
    # Thêm handlers
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("admins", admins_command))
    application.add_handler(CommandHandler("help", help_command))
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))
    
    print("✅ Bot đã sẵn sàng!")
    print("👉 Các lệnh: /start, /admins, /help")
    print("👉 Tìm kiếm: Gửi SĐT/STK/FB/Zalo/Tên admin")
    
    # Chạy bot
    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == "__main__":
    main()