import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Loading from "../components/Loading";

const ScamList = () => {
  const [activeTab, setActiveTab] = useState("accounts");
  const [accountReports, setAccountReports] = useState([]);
  const [websiteReports, setWebsiteReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchResults, setSearchResults] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedReportType, setSelectedReportType] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState({
    author_name: "",
    content: "",
  });
  const [submittingComment, setSubmittingComment] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const reportId = params.get("id");
    if (reportId) {
      handleQuickCheck(reportId);
    } else {
      fetchReports();
    }
  }, [activeTab, page, statusFilter, location.search]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: "20",
        offset: ((page - 1) * 20).toString(),
      });

      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      if (activeTab === "accounts") {
        const response = await fetch(
          `https://api.checkgdtg.vn/api/account-reports?${params}`
        );
        const reports = await response.json();
        setAccountReports(reports);
        setTotalPages(Math.ceil(reports.length / 20) || 1);
      } else {
        const response = await fetch(
          `https://api.checkgdtg.vn/api/website-reports?${params}`
        );
        const reports = await response.json();
        setWebsiteReports(reports);
        setTotalPages(Math.ceil(reports.length / 20) || 1);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickCheck = async (identifier) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.checkgdtg.vn/api/search/check/${encodeURIComponent(
          identifier
        )}`
      );
      const result = await response.json();

      if (result.is_scam) {
        setSearchResults(result.reports);
        setAccountReports(result.reports);
        setWebsiteReports([]);
        setActiveTab("accounts");
      } else {
        setSearchResults(null);
        setAccountReports([]);
        setWebsiteReports([]);
      }
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setLoading(false);
    }
  };

  // =============== CHỈ SỬA HÀM NÀY: ĐỔI API TỪ /check/ SANG /?q= ===============
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults(null);
      fetchReports();
      return;
    }

    setLoading(true);
    try {
      // ĐỔI TỪ: /api/search/check/${query}
      // THÀNH: /api/search/?q=${query}
      const response = await fetch(
        `https://api.checkgdtg.vn/api/search/?q=${encodeURIComponent(
          searchQuery.trim()
        )}`
      );
      const result = await response.json();

      // API /search/?q= trả về: {account_scams: [], website_scams: [], total_results: X}
      // Cần format lại để phù hợp với component hiện tại
      if (result.account_scams && result.account_scams.length > 0) {
        // Hiển thị account scams
        setSearchResults(result.account_scams);
        setAccountReports(result.account_scams);
        setWebsiteReports([]);
        setActiveTab("accounts");
      } else if (result.website_scams && result.website_scams.length > 0) {
        // Hiển thị website scams
        setSearchResults(result.website_scams);
        setAccountReports([]);
        setWebsiteReports(result.website_scams);
        setActiveTab("websites");
      } else {
        setSearchResults(null);
        setAccountReports([]);
        setWebsiteReports([]);
      }
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setLoading(false);
    }
  };
  // =============== KẾT THÚC PHẦN SỬA ===============

  // QUAN TRỌNG: Hàm xử lý khi click xem chi tiết báo cáo
  const handleViewReport = async (report, type) => {
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
      if (type === "account") {
        const updatedReport = {
          ...report,
          view_count: (report.view_count || 0) + 1,
        };

        setSelectedReport(updatedReport);
        setSelectedReportType(type);

        // Cập nhật trong danh sách
        setAccountReports((prev) =>
          prev.map((r) => (r.id === report.id ? updatedReport : r))
        );

        if (searchResults) {
          setSearchResults((prev) =>
            prev.map((r) => (r.id === report.id ? updatedReport : r))
          );
        }
      } else {
        const updatedReport = {
          ...report,
          view_count: (report.view_count || 0) + 1,
        };

        setSelectedReport(updatedReport);
        setSelectedReportType(type);

        // Cập nhật trong danh sách
        setWebsiteReports((prev) =>
          prev.map((r) => (r.id === report.id ? updatedReport : r))
        );
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

          // Update in list
          setAccountReports((prev) =>
            prev.map((r) =>
              r.id === selectedReport.id
                ? { ...r, comment_count: (r.comment_count || 0) + 1 }
                : r
            )
          );
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

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults(null);
    fetchReports();
    navigate("/scam-list");
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

  if (loading) return <Loading message="ĐANG TẢI DANH SÁCH SCAM..." />;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 glow-green">DANH SÁCH SCAM</h1>
        <p className="text-green-300">
          Tổng hợp tất cả tài khoản và website lừa đảo đã được báo cáo
        </p>
      </div>

      {/* Search Box */}
      <div className="bg-black bg-opacity-50 border border-green-700 rounded-lg p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nhập STK/SĐT, tên, link FB, URL website để tìm kiếm nâng cao..."
              className="w-full bg-black border border-green-600 text-green-400 px-4 py-3 rounded-lg focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 font-mono"
            />
            <div className="absolute right-3 top-3 text-green-500">
              <span className="blink">_</span>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-green-700 border border-green-500 rounded-lg hover:bg-green-600 transition-all font-bold flex items-center mx-auto"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                ĐANG TÌM KIẾM...
              </>
            ) : (
              "TÌM KIẾM NÂNG CAO"
            )}
          </button>
        </form>
      </div>

      {/* Quick Check Results */}
      {searchResults && (
        <div className="border border-yellow-700 rounded-lg overflow-hidden">
          <div className="bg-yellow-900 bg-opacity-30 p-4 flex justify-between items-center">
            <h2 className="text-xl font-bold">
              KẾT QUẢ TÌM KIẾM: {searchResults.length} BÁO CÁO
            </h2>
            <button
              onClick={handleClearSearch}
              className="px-4 py-2 bg-gray-700 border border-gray-500 rounded hover:bg-gray-600"
            >
              XÓA KẾT QUẢ
            </button>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchResults.map((report) => (
                <div
                  key={report.id}
                  className="p-4 bg-black bg-opacity-30 rounded border border-red-800 hover:bg-red-900 hover:bg-opacity-20 cursor-pointer"
                  onClick={() => handleViewReport(report, "account")}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-mono font-bold text-red-400">
                        {report.account_number}
                      </div>
                      <div className="text-sm">{report.account_name}</div>
                      {report.bank_name && (
                        <div className="text-xs text-green-400">
                          {report.bank_name}
                        </div>
                      )}
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        report.status === "approved"
                          ? "bg-green-900 text-green-300"
                          : "bg-yellow-900 text-yellow-300"
                      }`}
                    >
                      {report.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm text-green-300 line-clamp-2 mb-2">
                    {report.content}
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <span>👁️ {report.view_count || 0} lượt xem</span>
                    <span>💬 {report.comment_count || 0} bình luận</span>
                    <span>{formatDate(report.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tabs and Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Tabs */}
        <div className="flex border-b border-green-700">
          <button
            onClick={() => {
              setActiveTab("accounts");
              setPage(1);
            }}
            className={`px-6 py-3 font-bold ${
              activeTab === "accounts"
                ? "bg-green-900 text-white border-b-2 border-green-500"
                : "hover:bg-green-900"
            }`}
          >
            TÀI KHOẢN SCAM ({accountReports.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("websites");
              setPage(1);
            }}
            className={`px-6 py-3 font-bold ${
              activeTab === "websites"
                ? "bg-purple-900 text-white border-b-2 border-purple-500"
                : "hover:bg-purple-900"
            }`}
          >
            WEBSITE SCAM ({websiteReports.length})
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-black border border-green-600 text-green-400 px-3 py-2 rounded"
            >
              <option value="all">TẤT CẢ</option>
              <option value="approved">ĐÃ DUYỆT</option>
              <option value="pending">CHỜ DUYỆT</option>
              <option value="rejected">TỪ CHỐI</option>
            </select>
          </div>
          <button
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("all");
              fetchReports();
            }}
            className="px-4 py-2 bg-gray-700 border border-gray-500 rounded hover:bg-gray-600"
          >
            RESET
          </button>
        </div>
      </div>

      {/* Account Scams Grid */}
      {activeTab === "accounts" && !searchResults && (
        <div className="border border-green-700 rounded-lg overflow-hidden">
          <div className="bg-green-900 bg-opacity-30 p-3">
            <div className="flex justify-between items-center">
              <h3 className="font-bold">
                TÀI KHOẢN SCAM ({accountReports.length})
              </h3>
              <span className="text-sm text-green-300">
                Trang {page}/{totalPages}
              </span>
            </div>
          </div>

          {accountReports.length > 0 ? (
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {accountReports.map((report) => (
                  <div
                    key={report.id}
                    className="p-4 bg-black bg-opacity-30 rounded border border-green-800 hover:bg-green-900 hover:bg-opacity-20 cursor-pointer transition-all"
                    onClick={() => handleViewReport(report, "account")}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="font-mono font-bold text-red-400 truncate">
                          {report.account_number}
                        </div>
                        <div className="text-sm truncate">
                          {report.account_name}
                        </div>
                        {report.bank_name && (
                          <div className="text-xs text-green-400 truncate">
                            {report.bank_name}
                          </div>
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

                    <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
                      <span>👁️ {report.view_count || 0} lượt xem</span>
                      <span>💬 {report.comment_count || 0} bình luận</span>
                      <span>{formatDate(report.created_at)}</span>
                    </div>

                    <div className="text-xs text-gray-500">
                      Click để xem chi tiết
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-bold mb-2">KHÔNG CÓ DỮ LIỆU</h3>
              <p className="text-green-300">
                Chưa có báo cáo tài khoản scam nào
              </p>
            </div>
          )}
        </div>
      )}

      {/* Website Scams Grid */}
      {activeTab === "websites" && !searchResults && (
        <div className="border border-purple-700 rounded-lg overflow-hidden">
          <div className="bg-purple-900 bg-opacity-30 p-3">
            <div className="flex justify-between items-center">
              <h3 className="font-bold">
                WEBSITE SCAM ({websiteReports.length})
              </h3>
              <span className="text-sm text-purple-300">
                Trang {page}/{totalPages}
              </span>
            </div>
          </div>

          {websiteReports.length > 0 ? (
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {websiteReports.map((report) => (
                  <div
                    key={report.id}
                    className="p-4 bg-black bg-opacity-30 rounded border border-purple-800 hover:bg-purple-900 hover:bg-opacity-20 cursor-pointer transition-all"
                    onClick={() => handleViewReport(report, "website")}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="text-blue-400 hover:text-blue-300 break-all text-sm truncate">
                          {report.url.length > 40
                            ? report.url.substring(0, 40) + "..."
                            : report.url}
                        </div>
                        <div className="text-xs text-purple-400 mt-1 truncate">
                          {report.category}
                        </div>
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

                    <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
                      <span>👁️ {report.view_count || 0} lượt xem</span>
                      <span>{formatDate(report.created_at)}</span>
                    </div>

                    <div className="text-xs text-gray-500">
                      Click để xem chi tiết
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-bold mb-2">KHÔNG CÓ DỮ LIỆU</h3>
              <p className="text-purple-300">
                Chưa có báo cáo website scam nào
              </p>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && !searchResults && (
        <div className="flex justify-center items-center space-x-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-green-900 border border-green-700 rounded hover:bg-green-800 disabled:opacity-50"
          >
            TRƯỚC
          </button>

          {[...Array(Math.min(5, totalPages))].map((_, i) => {
            const pageNum = i + 1;
            return (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`w-10 h-10 rounded ${
                  page === pageNum
                    ? "bg-green-700 border border-green-500"
                    : "bg-green-900 border border-green-700 hover:bg-green-800"
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-green-900 border border-green-700 rounded hover:bg-green-800 disabled:opacity-50"
          >
            SAU
          </button>
        </div>
      )}

      {/* Report Detail Modal */}
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

export default ScamList;
