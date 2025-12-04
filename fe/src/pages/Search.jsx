import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Loading from "../components/Loading";

const Search = () => {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [quickCheckResult, setQuickCheckResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchType, setSearchType] = useState("full");
  const navigate = useNavigate();
  const location = useLocation();

  // Get query from URL on component mount
  React.useEffect(() => {
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
        `http://localhost:8000/api/search/?q=${encodeURIComponent(searchQuery)}`
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
        `http://localhost:8000/api/search/check/${encodeURIComponent(
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

  const handleViewReport = (reportId) => {
    navigate(`/scam-list?id=${reportId}`);
  };

  const handleClearResults = () => {
    setSearchResults(null);
    setQuickCheckResult(null);
    setQuery("");
    navigate("/search");
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
                        className="p-4 bg-black bg-opacity-30 rounded border border-red-800"
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
                            {new Date(report.created_at).toLocaleDateString(
                              "vi-VN"
                            )}
                          </span>
                        </div>
                        <div className="text-xs text-gray-300 mb-2">
                          FB: {report.facebook_link || "N/A"} | Zalo:{" "}
                          {report.zalo_link || "N/A"} | SĐT:{" "}
                          {report.phone_number || "N/A"}
                        </div>
                        <button
                          onClick={() => handleViewReport(report.id)}
                          className="text-xs px-3 py-1 bg-blue-700 rounded hover:bg-blue-600"
                        >
                          XEM CHI TIẾT
                        </button>
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
                      onClick={() => handleViewReport(report.id)}
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
                        <span>
                          {new Date(report.created_at).toLocaleDateString(
                            "vi-VN"
                          )}
                        </span>
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
                      onClick={() => handleViewReport(report.id)}
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
                        <span>
                          {new Date(report.created_at).toLocaleDateString(
                            "vi-VN"
                          )}
                        </span>
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
      {!searchResults && !quickCheckResult && (
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
    </div>
  );
};

export default Search;
