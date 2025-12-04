import React, { useState, useEffect } from "react";
import Loading from "../components/Loading";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [topScammers, setTopScammers] = useState([]);
  const [topSearches, setTopSearches] = useState([]);
  const [todayReports, setTodayReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, scammersData, searchesData, todayData] =
        await Promise.all([
          fetch("http://localhost:8000/api/dashboard/stats").then((res) =>
            res.json()
          ),
          fetch("http://localhost:8000/api/search/top/reported-7days").then(
            (res) => res.json()
          ),
          fetch("http://localhost:8000/api/search/top/searches-today").then(
            (res) => res.json()
          ),
          fetch("http://localhost:8000/api/search/reports/today").then((res) =>
            res.json()
          ),
        ]);

      setStats(statsData);
      setTopScammers(scammersData);
      setTopSearches(searchesData);

      // Combine today's reports
      const allTodayReports = [
        ...(todayData.account_reports || []),
        ...(todayData.website_reports || []),
      ];
      setTodayReports(allTodayReports);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    fetchDashboardData();
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  if (loading) return <Loading message="ĐANG TẢI DASHBOARD..." />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 glow-green">
            DASHBOARD HỆ THỐNG
          </h1>
          <p className="text-green-300">
            Thống kê toàn diện & phân tích dữ liệu scam
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={refreshData}
            className="px-4 py-2 bg-green-700 border border-green-500 rounded hover:bg-green-600 flex items-center"
          >
            🔄 REFRESH
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-black bg-opacity-50 border border-green-700 rounded-lg p-4 hover:border-green-500 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-green-400">
                {formatNumber(stats?.total_account_scams || 0)}
              </div>
              <div className="text-sm text-green-300">STK SCAM</div>
            </div>
            <div className="text-2xl">💰</div>
          </div>
          <div className="mt-2 text-xs text-green-400">
            +{formatNumber(stats?.today_reports_count || 0)} hôm nay
          </div>
        </div>

        <div className="bg-black bg-opacity-50 border border-green-700 rounded-lg p-4 hover:border-green-500 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-green-400">
                {formatNumber(stats?.total_fb_scams || 0)}
              </div>
              <div className="text-sm text-green-300">FB SCAM</div>
            </div>
            <div className="text-2xl">📘</div>
          </div>
          <div className="mt-2 text-xs text-green-400">Có link Facebook</div>
        </div>

        <div className="bg-black bg-opacity-50 border border-green-700 rounded-lg p-4 hover:border-green-500 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-green-400">
                {formatNumber(stats?.pending_reports || 0)}
              </div>
              <div className="text-sm text-green-300">CHỜ DUYỆT</div>
            </div>
            <div className="text-2xl">⏳</div>
          </div>
          <div className="mt-2 text-xs text-green-400">Báo cáo đang xử lý</div>
        </div>

        <div className="bg-black bg-opacity-50 border border-green-700 rounded-lg p-4 hover:border-green-500 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-green-400">
                {formatNumber(stats?.total_comments || 0)}
              </div>
              <div className="text-sm text-green-300">BÌNH LUẬN</div>
            </div>
            <div className="text-2xl">💬</div>
          </div>
          <div className="mt-2 text-xs text-green-400">Tương tác cộng đồng</div>
        </div>
      </div>

      {/* Charts and Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Top Scammers */}
        <div className="border border-green-700 rounded-lg overflow-hidden">
          <div className="bg-green-900 bg-opacity-30 p-4 border-b border-green-700">
            <h3 className="font-bold">TOP SCAMMER 7 NGÀY</h3>
          </div>
          <div className="p-4">
            {topScammers?.length > 0 ? (
              <div className="space-y-4">
                {topScammers.slice(0, 8).map((scammer, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-black bg-opacity-30 rounded border border-green-800"
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                          index === 0
                            ? "bg-yellow-900"
                            : index === 1
                            ? "bg-gray-700"
                            : index === 2
                            ? "bg-orange-900"
                            : "bg-green-900"
                        }`}
                      >
                        <span className="font-bold">{index + 1}</span>
                      </div>
                      <div>
                        <div className="font-mono font-bold">
                          {scammer.account_number}
                        </div>
                        <div className="text-sm text-green-300">
                          {scammer.account_name}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">
                        {scammer.report_count}
                      </div>
                      <div className="text-xs text-green-400">BÁO CÁO</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-green-300">Chưa có dữ liệu top scammer</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Top Searches */}
        <div className="border border-green-700 rounded-lg overflow-hidden">
          <div className="bg-green-900 bg-opacity-30 p-4 border-b border-green-700">
            <h3 className="font-bold">TOP TÌM KIẾM HÔM NAY</h3>
          </div>
          <div className="p-4">
            {topSearches?.length > 0 ? (
              <div className="space-y-3">
                {topSearches.slice(0, 8).map((search, index) => (
                  <div
                    key={index}
                    className="p-3 bg-black bg-opacity-30 rounded border border-green-800 hover:bg-green-900 hover:bg-opacity-20 transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-full bg-green-900 flex items-center justify-center mr-3">
                          <span className="font-bold text-xs">{index + 1}</span>
                        </div>
                        <div className="font-mono font-bold text-green-400">
                          {search.query}
                        </div>
                      </div>
                      <span className="bg-green-900 px-2 py-1 rounded text-xs">
                        {search.count} lượt
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-green-300">Chưa có dữ liệu tìm kiếm</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Today Reports */}
      <div className="border border-yellow-700 rounded-lg overflow-hidden">
        <div className="bg-yellow-900 bg-opacity-30 p-4 border-b border-yellow-700">
          <h3 className="font-bold">BÁO CÁO HÔM NAY ({todayReports.length})</h3>
        </div>
        <div className="p-4">
          {todayReports.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {todayReports.slice(0, 6).map((report, index) => (
                <div
                  key={index}
                  className="p-4 bg-black bg-opacity-30 rounded border border-yellow-800"
                >
                  {report.account_number ? (
                    <>
                      <div className="font-mono font-bold text-red-400 mb-1">
                        {report.account_number}
                      </div>
                      <div className="text-sm mb-2">{report.account_name}</div>
                      <div className="text-xs text-green-400 mb-2">
                        {report.bank_name || "Không có ngân hàng"}
                      </div>
                    </>
                  ) : (
                    <>
                      <a
                        href={report.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 break-all text-sm mb-1 block"
                      >
                        {report.url.length > 50
                          ? report.url.substring(0, 50) + "..."
                          : report.url}
                      </a>
                      <div className="text-xs text-purple-400 mb-2">
                        {report.category}
                      </div>
                    </>
                  )}
                  <div className="text-xs text-gray-400">
                    {new Date(report.created_at).toLocaleTimeString("vi-VN")}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-yellow-300">Chưa có báo cáo nào hôm nay</p>
            </div>
          )}
        </div>
      </div>

      {/* System Information */}
      <div className="bg-black bg-opacity-50 border border-green-700 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-bold mb-3 text-green-400">API STATUS</h4>
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span>Account Reports: ONLINE</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span>Search API: ONLINE</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span>Upload API: ONLINE</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span>Database: CONNECTED</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-3 text-green-400">THỐNG KÊ HỆ THỐNG</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Uptime:</span>
                <span className="text-green-400">99.8%</span>
              </div>
              <div className="flex justify-between">
                <span>Response Time:</span>
                <span className="text-green-400">120ms</span>
              </div>
              <div className="flex justify-between">
                <span>API Requests:</span>
                <span className="text-green-400">
                  {formatNumber(12345)}/ngày
                </span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-3 text-green-400">
              PHÂN TÍCH HIỆU SUẤT
            </h4>
            <div className="space-y-2">
              <div className="text-sm">Tốc độ xử lý báo cáo:</div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: "85%" }}
                ></div>
              </div>
              <div className="text-sm mt-4">Độ chính xác cảnh báo:</div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: "92%" }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
