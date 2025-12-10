import React, { useState, useEffect } from "react";
import Loading from "../components/Loading";

const AdminPanel = () => {
  // === AUTHENTICATION ===
  const ADMIN_CREDENTIALS = {
    username: "adminducdanh",
    password: "ducdanh999aA@",
  };

  const ADMIN_TOKEN_KEY = "checkgdtg_admin_token";

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
  });
  const [loginError, setLoginError] = useState("");

  // === ADMIN DATA STATES ===
  const [activeTab, setActiveTab] = useState("pending");
  const [pendingAccounts, setPendingAccounts] = useState([]);
  const [pendingWebsites, setPendingWebsites] = useState([]);
  const [allAccounts, setAllAccounts] = useState([]);
  const [allWebsites, setAllWebsites] = useState([]);
  const [insuranceAdmins, setInsuranceAdmins] = useState([]);
  const [systemSettings, setSystemSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [editSettings, setEditSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [showEditAdmin, setShowEditAdmin] = useState(false);
  const [bankList] = useState([
    "VCB",
    "MB",
    "BIDV",
    "Techcombank",
    "VietinBank",
    "Agribank",
    "ACB",
    "VPBank",
    "TPBank",
    "HDBank",
    "Sacombank",
    "Eximbank",
    "MSB",
    "VIB",
    "SHB",
    "OCB",
    "PVcomBank",
    "BaoVietBank",
    "ABBank",
    "NCB",
    "OceanBank",
    "GPBank",
    "BacABank",
    "NamABank",
    "VietBank",
    "KienLongBank",
    "PG Bank",
    "DongABank",
    "VietCapitalBank",
  ]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form for new admin
  const [newAdmin, setNewAdmin] = useState({
    order_number: "",
    full_name: "",
    avatar_url: "",
    fb_main: "",
    fb_backup: "",
    zalo: "",
    phone: "",
    website: "",
    insurance_amount: 0,
    insurance_start_date: "",
    services: [],
    bank_accounts: [{ bank: "", account_number: "", account_name: "" }],
    is_active: true,
  });

  // === AUTHENTICATION EFFECTS ===
  useEffect(() => {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (token === "authenticated") {
      setIsAuthenticated(true);
      fetchAdminData();
    } else {
      setShowLogin(true);
    }
  }, []);

  // === AUTH FUNCTIONS ===
  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError("");

    if (
      loginForm.username === ADMIN_CREDENTIALS.username &&
      loginForm.password === ADMIN_CREDENTIALS.password
    ) {
      localStorage.setItem(ADMIN_TOKEN_KEY, "authenticated");
      setIsAuthenticated(true);
      setShowLogin(false);
      fetchAdminData();
    } else {
      setLoginError("Sai tài khoản hoặc mật khẩu!");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    setIsAuthenticated(false);
    setShowLogin(true);
    setLoginForm({ username: "", password: "" });
  };

  // === ADMIN DATA FUNCTIONS ===
  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [accounts, websites, adminsResponse, settingsResponse] =
        await Promise.all([
          fetch(
            "https://api.checkgdtg.vn/api/account-reports?status=pending"
          ).then((res) => res.json()),
          fetch(
            "https://api.checkgdtg.vn/api/website-reports?status=pending"
          ).then((res) => res.json()),
          fetch("https://api.checkgdtg.vn/api/insurance-admins/").then((res) =>
            res.json()
          ),
          fetch("https://api.checkgdtg.vn/api/dashboard/settings").then((res) =>
            res.json()
          ),
        ]);

      setPendingAccounts(accounts);
      setPendingWebsites(websites);
      setInsuranceAdmins(adminsResponse);
      setSystemSettings(settingsResponse);

      if (activeTab === "manage") {
        const [allAcc, allWeb] = await Promise.all([
          fetch("https://api.checkgdtg.vn/api/account-reports?limit=100").then(
            (res) => res.json()
          ),
          fetch("https://api.checkgdtg.vn/api/website-reports?limit=100").then(
            (res) => res.json()
          ),
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

  // =============== UPLOAD ẢNH ===============
  const handleUploadImage = async (file) => {
    if (!file) return null;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        "https://api.checkgdtg.vn/api/upload/single",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();
      return result.success ? result.url : null;
    } catch (error) {
      console.error("Upload error:", error);
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  // =============== TÌM KIẾM ADMIN ===============
  const handleSearchAdmins = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://api.checkgdtg.vn/api/search/admin/find?q=${encodeURIComponent(
          searchQuery.trim()
        )}`
      );
      const results = await response.json();
      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults(null);
  };

  // =============== QUẢN LÝ BÁO CÁO ===============
  const handleApprove = async (type, id) => {
    try {
      const endpoint =
        type === "account"
          ? `/api/account-reports/${id}`
          : `/api/website-reports/${id}`;

      await fetch(`https://api.checkgdtg.vn${endpoint}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      });

      alert("✅ Đã duyệt báo cáo!");
      fetchAdminData();
    } catch (error) {
      alert("❌ Lỗi khi duyệt báo cáo");
    }
  };

  const handleReject = async (type, id) => {
    if (!window.confirm("Bạn có chắc chắn muốn từ chối báo cáo này?")) return;

    try {
      const endpoint =
        type === "account"
          ? `/api/account-reports/${id}`
          : `/api/website-reports/${id}`;

      await fetch(`https://api.checkgdtg.vn${endpoint}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected" }),
      });

      alert("✅ Đã từ chối báo cáo!");
      fetchAdminData();
    } catch (error) {
      alert("❌ Lỗi khi từ chối báo cáo");
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn?")) return;

    try {
      const endpoint =
        type === "account"
          ? `/api/account-reports/${id}`
          : `/api/website-reports/${id}`;

      await fetch(`https://api.checkgdtg.vn${endpoint}`, {
        method: "DELETE",
      });

      alert("✅ Đã xóa thành công!");
      fetchAdminData();
    } catch (error) {
      alert("❌ Lỗi khi xóa");
    }
  };

  // =============== TẠO ADMIN MỚI ===============
  const handleCreateAdmin = async (e) => {
    e.preventDefault();

    try {
      if (!newAdmin.order_number || !newAdmin.full_name) {
        alert("Vui lòng nhập số thứ tự và họ tên!");
        return;
      }

      const exists = insuranceAdmins.find(
        (a) => a.order_number.toString() === newAdmin.order_number.toString()
      );
      if (exists) {
        alert(`Số thứ tự ${newAdmin.order_number} đã tồn tại!`);
        return;
      }

      const adminData = {
        order_number: parseInt(newAdmin.order_number),
        full_name: newAdmin.full_name,
        avatar_url: newAdmin.avatar_url || null,
        fb_main: newAdmin.fb_main || null,
        fb_backup: newAdmin.fb_backup || null,
        zalo: newAdmin.zalo || null,
        phone: newAdmin.phone || null,
        website: newAdmin.website || null,
        insurance_amount: parseFloat(newAdmin.insurance_amount) || 0,
        insurance_start_date: newAdmin.insurance_start_date || null,
        services: newAdmin.services.filter((s) => s.trim() !== ""),
        bank_accounts: newAdmin.bank_accounts.filter(
          (acc) =>
            acc.bank.trim() !== "" &&
            acc.account_number.trim() !== "" &&
            acc.account_name.trim() !== ""
        ),
        is_active: newAdmin.is_active,
      };

      const response = await fetch(
        "https://api.checkgdtg.vn/api/insurance-admins/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(adminData),
        }
      );

      if (response.ok) {
        alert("✅ Đã thêm admin thành công!");
        setShowCreateAdmin(false);
        resetNewAdminForm();
        fetchAdminData();
      } else {
        const error = await response.json();
        alert(`❌ Lỗi: ${error.detail || "Không thể thêm admin"}`);
      }
    } catch (error) {
      alert("❌ Lỗi kết nối server!");
      console.error(error);
    }
  };

  // =============== SỬA ADMIN (FULL FORM) ===============
  const handleEditAdmin = (admin) => {
    setShowEditAdmin(true);
    // Clone admin data với định dạng đúng cho form
    setNewAdmin({
      order_number: admin.order_number.toString(),
      full_name: admin.full_name,
      avatar_url: admin.avatar_url || "",
      fb_main: admin.fb_main || "",
      fb_backup: admin.fb_backup || "",
      zalo: admin.zalo || "",
      phone: admin.phone || "",
      website: admin.website || "",
      insurance_amount: admin.insurance_amount || 0,
      insurance_start_date: admin.insurance_start_date
        ? admin.insurance_start_date.split("T")[0]
        : "",
      services: admin.services || [],
      bank_accounts:
        admin.bank_accounts && admin.bank_accounts.length > 0
          ? admin.bank_accounts
          : [{ bank: "", account_number: "", account_name: "" }],
      is_active: admin.is_active !== undefined ? admin.is_active : true,
    });
  };

  const handleUpdateAdmin = async (e) => {
    e.preventDefault();

    try {
      const updateData = {
        full_name: newAdmin.full_name,
        avatar_url: newAdmin.avatar_url || null,
        fb_main: newAdmin.fb_main || null,
        fb_backup: newAdmin.fb_backup || null,
        zalo: newAdmin.zalo || null,
        phone: newAdmin.phone || null,
        website: newAdmin.website || null,
        insurance_amount: parseFloat(newAdmin.insurance_amount) || 0,
        insurance_start_date: newAdmin.insurance_start_date || null,
        services: newAdmin.services.filter((s) => s.trim() !== ""),
        bank_accounts: newAdmin.bank_accounts.filter(
          (acc) =>
            acc.bank.trim() !== "" &&
            acc.account_number.trim() !== "" &&
            acc.account_name.trim() !== ""
        ),
        is_active: newAdmin.is_active,
      };

      const response = await fetch(
        `https://api.checkgdtg.vn/api/insurance-admins/${selectedAdmin.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        }
      );

      if (response.ok) {
        alert("✅ Đã cập nhật admin thành công!");
        setShowEditAdmin(false);
        setSelectedAdmin(null);
        resetNewAdminForm();
        fetchAdminData();
      } else {
        const error = await response.json();
        alert(`❌ Lỗi: ${error.detail || "Không thể cập nhật admin"}`);
      }
    } catch (error) {
      alert("❌ Lỗi kết nối server!");
      console.error(error);
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa admin này?")) return;

    try {
      const response = await fetch(
        `https://api.checkgdtg.vn/api/insurance-admins/${adminId}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        alert("✅ Đã xóa admin thành công!");
        fetchAdminData();
        if (selectedAdmin && selectedAdmin.id === adminId) {
          setSelectedAdmin(null);
        }
      } else {
        alert("❌ Lỗi khi xóa admin!");
      }
    } catch (error) {
      alert("❌ Lỗi kết nối server!");
    }
  };

  // =============== FORM HELPERS ===============
  const handleAddBankAccount = () => {
    setNewAdmin((prev) => ({
      ...prev,
      bank_accounts: [
        ...prev.bank_accounts,
        { bank: "", account_number: "", account_name: "" },
      ],
    }));
  };

  const handleRemoveBankAccount = (index) => {
    if (newAdmin.bank_accounts.length <= 1) return;
    const newBankAccounts = [...newAdmin.bank_accounts];
    newBankAccounts.splice(index, 1);
    setNewAdmin({ ...newAdmin, bank_accounts: newBankAccounts });
  };

  const handleBankAccountChange = (index, field, value) => {
    const newBankAccounts = [...newAdmin.bank_accounts];
    newBankAccounts[index][field] = value;
    setNewAdmin({ ...newAdmin, bank_accounts: newBankAccounts });
  };

  const handleAddService = () => {
    const service = prompt("Nhập tên dịch vụ:");
    if (service && service.trim()) {
      setNewAdmin((prev) => ({
        ...prev,
        services: [...prev.services, service.trim()],
      }));
    }
  };

  const handleRemoveService = (index) => {
    const newServices = [...newAdmin.services];
    newServices.splice(index, 1);
    setNewAdmin({ ...newAdmin, services: newServices });
  };

  const resetNewAdminForm = () => {
    setNewAdmin({
      order_number: "",
      full_name: "",
      avatar_url: "",
      fb_main: "",
      fb_backup: "",
      zalo: "",
      phone: "",
      website: "",
      insurance_amount: 0,
      insurance_start_date: "",
      services: [],
      bank_accounts: [{ bank: "", account_number: "", account_name: "" }],
      is_active: true,
    });
  };

  // =============== SYSTEM SETTINGS ===============
  const handleSaveSettings = async () => {
    try {
      await fetch("https://api.checkgdtg.vn/api/dashboard/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(systemSettings),
      });
      setEditSettings(false);
      alert("✅ Đã lưu cài đặt!");
    } catch (error) {
      alert("❌ Lỗi khi lưu cài đặt");
    }
  };

  const handleRefreshStats = async () => {
    try {
      await fetch("https://api.checkgdtg.vn/api/dashboard/refresh-stats", {
        method: "POST",
      });
      alert("✅ Đã làm mới thống kê!");
      fetchAdminData();
    } catch (error) {
      alert("❌ Lỗi khi làm mới thống kê");
    }
  };

  // =============== UTILITIES ===============
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  // =============== RENDER LOGIN FORM ===============
  if (showLogin && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-black border-2 border-red-500 rounded-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-red-400 mb-2">
              ⚙️ ADMIN LOGIN
            </h1>
            <p className="text-red-300">CHECKGDTG ADMIN CONTROL PANEL</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm mb-2 text-red-300">
                USERNAME
              </label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, username: e.target.value })
                }
                className="w-full bg-black border border-red-600 text-white px-4 py-3 rounded focus:outline-none focus:border-red-500"
                placeholder="admin"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-2 text-red-300">
                PASSWORD
              </label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, password: e.target.value })
                }
                className="w-full bg-black border border-red-600 text-white px-4 py-3 rounded focus:outline-none focus:border-red-500"
                placeholder="********"
                required
              />
            </div>

            {loginError && (
              <div className="p-3 bg-red-900 border border-red-700 rounded">
                <p className="text-red-300 text-center">{loginError}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-red-700 border border-red-500 rounded hover:bg-red-600 transition-all font-bold text-lg"
            >
              LOGIN
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => (window.location.href = "/")}
                className="text-sm text-gray-400 hover:text-gray-300"
              >
                ← Quay lại trang chủ
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (loading) return <Loading message="ĐANG TẢI ADMIN PANEL..." />;

  // =============== RENDER ADMIN PANEL ===============
  return (
    <div className="space-y-6">
      {/* Admin Header với Logout */}
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
                onClick={handleLogout}
                className="px-4 py-2 bg-red-700 border border-red-500 rounded hover:bg-red-600"
              >
                LOGOUT
              </button>
            </div>
            <div className="text-xs text-red-400 mt-2 text-center md:text-right">
              Đăng nhập: adminducdanh
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
            label: "📋 QUẢN LÝ BÁO CÁO",
            count: allAccounts.length + allWebsites.length,
          },
          {
            id: "admins",
            label: "🛡️ QUỸ BẢO HIỂM",
            count: insuranceAdmins.length,
          },
          { id: "settings", label: "⚙️ CÀI ĐẶT", count: 0 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              if (tab.id === "manage") fetchAdminData();
            }}
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

      {/* PENDING REPORTS TAB */}
      {activeTab === "pending" && (
        <div className="space-y-6">
          {/* Pending Account Reports */}
          <div className="border border-red-700 rounded-lg overflow-hidden">
            <div className="bg-red-900 bg-opacity-30 p-4">
              <h3 className="font-bold text-lg">
                TÀI KHOẢN SCAM CHỜ DUYỆT ({pendingAccounts.length})
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
                              className="w-20 h-20 object-cover rounded border border-red-600 cursor-pointer hover:opacity-80"
                              onClick={() => window.open(img, "_blank")}
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
                    Không có báo cáo tài khoản nào chờ duyệt
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
                        <div>
                          <div className="font-mono font-bold text-lg text-purple-400">
                            {report.url}
                          </div>
                          <div className="text-sm">
                            Thể loại: {report.category}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            Email: {report.reporter_email}
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
                      <div className="text-sm line-clamp-2">
                        {report.description}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">✅</div>
                  <p className="text-purple-400">
                    Không có website nào chờ duyệt
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MANAGE REPORTS TAB */}
      {activeTab === "manage" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Account Reports Management */}
            <div className="border border-green-700 rounded-lg overflow-hidden">
              <div className="bg-green-900 bg-opacity-30 p-4">
                <h3 className="font-bold">
                  TÀI KHOẢN SCAM ({allAccounts.length})
                </h3>
              </div>
              <div className="p-4 max-h-96 overflow-y-auto">
                {allAccounts.length > 0 ? (
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
                          <td className="p-2 font-mono truncate max-w-xs">
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
                                className="px-2 py-1 bg-blue-700 rounded text-xs hover:bg-blue-600"
                              >
                                XEM
                              </button>
                              <button
                                onClick={() =>
                                  handleDelete("account", report.id)
                                }
                                className="px-2 py-1 bg-red-700 rounded text-xs hover:bg-red-600"
                              >
                                XÓA
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3">✅</div>
                    <p className="text-green-400">Không có báo cáo tài khoản</p>
                  </div>
                )}
              </div>
            </div>

            {/* Website Reports Management */}
            <div className="border border-purple-700 rounded-lg overflow-hidden">
              <div className="bg-purple-900 bg-opacity-30 p-4">
                <h3 className="font-bold">
                  🌐 WEBSITE SCAM ({allWebsites.length})
                </h3>
              </div>
              <div className="p-4 max-h-96 overflow-y-auto">
                {allWebsites.length > 0 ? (
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
                          <td className="p-2 truncate max-w-xs">
                            {report.url}
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
                                    type: "website",
                                    data: report,
                                  })
                                }
                                className="px-2 py-1 bg-blue-700 rounded text-xs hover:bg-blue-600"
                              >
                                XEM
                              </button>
                              <button
                                onClick={() =>
                                  handleDelete("website", report.id)
                                }
                                className="px-2 py-1 bg-red-700 rounded text-xs hover:bg-red-600"
                              >
                                XÓA
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3">✅</div>
                    <p className="text-purple-400">Không có báo cáo website</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INSURANCE ADMINS TAB */}
      {activeTab === "admins" && (
        <div className="space-y-6">
          {/* Search and Actions */}
          <div className="flex gap-3 mb-6">
            <form onSubmit={handleSearchAdmins} className="flex-1 flex gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm admin theo STK/SĐT/Facebook/Zalo..."
                className="flex-1 bg-black border border-blue-600 text-green-400 px-3 py-2 rounded"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-700 border border-blue-500 rounded hover:bg-blue-600"
              >
                🔍 TÌM
              </button>
              {searchResults && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="px-4 py-2 bg-gray-700 border border-gray-500 rounded hover:bg-gray-600"
                >
                  XÓA
                </button>
              )}
            </form>
            <button
              onClick={() => setShowCreateAdmin(true)}
              className="px-4 py-2 bg-green-700 border border-green-500 rounded hover:bg-green-600"
            >
              ➕ THÊM ADMIN
            </button>
          </div>

          {/* Display Search Results or All Admins */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(searchResults || insuranceAdmins).map((admin) => (
              <div
                key={admin.id}
                className="border border-blue-600 rounded-lg overflow-hidden bg-black bg-opacity-50 hover:border-blue-500 transition-all cursor-pointer"
                onClick={() => setSelectedAdmin(admin)}
              >
                <div className="bg-blue-900 bg-opacity-30 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold truncate max-w-[200px]">
                        {admin.full_name}
                      </h3>
                      <div className="text-sm text-blue-300">
                        #{admin.order_number}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        admin.is_active
                          ? "bg-green-900 text-green-300"
                          : "bg-gray-700 text-gray-400"
                      }`}
                    >
                      {admin.is_active ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-center mb-4">
                    {admin.avatar_url ? (
                      <img
                        src={admin.avatar_url}
                        alt={admin.full_name}
                        className="w-16 h-16 rounded-full object-cover mr-4 border border-blue-500"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-blue-700 flex items-center justify-center text-xl mr-4">
                        👤
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-lg text-green-400">
                        {formatCurrency(admin.insurance_amount)}
                      </div>
                      <div className="text-sm text-blue-300">Quỹ bảo hiểm</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm text-blue-300 mb-2">Dịch vụ:</div>
                    <div className="flex flex-wrap gap-1">
                      {admin.services.slice(0, 2).map((service, index) => (
                        <span
                          key={index}
                          className="inline-block bg-blue-900 text-blue-300 px-2 py-1 rounded text-xs"
                        >
                          {service}
                        </span>
                      ))}
                      {admin.services.length > 2 && (
                        <span className="text-xs text-gray-400">
                          +{admin.services.length - 2} dịch vụ khác
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAdmin(admin);
                      }}
                      className="flex-1 py-2 bg-blue-700 border border-blue-500 rounded hover:bg-blue-600 text-sm"
                    >
                      XEM
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAdmin(admin.id);
                      }}
                      className="flex-1 py-2 bg-red-700 border border-red-500 rounded hover:bg-red-600 text-sm"
                    >
                      XÓA
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* No Admins */}
          {(searchResults || insuranceAdmins).length === 0 && (
            <div className="text-center py-8 border border-blue-700 rounded-lg">
              <h3 className="text-xl font-bold mb-2">KHÔNG TÌM THẤY ADMIN</h3>
              <p className="text-blue-300">
                {searchResults
                  ? "Không tìm thấy admin nào phù hợp"
                  : "Chưa có admin nào trong hệ thống"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* SETTINGS TAB */}
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
                  CHỈNH SỬA
                </button>
              )}
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* System Stats */}
                <div>
                  <h4 className="font-bold mb-3 text-green-400">
                    THỐNG KÊ HỆ THỐNG
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-black bg-opacity-30 rounded">
                      <span>Tổng STK scam</span>
                      <span className="font-bold text-green-400">
                        {systemSettings.total_account_scams}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-black bg-opacity-30 rounded">
                      <span>Tổng FB scam</span>
                      <span className="font-bold text-green-400">
                        {systemSettings.total_fb_scams}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-black bg-opacity-30 rounded">
                      <span>Tổng bình luận</span>
                      <span className="font-bold text-green-400">
                        {systemSettings.total_comments}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-black bg-opacity-30 rounded">
                      <span>Báo cáo chờ duyệt</span>
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
            </div>
          </div>
        </div>
      )}

      {/* =============== MODALS =============== */}

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
                className="text-xl hover:text-gray-300"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              {/* Report details... */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-2 bg-gray-700 border border-gray-500 rounded hover:bg-gray-600"
                >
                  ĐÓNG
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Detail Modal */}
      {selectedAdmin && !showEditAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black bg-opacity-75"
            onClick={() => setSelectedAdmin(null)}
          ></div>
          <div className="relative w-full max-w-2xl bg-black border-2 border-blue-500 rounded-lg overflow-hidden">
            <div className="bg-blue-900 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">
                ADMIN #{selectedAdmin.order_number}
              </h2>
              <button
                onClick={() => setSelectedAdmin(null)}
                className="text-xl hover:text-gray-300"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <div className="text-center">
                    {selectedAdmin.avatar_url ? (
                      <img
                        src={selectedAdmin.avatar_url}
                        alt={selectedAdmin.full_name}
                        className="w-32 h-32 rounded-full mx-auto mb-4 border-2 border-blue-600 object-cover"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-blue-700 flex items-center justify-center text-4xl mx-auto mb-4 border-2 border-blue-600">
                        👤
                      </div>
                    )}
                    <h3 className="text-xl font-bold mb-2">
                      {selectedAdmin.full_name}
                    </h3>
                    <div
                      className={`px-3 py-1 rounded-full text-sm inline-block mb-4 ${
                        selectedAdmin.is_active
                          ? "bg-green-900 text-green-300"
                          : "bg-gray-700 text-gray-400"
                      }`}
                    >
                      {selectedAdmin.is_active
                        ? "ĐANG HOẠT ĐỘNG"
                        : "NGỪNG HOẠT ĐỘNG"}
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-4">
                  <div>
                    <h4 className="font-bold mb-2 text-green-400">
                      QUỸ BẢO HIỂM
                    </h4>
                    <div className="bg-blue-900 bg-opacity-30 p-3 rounded">
                      <div className="text-2xl font-bold text-green-400 mb-1">
                        {formatCurrency(selectedAdmin.insurance_amount)}
                      </div>
                      {selectedAdmin.insurance_start_date && (
                        <div className="text-xs text-gray-400">
                          Bắt đầu:{" "}
                          {formatDate(selectedAdmin.insurance_start_date)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold mb-2 text-green-400">
                      THÔNG TIN LIÊN HỆ
                    </h4>
                    <div className="space-y-2">
                      {selectedAdmin.zalo && (
                        <div className="flex items-center">
                          <span className="w-24 text-sm">Zalo:</span>
                          <span className="font-mono">
                            {selectedAdmin.zalo}
                          </span>
                        </div>
                      )}
                      {selectedAdmin.phone && (
                        <div className="flex items-center">
                          <span className="w-24 text-sm">SĐT:</span>
                          <span className="font-mono">
                            {selectedAdmin.phone}
                          </span>
                        </div>
                      )}
                      {selectedAdmin.fb_main && (
                        <a
                          href={selectedAdmin.fb_main}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block bg-blue-800 hover:bg-blue-700 px-3 py-2 rounded text-center"
                        >
                          Facebook Chính
                        </a>
                      )}
                      {selectedAdmin.fb_backup && (
                        <a
                          href={selectedAdmin.fb_backup}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block bg-blue-800 hover:bg-blue-700 px-3 py-2 rounded text-center"
                        >
                          Facebook Dự phòng
                        </a>
                      )}
                      {selectedAdmin.website && (
                        <a
                          href={selectedAdmin.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block bg-purple-800 hover:bg-purple-700 px-3 py-2 rounded text-center"
                        >
                          Website
                        </a>
                      )}
                    </div>
                  </div>

                  {selectedAdmin.services &&
                    selectedAdmin.services.length > 0 && (
                      <div>
                        <h4 className="font-bold mb-2 text-green-400">
                          DỊCH VỤ CUNG CẤP
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedAdmin.services.map((service, index) => (
                            <span
                              key={index}
                              className="bg-blue-900 text-blue-300 px-3 py-1 rounded text-sm"
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
                        <h4 className="font-bold mb-2 text-green-400">
                          TÀI KHOẢN NGÂN HÀNG
                        </h4>
                        <div className="space-y-2">
                          {selectedAdmin.bank_accounts.map((account, index) => (
                            <div
                              key={index}
                              className="bg-gray-900 p-3 rounded"
                            >
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-bold">
                                  {account.bank}
                                </span>
                                <span className="text-green-400 font-mono">
                                  {account.account_number}
                                </span>
                              </div>
                              <div className="text-sm text-gray-300">
                                Chủ TK: {account.account_name}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  <div className="text-sm text-gray-400">
                    <div>Ngày tạo: {formatDate(selectedAdmin.created_at)}</div>
                    <div>
                      Ngày cập nhật: {formatDate(selectedAdmin.updated_at)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => handleEditAdmin(selectedAdmin)}
                  className="px-4 py-2 bg-green-700 border border-green-500 rounded hover:bg-green-600"
                >
                  SỬA
                </button>
                <button
                  onClick={() => handleDeleteAdmin(selectedAdmin.id)}
                  className="px-4 py-2 bg-red-700 border border-red-500 rounded hover:bg-red-600"
                >
                  XÓA
                </button>
                <button
                  onClick={() => setSelectedAdmin(null)}
                  className="px-4 py-2 bg-gray-700 border border-gray-500 rounded hover:bg-gray-600"
                >
                  ĐÓNG
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Admin Modal (FULL FORM) */}
      {(showCreateAdmin || showEditAdmin) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black bg-opacity-75"
            onClick={() => {
              setShowCreateAdmin(false);
              setShowEditAdmin(false);
              resetNewAdminForm();
            }}
          ></div>
          <div className="relative w-full max-w-4xl bg-black border-2 border-green-500 rounded-lg overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="bg-green-900 px-6 py-4">
              <h2 className="text-xl font-bold">
                {showCreateAdmin
                  ? "THÊM ADMIN MỚI"
                  : `CHỈNH SỬA ADMIN #${newAdmin.order_number}`}
              </h2>
            </div>

            <div className="p-6">
              <form
                onSubmit={
                  showCreateAdmin ? handleCreateAdmin : handleUpdateAdmin
                }
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left Column */}
                  <div className="space-y-4">
                    {showCreateAdmin && (
                      <div>
                        <label className="block text-sm mb-1">
                          <span className="text-red-400">*</span> Số thứ tự
                        </label>
                        <input
                          type="number"
                          value={newAdmin.order_number}
                          onChange={(e) =>
                            setNewAdmin({
                              ...newAdmin,
                              order_number: e.target.value,
                            })
                          }
                          className="w-full bg-black border border-green-600 text-green-400 px-3 py-2 rounded"
                          required
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm mb-1">
                        <span className="text-red-400">*</span> Họ tên
                      </label>
                      <input
                        type="text"
                        value={newAdmin.full_name}
                        onChange={(e) =>
                          setNewAdmin({
                            ...newAdmin,
                            full_name: e.target.value,
                          })
                        }
                        className="w-full bg-black border border-green-600 text-green-400 px-3 py-2 rounded"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm mb-1">Ảnh đại diện</label>
                      <div className="flex items-center space-x-3">
                        {newAdmin.avatar_url ? (
                          <img
                            src={newAdmin.avatar_url}
                            alt="Avatar"
                            className="w-16 h-16 rounded-full object-cover border border-green-600"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-green-900 flex items-center justify-center">
                            👤
                          </div>
                        )}
                        <div className="flex-1">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files[0];
                              if (file) {
                                const url = await handleUploadImage(file);
                                if (url)
                                  setNewAdmin({ ...newAdmin, avatar_url: url });
                              }
                            }}
                            className="w-full text-sm"
                            disabled={uploadingImage}
                          />
                          {uploadingImage && (
                            <div className="text-xs text-yellow-400">
                              Đang upload...
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm mb-1">Zalo</label>
                      <input
                        type="text"
                        value={newAdmin.zalo}
                        onChange={(e) =>
                          setNewAdmin({ ...newAdmin, zalo: e.target.value })
                        }
                        className="w-full bg-black border border-green-600 text-green-400 px-3 py-2 rounded"
                      />
                    </div>

                    <div>
                      <label className="block text-sm mb-1">SĐT</label>
                      <input
                        type="text"
                        value={newAdmin.phone}
                        onChange={(e) =>
                          setNewAdmin({ ...newAdmin, phone: e.target.value })
                        }
                        className="w-full bg-black border border-green-600 text-green-400 px-3 py-2 rounded"
                      />
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm mb-1">
                        Facebook Chính
                      </label>
                      <input
                        type="url"
                        value={newAdmin.fb_main}
                        onChange={(e) =>
                          setNewAdmin({ ...newAdmin, fb_main: e.target.value })
                        }
                        className="w-full bg-black border border-green-600 text-green-400 px-3 py-2 rounded"
                        placeholder="https://facebook.com/..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm mb-1">
                        Facebook Dự phòng
                      </label>
                      <input
                        type="url"
                        value={newAdmin.fb_backup}
                        onChange={(e) =>
                          setNewAdmin({
                            ...newAdmin,
                            fb_backup: e.target.value,
                          })
                        }
                        className="w-full bg-black border border-green-600 text-green-400 px-3 py-2 rounded"
                        placeholder="https://facebook.com/..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm mb-1">Website</label>
                      <input
                        type="url"
                        value={newAdmin.website}
                        onChange={(e) =>
                          setNewAdmin({ ...newAdmin, website: e.target.value })
                        }
                        className="w-full bg-black border border-green-600 text-green-400 px-3 py-2 rounded"
                        placeholder="https://..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm mb-1">
                        Quỹ bảo hiểm (VNĐ)
                      </label>
                      <input
                        type="number"
                        value={newAdmin.insurance_amount}
                        onChange={(e) =>
                          setNewAdmin({
                            ...newAdmin,
                            insurance_amount: e.target.value,
                          })
                        }
                        className="w-full bg-black border border-green-600 text-green-400 px-3 py-2 rounded"
                      />
                    </div>

                    <div>
                      <label className="block text-sm mb-1">
                        Ngày bắt đầu quỹ
                      </label>
                      <input
                        type="date"
                        value={newAdmin.insurance_start_date}
                        onChange={(e) =>
                          setNewAdmin({
                            ...newAdmin,
                            insurance_start_date: e.target.value,
                          })
                        }
                        className="w-full bg-black border border-green-600 text-green-400 px-3 py-2 rounded"
                      />
                    </div>
                  </div>
                </div>

                {/* Services */}
                <div>
                  <label className="block text-sm mb-1">Dịch vụ</label>
                  <div className="mb-2">
                    {newAdmin.services.map((service, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between mb-1"
                      >
                        <span className="text-green-300">• {service}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveService(index)}
                          className="text-red-500 hover:text-red-400"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleAddService}
                    className="px-3 py-1 bg-green-700 border border-green-500 rounded text-sm hover:bg-green-600"
                  >
                    + Thêm dịch vụ
                  </button>
                </div>

                {/* Bank Accounts */}
                <div>
                  <label className="block text-sm mb-1">
                    Tài khoản ngân hàng
                  </label>
                  {newAdmin.bank_accounts.map((account, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2"
                    >
                      <input
                        type="text"
                        placeholder="Tên ngân hàng"
                        value={account.bank}
                        onChange={(e) =>
                          handleBankAccountChange(index, "bank", e.target.value)
                        }
                        className="bg-black border border-green-600 text-green-400 px-3 py-2 rounded"
                      />
                      <input
                        type="text"
                        placeholder="Số tài khoản"
                        value={account.account_number}
                        onChange={(e) =>
                          handleBankAccountChange(
                            index,
                            "account_number",
                            e.target.value
                          )
                        }
                        className="bg-black border border-green-600 text-green-400 px-3 py-2 rounded"
                      />
                      <input
                        type="text"
                        placeholder="Tên chủ TK"
                        value={account.account_name}
                        onChange={(e) =>
                          handleBankAccountChange(
                            index,
                            "account_name",
                            e.target.value
                          )
                        }
                        className="bg-black border border-green-600 text-green-400 px-3 py-2 rounded"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveBankAccount(index)}
                        className="px-3 py-2 bg-red-700 rounded hover:bg-red-600 text-sm"
                        disabled={newAdmin.bank_accounts.length === 1}
                      >
                        XÓA
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddBankAccount}
                    className="mt-2 px-4 py-2 bg-green-700 border border-green-500 rounded hover:bg-green-600 text-sm"
                  >
                    + Thêm tài khoản
                  </button>
                </div>

                {/* Active Status */}
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newAdmin.is_active}
                      onChange={(e) =>
                        setNewAdmin({
                          ...newAdmin,
                          is_active: e.target.checked,
                        })
                      }
                      className="mr-2"
                    />
                    <span>Đang hoạt động</span>
                  </label>
                </div>

                {/* Buttons */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateAdmin(false);
                      setShowEditAdmin(false);
                      resetNewAdminForm();
                    }}
                    className="px-4 py-2 bg-gray-700 border border-gray-500 rounded hover:bg-gray-600"
                  >
                    HỦY
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-700 border border-green-500 rounded hover:bg-green-600"
                  >
                    {showCreateAdmin ? "THÊM ADMIN" : "CẬP NHẬT"}
                  </button>
                </div>
              </form>
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

export default AdminPanel;
