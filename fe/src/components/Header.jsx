import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import imageslogo from "../images/4d507a03dc5c53020a4d.jpg";
const Header = ({ theme, setTheme }) => {
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalOutput, setTerminalOutput] = useState([
    "CHECK GDTG TERMINAL v1.0.0",
    "Nhập STK/SĐT/Facebook/Zalo để tìm kiếm admin quỹ bảo hiểm",
    "-----------------------------------",
  ]);
  const [loading, setLoading] = useState(false);
  const [systemSettings, setSystemSettings] = useState({
    facebook_group: "#",
    telegram_link: "#",
  });
  const location = useLocation();

  // Fetch system settings khi component mount
  useEffect(() => {
    fetchSystemSettings();
  }, []);

  const fetchSystemSettings = async () => {
    try {
      const response = await fetch(
        "https://api.checkgdtg.vn/api/dashboard/settings"
      );
      if (response.ok) {
        const data = await response.json();
        setSystemSettings({
          facebook_group: data.facebook_group || "#",
          telegram_link: data.telegram_link || "#",
        });
      }
    } catch (error) {
      console.error("Error fetching system settings:", error);
    }
  };

  const navItems = [
    { path: "/", label: "TRANG CHỦ" },
    { path: "/search", label: "TÌM KIẾM" },
    { path: "/scam-list", label: "DANH SÁCH SCAM" },
    { path: "/report", label: "TỐ CÁO" },
    { path: "/insurance-fund", label: "QUỸ BẢO HIỂM" },
    { path: "/dashboard", label: "THỐNG KÊ" },
  ];

  const themes = [
    { id: "hacker", label: "CLASSIC", color: "text-green-400" },
    { id: "matrix", label: "MATRIX", color: "text-green-300" },
    { id: "cyberpunk", label: "CYBERPUNK", color: "text-purple-400" },
  ];

  const handleTerminalSubmit = async (e) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;

    const query = terminalInput.trim();
    setTerminalOutput((prev) => [...prev, `check_gdtg@web:~$ ${query}`]);
    setLoading(true);

    try {
      const response = await fetch(
        `https://api.checkgdtg.vn/api/search/admin/find?q=${encodeURIComponent(
          query
        )}`
      );
      const admins = await response.json();

      if (admins && admins.length > 0) {
        const results = admins
          .map((admin) => {
            return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ADMIN #${admin.order_number}: ${admin.full_name}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Zalo: ${admin.zalo || "N/A"}
Phone: ${admin.phone || "N/A"}
Facebook: ${admin.fb_main || "N/A"}
Website: ${admin.website || "N/A"}
Quỹ bảo hiểm: ${new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(admin.insurance_amount)}
Tài khoản ngân hàng:
${admin.bank_accounts
  .map((acc) => `   - ${acc.bank}: ${acc.account_number} (${acc.account_name})`)
  .join("\n")}
Dịch vụ: ${admin.services.join(", ")}
Trạng thái: ${admin.is_active ? "ĐANG HOẠT ĐỘNG" : "NGỪNG HOẠT ĐỘNG"}
          `.trim();
          })
          .join("\n\n");
        setTerminalOutput((prev) => [...prev, results]);
      } else {
        setTerminalOutput((prev) => [
          ...prev,
          "Không tìm thấy admin nào phù hợp với từ khóa này.",
        ]);
      }
    } catch (error) {
      setTerminalOutput((prev) => [...prev, `Lỗi kết nối: ${error.message}`]);
    } finally {
      setLoading(false);
      setTerminalInput("");
    }
  };

  const handleClear = () => {
    setTerminalOutput([
      "CHECK GDTG TERMINAL v1.0.0",
      "Nhập STK/SĐT/Facebook/Zalo để tìm kiếm admin quỹ bảo hiểm",
      "-----------------------------------",
    ]);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-black bg-opacity-90 backdrop-blur-sm border-b border-green-600">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center">
                <img
                  src={imageslogo}
                  alt="CHECKGDTG Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold glow-green">
                  CHECKGDTG<span className="blink"></span>
                </h1>
                <p className="text-xs text-green-300">HỆ THỐNG CHỐNG LỪA ĐẢO</p>
              </div>
            </Link>

            <nav className="flex flex-wrap justify-center gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-lg border transition-all ${
                    location.pathname === item.path
                      ? "bg-green-900 border-green-500 text-white"
                      : "border-green-800 hover:bg-green-900 hover:border-green-500"
                  }`}
                >
                  <span className="text-sm font-bold">{item.label}</span>
                </Link>
              ))}
            </nav>

            <div className="flex items-center space-x-4">
              {/* <div className="flex items-center space-x-2">
                <span className="text-sm">THEME:</span>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="bg-black border border-green-600 text-green-400 px-2 py-1 rounded text-sm"
                >
                  {themes.map((t) => (
                    <option key={t.id} value={t.id} className={t.color}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div> */}

              <button
                onClick={() => setShowTerminal(!showTerminal)}
                className="px-4 py-2 bg-green-900 border border-green-500 rounded-lg hover:bg-green-800 transition-all flex items-center"
              >
                <span className="font-bold">TERMINAL</span>
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between text-xs">
            {/* THAY THẾ PHẦN NÀY BẰNG FACEBOOK & TELEGRAM LINKS */}
            <div className="flex items-center space-x-4">
              <a
                href={systemSettings.facebook_group}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center hover:text-green-400 transition-colors"
              >
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                <span>FACEBOOK GROUP</span>
              </a>

              <a
                href="https://t.me/CHECKGDTGBOT"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 border border-blue-500 rounded-lg hover:bg-blue-700 transition-all font-bold flex items-center"
              >
                🤖 TELEGRAM BOT
              </a>
              <a
                href={systemSettings.telegram_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center hover:text-green-400 transition-colors"
              >
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                <span>TELEGRAM</span>
              </a>
              {/* Giữ lại phần hiển thị trạng thái hệ thống nhưng chuyển sang bên phải */}
              <div className="hidden md:flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              </div>
            </div>

            {/* Phần bên phải - Hiển thị thông tin IP và API status */}
            <div className="text-green-300 flex items-center space-x-4"></div>
          </div>
        </div>
      </header>

      {showTerminal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black bg-opacity-75"
            onClick={() => setShowTerminal(false)}
          ></div>
          <div className="relative w-full max-w-3xl bg-black border-2 border-green-500 rounded-lg overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between bg-green-900 px-4 py-2">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <span className="ml-2 font-bold">check_gdtg@terminal:~</span>
              </div>
              <button
                onClick={() => setShowTerminal(false)}
                className="text-white hover:text-green-300"
              >
                ✕
              </button>
            </div>

            <div className="p-4">
              <div className="h-96 overflow-y-auto bg-black text-green-400 font-mono text-sm p-4 rounded border border-green-800 mb-4">
                {terminalOutput.map((line, index) => (
                  <div key={index} className="mb-1 whitespace-pre-wrap">
                    {line}
                  </div>
                ))}
                {loading && (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span>Đang tìm kiếm...</span>
                  </div>
                )}
                <div className="flex items-center mt-2">
                  <span className="mr-2 text-green-500">check_gdtg@web:~$</span>
                  <span className="terminal-cursor"></span>
                </div>
              </div>

              <form onSubmit={handleTerminalSubmit} className="flex">
                <div className="flex-1 flex items-center bg-black border border-green-600 rounded px-3 py-2">
                  <span className="text-green-500 mr-2">$</span>
                  <input
                    type="text"
                    value={terminalInput}
                    onChange={(e) => setTerminalInput(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-green-400"
                    placeholder="Nhập STK/SĐT/Facebook/Zalo..."
                    autoFocus
                    disabled={loading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="ml-2 px-4 py-2 bg-green-700 border border-green-500 rounded hover:bg-green-600 disabled:opacity-50"
                >
                  TÌM KIẾM
                </button>
              </form>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  onClick={handleClear}
                  className="px-3 py-1 bg-green-900 bg-opacity-30 border border-green-700 rounded text-xs hover:bg-green-800"
                >
                  CLEAR
                </button>
                <button
                  onClick={() => setShowTerminal(false)}
                  className="px-3 py-1 bg-green-900 bg-opacity-30 border border-green-700 rounded text-xs hover:bg-green-800"
                >
                  EXIT
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
