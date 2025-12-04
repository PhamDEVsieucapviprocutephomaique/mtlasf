import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import Loading from "../components/Loading";

const ScamList = () => {
  const [activeTab, setActiveTab] = useState("accounts");
  const [accountReports, setAccountReports] = useState([]);
  const [websiteReports, setWebsiteReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchReports();
  }, [activeTab, page]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      if (activeTab === "accounts") {
        const reports = await api.getAccountReports({
          limit: 20,
          offset: (page - 1) * 20,
        });
        setAccountReports(reports);
        // Giả sử API trả về tổng số trang (trong thực tế cần API hỗ trợ pagination)
        setTotalPages(Math.ceil(reports.length / 20));
      } else {
        const reports = await api.getWebsiteReports({
          limit: 20,
          offset: (page - 1) * 20,
        });
        setWebsiteReports(reports);
        setTotalPages(Math.ceil(reports.length / 20));
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusBadge = (status) => {
    const config = {
      pending: { color: "bg-yellow-900 text-yellow-300", label: "CHỜ DUYỆT" },
      approved: { color: "bg-green-900 text-green-300", label: "ĐÃ DUYỆT" },
      rejected: { color: "bg-red-900 text-red-300", label: "TỪ CHỐI" },
    };
    const { color, label } = config[status] || config.pending;
    return (
      <span className={`px-2 py-1 rounded text-xs ${color}`}>{label}</span>
    );
  };

  if (loading) return <Loading message="ĐANG TẢI DANH SÁCH SCAM..." />;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 glow-green">
          📋 DANH SÁCH SCAM
        </h1>
        <p className="text-green-300">
          Tổng hợp tất cả tài khoản và website lừa đảo đã được báo cáo
        </p>
      </div>

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
          <span className="mr-2">💰</span>
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
          <span className="mr-2">🌐</span>
          WEBSITE SCAM ({websiteReports.length})
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 bg-black bg-opacity-50 border border-green-700 rounded-lg">
        <div>
          <label className="block text-sm mb-1">Sắp xếp:</label>
          <select className="bg-black border border-green-600 text-green-400 px-3 py-1 rounded">
            <option>MỚI NHẤT</option>
            <option>LƯỢT XEM CAO</option>
            <option>LẦN BÁO CÁO</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Trạng thái:</label>
          <select className="bg-black border border-green-600 text-green-400 px-3 py-1 rounded">
            <option>TẤT CẢ</option>
            <option>ĐÃ DUYỆT</option>
            <option>CHỜ DUYỆT</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Ngân hàng:</label>
          <select className="bg-black border border-green-600 text-green-400 px-3 py-1 rounded">
            <option>TẤT CẢ</option>
            <option>VIETCOMBANK</option>
            <option>TECHCOMBANK</option>
            <option>BIDV</option>
            <option>AGRIBANK</option>
          </select>
        </div>
        <button className="self-end px-4 py-1 bg-green-700 border border-green-500 rounded hover:bg-green-600">
          ÁP DỤNG
        </button>
      </div>

      {/* Account Scams Table */}
      {activeTab === "accounts" && (
        <div className="border border-green-700 rounded-lg overflow-hidden">
          <div className="bg-green-900 bg-opacity-30 p-3">
            <div className="flex justify-between items-center">
              <h3 className="font-bold">DANH SÁCH TÀI KHOẢN SCAM</h3>
              <span className="text-sm text-green-300">
                Hiển thị {accountReports.length} báo cáo
              </span>
            </div>
          </div>

          {accountReports.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-green-900 bg-opacity-20">
                    <th className="p-3 text-left">STK/SĐT</th>
                    <th className="p-3 text-left">TÊN CHỦ TK</th>
                    <th className="p-3 text-left">NGÂN HÀNG</th>
                    <th className="p-3 text-left">FB LINK</th>
                    <th className="p-3 text-left">TRẠNG THÁI</th>
                    <th className="p-3 text-left">LƯỢT XEM</th>
                    <th className="p-3 text-left">NGÀY BÁO CÁO</th>
                  </tr>
                </thead>
                <tbody>
                  {accountReports.map((report, index) => (
                    <tr
                      key={report.id}
                      className={`hover:bg-green-900 hover:bg-opacity-10 ${
                        index % 2 === 0 ? "bg-black bg-opacity-20" : ""
                      }`}
                    >
                      <td className="p-3 font-mono">
                        <span className="bg-red-900 bg-opacity-30 px-2 py-1 rounded">
                          {report.account_number}
                        </span>
                      </td>
                      <td className="p-3">{report.account_name}</td>
                      <td className="p-3">{report.bank_name || "-"}</td>
                      <td className="p-3">
                        {report.facebook_link ? (
                          <a
                            href={report.facebook_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-sm"
                          >
                            LINK
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="p-3">
                        {handleStatusBadge(report.status)}
                      </td>
                      <td className="p-3 text-center">{report.view_count}</td>
                      <td className="p-3 text-sm">
                        {new Date(report.created_at).toLocaleDateString(
                          "vi-VN"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">📭</div>
              <h3 className="text-xl font-bold mb-2">KHÔNG CÓ DỮ LIỆU</h3>
              <p className="text-green-300">
                Chưa có báo cáo tài khoản scam nào
              </p>
            </div>
          )}
        </div>
      )}

      {/* Website Scams Table */}
      {activeTab === "websites" && (
        <div className="border border-purple-700 rounded-lg overflow-hidden">
          <div className="bg-purple-900 bg-opacity-30 p-3">
            <div className="flex justify-between items-center">
              <h3 className="font-bold">DANH SÁCH WEBSITE SCAM</h3>
              <span className="text-sm text-purple-300">
                Hiển thị {websiteReports.length} báo cáo
              </span>
            </div>
          </div>

          {websiteReports.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-purple-900 bg-opacity-20">
                    <th className="p-3 text-left">URL</th>
                    <th className="p-3 text-left">THỂ LOẠI</th>
                    <th className="p-3 text-left">MÔ TẢ</th>
                    <th className="p-3 text-left">TRẠNG THÁI</th>
                    <th className="p-3 text-left">LƯỢT XEM</th>
                    <th className="p-3 text-left">NGÀY BÁO CÁO</th>
                  </tr>
                </thead>
                <tbody>
                  {websiteReports.map((report, index) => (
                    <tr
                      key={report.id}
                      className={`hover:bg-purple-900 hover:bg-opacity-10 ${
                        index % 2 === 0 ? "bg-black bg-opacity-20" : ""
                      }`}
                    >
                      <td className="p-3">
                        <a
                          href={report.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 break-all text-sm"
                        >
                          {report.url.length > 50
                            ? report.url.substring(0, 50) + "..."
                            : report.url}
                        </a>
                      </td>
                      <td className="p-3">
                        <span className="bg-purple-900 px-2 py-1 rounded text-xs">
                          {report.category}
                        </span>
                      </td>
                      <td className="p-3 text-sm max-w-xs truncate">
                        {report.description}
                      </td>
                      <td className="p-3">
                        {handleStatusBadge(report.status)}
                      </td>
                      <td className="p-3 text-center">{report.view_count}</td>
                      <td className="p-3 text-sm">
                        {new Date(report.created_at).toLocaleDateString(
                          "vi-VN"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🌐</div>
              <h3 className="text-xl font-bold mb-2">KHÔNG CÓ DỮ LIỆU</h3>
              <p className="text-purple-300">
                Chưa có báo cáo website scam nào
              </p>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-green-900 border border-green-700 rounded hover:bg-green-800 disabled:opacity-50"
          >
            ← TRƯỚC
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
            SAU →
          </button>
        </div>
      )}

      {/* Export Data */}
      <div className="text-center">
        <button className="px-6 py-3 bg-blue-900 border border-blue-700 rounded-lg hover:bg-blue-800 transition-all">
          <span className="mr-2">📥</span>
          XUẤT DỮ LIỆU CSV
        </button>
        <p className="text-sm text-green-400 mt-2">
          Tải xuống danh sách đầy đủ để phân tích
        </p>
      </div>
    </div>
  );
};

export default ScamList;
