import React, { useState, useEffect } from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [systemStats, setSystemStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSystemStats();
  }, []);

  const fetchSystemStats = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/dashboard/stats");
      const data = await response.json();
      setSystemStats(data);
    } catch (error) {
      console.error("Error fetching system stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat("vi-VN").format(num || 0);
  };

  return (
    <footer className="mt-12 border-t border-green-800 pt-6 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-3 flex items-center">
              CHECKGDTG
            </h3>
            <p className="text-sm text-green-300">
              Hệ thống chống lừa đảo, bảo vệ cộng đồng. Tra cứu, tố cáo và cảnh
              báo scammer.
            </p>
            <div className="mt-4 text-xs text-green-400">
              <p>API: xanohtml.nnmust.h989xkw</p>
              <p>
                Status: <span className="text-green-500">ONLINE</span>
              </p>
              <p>by anodev telegram: https://web.telegram.org/k/#@o2v25</p>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-3">LIÊN KẾT NHANH</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/" className="hover:text-green-300">
                  Trang Chủ
                </a>
              </li>
              <li>
                <a href="/search" className="hover:text-green-300">
                  Tra Cứu Scam
                </a>
              </li>
              <li>
                <a href="/scam-list" className="hover:text-green-300">
                  Danh Sách Scam
                </a>
              </li>
              <li>
                <a href="/report" className="hover:text-green-300">
                  Tố Cáo Scam
                </a>
              </li>
              <li>
                <a href="/insurance-fund" className="hover:text-green-300">
                  Quỹ Bảo Hiểm
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-3">THỐNG KÊ HỆ THỐNG</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>STK Scam:</span>
                <span className="text-green-500">
                  {loading
                    ? "..."
                    : formatNumber(systemStats?.total_account_scams)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>FB Scam:</span>
                <span className="text-green-500">
                  {loading ? "..." : formatNumber(systemStats?.total_fb_scams)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Bình luận:</span>
                <span>
                  {loading ? "..." : formatNumber(systemStats?.total_comments)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Chờ duyệt:</span>
                <span className="text-yellow-500">
                  {loading ? "..." : formatNumber(systemStats?.pending_reports)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-green-900 text-center text-sm">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-green-300">
                © {currentYear} CHECKGDTG. ALL RIGHTS RESERVED.
              </p>
              <p className="text-xs text-green-500 mt-1">
                Hệ thống bảo vệ cộng đồng khỏi lừa đảo trực tuyến
              </p>
            </div>

            <div className="flex space-x-4">
              <span className="px-3 py-1 bg-green-900 bg-opacity-30 rounded text-xs">
                VERSION 2.0.0
              </span>
              <span className="px-3 py-1 bg-green-900 bg-opacity-30 rounded text-xs">
                BUILD 2025.12
              </span>
              <span className="px-3 py-1 bg-green-900 bg-opacity-30 rounded text-xs">
                API v1
              </span>
            </div>
          </div>

          <div className="mt-6 p-3 bg-black bg-opacity-50 border border-green-800 rounded">
            <p className="text-xs text-green-400">
              HỆ THỐNG AN NINH: Dữ liệu được mã hóa và bảo vệ. Không chia sẻ
              thông tin cá nhân nhạy cảm. Chỉ sử dụng với mục đích chống lừa
              đảo.
            </p>
            <p>
              @Được làm bởi anodev, telegram: https://web.telegram.org/k/#@o2v25{" "}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
