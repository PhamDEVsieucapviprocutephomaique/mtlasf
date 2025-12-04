import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import Loading from "../components/Loading";

const InsuranceFund = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const data = await api.getInsuranceAdmins();
      setAdmins(data);
    } catch (error) {
      console.error("Error fetching admins:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getServicesBadges = (services) => {
    return services.map((service, index) => (
      <span
        key={index}
        className="inline-block bg-blue-900 text-blue-300 px-2 py-1 rounded text-xs mr-1 mb-1"
      >
        {service}
      </span>
    ));
  };

  if (loading) return <Loading message="ĐANG TẢI DANH SÁCH ADMIN..." />;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 glow-green">
          🛡️ QUỸ BẢO HIỂM CS
        </h1>
        <p className="text-green-300">
          Danh sách Admin trung gian uy tín - Bảo vệ giao dịch an toàn
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-black bg-opacity-50 border border-blue-700 rounded-lg p-4">
          <div className="text-3xl font-bold text-blue-400">
            {admins.length}
          </div>
          <div className="text-sm text-blue-300">TỔNG SỐ ADMIN</div>
        </div>
        <div className="bg-black bg-opacity-50 border border-blue-700 rounded-lg p-4">
          <div className="text-3xl font-bold text-blue-400">
            {admins.filter((a) => a.is_active).length}
          </div>
          <div className="text-sm text-blue-300">ĐANG HOẠT ĐỘNG</div>
        </div>
        <div className="bg-black bg-opacity-50 border border-blue-700 rounded-lg p-4">
          <div className="text-3xl font-bold text-blue-400">
            {formatCurrency(
              admins.reduce((sum, admin) => sum + admin.insurance_amount, 0)
            )}
          </div>
          <div className="text-sm text-blue-300">TỔNG QUỸ BẢO HIỂM</div>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode("grid")}
            className={`px-4 py-2 rounded ${
              viewMode === "grid"
                ? "bg-blue-900 border border-blue-500"
                : "bg-black border border-blue-700 hover:bg-blue-900"
            }`}
          >
            🏢 GRID VIEW
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-4 py-2 rounded ${
              viewMode === "list"
                ? "bg-blue-900 border border-blue-500"
                : "bg-black border border-blue-700 hover:bg-blue-900"
            }`}
          >
            📋 LIST VIEW
          </button>
        </div>
        <div className="text-sm text-blue-300">
          Hiển thị: {admins.filter((a) => a.is_active).length}/{admins.length}{" "}
          admin active
        </div>
      </div>

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {admins.map((admin) => (
            <div
              key={admin.id}
              className={`border rounded-lg overflow-hidden transition-all hover:scale-[1.02] ${
                admin.is_active
                  ? "border-blue-600 bg-black bg-opacity-50"
                  : "border-gray-700 bg-black bg-opacity-30 opacity-70"
              }`}
            >
              {/* Admin Header */}
              <div
                className={`p-4 ${
                  admin.is_active ? "bg-blue-900 bg-opacity-30" : "bg-gray-900"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-blue-700 flex items-center justify-center text-xl mr-3">
                      {admin.avatar_url ? (
                        <img
                          src={admin.avatar_url}
                          alt={admin.full_name}
                          className="w-12 h-12 rounded-full"
                        />
                      ) : (
                        <span>👤</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold">{admin.full_name}</h3>
                      <div className="flex items-center text-sm">
                        <span className="mr-2">#</span>
                        <span className="bg-blue-900 px-2 py-1 rounded">
                          STT {admin.order_number}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    {admin.is_active ? (
                      <span className="bg-green-900 text-green-300 px-2 py-1 rounded text-xs">
                        ACTIVE
                      </span>
                    ) : (
                      <span className="bg-gray-700 text-gray-400 px-2 py-1 rounded text-xs">
                        INACTIVE
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Admin Details */}
              <div className="p-4">
                <div className="mb-4">
                  <div className="text-sm text-blue-300 mb-1">
                    QUỸ BẢO HIỂM:
                  </div>
                  <div className="text-xl font-bold text-green-400">
                    {formatCurrency(admin.insurance_amount)}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-sm text-blue-300 mb-1">DỊCH VỤ:</div>
                  <div className="flex flex-wrap">
                    {getServicesBadges(admin.services.slice(0, 3))}
                    {admin.services.length > 3 && (
                      <span className="text-xs text-gray-400">
                        +{admin.services.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Bank Accounts */}
                {admin.bank_accounts && admin.bank_accounts.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm text-blue-300 mb-1">
                      TÀI KHOẢN NGÂN HÀNG:
                    </div>
                    <div className="space-y-1">
                      {admin.bank_accounts.slice(0, 2).map((acc, index) => (
                        <div
                          key={index}
                          className="text-xs bg-gray-900 p-2 rounded"
                        >
                          <div className="font-bold">{acc.bank}</div>
                          <div className="font-mono">{acc.account_number}</div>
                          <div>{acc.account_name}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact Info */}
                <div className="flex space-x-2">
                  {admin.fb_main && (
                    <a
                      href={admin.fb_main}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center bg-blue-800 hover:bg-blue-700 px-2 py-1 rounded text-sm"
                    >
                      FB
                    </a>
                  )}
                  {admin.zalo && (
                    <a
                      href={`https://zalo.me/${admin.zalo}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center bg-green-800 hover:bg-green-700 px-2 py-1 rounded text-sm"
                    >
                      ZALO
                    </a>
                  )}
                  {admin.website && (
                    <a
                      href={admin.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center bg-purple-800 hover:bg-purple-700 px-2 py-1 rounded text-sm"
                    >
                      WEB
                    </a>
                  )}
                </div>
              </div>

              {/* View Details Button */}
              <div className="p-3 border-t border-blue-800">
                <button
                  onClick={() => setSelectedAdmin(admin)}
                  className="w-full py-2 bg-blue-900 hover:bg-blue-800 rounded text-sm"
                >
                  XEM CHI TIẾT
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="border border-blue-700 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-blue-900 bg-opacity-30">
                  <th className="p-3 text-left">STT</th>
                  <th className="p-3 text-left">ADMIN</th>
                  <th className="p-3 text-left">QUỸ BẢO HIỂM</th>
                  <th className="p-3 text-left">DỊCH VỤ</th>
                  <th className="p-3 text-left">LIÊN HỆ</th>
                  <th className="p-3 text-left">TRẠNG THÁI</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr
                    key={admin.id}
                    className="hover:bg-blue-900 hover:bg-opacity-10"
                  >
                    <td className="p-3">
                      <span className="bg-blue-900 px-3 py-1 rounded font-bold">
                        {admin.order_number}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center">
                        {admin.avatar_url ? (
                          <img
                            src={admin.avatar_url}
                            alt={admin.full_name}
                            className="w-8 h-8 rounded-full mr-3"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center mr-3">
                            👤
                          </div>
                        )}
                        <div>
                          <div className="font-bold">{admin.full_name}</div>
                          <div className="text-xs text-blue-300">
                            ID: {admin.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-bold text-green-400">
                      {formatCurrency(admin.insurance_amount)}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {admin.services.slice(0, 2).map((service, index) => (
                          <span
                            key={index}
                            className="text-xs bg-blue-900 px-2 py-1 rounded"
                          >
                            {service}
                          </span>
                        ))}
                        {admin.services.length > 2 && (
                          <span className="text-xs text-gray-400">
                            +{admin.services.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex space-x-1">
                        {admin.fb_main && (
                          <span className="text-blue-400">FB</span>
                        )}
                        {admin.zalo && (
                          <span className="text-green-400">Z</span>
                        )}
                        {admin.website && (
                          <span className="text-purple-400">W</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      {admin.is_active ? (
                        <span className="bg-green-900 text-green-300 px-2 py-1 rounded text-xs">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="bg-gray-700 text-gray-400 px-2 py-1 rounded text-xs">
                          INACTIVE
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Admin Detail Modal */}
      {selectedAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black bg-opacity-75"
            onClick={() => setSelectedAdmin(null)}
          ></div>
          <div className="relative w-full max-w-2xl bg-black border-2 border-blue-500 rounded-lg overflow-hidden">
            <div className="bg-blue-900 px-6 py-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">
                  CHI TIẾT ADMIN #{selectedAdmin.order_number}
                </h2>
                <button
                  onClick={() => setSelectedAdmin(null)}
                  className="text-xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="md:col-span-1">
                  <div className="text-center">
                    {selectedAdmin.avatar_url ? (
                      <img
                        src={selectedAdmin.avatar_url}
                        alt={selectedAdmin.full_name}
                        className="w-32 h-32 rounded-full mx-auto mb-4"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-blue-700 flex items-center justify-center text-4xl mx-auto mb-4">
                        👤
                      </div>
                    )}
                    <h3 className="text-xl font-bold mb-2">
                      {selectedAdmin.full_name}
                    </h3>
                    <div className="space-y-2">
                      {selectedAdmin.fb_main && (
                        <a
                          href={selectedAdmin.fb_main}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block bg-blue-800 hover:bg-blue-700 px-3 py-2 rounded"
                        >
                          Facebook
                        </a>
                      )}
                      {selectedAdmin.zalo && (
                        <a
                          href={`https://zalo.me/${selectedAdmin.zalo}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block bg-green-800 hover:bg-green-700 px-3 py-2 rounded"
                        >
                          Zalo: {selectedAdmin.zalo}
                        </a>
                      )}
                      {selectedAdmin.website && (
                        <a
                          href={selectedAdmin.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block bg-purple-800 hover:bg-purple-700 px-3 py-2 rounded"
                        >
                          Website
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <h4 className="font-bold mb-2">THÔNG TIN QUỸ</h4>
                    <div className="bg-blue-900 bg-opacity-30 p-3 rounded">
                      <div className="text-2xl font-bold text-green-400 mb-1">
                        {formatCurrency(selectedAdmin.insurance_amount)}
                      </div>
                      <div className="text-sm text-blue-300">Quỹ bảo hiểm</div>
                      {selectedAdmin.insurance_start_date && (
                        <div className="text-xs text-gray-400 mt-2">
                          Bắt đầu:{" "}
                          {new Date(
                            selectedAdmin.insurance_start_date
                          ).toLocaleDateString("vi-VN")}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold mb-2">DỊCH VỤ CUNG CẤP</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedAdmin.services.map((service, index) => (
                        <span
                          key={index}
                          className="bg-blue-900 text-blue-300 px-3 py-1 rounded"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold mb-2">TÀI KHOẢN NGÂN HÀNG</h4>
                    <div className="space-y-2">
                      {selectedAdmin.bank_accounts.map((account, index) => (
                        <div key={index} className="bg-gray-900 p-3 rounded">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-bold">{account.bank}</span>
                            <span className="text-green-400 font-mono">
                              {account.account_number}
                            </span>
                          </div>
                          <div className="text-sm">
                            Chủ TK: {account.account_name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold mb-2">THÔNG TIN BỔ SUNG</h4>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>ID:</span>
                        <span>{selectedAdmin.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Trạng thái:</span>
                        <span
                          className={
                            selectedAdmin.is_active
                              ? "text-green-400"
                              : "text-gray-400"
                          }
                        >
                          {selectedAdmin.is_active
                            ? "Đang hoạt động"
                            : "Ngừng hoạt động"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ngày tạo:</span>
                        <span>
                          {new Date(
                            selectedAdmin.created_at
                          ).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cập nhật:</span>
                        <span>
                          {new Date(
                            selectedAdmin.updated_at
                          ).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setSelectedAdmin(null)}
                  className="px-6 py-2 bg-blue-700 border border-blue-500 rounded hover:bg-blue-600"
                >
                  ĐÓNG
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Information */}
      <div className="bg-black bg-opacity-50 border border-blue-700 rounded-lg p-6">
        <h3 className="font-bold mb-3 flex items-center">
          <span className="mr-2">ℹ️</span>
          VỀ QUỸ BẢO HIỂM CS
        </h3>
        <div className="space-y-3 text-sm text-blue-300">
          <p>Quỹ bảo hiểm CS là hệ thống admin trung gian đáng tin cậy:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Cam kết bảo vệ giao dịch an toàn</li>
            <li>Quỹ bảo hiểm đảm bảo từ 50 - 500 triệu VNĐ</li>
            <li>Hỗ trợ đa dạng dịch vụ: giao dịch, trung gian, bảo hiểm</li>
            <li>Thông tin minh bạch, xác minh rõ ràng</li>
            <li>Liên hệ trực tiếp qua Facebook, Zalo, Website</li>
          </ul>
          <p className="mt-3 text-yellow-400">
            ⚠️ LƯU Ý: Luôn xác minh admin trước khi giao dịch. Không chuyển tiền
            trước khi xác nhận.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InsuranceFund;
