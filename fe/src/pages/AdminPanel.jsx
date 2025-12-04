import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import Loading from "../components/Loading";

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [pendingAccounts, setPendingAccounts] = useState([]);
  const [pendingWebsites, setPendingWebsites] = useState([]);
  const [allAccounts, setAllAccounts] = useState([]);
  const [allWebsites, setAllWebsites] = useState([]);
  const [comments, setComments] = useState([]);
  const [systemSettings, setSystemSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedComment, setSelectedComment] = useState(null);
  const [editSettings, setEditSettings] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, [activeTab]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [accounts, websites, settings] = await Promise.all([
        api.getAccountReports({ status: "pending" }),
        api.getWebsiteReports({ status: "pending" }),
        api.getSystemSettings(),
      ]);

      setPendingAccounts(accounts);
      setPendingWebsites(websites);
      setSystemSettings(settings);

      // Fetch all reports for management tab
      if (activeTab === "manage") {
        const [allAcc, allWeb] = await Promise.all([
          api.getAccountReports({ limit: 50 }),
          api.getWebsiteReports({ limit: 50 }),
        ]);
        setAllAccounts(allAcc);
        setAllWebsites(allWeb);
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (type, id) => {
    try {
      if (type === "account") {
        await fetch(`http://localhost:8000/api/account-reports/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "approved" }),
        });
      } else {
        await fetch(`http://localhost:8000/api/website-reports/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "approved" }),
        });
      }
      alert("Đã duyệt báo cáo!");
      fetchAdminData();
    } catch (error) {
      alert("Lỗi khi duyệt báo cáo");
    }
  };

  const handleReject = async (type, id) => {
    if (!window.confirm("Bạn có chắc chắn muốn từ chối báo cáo này?")) return;

    try {
      if (type === "account") {
        await fetch(`http://localhost:8000/api/account-reports/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "rejected" }),
        });
      } else {
        await fetch(`http://localhost:8000/api/website-reports/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "rejected" }),
        });
      }
      alert("Đã từ chối báo cáo!");
      fetchAdminData();
    } catch (error) {
      alert("Lỗi khi từ chối báo cáo");
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn?")) return;

    try {
      if (type === "account") {
        await fetch(`http://localhost:8000/api/account-reports/${id}`, {
          method: "DELETE",
        });
      } else {
        await fetch(`http://localhost:8000/api/website-reports/${id}`, {
          method: "DELETE",
        });
      }
      alert("Đã xóa thành công!");
      fetchAdminData();
    } catch (error) {
      alert("Lỗi khi xóa");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Xóa bình luận này?")) return;

    try {
      await fetch(`http://localhost:8000/api/comments/${commentId}`, {
        method: "DELETE",
      });
      alert("Đã xóa bình luận!");
      setComments(comments.filter((c) => c.id !== commentId));
    } catch (error) {
      alert("Lỗi khi xóa bình luận");
    }
  };

  const handleSaveSettings = async () => {
    try {
      await fetch("http://localhost:8000/api/dashboard/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(systemSettings),
      });
      setEditSettings(false);
      alert("Đã lưu cài đặt!");
    } catch (error) {
      alert("Lỗi khi lưu cài đặt");
    }
  };

  const handleRefreshStats = async () => {
    try {
      await fetch("http://localhost:8000/api/dashboard/refresh-stats", {
        method: "POST",
      });
      alert("Đã làm mới thống kê!");
      fetchAdminData();
    } catch (error) {
      alert("Lỗi khi làm mới thống kê");
    }
  };

  if (loading) return <Loading message="ĐANG TẢI ADMIN PANEL..." />;

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="bg-black bg-opacity-50 border border-red-700 rounded-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-red-400">
              ⚙️ ADMIN CONTROL PANEL
            </h1>
            <p className="text-red-300">
              Quản lý hệ thống CheckScam - Quyền admin
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="flex space-x-3">
              <button
                onClick={handleRefreshStats}
                className="px-4 py-2 bg-blue-700 border border-blue-500 rounded hover:bg-blue-600"
              >
                🔄 REFRESH STATS
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-green-700 border border-green-500 rounded hover:bg-green-600"
              >
                RELOAD SYSTEM
              </button>
            </div>
            <div className="text-xs text-red-400 mt-2 text-center md:text-right">
              IP: 127.0.0.1 | ADMIN: ROOT | TIME:{" "}
              {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex border-b border-red-700 overflow-x-auto">
        {[
          {
            id: "pending",
            label: "⏳ CHỜ DUYỆT",
            count: pendingAccounts.length + pendingWebsites.length,
          },
          {
            id: "manage",
            label: "📋 QUẢN LÝ",
            count: allAccounts.length + allWebsites.length,
          },
          { id: "comments", label: "💬 BÌNH LUẬN", count: 0 },
          { id: "settings", label: "⚙️ CÀI ĐẶT", count: 0 },
          { id: "logs", label: "📊 NHẬT KÝ", count: 0 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-6 py-3 font-bold whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-red-900 text-white border-b-2 border-red-500"
                : "hover:bg-red-900"
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-2 bg-red-700 px-2 py-1 rounded-full text-xs">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Pending Reports Tab */}
      {activeTab === "pending" && (
        <div className="space-y-6">
          {/* Pending Account Reports */}
          <div className="border border-red-700 rounded-lg overflow-hidden">
            <div className="bg-red-900 bg-opacity-30 p-4">
              <h3 className="font-bold text-lg">
                💰 TÀI KHOẢN SCAM CHỜ DUYỆT ({pendingAccounts.length})
              </h3>
            </div>
            <div className="p-4">
              {pendingAccounts.length > 0 ? (
                <div className="space-y-4">
                  {pendingAccounts.map((report) => (
                    <div
                      key={report.id}
                      className="border border-red-800 rounded-lg p-4 hover:bg-red-900 hover:bg-opacity-10"
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start mb-3">
                        <div>
                          <div className="font-mono font-bold text-lg text-red-400">
                            {report.account_number}
                          </div>
                          <div className="text-sm">
                            {report.account_name} |{" "}
                            {report.bank_name || "Không có ngân hàng"}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            Người báo cáo: {report.reporter_name} | Zalo:{" "}
                            {report.reporter_zalo}
                          </div>
                        </div>
                        <div className="mt-2 md:mt-0 flex space-x-2">
                          <button
                            onClick={() => handleApprove("account", report.id)}
                            className="px-4 py-2 bg-green-700 border border-green-500 rounded hover:bg-green-600"
                          >
                            ✅ DUYỆT
                          </button>
                          <button
                            onClick={() => handleReject("account", report.id)}
                            className="px-4 py-2 bg-yellow-700 border border-yellow-500 rounded hover:bg-yellow-600"
                          >
                            ❌ TỪ CHỐI
                          </button>
                          <button
                            onClick={() =>
                              setSelectedReport({
                                type: "account",
                                data: report,
                              })
                            }
                            className="px-4 py-2 bg-blue-700 border border-blue-500 rounded hover:bg-blue-600"
                          >
                            👁️ XEM
                          </button>
                        </div>
                      </div>
                      <div className="text-sm mb-3 line-clamp-2">
                        {report.content}
                      </div>
                      {report.evidence_images.length > 0 && (
                        <div className="flex space-x-2 overflow-x-auto">
                          {report.evidence_images.map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt="evidence"
                              className="w-20 h-20 object-cover rounded border border-red-600"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">✅</div>
                  <p className="text-green-400">
                    Không có báo cáo nào chờ duyệt
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Pending Website Reports */}
          <div className="border border-purple-700 rounded-lg overflow-hidden">
            <div className="bg-purple-900 bg-opacity-30 p-4">
              <h3 className="font-bold text-lg">
                🌐 WEBSITE SCAM CHỜ DUYỆT ({pendingWebsites.length})
              </h3>
            </div>
            <div className="p-4">
              {pendingWebsites.length > 0 ? (
                <div className="space-y-4">
                  {pendingWebsites.map((report) => (
                    <div
                      key={report.id}
                      className="border border-purple-800 rounded-lg p-4 hover:bg-purple-900 hover:bg-opacity-10"
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start mb-3">
                        <div className="flex-1">
                          <a
                            href={report.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 break-all"
                          >
                            {report.url}
                          </a>
                          <div className="text-sm mt-1">
                            <span className="bg-purple-900 px-2 py-1 rounded mr-2">
                              {report.category}
                            </span>
                            <span className="text-gray-400">
                              Email: {report.reporter_email}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 md:mt-0 flex space-x-2">
                          <button
                            onClick={() => handleApprove("website", report.id)}
                            className="px-4 py-2 bg-green-700 border border-green-500 rounded hover:bg-green-600"
                          >
                            ✅ DUYỆT
                          </button>
                          <button
                            onClick={() => handleReject("website", report.id)}
                            className="px-4 py-2 bg-yellow-700 border border-yellow-500 rounded hover:bg-yellow-600"
                          >
                            ❌ TỪ CHỐI
                          </button>
                          <button
                            onClick={() =>
                              setSelectedReport({
                                type: "website",
                                data: report,
                              })
                            }
                            className="px-4 py-2 bg-blue-700 border border-blue-500 rounded hover:bg-blue-600"
                          >
                            👁️ XEM
                          </button>
                        </div>
                      </div>
                      <div className="text-sm">{report.description}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">✅</div>
                  <p className="text-green-400">
                    Không có website nào chờ duyệt
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Manage Tab */}
      {activeTab === "manage" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Account Reports Management */}
            <div className="border border-green-700 rounded-lg overflow-hidden">
              <div className="bg-green-900 bg-opacity-30 p-4">
                <h3 className="font-bold flex justify-between items-center">
                  <span>💰 QUẢN LÝ TÀI KHOẢN SCAM ({allAccounts.length})</span>
                  <input
                    type="text"
                    placeholder="Tìm STK/SĐT..."
                    className="bg-black border border-green-600 text-green-400 px-2 py-1 rounded text-sm"
                  />
                </h3>
              </div>
              <div className="p-4 max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-green-900 bg-opacity-20">
                      <th className="p-2 text-left">STK/SĐT</th>
                      <th className="p-2 text-left">TRẠNG THÁI</th>
                      <th className="p-2 text-left">HÀNH ĐỘNG</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allAccounts.map((report) => (
                      <tr
                        key={report.id}
                        className="border-b border-green-800 hover:bg-green-900 hover:bg-opacity-10"
                      >
                        <td className="p-2 font-mono">
                          {report.account_number}
                        </td>
                        <td className="p-2">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              report.status === "approved"
                                ? "bg-green-900"
                                : report.status === "pending"
                                ? "bg-yellow-900"
                                : "bg-red-900"
                            }`}
                          >
                            {report.status}
                          </span>
                        </td>
                        <td className="p-2">
                          <div className="flex space-x-1">
                            <button
                              onClick={() =>
                                setSelectedReport({
                                  type: "account",
                                  data: report,
                                })
                              }
                              className="px-2 py-1 bg-blue-700 rounded text-xs"
                            >
                              XEM
                            </button>
                            <button
                              onClick={() => handleDelete("account", report.id)}
                              className="px-2 py-1 bg-red-700 rounded text-xs"
                            >
                              XÓA
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Website Reports Management */}
            <div className="border border-purple-700 rounded-lg overflow-hidden">
              <div className="bg-purple-900 bg-opacity-30 p-4">
                <h3 className="font-bold flex justify-between items-center">
                  <span>🌐 QUẢN LÝ WEBSITE SCAM ({allWebsites.length})</span>
                  <input
                    type="text"
                    placeholder="Tìm URL..."
                    className="bg-black border border-purple-600 text-purple-400 px-2 py-1 rounded text-sm"
                  />
                </h3>
              </div>
              <div className="p-4 max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-purple-900 bg-opacity-20">
                      <th className="p-2 text-left">URL</th>
                      <th className="p-2 text-left">TRẠNG THÁI</th>
                      <th className="p-2 text-left">HÀNH ĐỘNG</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allWebsites.map((report) => (
                      <tr
                        key={report.id}
                        className="border-b border-purple-800 hover:bg-purple-900 hover:bg-opacity-10"
                      >
                        <td className="p-2 truncate max-w-xs">{report.url}</td>
                        <td className="p-2">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              report.status === "approved"
                                ? "bg-green-900"
                                : report.status === "pending"
                                ? "bg-yellow-900"
                                : "bg-red-900"
                            }`}
                          >
                            {report.status}
                          </span>
                        </td>
                        <td className="p-2">
                          <div className="flex space-x-1">
                            <button
                              onClick={() =>
                                setSelectedReport({
                                  type: "website",
                                  data: report,
                                })
                              }
                              className="px-2 py-1 bg-blue-700 rounded text-xs"
                            >
                              XEM
                            </button>
                            <button
                              onClick={() => handleDelete("website", report.id)}
                              className="px-2 py-1 bg-red-700 rounded text-xs"
                            >
                              XÓA
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          <div className="border border-yellow-700 rounded-lg p-4">
            <h3 className="font-bold mb-3 text-yellow-400">
              ⚡ HÀNH ĐỘNG HÀNG LOẠT
            </h3>
            <div className="flex flex-wrap gap-3">
              <button className="px-4 py-2 bg-green-700 border border-green-500 rounded hover:bg-green-600">
                DUYỆT TẤT CẢ PENDING
              </button>
              <button className="px-4 py-2 bg-red-700 border border-red-500 rounded hover:bg-red-600">
                XÓA TẤT CẢ REJECTED
              </button>
              <button className="px-4 py-2 bg-blue-700 border border-blue-500 rounded hover:bg-blue-600">
                XUẤT BÁO CÁO CSV
              </button>
              <button className="px-4 py-2 bg-purple-700 border border-purple-500 rounded hover:bg-purple-600">
                BACKUP DATABASE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === "settings" && systemSettings && (
        <div className="space-y-6">
          <div className="border border-blue-700 rounded-lg overflow-hidden">
            <div className="bg-blue-900 bg-opacity-30 p-4 flex justify-between items-center">
              <h3 className="font-bold text-lg">⚙️ CÀI ĐẶT HỆ THỐNG</h3>
              {editSettings ? (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSaveSettings}
                    className="px-4 py-2 bg-green-700 border border-green-500 rounded hover:bg-green-600"
                  >
                    💾 LƯU
                  </button>
                  <button
                    onClick={() => setEditSettings(false)}
                    className="px-4 py-2 bg-gray-700 border border-gray-500 rounded hover:bg-gray-600"
                  >
                    HỦY
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditSettings(true)}
                  className="px-4 py-2 bg-yellow-700 border border-yellow-500 rounded hover:bg-yellow-600"
                >
                  ✏️ CHỈNH SỬA
                </button>
              )}
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* System Stats */}
                <div>
                  <h4 className="font-bold mb-3 text-green-400">
                    📊 THỐNG KÊ HỆ THỐNG
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-black bg-opacity-30 rounded">
                      <span>Tổng STK scam:</span>
                      <span className="font-bold text-green-400">
                        {systemSettings.total_account_scams}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-black bg-opacity-30 rounded">
                      <span>Tổng FB scam:</span>
                      <span className="font-bold text-green-400">
                        {systemSettings.total_fb_scams}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-black bg-opacity-30 rounded">
                      <span>Tổng bình luận:</span>
                      <span className="font-bold text-green-400">
                        {systemSettings.total_comments}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-black bg-opacity-30 rounded">
                      <span>Báo cáo chờ duyệt:</span>
                      <span className="font-bold text-yellow-400">
                        {systemSettings.pending_reports}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                <div>
                  <h4 className="font-bold mb-3 text-green-400">
                    🔗 LIÊN KẾT MẠNG XÃ HỘI
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm mb-1">
                        Facebook Group:
                      </label>
                      {editSettings ? (
                        <input
                          type="text"
                          value={systemSettings.facebook_group || ""}
                          onChange={(e) =>
                            setSystemSettings({
                              ...systemSettings,
                              facebook_group: e.target.value,
                            })
                          }
                          className="w-full bg-black border border-blue-600 text-green-400 px-3 py-2 rounded"
                        />
                      ) : (
                        <div className="p-2 bg-black bg-opacity-30 rounded">
                          {systemSettings.facebook_group || "Chưa cài đặt"}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm mb-1">
                        Discord Link:
                      </label>
                      {editSettings ? (
                        <input
                          type="text"
                          value={systemSettings.discord_link || ""}
                          onChange={(e) =>
                            setSystemSettings({
                              ...systemSettings,
                              discord_link: e.target.value,
                            })
                          }
                          className="w-full bg-black border border-blue-600 text-green-400 px-3 py-2 rounded"
                        />
                      ) : (
                        <div className="p-2 bg-black bg-opacity-30 rounded">
                          {systemSettings.discord_link || "Chưa cài đặt"}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm mb-1">
                        Telegram Link:
                      </label>
                      {editSettings ? (
                        <input
                          type="text"
                          value={systemSettings.telegram_link || ""}
                          onChange={(e) =>
                            setSystemSettings({
                              ...systemSettings,
                              telegram_link: e.target.value,
                            })
                          }
                          className="w-full bg-black border border-blue-600 text-green-400 px-3 py-2 rounded"
                        />
                      ) : (
                        <div className="p-2 bg-black bg-opacity-30 rounded">
                          {systemSettings.telegram_link || "Chưa cài đặt"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* System Config */}
              <div className="mt-6">
                <h4 className="font-bold mb-3 text-green-400">
                  ⚙️ CẤU HÌNH HỆ THỐNG
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-black bg-opacity-30 rounded border border-green-800">
                    <div className="text-sm text-gray-400">Auto Approve</div>
                    <div className="font-bold">TẮT</div>
                  </div>
                  <div className="p-3 bg-black bg-opacity-30 rounded border border-green-800">
                    <div className="text-sm text-gray-400">API Rate Limit</div>
                    <div className="font-bold">100/giờ</div>
                  </div>
                  <div className="p-3 bg-black bg-opacity-30 rounded border border-green-800">
                    <div className="text-sm text-gray-400">Backup Auto</div>
                    <div className="font-bold">HÀNG NGÀY</div>
                  </div>
                  <div className="p-3 bg-black bg-opacity-30 rounded border border-green-800">
                    <div className="text-sm text-gray-400">Log Retention</div>
                    <div className="font-bold">30 NGÀY</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="border border-red-700 rounded-lg overflow-hidden">
            <div className="bg-red-900 bg-opacity-30 p-4">
              <h3 className="font-bold text-lg">⚠️ VÙNG NGUY HIỂM</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <button className="w-full text-left p-4 bg-red-900 bg-opacity-30 border border-red-700 rounded-lg hover:bg-red-800">
                  <div className="font-bold">
                    🗑️ XÓA TẤT CẢ DỮ LIỆU CŨ (90+ NGÀY)
                  </div>
                  <div className="text-sm text-red-300 mt-1">
                    Xóa vĩnh viễn dữ liệu cũ hơn 90 ngày
                  </div>
                </button>
                <button className="w-full text-left p-4 bg-red-900 bg-opacity-30 border border-red-700 rounded-lg hover:bg-red-800">
                  <div className="font-bold">🚫 RESET TOÀN BỘ HỆ THỐNG</div>
                  <div className="text-sm text-red-300 mt-1">
                    Xóa tất cả dữ liệu và reset về mặc định
                  </div>
                </button>
                <button className="w-full text-left p-4 bg-red-900 bg-opacity-30 border border-red-700 rounded-lg hover:bg-red-800">
                  <div className="font-bold">🔒 CHẶN IP HÀNG LOẠT</div>
                  <div className="text-sm text-red-300 mt-1">
                    Chặn IP spam hoặc tấn công
                  </div>
                </button>
              </div>
              <div className="mt-6 text-center text-sm text-red-400">
                ⚠️ Các thao tác này không thể hoàn tác. Vui lòng sao lưu dữ liệu
                trước khi thực hiện.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black bg-opacity-75"
            onClick={() => setSelectedReport(null)}
          ></div>
          <div className="relative w-full max-w-4xl bg-black border-2 border-red-500 rounded-lg overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="bg-red-900 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">
                {selectedReport.type === "account"
                  ? "💰 CHI TIẾT BÁO CÁO TK"
                  : "🌐 CHI TIẾT BÁO CÁO WEBSITE"}
              </h2>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-xl"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              {selectedReport.type === "account" ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-bold mb-2 text-green-400">
                        THÔNG TIN TÀI KHOẢN
                      </h4>
                      <div className="space-y-2">
                        <div>
                          <strong>STK/SĐT:</strong>{" "}
                          <span className="font-mono text-red-400">
                            {selectedReport.data.account_number}
                          </span>
                        </div>
                        <div>
                          <strong>Tên chủ TK:</strong>{" "}
                          {selectedReport.data.account_name}
                        </div>
                        <div>
                          <strong>Ngân hàng:</strong>{" "}
                          {selectedReport.data.bank_name || "Không có"}
                        </div>
                        <div>
                          <strong>Facebook:</strong>{" "}
                          {selectedReport.data.facebook_link || "Không có"}
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold mb-2 text-green-400">
                        THÔNG TIN BÁO CÁO
                      </h4>
                      <div className="space-y-2">
                        <div>
                          <strong>Trạng thái:</strong>{" "}
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              selectedReport.data.status === "approved"
                                ? "bg-green-900"
                                : selectedReport.data.status === "pending"
                                ? "bg-yellow-900"
                                : "bg-red-900"
                            }`}
                          >
                            {selectedReport.data.status}
                          </span>
                        </div>
                        <div>
                          <strong>Người báo cáo:</strong>{" "}
                          {selectedReport.data.reporter_name}
                        </div>
                        <div>
                          <strong>Zalo:</strong>{" "}
                          {selectedReport.data.reporter_zalo}
                        </div>
                        <div>
                          <strong>Là nạn nhân:</strong>{" "}
                          {selectedReport.data.is_victim ? "Có" : "Không"}
                        </div>
                        <div>
                          <strong>Báo cáo hộ:</strong>{" "}
                          {selectedReport.data.is_proxy_report ? "Có" : "Không"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold mb-2 text-green-400">
                      NỘI DUNG BÁO CÁO
                    </h4>
                    <div className="bg-black bg-opacity-30 p-4 rounded border border-green-800">
                      {selectedReport.data.content}
                    </div>
                  </div>

                  {selectedReport.data.evidence_images.length > 0 && (
                    <div>
                      <h4 className="font-bold mb-2 text-green-400">
                        HÌNH ẢNH BẰNG CHỨNG (
                        {selectedReport.data.evidence_images.length})
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {selectedReport.data.evidence_images.map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt="evidence"
                            className="w-full h-32 object-cover rounded border border-green-600"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-bold mb-2 text-green-400">
                        THỐNG KÊ
                      </h4>
                      <div className="space-y-2">
                        <div>
                          <strong>Lượt xem:</strong>{" "}
                          {selectedReport.data.view_count}
                        </div>
                        <div>
                          <strong>Bình luận:</strong>{" "}
                          {selectedReport.data.comment_count}
                        </div>
                        <div>
                          <strong>Ngày tạo:</strong>{" "}
                          {new Date(
                            selectedReport.data.created_at
                          ).toLocaleString("vi-VN")}
                        </div>
                        {selectedReport.data.approved_at && (
                          <div>
                            <strong>Ngày duyệt:</strong>{" "}
                            {new Date(
                              selectedReport.data.approved_at
                            ).toLocaleString("vi-VN")}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold mb-2 text-green-400">
                        HÀNH ĐỘNG
                      </h4>
                      <div className="space-y-2">
                        {selectedReport.data.status === "pending" && (
                          <>
                            <button
                              onClick={() => {
                                handleApprove(
                                  "account",
                                  selectedReport.data.id
                                );
                                setSelectedReport(null);
                              }}
                              className="w-full py-2 bg-green-700 border border-green-500 rounded hover:bg-green-600"
                            >
                              ✅ DUYỆT BÁO CÁO
                            </button>
                            <button
                              onClick={() => {
                                handleReject("account", selectedReport.data.id);
                                setSelectedReport(null);
                              }}
                              className="w-full py-2 bg-yellow-700 border border-yellow-500 rounded hover:bg-yellow-600"
                            >
                              ❌ TỪ CHỐI BÁO CÁO
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => {
                            handleDelete("account", selectedReport.data.id);
                            setSelectedReport(null);
                          }}
                          className="w-full py-2 bg-red-700 border border-red-500 rounded hover:bg-red-600"
                        >
                          🗑️ XÓA BÁO CÁO
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-bold mb-2 text-green-400">
                        THÔNG TIN WEBSITE
                      </h4>
                      <div className="space-y-2">
                        <div>
                          <strong>URL:</strong>{" "}
                          <a
                            href={selectedReport.data.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 break-all"
                          >
                            {selectedReport.data.url}
                          </a>
                        </div>
                        <div>
                          <strong>Thể loại:</strong>{" "}
                          <span className="bg-purple-900 px-2 py-1 rounded text-xs">
                            {selectedReport.data.category}
                          </span>
                        </div>
                        <div>
                          <strong>Email báo cáo:</strong>{" "}
                          {selectedReport.data.reporter_email}
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold mb-2 text-green-400">
                        THÔNG TIN BÁO CÁO
                      </h4>
                      <div className="space-y-2">
                        <div>
                          <strong>Trạng thái:</strong>{" "}
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              selectedReport.data.status === "approved"
                                ? "bg-green-900"
                                : selectedReport.data.status === "pending"
                                ? "bg-yellow-900"
                                : "bg-red-900"
                            }`}
                          >
                            {selectedReport.data.status}
                          </span>
                        </div>
                        <div>
                          <strong>Lượt xem:</strong>{" "}
                          {selectedReport.data.view_count}
                        </div>
                        <div>
                          <strong>Ngày tạo:</strong>{" "}
                          {new Date(
                            selectedReport.data.created_at
                          ).toLocaleString("vi-VN")}
                        </div>
                        {selectedReport.data.approved_at && (
                          <div>
                            <strong>Ngày duyệt:</strong>{" "}
                            {new Date(
                              selectedReport.data.approved_at
                            ).toLocaleString("vi-VN")}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold mb-2 text-green-400">
                      MÔ TẢ CHI TIẾT
                    </h4>
                    <div className="bg-black bg-opacity-30 p-4 rounded border border-green-800">
                      {selectedReport.data.description}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-bold mb-2 text-green-400">
                        HÀNH ĐỘNG
                      </h4>
                      <div className="space-y-2">
                        {selectedReport.data.status === "pending" && (
                          <>
                            <button
                              onClick={() => {
                                handleApprove(
                                  "website",
                                  selectedReport.data.id
                                );
                                setSelectedReport(null);
                              }}
                              className="w-full py-2 bg-green-700 border border-green-500 rounded hover:bg-green-600"
                            >
                              ✅ DUYỆT BÁO CÁO
                            </button>
                            <button
                              onClick={() => {
                                handleReject("website", selectedReport.data.id);
                                setSelectedReport(null);
                              }}
                              className="w-full py-2 bg-yellow-700 border border-yellow-500 rounded hover:bg-yellow-600"
                            >
                              ❌ TỪ CHỐI BÁO CÁO
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => {
                            handleDelete("website", selectedReport.data.id);
                            setSelectedReport(null);
                          }}
                          className="w-full py-2 bg-red-700 border border-red-500 rounded hover:bg-red-600"
                        >
                          🗑️ XÓA BÁO CÁO
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
