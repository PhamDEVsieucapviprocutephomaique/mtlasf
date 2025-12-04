import React, { useState } from "react";
import { api } from "../services/api";

const Search = () => {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (query.trim().length < 3) {
      setError("Từ khóa phải có ít nhất 3 ký tự");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await api.searchReports(query);
      setSearchResults(results);
    } catch (err) {
      setError("Lỗi kết nối server. Vui lòng thử lại.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickCheck = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const result = await api.quickCheck(query);
      setSearchResults({
        account_scams: result.is_scam ? [result.latest_report] : [],
        website_scams: [],
        total_results: result.is_scam ? 1 : 0,
      });
    } catch (err) {
      setError("Lỗi kiểm tra nhanh");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 glow-green">TRA CỨU SCAM</h1>
        <p className="text-green-300">
          Kiểm tra STK, SĐT, link Facebook, website nghi vấn
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

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-green-700 border border-green-500 rounded-lg hover:bg-green-600 transition-all font-bold flex items-center"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  ĐANG TÌM KIẾM...
                </>
              ) : (
                <>
                  <span className="mr-2">🔍</span>
                  TRA CỨU SCAM
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleQuickCheck}
              disabled={loading || !query.trim()}
              className="px-6 py-3 bg-blue-700 border border-blue-500 rounded-lg hover:bg-blue-600 transition-all font-bold flex items-center"
            >
              <span className="mr-2">⚡</span>
              KIỂM TRA NHANH STK
            </button>

            <button
              type="button"
              onClick={() => setQuery("")}
              className="px-6 py-3 bg-gray-700 border border-gray-500 rounded-lg hover:bg-gray-600 transition-all font-bold"
            >
              XÓA
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-900 border border-red-700 rounded">
              <p className="text-red-300">⚠️ {error}</p>
            </div>
          )}
        </form>
      </div>

      {/* Results */}
      {searchResults && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">
              KẾT QUẢ:{" "}
              <span className="text-green-400">
                {searchResults.total_results}
              </span>{" "}
              KẾT QUẢ
            </h2>
            <button
              onClick={() => setSearchResults(null)}
              className="px-4 py-2 bg-gray-700 border border-gray-500 rounded hover:bg-gray-600"
            >
              ĐÓNG KẾT QUẢ
            </button>
          </div>

          {/* Account Scams */}
          {searchResults.account_scams.length > 0 && (
            <div className="border border-green-700 rounded-lg overflow-hidden">
              <div className="bg-green-900 bg-opacity-30 p-3 border-b border-green-700">
                <h3 className="font-bold flex items-center">
                  <span className="mr-2">💰</span>
                  TÀI KHOẢN SCAM ({searchResults.account_scams.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-green-900 bg-opacity-20">
                      <th className="p-3 border-b border-green-700">STT</th>
                      <th className="p-3 border-b border-green-700">STK/SĐT</th>
                      <th className="p-3 border-b border-green-700">TÊN</th>
                      <th className="p-3 border-b border-green-700">
                        NGÂN HÀNG
                      </th>
                      <th className="p-3 border-b border-green-700">
                        FACEBOOK
                      </th>
                      <th className="p-3 border-b border-green-700">
                        TRẠNG THÁI
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.account_scams.map((report, index) => (
                      <tr
                        key={index}
                        className="hover:bg-green-900 hover:bg-opacity-10"
                      >
                        <td className="p-3 border-b border-green-700 text-center">
                          {index + 1}
                        </td>
                        <td className="p-3 border-b border-green-700 font-mono">
                          <span className="bg-red-900 bg-opacity-30 px-2 py-1 rounded">
                            {report.account_number}
                          </span>
                        </td>
                        <td className="p-3 border-b border-green-700">
                          {report.account_name}
                        </td>
                        <td className="p-3 border-b border-green-700">
                          {report.bank_name || "-"}
                        </td>
                        <td className="p-3 border-b border-green-700">
                          {report.facebook_link ? (
                            <a
                              href={report.facebook_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300"
                            >
                              LINK
                            </a>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="p-3 border-b border-green-700">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              report.status === "approved"
                                ? "bg-green-900 text-green-300"
                                : "bg-yellow-900 text-yellow-300"
                            }`}
                          >
                            {report.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Website Scams */}
          {searchResults.website_scams.length > 0 && (
            <div className="border border-green-700 rounded-lg overflow-hidden">
              <div className="bg-purple-900 bg-opacity-30 p-3 border-b border-purple-700">
                <h3 className="font-bold flex items-center">
                  <span className="mr-2">🌐</span>
                  WEBSITE/LINK SCAM ({searchResults.website_scams.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-purple-900 bg-opacity-20">
                      <th className="p-3 border-b border-purple-700">STT</th>
                      <th className="p-3 border-b border-purple-700">URL</th>
                      <th className="p-3 border-b border-purple-700">
                        THỂ LOẠI
                      </th>
                      <th className="p-3 border-b border-purple-700">MÔ TẢ</th>
                      <th className="p-3 border-b border-purple-700">
                        TRẠNG THÁI
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.website_scams.map((report, index) => (
                      <tr
                        key={index}
                        className="hover:bg-purple-900 hover:bg-opacity-10"
                      >
                        <td className="p-3 border-b border-purple-700 text-center">
                          {index + 1}
                        </td>
                        <td className="p-3 border-b border-purple-700 font-mono">
                          <a
                            href={report.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 break-all"
                          >
                            {report.url}
                          </a>
                        </td>
                        <td className="p-3 border-b border-purple-700">
                          <span className="bg-purple-900 px-2 py-1 rounded text-xs">
                            {report.category}
                          </span>
                        </td>
                        <td className="p-3 border-b border-purple-700 text-sm">
                          {report.description}
                        </td>
                        <td className="p-3 border-b border-purple-700">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              report.status === "approved"
                                ? "bg-green-900 text-green-300"
                                : "bg-yellow-900 text-yellow-300"
                            }`}
                          >
                            {report.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* No Results */}
          {searchResults.total_results === 0 && (
            <div className="text-center py-12 border border-green-700 rounded-lg">
              <div className="text-5xl mb-4">✅</div>
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
      {!searchResults && (
        <div className="bg-black bg-opacity-50 border border-green-700 rounded-lg p-6">
          <h3 className="font-bold mb-3 flex items-center">
            <span className="mr-2">💡</span>
            HƯỚNG DẪN TÌM KIẾM
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 border border-green-800 rounded">
              <h4 className="font-bold text-green-400 mb-1">STK/SĐT</h4>
              <p className="text-sm">
                Nhập số tài khoản ngân hàng hoặc số điện thoại
              </p>
            </div>
            <div className="p-3 border border-green-800 rounded">
              <h4 className="font-bold text-green-400 mb-1">TÊN CHỦ TK</h4>
              <p className="text-sm">
                Tìm theo tên chủ tài khoản (có dấu/không dấu)
              </p>
            </div>
            <div className="p-3 border border-green-800 rounded">
              <h4 className="font-bold text-green-400 mb-1">LINK FACEBOOK</h4>
              <p className="text-sm">Dán link Facebook profile hoặc page</p>
            </div>
            <div className="p-3 border border-green-800 rounded">
              <h4 className="font-bold text-green-400 mb-1">URL WEBSITE</h4>
              <p className="text-sm">Dán URL website nghi vấn lừa đảo</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
