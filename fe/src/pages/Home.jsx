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

  // Thêm các state cho modal xem chi tiết
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedReportType, setSelectedReportType] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState({
    author_name: "",
    content: "",
  });
  const [submittingComment, setSubmittingComment] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

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

  const handleViewScammer = (scammer) => {
    // Nếu có account_number, hiển thị modal xem chi tiết
    if (scammer.account_number) {
      // Gọi API để lấy chi tiết báo cáo đầu tiên của scammer này
      fetch(
        `https://api.checkgdtg.vn/api/search/?q=${encodeURIComponent(
          scammer.account_number
        )}`
      )
        .then((res) => res.json())
        .then((results) => {
          if (results.account_scams && results.account_scams.length > 0) {
            // Lấy báo cáo đầu tiên
            const report = results.account_scams[0];
            handleViewReportDetail(report, "account");
          }
        })
        .catch((error) => {
          console.error("Error fetching scammer details:", error);
        });
    }
  };

  const handleViewReport = (reportId) => {
    // Tìm report trong todayReports
    const report = todayReports.find((r) => r.id === reportId);
    if (report) {
      handleViewReportDetail(
        report,
        report.account_number ? "account" : "website"
      );
    }
  };

  const handleViewReportDetail = async (report, type) => {
    // TĂNG VIEW_COUNT NGAY KHI CLICK
    try {
      // Gọi API để tăng view_count
      const endpoint =
        type === "account"
          ? `/api/account-reports/${report.id}`
          : `/api/website-reports/${report.id}`;

      // Gọi API GET để trigger tăng view_count (backend đã xử lý)
      await fetch(`https://api.checkgdtg.vn${endpoint}`);

      // Cập nhật local state để hiển thị ngay
      const updatedReport = {
        ...report,
        view_count: (report.view_count || 0) + 1,
      };

      setSelectedReport(updatedReport);
      setSelectedReportType(type);

      // Cập nhật trong danh sách todayReports
      const updatedTodayReports = todayReports.map((r) =>
        r.id === report.id ? updatedReport : r
      );
      setTodayReports(updatedTodayReports);

      // Cập nhật trong topScammers nếu là account report
      if (type === "account") {
        const updatedTopScammers = topScammers.map((s) =>
          s.account_number === report.account_number
            ? { ...s, total_searches: (s.total_searches || 0) + 1 }
            : s
        );
        setTopScammers(updatedTopScammers);
      }
    } catch (error) {
      console.error("Error incrementing view count:", error);
      // Vẫn hiển thị modal nếu có lỗi
      setSelectedReport(report);
      setSelectedReportType(type);
    }

    // Fetch comments cho báo cáo này
    try {
      const response = await fetch(
        `https://api.checkgdtg.vn/api/comments/${type}_scam/${report.id}`
      );
      const commentsData = await response.json();
      setComments(commentsData);
    } catch (error) {
      console.error("Error fetching comments:", error);
      setComments([]);
    }

    setNewComment({ author_name: "", content: "" });
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();

    if (!newComment.author_name.trim() || !newComment.content.trim()) {
      alert("Vui lòng nhập tên và nội dung bình luận");
      return;
    }

    setSubmittingComment(true);

    try {
      const response = await fetch(
        `https://api.checkgdtg.vn/api/comments/${selectedReportType}_scam/${selectedReport.id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newComment),
        }
      );

      if (response.ok) {
        const newCommentData = await response.json();
        setComments([newCommentData, ...comments]);
        setNewComment({ author_name: "", content: "" });

        // Update report comment count
        if (selectedReportType === "account") {
          const updatedReport = {
            ...selectedReport,
            comment_count: (selectedReport.comment_count || 0) + 1,
          };

          setSelectedReport(updatedReport);

          // Update in todayReports
          const updatedTodayReports = todayReports.map((r) =>
            r.id === selectedReport.id
              ? { ...r, comment_count: (r.comment_count || 0) + 1 }
              : r
          );
          setTodayReports(updatedTodayReports);
        }

        alert("✅ Đã gửi bình luận!");
      } else {
        alert("❌ Lỗi khi gửi bình luận");
      }
    } catch (error) {
      alert("❌ Lỗi kết nối server");
      console.error(error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleCloseDetail = () => {
    setSelectedReport(null);
    setSelectedReportType(null);
    setComments([]);
    setNewComment({ author_name: "", content: "" });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("vi-VN");
  };

  if (loading) return <Loading message="ĐANG TẢI DỮ LIỆU HỆ THỐNG..." />;

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-8 scan-line relative">
        <h1 className="text-5xl font-bold mb-4 typewriter glow-green">
          CHECKGDTG<span className="blink">_</span>
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
                    <span>{formatDateTime(report.created_at)}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Click để xem chi tiết
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
                      onClick={() => handleViewScammer(scammer)}
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
                      {formatDateTime(comment.created_at)}
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

      {/* Report Detail Modal - GIỐNG Y HỆT SCAMLIST & SEARCH */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black bg-opacity-75"
            onClick={handleCloseDetail}
          ></div>
          <div className="relative w-full max-w-4xl bg-black border-2 border-green-500 rounded-lg overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="bg-green-900 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">
                {selectedReportType === "account"
                  ? " CHI TIẾT BÁO CÁO TÀI KHOẢN"
                  : "🌐 CHI TIẾT BÁO CÁO WEBSITE"}
              </h2>
              <button
                onClick={handleCloseDetail}
                className="text-xl hover:text-gray-300"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              {/* Report Details */}
              <div className="space-y-4 mb-8">
                {selectedReportType === "account" ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <strong>STK/SĐT:</strong>
                        <div className="font-mono text-red-400 mt-1">
                          {selectedReport.account_number}
                        </div>
                      </div>
                      <div>
                        <strong>Tên chủ TK:</strong>
                        <div className="mt-1">
                          {selectedReport.account_name}
                        </div>
                      </div>
                      <div>
                        <strong>Ngân hàng:</strong>
                        <div className="mt-1">
                          {selectedReport.bank_name || "N/A"}
                        </div>
                      </div>
                      <div>
                        <strong>Facebook:</strong>
                        <div className="mt-1 truncate">
                          {selectedReport.facebook_link ? (
                            <a
                              href={selectedReport.facebook_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300"
                            >
                              {selectedReport.facebook_link}
                            </a>
                          ) : (
                            "N/A"
                          )}
                        </div>
                      </div>
                      <div>
                        <strong>Zalo:</strong>
                        <div className="mt-1 truncate">
                          {selectedReport.zalo_link ? (
                            <a
                              href={selectedReport.zalo_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-400 hover:text-green-300"
                            >
                              {selectedReport.zalo_link}
                            </a>
                          ) : (
                            "N/A"
                          )}
                        </div>
                      </div>
                      <div>
                        <strong>SĐT:</strong>
                        <div className="mt-1">
                          {selectedReport.phone_number || "N/A"}
                        </div>
                      </div>
                    </div>

                    <div>
                      <strong>Nội dung:</strong>
                      <div className="mt-2 p-3 bg-black bg-opacity-30 rounded whitespace-pre-wrap">
                        {selectedReport.content}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <strong>URL:</strong>
                        <div className="mt-1 break-all">
                          <a
                            href={selectedReport.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300"
                          >
                            {selectedReport.url}
                          </a>
                        </div>
                      </div>
                      <div>
                        <strong>Thể loại:</strong>
                        <div className="mt-1 text-purple-400">
                          {selectedReport.category}
                        </div>
                      </div>
                      <div>
                        <strong>Email liên hệ:</strong>
                        <div className="mt-1">
                          {selectedReport.reporter_email}
                        </div>
                      </div>
                    </div>

                    <div>
                      <strong>Mô tả:</strong>
                      <div className="mt-2 p-3 bg-black bg-opacity-30 rounded whitespace-pre-wrap">
                        {selectedReport.description}
                      </div>
                    </div>
                  </>
                )}

                {/* Evidence Images */}
                {selectedReport.evidence_images &&
                  selectedReport.evidence_images.length > 0 && (
                    <div>
                      <strong className="block mb-2">
                        Hình ảnh bằng chứng:
                      </strong>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {selectedReport.evidence_images.map((img, idx) => (
                          <div key={idx} className="relative">
                            <img
                              src={img}
                              alt={`Evidence ${idx + 1}`}
                              className="w-full h-32 object-cover rounded border border-green-600 cursor-pointer hover:opacity-80 transition-all"
                              onClick={() => window.open(img, "_blank")}
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-xs p-1 text-center">
                              Ảnh {idx + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Report Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-400">
                  <div>
                    <strong>Trạng thái:</strong>
                    <div className="mt-1">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          selectedReport.status === "approved"
                            ? "bg-green-900 text-green-300"
                            : selectedReport.status === "pending"
                            ? "bg-yellow-900 text-yellow-300"
                            : "bg-red-900 text-red-300"
                        }`}
                      >
                        {selectedReport.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div>
                    <strong>Lượt xem:</strong>
                    <div className="mt-1">{selectedReport.view_count || 0}</div>
                  </div>
                  {selectedReportType === "account" && (
                    <div>
                      <strong>Bình luận:</strong>
                      <div className="mt-1">
                        {selectedReport.comment_count || 0}
                      </div>
                    </div>
                  )}
                  <div>
                    <strong>Ngày tạo:</strong>
                    <div className="mt-1">
                      {formatDateTime(selectedReport.created_at)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Comments Section */}
              <div className="border-t border-green-700 pt-6">
                <h3 className="font-bold text-lg mb-4">
                  💬 BÌNH LUẬN ({comments.length})
                </h3>

                {/* Add Comment Form */}
                <form onSubmit={handleSubmitComment} className="mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <div>
                      <label className="block text-sm mb-1">Tên của bạn:</label>
                      <input
                        type="text"
                        value={newComment.author_name}
                        onChange={(e) =>
                          setNewComment({
                            ...newComment,
                            author_name: e.target.value,
                          })
                        }
                        className="w-full bg-black border border-green-600 text-green-400 px-3 py-2 rounded"
                        placeholder="Nhập tên..."
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm mb-1">Nội dung:</label>
                      <input
                        type="text"
                        value={newComment.content}
                        onChange={(e) =>
                          setNewComment({
                            ...newComment,
                            content: e.target.value,
                          })
                        }
                        className="w-full bg-black border border-green-600 text-green-400 px-3 py-2 rounded"
                        placeholder="Nhập bình luận..."
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={submittingComment}
                    className="px-4 py-2 bg-green-700 border border-green-500 rounded hover:bg-green-600 disabled:opacity-50"
                  >
                    {submittingComment ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
                        ĐANG GỬI...
                      </>
                    ) : (
                      "GỬI BÌNH LUẬN"
                    )}
                  </button>
                </form>

                {/* Comments List */}
                {comments.length > 0 ? (
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="p-3 bg-black bg-opacity-30 rounded border border-green-800"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-blue-400">
                            {comment.author_name}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatDateTime(comment.created_at)}
                          </span>
                        </div>
                        <div className="text-sm">{comment.content}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-400">
                    Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black bg-opacity-90"
            onClick={() => setSelectedImage(null)}
          ></div>
          <div className="relative z-50">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300"
            >
              ×
            </button>
            <img
              src={selectedImage}
              alt="Preview"
              className="max-w-full max-h-[90vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
