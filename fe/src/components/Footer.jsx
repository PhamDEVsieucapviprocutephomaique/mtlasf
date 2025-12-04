import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-12 border-t border-green-800 pt-6 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left - About */}
          <div>
            <h3 className="font-bold text-lg mb-3 flex items-center">
              <span className="mr-2">⚡</span>
              CHECKSCAM
            </h3>
            <p className="text-sm text-green-300">
              Hệ thống chống lừa đảo, bảo vệ cộng đồng. Tra cứu, tố cáo và cảnh
              báo scammer.
            </p>
            <div className="mt-4 text-xs text-green-400">
              <p>API: http://localhost:8000</p>
              <p>
                Status: <span className="text-green-500">● ONLINE</span>
              </p>
            </div>
          </div>

          {/* Middle - Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-3">QUICK LINKS</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/search" className="hover:text-green-300">
                  🔍 Tra Cứu Scam
                </a>
              </li>
              <li>
                <a href="/report" className="hover:text-green-300">
                  🚨 Báo Cáo Scam
                </a>
              </li>
              <li>
                <a href="/scam-list" className="hover:text-green-300">
                  📋 Danh Sách Scam
                </a>
              </li>
              <li>
                <a href="/insurance-fund" className="hover:text-green-300">
                  🛡️ Quỹ Bảo Hiểm
                </a>
              </li>
              <li>
                <a href="/dashboard" className="hover:text-green-300">
                  📊 Thống Kê
                </a>
              </li>
            </ul>
          </div>

          {/* Right - System Info */}
          <div>
            <h3 className="font-bold text-lg mb-3">SYSTEM INFO</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>API Status:</span>
                <span className="text-green-500">● LIVE</span>
              </div>
              <div className="flex justify-between">
                <span>Database:</span>
                <span className="text-green-500">● CONNECTED</span>
              </div>
              <div className="flex justify-between">
                <span>Reports Today:</span>
                <span className="text-yellow-500">24</span>
              </div>
              <div className="flex justify-between">
                <span>Total Scams:</span>
                <span className="text-red-500">1,234</span>
              </div>
              <div className="flex justify-between">
                <span>Uptime:</span>
                <span>99.8%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-green-900 text-center text-sm">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-green-300">
                © {currentYear} CHECKSCAM. ALL RIGHTS RESERVED.
              </p>
              <p className="text-xs text-green-500 mt-1">
                Hệ thống bảo vệ cộng đồng khỏi lừa đảo trực tuyến
              </p>
            </div>

            <div className="flex space-x-4">
              <span className="px-3 py-1 bg-green-900 bg-opacity-30 rounded text-xs">
                VERSION 1.0.0
              </span>
              <span className="px-3 py-1 bg-green-900 bg-opacity-30 rounded text-xs">
                BUILD 2024.12
              </span>
              <span className="px-3 py-1 bg-green-900 bg-opacity-30 rounded text-xs">
                API v1
              </span>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-6 p-3 bg-black bg-opacity-50 border border-green-800 rounded">
            <p className="text-xs text-green-400">
              ⚠️ HỆ THỐNG AN NINH: Dữ liệu được mã hóa và bảo vệ. Không chia sẻ
              thông tin cá nhân nhạy cảm. Chỉ sử dụng với mục đích chống lừa
              đảo.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
