import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";

const Home = () => {
  const [stats, setStats] = useState(null);
  const [topScammers, setTopScammers] = useState([]);
  const [topSearches, setTopSearches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, scammersData] = await Promise.all([
          api.getDashboardStats(),
          api.getTopScammers(7),
        ]);
        setStats(statsData);
        setTopScammers(scammersData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const features = [
    {
      icon: "🔍",
      title: "TRA CỨU SCAM",
      desc: "Kiểm tra STK, SĐT, website nghi vấn",
      link: "/search",
    },
    {
      icon: "🚨",
      title: "TỐ CÁO LỪA ĐẢO",
      desc: "Gửi báo cáo scam mới",
      link: "/report",
    },
    {
      icon: "📋",
      title: "DANH SÁCH SCAM",
      desc: "Xem tất cả STK/website lừa đảo",
      link: "/scam-list",
    },
    {
      icon: "🛡️",
      title: "QUỸ BẢO HIỂM",
      desc: "Admin trung gian uy tín",
      link: "/insurance-fund",
    },
    {
      icon: "📊",
      title: "THỐNG KÊ",
      desc: "Dashboard hệ thống",
      link: "/dashboard",
    },
    {
      icon: "⚡",
      title: "TOP SCAMMER",
      desc: "Scammer bị tố cáo nhiều nhất",
      link: "/scam-list",
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-green-400">ĐANG TẢI DỮ LIỆU HỆ THỐNG...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-8 scan-line relative">
        <h1 className="text-5xl font-bold mb-4 typewriter glow-green">
          CHECKSCAM<span className="blink">_</span>
        </h1>
        <p className="text-xl text-green-300 mb-6">
          HỆ THỐNG CHỐNG LỪA ĐẢO - BẢO VỆ CỘNG ĐỒNG
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <Link
            to="/search"
            className="p-4 bg-green-900 bg-opacity-50 border border-green-700 rounded-lg hover:bg-green-800 transition-all"
          >
            <div className="text-2xl mb-2">🔍</div>
            <h3 className="font-bold">TRA CỨU NGAY</h3>
          </Link>
          <Link
            to="/report"
            className="p-4 bg-red-900 bg-opacity-50 border border-red-700 rounded-lg hover:bg-red-800 transition-all"
          >
            <div className="text-2xl mb-2">🚨</div>
            <h3 className="font-bold">BÁO CÁO SCAM</h3>
          </Link>
          <Link
            to="/scam-list"
            className="p-4 bg-yellow-900 bg-opacity-50 border border-yellow-700 rounded-lg hover:bg-yellow-800 transition-all"
          >
            <div className="text-2xl mb-2">📋</div>
            <h3 className="font-bold">DANH SÁCH SCAM</h3>
          </Link>
          <Link
            to="/insurance-fund"
            className="p-4 bg-blue-900 bg-opacity-50 border border-blue-700 rounded-lg hover:bg-blue-800 transition-all"
          >
            <div className="text-2xl mb-2">🛡️</div>
            <h3 className="font-bold">BẢO HIỂM CS</h3>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-black bg-opacity-50 border border-green-700 rounded-lg p-4">
          <div className="text-3xl font-bold text-green-400">
            {stats?.total_account_scams || 0}
          </div>
          <div className="text-sm text-green-300">STK/SCAM ĐÃ DUYỆT</div>
          <div className="text-xs mt-2">
            +{stats?.today_reports_count || 0} hôm nay
          </div>
        </div>
        <div className="bg-black bg-opacity-50 border border-green-700 rounded-lg p-4">
          <div className="text-3xl font-bold text-green-400">
            {stats?.total_fb_scams || 0}
          </div>
          <div className="text-sm text-green-300">FACEBOOK SCAM</div>
          <div className="text-xs mt-2">Có link FB</div>
        </div>
        <div className="bg-black bg-opacity-50 border border-green-700 rounded-lg p-4">
          <div className="text-3xl font-bold text-green-400">
            {stats?.pending_reports || 0}
          </div>
          <div className="text-sm text-green-300">BÁO CÁO CHỜ</div>
          <div className="text-xs mt-2">Đang chờ duyệt</div>
        </div>
        <div className="bg-black bg-opacity-50 border border-green-700 rounded-lg p-4">
          <div className="text-3xl font-bold text-green-400">
            {stats?.total_comments || 0}
          </div>
          <div className="text-sm text-green-300">BÌNH LUẬN</div>
          <div className="text-xs mt-2">Tương tác cộng đồng</div>
        </div>
      </div>

      {/* Features Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-4 border-b border-green-700 pb-2">
          TÍNH NĂNG HỆ THỐNG
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <Link
              key={index}
              to={feature.link}
              className="bg-black bg-opacity-50 border border-green-800 rounded-lg p-4 hover:border-green-500 hover:bg-green-900 hover:bg-opacity-20 transition-all"
            >
              <div className="flex items-start space-x-4">
                <div className="text-3xl">{feature.icon}</div>
                <div>
                  <h3 className="font-bold text-lg mb-1">{feature.title}</h3>
                  <p className="text-sm text-green-300">{feature.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Top Scammers */}
      <div>
        <h2 className="text-2xl font-bold mb-4 border-b border-green-700 pb-2">
          TOP SCAMMER 7 NGÀY
        </h2>
        {topScammers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-green-900 bg-opacity-30">
                  <th className="border border-green-700 p-2">STT</th>
                  <th className="border border-green-700 p-2">STK/SĐT</th>
                  <th className="border border-green-700 p-2">TÊN</th>
                  <th className="border border-green-700 p-2">
                    SỐ LẦN BÁO CÁO
                  </th>
                </tr>
              </thead>
              <tbody>
                {topScammers.slice(0, 5).map((scammer, index) => (
                  <tr
                    key={index}
                    className="hover:bg-green-900 hover:bg-opacity-20"
                  >
                    <td className="border border-green-700 p-2 text-center">
                      {index + 1}
                    </td>
                    <td className="border border-green-700 p-2 font-mono">
                      {scammer.account_number}
                    </td>
                    <td className="border border-green-700 p-2">
                      {scammer.account_name}
                    </td>
                    <td className="border border-green-700 p-2 text-center">
                      <span className="bg-red-900 px-2 py-1 rounded">
                        {scammer.report_count}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 border border-green-700 rounded-lg">
            <p className="text-green-300">Chưa có dữ liệu top scammer</p>
          </div>
        )}
      </div>

      {/* Quick Search */}
      <div className="bg-black bg-opacity-50 border border-green-700 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">KIỂM TRA NHANH</h2>
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Nhập STK/SĐT cần kiểm tra..."
            className="flex-grow bg-black border border-green-600 text-green-400 px-4 py-2 rounded focus:outline-none focus:border-green-500"
          />
          <Link
            to="/search"
            className="px-6 py-2 bg-green-700 border border-green-500 rounded hover:bg-green-600 transition-all font-bold"
          >
            TRA CỨU
          </Link>
        </div>
        <p className="text-sm text-green-300 mt-2">
          Nhập STK, SĐT, link FB hoặc URL website để kiểm tra ngay
        </p>
      </div>
    </div>
  );
};

export default Home;
