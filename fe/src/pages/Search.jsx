import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Loading from "../components/Loading";

const Search = () => {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [quickCheckResult, setQuickCheckResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchType, setSearchType] = useState("full");

  // Thêm các state mới giống ScamList
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
  const location = useLocation();

  // Get query from URL on component mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("q");
    if (q) {
      setQuery(q);
      performFullSearch(q);
    }
  }, [location.search]);

  const performFullSearch = async (searchQuery) => {
    if (searchQuery.trim().length < 1) {
      setError("Vui lòng nhập từ khóa tìm kiếm");
      return;
    }

    setLoading(true);
    setError(null);
    setQuickCheckResult(null);

    try {
      const response = await fetch(
        `https://api.checkgdtg.vn/api/search/?q=${encodeURIComponent(
          searchQuery
        )}`
      );
      if (!response.ok) throw new Error("Lỗi kết nối server");

      const results = await response.json();
      setSearchResults(results);

      // Update URL without reloading page
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`, {
        replace: true,
      });
    } catch (err) {
      setError("Lỗi kết nối server. Vui lòng thử lại.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const performQuickCheck = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setSearchResults(null);

    try {
      const response = await fetch(
        `https://api.checkgdtg.vn/api/search/check/${encodeURIComponent(
          query.trim()
        )}`
      );
      if (!response.ok) throw new Error("Lỗi kết nối server");

      const result = await response.json();
      setQuickCheckResult(result);
    } catch (err) {
      setError("Lỗi kiểm tra nhanh");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (searchType === "quick") {
      performQuickCheck();
    } else {
      performFullSearch(query.trim());
    }
  };

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
        if (searchResults && searchResults.account_scams) {
          const updatedScams = searchResults.account_scams.map((r) =>
            r.id === report.id ? updatedReport : r
          );
          setSearchResults({
            ...searchResults,
            account_scams: updatedScams,
          });
        }
      } else {
        const updatedReport = {
          ...report,
          view_count: (report.view_count || 0) + 1,
        };

        setSelectedReport(updatedReport);
        setSelectedReportType(type);

        // Cập nhật trong danh sách
        if (searchResults && searchResults.website_scams) {
          const updatedScams = searchResults.website_scams.map((r) =>
            r.id === report.id ? updatedReport : r
          );
          setSearchResults({
            ...searchResults,
            website_scams: updatedScams,
          });
        }
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

          // Update in search results
          if (searchResults && searchResults.account_scams) {
            const updatedScams = searchResults.account_scams.map((r) =>
              r.id === selectedReport.id
                ? { ...r, comment_count: (r.comment_count || 0) + 1 }
                : r
            );
            setSearchResults({
              ...searchResults,
              account_scams: updatedScams,
            });
          }
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

  const handleClearResults = () => {
    setSearchResults(null);
    setQuickCheckResult(null);
    setQuery("");
    navigate("/search");
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

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 glow-green">TRA CỨU SCAM</h1>
        <p className="text-green-300">
          Tìm kiếm nâng cao STK, SĐT, link Facebook, website nghi vấn
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-black bg-opacity-50 border border-green-700 rounded-lg p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nhập STK/SĐT, tên, link FB, URL website..."
              className="w-full bg-black border border-green-600 text-green-400 px-4 py-3 rounded-lg focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 font-mono"
            />
            <div className="absolute right-3 top-3 text-green-500">
              <span className="blink">_</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-green-700 border border-green-500 rounded-lg hover:bg-green-600 transition-all font-bold flex items-center flex-1 justify-center"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  ĐANG TÌM KIẾM...
                </>
              ) : (
                "TRA CỨU SCAM"
              )}
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-900 border border-red-700 rounded">
              <p className="text-red-300">{error}</p>
            </div>
          )}
        </form>
      </div>

      {/* Quick Check Results */}
      {quickCheckResult && (
        <div className="border border-yellow-700 rounded-lg overflow-hidden">
          <div className="bg-yellow-900 bg-opacity-30 p-4 border-b border-yellow-700">
            <h2 className="text-xl font-bold">KIỂM TRA NHANH</h2>
          </div>
          <div className="p-6">
            <div
              className={`text-center p-4 rounded-lg mb-6 ${
                quickCheckResult.is_scam
                  ? "bg-red-900 bg-opacity-30"
                  : "bg-green-900 bg-opacity-30"
              }`}
            >
              <h3 className="text-2xl font-bold mb-2">
                {quickCheckResult.is_scam ? "⚠️ CẢNH BÁO SCAM!" : "✅ AN TOÀN"}
              </h3>
              <p className="text-lg">
                {quickCheckResult.is_scam
                  ? quickCheckResult.warning
                  : quickCheckResult.message}
              </p>
              <p className="text-sm mt-2">
                Số lần bị tố cáo: {quickCheckResult.report_count || 0}
              </p>
            </div>

            {quickCheckResult.reports &&
              quickCheckResult.reports.length > 0 && (
                <div>
                  <h4 className="font-bold mb-3 text-green-400">
                    CHI TIẾT BÁO CÁO:
                  </h4>
                  <div className="space-y-3">
                    {quickCheckResult.reports.map((report, index) => (
                      <div
                        key={index}
                        className="p-4 bg-black bg-opacity-30 rounded border border-red-800 hover:bg-red-900 hover:bg-opacity-20 cursor-pointer"
                        onClick={() => handleViewReport(report, "account")}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-mono font-bold text-red-400">
                              {report.account_number}
                            </div>
                            <div className="text-sm">{report.account_name}</div>
                            <div className="text-xs text-green-400">
                              {report.bank_name}
                            </div>
                          </div>
                          <span className="text-xs text-gray-400">
                            {formatDate(report.created_at)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-300 mb-2">
                          FB: {report.facebook_link || "N/A"} | Zalo:{" "}
                          {report.zalo_link || "N/A"} | SĐT:{" "}
                          {report.phone_number || "N/A"}
                        </div>
                        <div className="text-xs text-gray-500">
                          Click để xem chi tiết
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      )}

      {/* Full Search Results */}
      {searchResults && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">
              KẾT QUẢ TÌM KIẾM:{" "}
              <span className="text-green-400">
                {searchResults.total_results}
              </span>{" "}
              KẾT QUẢ
            </h2>
            <button
              onClick={handleClearResults}
              className="px-4 py-2 bg-gray-700 border border-gray-500 rounded hover:bg-gray-600"
            >
              XÓA KẾT QUẢ
            </button>
          </div>

          {/* Account Scams */}
          {searchResults.account_scams.length > 0 && (
            <div className="border border-green-700 rounded-lg overflow-hidden">
              <div className="bg-green-900 bg-opacity-30 p-3 border-b border-green-700">
                <h3 className="font-bold">
                  TÀI KHOẢN SCAM ({searchResults.account_scams.length})
                </h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {searchResults.account_scams.map((report) => (
                    <div
                      key={report.id}
                      className="p-4 bg-black bg-opacity-30 rounded border border-green-800 hover:bg-green-900 hover:bg-opacity-20 cursor-pointer"
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
                              : report.status === "pending"
                              ? "bg-yellow-900 text-yellow-300"
                              : "bg-red-900 text-red-300"
                          }`}
                        >
                          {report.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-sm text-green-300 line-clamp-2 mb-2">
                        {report.content}
                      </div>
                      <div className="flex justify-between items-center text-xs text-gray-400">
                        <span>👁️ {report.view_count} lượt xem</span>
                        <span>💬 {report.comment_count} bình luận</span>
                        <span>{formatDate(report.created_at)}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Click để xem chi tiết
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Website Scams */}
          {searchResults.website_scams.length > 0 && (
            <div className="border border-purple-700 rounded-lg overflow-hidden">
              <div className="bg-purple-900 bg-opacity-30 p-3 border-b border-purple-700">
                <h3 className="font-bold">
                  WEBSITE SCAM ({searchResults.website_scams.length})
                </h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {searchResults.website_scams.map((report) => (
                    <div
                      key={report.id}
                      className="p-4 bg-black bg-opacity-30 rounded border border-purple-800 hover:bg-purple-900 hover:bg-opacity-20 cursor-pointer"
                      onClick={() => handleViewReport(report, "website")}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
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
                      <div className="text-sm text-green-300 line-clamp-2 mb-2">
                        {report.description}
                      </div>
                      <div className="flex justify-between items-center text-xs text-gray-400">
                        <span>👁️ {report.view_count} lượt xem</span>
                        <span>{formatDate(report.created_at)}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Click để xem chi tiết
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* No Results */}
          {searchResults.total_results === 0 && (
            <div className="text-center py-12 border border-green-700 rounded-lg">
              <h3 className="text-xl font-bold mb-2">KHÔNG TÌM THẤY KẾT QUẢ</h3>
              <p className="text-green-300">
                Không có báo cáo nào cho từ khóa "{query}"
              </p>
              <p className="text-sm text-green-400 mt-4">
                Hãy kiểm tra lại hoặc gửi báo cáo mới nếu bạn nghi ngờ
              </p>
            </div>
          )}
        </div>
      )}

      {/* Search Tips */}
      {!searchResults && !quickCheckResult && !selectedReport && (
        <div className="bg-black bg-opacity-50 border border-green-700 rounded-lg p-6">
          <h3 className="font-bold mb-3">HƯỚNG DẪN TÌM KIẾM</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 border border-green-800 rounded">
              <h4 className="font-bold text-green-400 mb-1">STK NGÂN HÀNG</h4>
              <p className="text-sm">Ví dụ: 0123456789, 1234567890123</p>
            </div>
            <div className="p-3 border border-green-800 rounded">
              <h4 className="font-bold text-green-400 mb-1">SỐ ĐIỆN THOẠI</h4>
              <p className="text-sm">Ví dụ: 0912345678, 0987654321</p>
            </div>
            <div className="p-3 border border-green-800 rounded">
              <h4 className="font-bold text-green-400 mb-1">LINK FACEBOOK</h4>
              <p className="text-sm">
                Ví dụ: facebook.com/username, fb.com/profile.php?id=...
              </p>
            </div>
            <div className="p-3 border border-green-800 rounded">
              <h4 className="font-bold text-green-400 mb-1">URL WEBSITE</h4>
              <p className="text-sm">Ví dụ: scam-site.com, phishing-link.net</p>
            </div>
          </div>
        </div>
      )}

      {/* Report Detail Modal - GIỐNG Y HỆT SCAMLIST */}
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
                  ? "CHI TIẾT BÁO CÁO TÀI KHOẢN"
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

export default Search;
