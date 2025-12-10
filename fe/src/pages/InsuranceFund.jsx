import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Loading from "../components/Loading";

const InsuranceFund = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const navigate = useNavigate();
  const { adminId } = useParams();

  useEffect(() => {
    fetchAdmins();
  }, []);

  useEffect(() => {
    if (adminId && admins.length > 0) {
      // Tìm admin theo tên nguyên bản từ URL
      const decodedAdminId = decodeURIComponent(adminId);
      const foundAdmin = admins.find(
        (admin) =>
          admin.full_name.toLowerCase() === decodedAdminId.toLowerCase()
      );
      if (foundAdmin) {
        setSelectedAdmin(foundAdmin);
      }
    }
  }, [adminId, admins]);

  const fetchAdmins = async () => {
    try {
      const response = await fetch(
        "https://api.checkgdtg.vn/api/insurance-admins/"
      );
      const data = await response.json();
      setAdmins(data);
      setSearchResults(data);
    } catch (error) {
      console.error("Error fetching admins:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults(admins);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setLoading(true);

    try {
      const response = await fetch(
        `https://api.checkgdtg.vn/api/search/admin/find?q=${encodeURIComponent(
          searchQuery.trim()
        )}`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Error searching admins:", error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults(admins);
    setIsSearching(false);
  };

  // Tạo slug từ tên admin - GIỮ NGUYÊN TÊN
  const createAdminSlug = (admin) => {
    // GIỮ NGUYÊN TÊN NGUYÊN BẢN
    return admin.full_name.replace(/\s+/g, "-"); // Thay mọi khoảng trắng bằng -
    // .replace(/[\/\\?%*:|"<>]/g, "-"); // Thay ký tự đặc biệt khác bằng -
  };

  const handleAdminClick = (admin) => {
    const slug = createAdminSlug(admin);
    navigate(`/admin/${slug}`);
    setSelectedAdmin(admin);
  };

  const handleCloseDetail = () => {
    setSelectedAdmin(null);
    navigate("/admin");
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (loading && !isSearching)
    return <Loading message="ĐANG TẢI DANH SÁCH ADMIN..." />;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 glow-green">
          QUỸ BẢO HIỂM CHECKGDTG
        </h1>
        <p className="text-green-300">
          Danh sách Admin trung gian uy tín - Bảo vệ giao dịch an toàn
        </p>
      </div>

      <div className="bg-black bg-opacity-50 border border-blue-700 rounded-lg p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm admin theo STK/SĐT/Facebook/Zalo..."
              className="w-full bg-black border border-blue-600 text-green-400 px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
            />
            <div className="absolute right-3 top-3 text-green-500">
              <span className="blink">_</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-700 border border-blue-500 rounded-lg hover:bg-blue-600 transition-all font-bold flex items-center flex-1 justify-center"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  ĐANG TÌM KIẾM...
                </>
              ) : (
                "TÌM KIẾM ADMIN"
              )}
            </button>
            {isSearching && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="px-6 py-3 bg-gray-700 border border-gray-500 rounded-lg hover:bg-gray-600 transition-all font-bold"
              >
                XÓA TÌM KIẾM
              </button>
            )}
          </div>
        </form>
      </div>

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

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {searchResults.map((admin) => (
          <div
            key={admin.id}
            className="cursor-pointer group"
            onClick={() => handleAdminClick(admin)}
          >
            <div className="flex flex-col items-center">
              <div className="relative">
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center text-xl mb-3 overflow-hidden
                  ${
                    admin.is_active
                      ? "border-2 border-blue-500"
                      : "border-2 border-gray-700 opacity-70"
                  }
                  group-hover:border-green-500 transition-all`}
                >
                  {admin.avatar_url ? (
                    <img
                      src={admin.avatar_url}
                      alt={admin.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-blue-700 flex items-center justify-center">
                      <span className="text-3xl">👤</span>
                    </div>
                  )}
                </div>
                <div
                  className={`absolute bottom-3 right-0 w-4 h-4 rounded-full border-2 border-black
                  ${admin.is_active ? "bg-green-500" : "bg-gray-500"}`}
                ></div>
              </div>

              <div className="text-center">
                <div className="font-bold text-sm truncate max-w-[120px]">
                  {admin.full_name}
                </div>
                <div className="text-xs text-gray-400">
                  #{admin.order_number}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {searchResults.length === 0 && (
        <div className="text-center py-12 border border-blue-700 rounded-lg">
          <h3 className="text-xl font-bold mb-2">KHÔNG TÌM THẤY ADMIN</h3>
          <p className="text-blue-300">
            {isSearching
              ? `Không tìm thấy admin nào phù hợp với "${searchQuery}"`
              : "Chưa có admin nào trong hệ thống"}
          </p>
        </div>
      )}

      {selectedAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4">
          <div
            className="absolute inset-0 bg-black bg-opacity-75"
            onClick={handleCloseDetail}
          ></div>
          <div className="relative w-full max-w-md md:max-w-2xl max-h-[90vh] overflow-y-auto bg-black border-2 border-blue-500 rounded-lg">
            <div className="sticky top-0 bg-blue-900 px-4 py-3 z-10">
              <div className="flex justify-between items-center">
                <h2 className="text-lg md:text-xl font-bold truncate">
                  {selectedAdmin.full_name} - #{selectedAdmin.order_number}
                </h2>
                <button
                  onClick={handleCloseDetail}
                  className="text-2xl hover:text-green-300 w-8 h-8 flex items-center justify-center"
                  aria-label="Đóng"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-3 md:p-6">
              <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                <div className="md:w-1/3">
                  <div className="text-center">
                    {selectedAdmin.avatar_url ? (
                      <img
                        src={selectedAdmin.avatar_url}
                        alt={selectedAdmin.full_name}
                        className="w-24 h-24 md:w-32 md:h-32 rounded-full mx-auto mb-3 md:mb-4 border-2 border-blue-600"
                      />
                    ) : (
                      <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-blue-700 flex items-center justify-center text-3xl md:text-4xl mx-auto mb-3 md:mb-4 border-2 border-blue-600">
                        👤
                      </div>
                    )}
                    <h3 className="text-lg md:text-xl font-bold mb-1 md:mb-2 truncate px-2">
                      {selectedAdmin.full_name}
                    </h3>
                    <div
                      className={`px-2 py-1 rounded-full text-xs md:text-sm inline-block mb-3 md:mb-4 ${
                        selectedAdmin.is_active
                          ? "bg-green-900 text-green-300"
                          : "bg-gray-700 text-gray-400"
                      }`}
                    >
                      {selectedAdmin.is_active
                        ? "✅ ĐANG HOẠT ĐỘNG"
                        : "⛔ NGỪNG HOẠT ĐỘNG"}
                    </div>
                  </div>
                </div>

                <div className="md:w-2/3 space-y-3 md:space-y-4">
                  <div>
                    <h4 className="font-bold mb-1 md:mb-2 text-green-400 text-sm md:text-base">
                      QUỸ BẢO HIỂM
                    </h4>
                    <div className="bg-blue-900 bg-opacity-30 p-2 md:p-3 rounded">
                      <div className="text-lg md:text-2xl font-bold text-green-400 mb-1">
                        {formatCurrency(selectedAdmin.insurance_amount)}
                      </div>
                      {selectedAdmin.insurance_start_date && (
                        <div className="text-xs text-gray-400">
                          Bắt đầu:{" "}
                          {new Date(
                            selectedAdmin.insurance_start_date
                          ).toLocaleDateString("vi-VN")}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold mb-1 md:mb-2 text-green-400 text-sm md:text-base">
                      THÔNG TIN LIÊN HỆ
                    </h4>
                    <div className="space-y-2">
                      {selectedAdmin.zalo && (
                        <div className="flex flex-col md:flex-row md:items-center">
                          <span className="text-xs md:text-sm text-gray-400 mb-1 md:mb-0 md:w-20">
                            Zalo:
                          </span>
                          <span className="font-mono text-sm md:text-base break-all">
                            {selectedAdmin.zalo}
                          </span>
                        </div>
                      )}
                      {selectedAdmin.phone && (
                        <div className="flex flex-col md:flex-row md:items-center">
                          <span className="text-xs md:text-sm text-gray-400 mb-1 md:mb-0 md:w-20">
                            SĐT:
                          </span>
                          <span className="font-mono text-sm md:text-base">
                            {selectedAdmin.phone}
                          </span>
                        </div>
                      )}
                      <div className="flex flex-col md:flex-row gap-2 mt-2">
                        {selectedAdmin.fb_main && (
                          <a
                            href={selectedAdmin.fb_main}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-blue-800 hover:bg-blue-700 px-3 py-2 rounded text-center text-sm md:text-base"
                          >
                            Facebook
                          </a>
                        )}
                        {selectedAdmin.website && (
                          <a
                            href={selectedAdmin.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-purple-800 hover:bg-purple-700 px-3 py-2 rounded text-center text-sm md:text-base"
                          >
                            Website
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {selectedAdmin.services &&
                    selectedAdmin.services.length > 0 && (
                      <div>
                        <h4 className="font-bold mb-1 md:mb-2 text-green-400 text-sm md:text-base">
                          DỊCH VỤ CUNG CẤP
                        </h4>
                        <div className="flex flex-wrap gap-1 md:gap-2">
                          {selectedAdmin.services.map((service, index) => (
                            <span
                              key={index}
                              className="bg-blue-900 text-blue-300 px-2 py-1 rounded text-xs md:text-sm"
                            >
                              {service}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  {selectedAdmin.bank_accounts &&
                    selectedAdmin.bank_accounts.length > 0 && (
                      <div>
                        <h4 className="font-bold mb-1 md:mb-2 text-green-400 text-sm md:text-base">
                          TÀI KHOẢN NGÂN HÀNG
                        </h4>
                        <div className="space-y-2">
                          {selectedAdmin.bank_accounts.map((account, index) => (
                            <div
                              key={index}
                              className="bg-gray-900 p-2 md:p-3 rounded"
                            >
                              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-1">
                                <span className="font-bold text-sm md:text-base truncate">
                                  {account.bank}
                                </span>
                                <span className="text-green-400 font-mono text-sm md:text-base break-all">
                                  {account.account_number}
                                </span>
                              </div>
                              <div className="text-xs md:text-sm text-gray-300 truncate">
                                Chủ TK: {account.account_name}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>

              <div className="mt-4 md:mt-6 text-center">
                <button
                  onClick={handleCloseDetail}
                  className="w-full md:w-auto px-6 py-2 bg-blue-700 border border-blue-500 rounded hover:bg-blue-600 text-sm md:text-base"
                >
                  ĐÓNG
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-black bg-opacity-50 border border-blue-700 rounded-lg p-6">
        <h3 className="font-bold mb-3">Quỹ bảo hiểm checkgdtg.vn </h3>
        <div className="space-y-3 text-sm text-blue-300">
          <p>
            bảo đảm an toàn với người này trong giới hạn số tiền cọc khi nhập nó
            sẽ tự hiện thị VND của TÊN GDV để được an toàn cao nhất
          </p>

          <p className="mt-3 text-yellow-400">
            LƯU Ý: Luôn xác minh admin trước khi giao dịch. Không chuyển tiền
            trước khi xác nhận.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InsuranceFund;
