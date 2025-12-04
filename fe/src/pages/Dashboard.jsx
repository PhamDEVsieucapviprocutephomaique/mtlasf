import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import Loading from "../components/Loading";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [topScammers, setTopScammers] = useState([]);
  const [topSearches, setTopSearches] = useState([]);
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7days");

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, scammersData] = await Promise.all([
        api.getDashboardStats(),
        api.getTopScammers(parseInt(timeRange.replace("days", ""))),
      ]);
      setStats(statsData);
      setTopScammers(scammersData);
      // Fetch recent reports
      const recentData = await api.getAccountReports({ limit: 10 });
      setRecentReports(recentData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    fetchDashboardData();
  };

  if (loading) return <Loading message="ĐANG TẢI DASHBOARD..." />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 glow-green">
            📊 DASHBOARD HỆ THỐNG
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
            <span className="mr-2">🔄</span>
            REFRESH
          </button>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-black border border-green-600 text-green-400 px-3 py-2 rounded"
          >
            <option value="7days">7 NGÀY</option>
            <option value="30days">30 NGÀY</option>
            <option value="90days">90 NGÀY</option>
          </select>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-black bg-opacity-50 border border-green-700 rounded-lg p-4 hover:border-green-500 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-green-400">
                {stats?.total_account_scams || 0}
              </div>
              <div className="text-sm text-green-300">STK SCAM</div>
            </div>
            <div className="text-2xl">💰</div>
          </div>
          <div className="mt-2 text-xs text-green-400">
            +{stats?.today_reports_count || 0} hôm nay
          </div>
        </div>

        <div className="bg-black bg-opacity-50 border border-green-700 rounded-lg p-4 hover:border-green-500 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-green-400">
                {stats?.total_fb_scams || 0}
              </div>
              <div className="text-sm text-green-300">FB SCAM</div>
            </div>
            <div className="text-2xl">👤</div>
          </div>
          <div className="mt-2 text-xs text-green-400">Có link Facebook</div>
        </div>

        <div className="bg-black bg-opacity-50 border border-green-700 rounded-lg p-4 hover:border-green-500 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-green-400">
                {stats?.pending_reports || 0}
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
                {stats?.total_comments || 0}
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
            <h3 className="font-bold flex items-center">
              <span className="mr-2">🏆</span>
              TOP SCAMMER {timeRange.toUpperCase()}
            </h3>
          </div>
          <div className="p-4">
            {topScammers.length > 0 ? (
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
                <div className="text-4xl mb-3">📭</div>
                <p className="text-green-300">Chưa có dữ liệu top scammer</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Recent Reports */}
        <div className="border border-green-700 rounded-lg overflow-hidden">
          <div className="bg-green-900 bg-opacity-30 p-4 border-b border-green-700">
            <h3 className="font-bold flex items-center">
              <span className="mr-2">🆕</span>
              BÁO CÁO GẦN ĐÂY
            </h3>
          </div>
          <div className="p-4">
            {recentReports.length > 0 ? (
              <div className="space-y-3">
                {recentReports.map((report) => (
                  <div
                    key={report.id}
                    className="p-3 bg-black bg-opacity-30 rounded border border-green-800 hover:bg-green-900 hover:bg-opacity-20 transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-mono font-bold text-green-400">
                          {report.account_number}
                        </div>
                        <div className="text-sm">{report.account_name}</div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          report.status === "approved"
                            ? "bg-green-900 text-green-300"
                            : report.status === "pending"
                            ? "bg-yellow-900 text-yellow-300"
                            : "bg-red-900 text-red-300"
                        }`}
                      >
                        {report.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-xs text-green-400 flex justify-between">
                      <span>👁️ {report.view_count} views</span>
                      <span>💬 {report.comment_count} comments</span>
                      <span>
                        {new Date(report.created_at).toLocaleDateString(
                          "vi-VN"
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">📄</div>
                <p className="text-green-300">Chưa có báo cáo nào</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section - Search Analytics */}
      <div className="border border-green-700 rounded-lg overflow-hidden">
        <div className="bg-green-900 bg-opacity-30 p-4 border-b border-green-700">
          <h3 className="font-bold flex items-center">
            <span className="mr-2">🔍</span>
            PHÂN TÍCH TÌM KIẾM
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Top Searches */}
            <div>
              <h4 className="font-bold mb-3 text-green-400">TOP TÌM KIẾM</h4>
              <div className="space-y-2">
                {stats?.top_searches_today?.slice(0, 5).map((search, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-2 bg-black bg-opacity-30 rounded"
                  >
                    <span className="truncate">{search.query}</span>
                    <span className="bg-green-900 px-2 py-1 rounded text-xs">
                      {search.count}
                    </span>
                  </div>
                )) || (
                  <div className="text-center py-4 text-green-400">
                    Chưa có dữ liệu tìm kiếm
                  </div>
                )}
              </div>
            </div>

            {/* Search Patterns */}
            <div className="md:col-span-2">
              <h4 className="font-bold mb-3 text-green-400">
                BIỂU ĐỒ PHÂN TÍCH
              </h4>
              <div className="bg-black bg-opacity-30 border border-green-800 rounded-lg p-4">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>STK/SĐT tìm kiếm</span>
                      <span>65%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: "65%" }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Tên chủ TK</span>
                      <span>25%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: "25%" }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Website URL</span>
                      <span>8%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: "8%" }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Facebook Link</span>
                      <span>2%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{ width: "2%" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button className="p-4 bg-green-900 bg-opacity-50 border border-green-700 rounded-lg hover:bg-green-800 transition-all text-center">
          <div className="text-2xl mb-2">📈</div>
          <div className="font-bold">XUẤT BÁO CÁO</div>
        </button>
        <button className="p-4 bg-blue-900 bg-opacity-50 border border-blue-700 rounded-lg hover:bg-blue-800 transition-all text-center">
          <div className="text-2xl mb-2">📊</div>
          <div className="font-bold">PHÂN TÍCH NÂNG CAO</div>
        </button>
        <button className="p-4 bg-purple-900 bg-opacity-50 border border-purple-700 rounded-lg hover:bg-purple-800 transition-all text-center">
          <div className="text-2xl mb-2">🔔</div>
          <div className="font-bold">THIẾT LẬP ALERT</div>
        </button>
        <button className="p-4 bg-red-900 bg-opacity-50 border border-red-700 rounded-lg hover:bg-red-800 transition-all text-center">
          <div className="text-2xl mb-2">⚙️</div>
          <div className="font-bold">CÀI ĐẶT HỆ THỐNG</div>
        </button>
      </div>

      {/* System Information */}
      <div className="bg-black bg-opacity-50 border border-green-700 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-bold mb-3 text-green-400">API STATUS</h4>
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span>Account Reports API: ONLINE</span>
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
                <span>Active Users:</span>
                <span className="text-green-400">1,234</span>
              </div>
              <div className="flex justify-between">
                <span>API Requests:</span>
                <span className="text-green-400">12,345/day</span>
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
