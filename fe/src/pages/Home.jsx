import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import Loading from "../components/Loading";

const Home = () => {
  const [stats, setStats] = useState(null);
  const [topScammers, setTopScammers] = useState([]);
  const [topSearches, setTopSearches] = useState([]);
  const [todayReports, setTodayReports] = useState([]);
  const [allComments, setAllComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsData, scammersData, searchesData, todayData] =
        await Promise.all([
          api.getDashboardStats(),
          api.getTopReported7Days(),
          api.getTopSearchesToday(),
          api.getReportsToday(),
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

      // Fetch all comments from recent reports
      fetchAllComments();

      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const fetchAllComments = async () => {
    try {
      // Get recent account reports
      const recentReports = await api.getAccountReports({ limit: 10 });
      const commentPromises = recentReports.map((report) =>
        api.getComments("account_scam", report.id, { limit: 5 })
      );

      const allCommentsArrays = await Promise.all(commentPromises);
      const flattenedComments = allCommentsArrays.flat();
      setAllComments(flattenedComments.slice(0, 15));
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleViewScammer = (accountNumber) => {
    navigate(`/search?q=${encodeURIComponent(accountNumber)}`);
  };

  const handleViewReport = (reportId) => {
    navigate(`/scam-list?id=${reportId}`);
  };

  if (loading) return <Loading message="ĐANG TẢI DỮ LIỆU HỆ THỐNG..." />;

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

        {/* Search Box */}
        <div className="max-w-3xl mx-auto mb-8">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nhập STK/SĐT, tên, link Facebook, Zalo để tìm kiếm..."
              className="w-full bg-black border-2 border-green-600 text-green-400 px-6 py-4 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500 font-mono text-lg"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 px-6 py-2 bg-green-700 border border-green-500 rounded-lg hover:bg-green-600 transition-all font-bold"
            >
              TÌM KIẾM
            </button>
          </form>
          <p className="text-sm text-green-400 mt-2">
            Tra cứu nhanh STK, SĐT, Facebook, Zalo để kiểm tra scam
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-6xl mx-auto">
          <Link
            to="/search"
            className="p-4 bg-green-900 bg-opacity-50 border border-green-700 rounded-lg hover:bg-green-800 transition-all"
          >
            <h3 className="font-bold">TRA CỨU NGAY</h3>
          </Link>
          <Link
            to="/scam-list"
            className="p-4 bg-red-900 bg-opacity-50 border border-red-700 rounded-lg hover:bg-red-800 transition-all"
          >
            <h3 className="font-bold">DANH SÁCH SCAM</h3>
          </Link>
          <Link
            to="/report"
            className="p-4 bg-yellow-900 bg-opacity-50 border border-yellow-700 rounded-lg hover:bg-yellow-800 transition-all"
          >
            <h3 className="font-bold">TỐ CÁO SCAM</h3>
          </Link>
          <Link
            to="/insurance-fund"
            className="p-4 bg-blue-900 bg-opacity-50 border border-blue-700 rounded-lg hover:bg-blue-800 transition-all"
          >
            <h3 className="font-bold">QUỸ BẢO HIỂM</h3>
          </Link>
          <Link
            to="/dashboard"
            className="p-4 bg-purple-900 bg-opacity-50 border border-purple-700 rounded-lg hover:bg-purple-800 transition-all"
          >
            <h3 className="font-bold">THỐNG KÊ</h3>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-black bg-opacity-50 border border-green-700 rounded-lg p-4">
          <div className="text-3xl font-bold text-green-400">
            {stats?.total_account_scams || 0}
          </div>
          <div className="text-sm text-green-300">STK SCAM ĐÃ DUYỆT</div>
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

      {/* Top Searches Today */}
      <div className="border border-green-700 rounded-lg overflow-hidden">
        <div className="bg-green-900 bg-opacity-30 p-4 border-b border-green-700">
          <h2 className="text-xl font-bold">TOP TÌM KIẾM HÔM NAY</h2>
        </div>
        <div className="p-4">
          {topSearches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {topSearches.map((search, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-black bg-opacity-30 rounded border border-green-800 hover:bg-green-900 hover:bg-opacity-20 cursor-pointer"
                  onClick={() => navigate(`/search?q=${search.query}`)}
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-green-900 flex items-center justify-center mr-3">
                      <span className="font-bold">{index + 1}</span>
                    </div>
                    <span className="font-mono">{search.query}</span>
                  </div>
                  <span className="bg-green-900 px-2 py-1 rounded text-xs">
                    {search.count} lượt
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-green-300">
              Chưa có dữ liệu tìm kiếm hôm nay
            </div>
          )}
        </div>
      </div>

      {/* Today Reports */}
      <div className="border border-yellow-700 rounded-lg overflow-hidden">
        <div className="bg-yellow-900 bg-opacity-30 p-4 border-b border-yellow-700">
          <h2 className="text-xl font-bold">BÁO CÁO HÔM NAY</h2>
        </div>
        <div className="p-4">
          {todayReports.length > 0 ? (
            <div className="space-y-3">
              {todayReports.slice(0, 5).map((report) => (
                <div
                  key={report.id}
                  className="p-4 bg-black bg-opacity-30 rounded border border-yellow-800 hover:bg-yellow-900 hover:bg-opacity-20 cursor-pointer"
                  onClick={() => handleViewReport(report.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      {report.account_number ? (
                        <>
                          <div className="font-mono font-bold text-red-400">
                            {report.account_number}
                          </div>
                          <div className="text-sm">{report.account_name}</div>
                          {report.bank_name && (
                            <div className="text-xs text-green-400">
                              {report.bank_name}
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <a
                            href={report.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 break-all"
                          >
                            {report.url}
                          </a>
                          <div className="text-xs text-purple-400 mt-1">
                            {report.category}
                          </div>
                        </>
                      )}
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
                  <div className="text-sm text-green-300 line-clamp-2">
                    {report.content || report.description}
                  </div>
                  <div className="flex justify-between items-center mt-2 text-xs text-green-400">
                    <span>👁️ {report.view_count || 0} lượt xem</span>
                    <span>
                      {new Date(report.created_at).toLocaleString("vi-VN")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-yellow-300">
              Chưa có báo cáo nào hôm nay
            </div>
          )}
        </div>
      </div>

      {/* Top Scammers 7 Days */}
      <div className="border border-red-700 rounded-lg overflow-hidden">
        <div className="bg-red-900 bg-opacity-30 p-4 border-b border-red-700">
          <h2 className="text-xl font-bold">TOP SCAMMER 7 NGÀY</h2>
        </div>
        <div className="p-4">
          {topScammers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-red-900 bg-opacity-20">
                    <th className="p-3 text-left">STT</th>
                    <th className="p-3 text-left">STK/SĐT</th>
                    <th className="p-3 text-left">TÊN</th>
                    <th className="p-3 text-left">NGÂN HÀNG</th>
                    <th className="p-3 text-left">SỐ LẦN BÁO CÁO</th>
                    <th className="p-3 text-left">TÌM KIẾM</th>
                  </tr>
                </thead>
                <tbody>
                  {topScammers.map((scammer, index) => (
                    <tr
                      key={index}
                      className="hover:bg-red-900 hover:bg-opacity-20 cursor-pointer"
                      onClick={() => handleViewScammer(scammer.account_number)}
                    >
                      <td className="p-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            index === 0
                              ? "bg-yellow-900"
                              : index === 1
                              ? "bg-gray-700"
                              : index === 2
                              ? "bg-orange-900"
                              : "bg-red-900"
                          }`}
                        >
                          <span className="font-bold">{index + 1}</span>
                        </div>
                      </td>
                      <td className="p-3 font-mono">
                        {scammer.account_number}
                      </td>
                      <td className="p-3">{scammer.account_name}</td>
                      <td className="p-3">{scammer.bank_name || "N/A"}</td>
                      <td className="p-3">
                        <span className="bg-red-900 px-3 py-1 rounded font-bold">
                          {scammer.report_count}
                        </span>
                      </td>
                      <td className="p-3 text-green-400">
                        {scammer.total_searches || 0} lượt
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-red-300">
              Chưa có dữ liệu top scammer
            </div>
          )}
        </div>
      </div>

      {/* All Comments */}
      <div className="border border-blue-700 rounded-lg overflow-hidden">
        <div className="bg-blue-900 bg-opacity-30 p-4 border-b border-blue-700">
          <h2 className="text-xl font-bold">BÌNH LUẬN GẦN ĐÂY</h2>
        </div>
        <div className="p-4">
          {allComments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allComments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-3 bg-black bg-opacity-30 rounded border border-blue-800"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-blue-400">
                      {comment.author_name}
                    </span>
                    <span className="text-xs text-green-400">
                      {new Date(comment.created_at).toLocaleString("vi-VN")}
                    </span>
                  </div>
                  <div className="text-sm mb-2">{comment.content}</div>
                  <div className="text-xs text-gray-400">
                    Báo cáo #{comment.report_id}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-blue-300">
              Chưa có bình luận nào
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
