import React, { useState, useEffect } from "react";
import Loading from "../components/Loading";

const AdminPanel = () => {
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

  // Form for edit admin
  const [editAdminData, setEditAdminData] = useState(null);
  const [tempServices, setTempServices] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, [activeTab]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // Fetch pending reports
      const [accounts, websites] = await Promise.all([
        fetch("http://localhost:8000/api/account-reports?status=pending").then(
          (res) => res.json()
        ),
        fetch("http://localhost:8000/api/website-reports?status=pending").then(
          (res) => res.json()
        ),
      ]);

      setPendingAccounts(accounts);
      setPendingWebsites(websites);

      // Fetch insurance admins
      const adminsResponse = await fetch(
        "http://localhost:8000/api/insurance-admins/"
      );
      const admins = await adminsResponse.json();
      setInsuranceAdmins(admins);

      // Fetch system settings
      const settingsResponse = await fetch(
        "http://localhost:8000/api/dashboard/settings"
      );
      const settings = await settingsResponse.json();
      setSystemSettings(settings);

      // Fetch all reports for management tab
      if (activeTab === "manage") {
        const [allAcc, allWeb] = await Promise.all([
          fetch("http://localhost:8000/api/account-reports?limit=100").then(
            (res) => res.json()
          ),
          fetch("http://localhost:8000/api/website-reports?limit=100").then(
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
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://localhost:8000/api/upload/single", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        return result.url;
      } else {
        alert("Upload ảnh thất bại");
        return null;
      }
    } catch (error) {
      alert("Lỗi upload ảnh: " + error.message);
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  // =============== SEARCH ADMIN ===============
  const handleSearchAdmins = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8000/api/search/admin/find?q=${encodeURIComponent(
          searchQuery.trim()
        )}`
      );
      const results = await response.json();
      setSearchResults(results);
    } catch (error) {
      alert("Lỗi tìm kiếm admin");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults(null);
  };

  // =============== REPORT MANAGEMENT ===============
  const handleApprove = async (type, id) => {
    try {
      const endpoint =
        type === "account"
          ? `/api/account-reports/${id}`
          : `/api/website-reports/${id}`;

      await fetch(`http://localhost:8000${endpoint}`, {
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

      await fetch(`http://localhost:8000${endpoint}`, {
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

      await fetch(`http://localhost:8000${endpoint}`, {
        method: "DELETE",
      });

      alert("✅ Đã xóa thành công!");
      fetchAdminData();
    } catch (error) {
      alert("❌ Lỗi khi xóa");
    }
  };

  // =============== INSURANCE ADMIN MANAGEMENT ===============
  const handleCreateAdmin = async (e) => {
    e.preventDefault();

    try {
      // Validate required fields
      if (!newAdmin.order_number || !newAdmin.full_name) {
        alert("Vui lòng nhập số thứ tự và họ tên!");
        return;
      }

      // Check if order number exists
      const exists = insuranceAdmins.find(
        (a) => a.order_number.toString() === newAdmin.order_number.toString()
      );
      if (exists) {
        alert(`Số thứ tự ${newAdmin.order_number} đã tồn tại!`);
        return;
      }

      // Prepare data for API
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
        "http://localhost:8000/api/insurance-admins/",
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

  const handleEditAdmin = (admin) => {
    setEditAdminData({
      ...admin,
      insurance_start_date: admin.insurance_start_date
        ? admin.insurance_start_date.split("T")[0]
        : "",
    });
    setTempServices(admin.services.join(", "));
    setShowEditAdmin(true);
  };

  const handleUpdateAdmin = async (e) => {
    e.preventDefault();

    try {
      // Prepare services from textarea
      const servicesArray = tempServices
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s !== "");

      // Prepare update data - CHỈ GỬI CÁC TRƯỜNG CẦN UPDATE
      const updateData = {
        full_name: editAdminData.full_name,
        avatar_url: editAdminData.avatar_url || null,
        fb_main: editAdminData.fb_main || null,
        fb_backup: editAdminData.fb_backup || null,
        zalo: editAdminData.zalo || null,
        phone: editAdminData.phone || null,
        website: editAdminData.website || null,
        insurance_amount: parseFloat(editAdminData.insurance_amount) || 0,
        insurance_start_date: editAdminData.insurance_start_date || null,
        services: servicesArray,
        bank_accounts: editAdminData.bank_accounts,
        is_active: editAdminData.is_active,
      };

      // Remove null values
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] === null || updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      console.log("Update data:", updateData);

      const response = await fetch(
        `http://localhost:8000/api/insurance-admins/${editAdminData.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        }
      );

      if (response.ok) {
        alert("✅ Đã cập nhật admin thành công!");
        setShowEditAdmin(false);
        setEditAdminData(null);
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
        `http://localhost:8000/api/insurance-admins/${adminId}`,
        {
          method: "DELETE",
        }
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

  const handleAddBankAccount = () => {
    if (showEditAdmin && editAdminData) {
      setEditAdminData({
        ...editAdminData,
        bank_accounts: [
          ...editAdminData.bank_accounts,
          { bank: "", account_number: "", account_name: "" },
        ],
      });
    } else {
      setNewAdmin({
        ...newAdmin,
        bank_accounts: [
          ...newAdmin.bank_accounts,
          { bank: "", account_number: "", account_name: "" },
        ],
      });
    }
  };

  const handleRemoveBankAccount = (index) => {
    if (showEditAdmin && editAdminData) {
      const newBankAccounts = [...editAdminData.bank_accounts];
      newBankAccounts.splice(index, 1);
      setEditAdminData({ ...editAdminData, bank_accounts: newBankAccounts });
    } else {
      const newBankAccounts = [...newAdmin.bank_accounts];
      newBankAccounts.splice(index, 1);
      setNewAdmin({ ...newAdmin, bank_accounts: newBankAccounts });
    }
  };

  const handleBankAccountChange = (index, field, value) => {
    if (showEditAdmin && editAdminData) {
      const newBankAccounts = [...editAdminData.bank_accounts];
      newBankAccounts[index][field] = value;
      setEditAdminData({ ...editAdminData, bank_accounts: newBankAccounts });
    } else {
      const newBankAccounts = [...newAdmin.bank_accounts];
      newBankAccounts[index][field] = value;
      setNewAdmin({ ...newAdmin, bank_accounts: newBankAccounts });
    }
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
      await fetch("http://localhost:8000/api/dashboard/settings", {
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
      await fetch("http://localhost:8000/api/dashboard/refresh-stats", {
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
              API: localhost:8000 | ADMIN: ROOT
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
                    <PendingReportCard
                      key={report.id}
                      report={report}
                      type="account"
                      onApprove={() => handleApprove("account", report.id)}
                      onReject={() => handleReject("account", report.id)}
                      onView={() =>
                        setSelectedReport({ type: "account", data: report })
                      }
                    />
                  ))}
                </div>
              ) : (
                <EmptyState message="Không có báo cáo tài khoản nào chờ duyệt" />
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
                    <PendingReportCard
                      key={report.id}
                      report={report}
                      type="website"
                      onApprove={() => handleApprove("website", report.id)}
                      onReject={() => handleReject("website", report.id)}
                      onView={() =>
                        setSelectedReport({ type: "website", data: report })
                      }
                    />
                  ))}
                </div>
              ) : (
                <EmptyState message="Không có website nào chờ duyệt" />
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
                  <ReportTable
                    reports={allAccounts}
                    type="account"
                    onView={(report) =>
                      setSelectedReport({ type: "account", data: report })
                    }
                    onDelete={(id) => handleDelete("account", id)}
                  />
                ) : (
                  <EmptyState message="Không có báo cáo tài khoản" />
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
                  <ReportTable
                    reports={allWebsites}
                    type="website"
                    onView={(report) =>
                      setSelectedReport({ type: "website", data: report })
                    }
                    onDelete={(id) => handleDelete("website", id)}
                  />
                ) : (
                  <EmptyState message="Không có báo cáo website" />
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
                        handleEditAdmin(admin);
                      }}
                      className="flex-1 py-2 bg-green-700 border border-green-500 rounded hover:bg-green-600 text-sm"
                    >
                      SỬA
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
            <EmptyState
              message={
                searchResults
                  ? "Không tìm thấy admin nào phù hợp"
                  : "Chưa có admin nào trong hệ thống"
              }
            />
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
                    <StatItem
                      label="Tổng STK scam"
                      value={systemSettings.total_account_scams}
                    />
                    <StatItem
                      label="Tổng FB scam"
                      value={systemSettings.total_fb_scams}
                    />
                    <StatItem
                      label="Tổng bình luận"
                      value={systemSettings.total_comments}
                    />
                    <StatItem
                      label="Báo cáo chờ duyệt"
                      value={systemSettings.pending_reports}
                    />
                  </div>
                </div>

                {/* Social Links */}
                <div>
                  <h4 className="font-bold mb-3 text-green-400">
                    🔗 LIÊN KẾT MẠNG XÃ HỘI
                  </h4>
                  <div className="space-y-3">
                    <SettingInput
                      label="Facebook Group"
                      value={systemSettings.facebook_group || ""}
                      editMode={editSettings}
                      onChange={(value) =>
                        setSystemSettings({
                          ...systemSettings,
                          facebook_group: value,
                        })
                      }
                    />
                    <SettingInput
                      label="Discord Link"
                      value={systemSettings.discord_link || ""}
                      editMode={editSettings}
                      onChange={(value) =>
                        setSystemSettings({
                          ...systemSettings,
                          discord_link: value,
                        })
                      }
                    />
                    <SettingInput
                      label="Telegram Link"
                      value={systemSettings.telegram_link || ""}
                      editMode={editSettings}
                      onChange={(value) =>
                        setSystemSettings({
                          ...systemSettings,
                          telegram_link: value,
                        })
                      }
                    />
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
        <Modal onClose={() => setSelectedReport(null)}>
          <ReportDetailModal
            report={selectedReport.data}
            type={selectedReport.type}
            onClose={() => setSelectedReport(null)}
            onImageClick={(img) => setSelectedImage(img)}
          />
        </Modal>
      )}

      {/* Admin Detail Modal */}
      {selectedAdmin && (
        <Modal onClose={() => setSelectedAdmin(null)}>
          <AdminDetailModal
            admin={selectedAdmin}
            onEdit={() => {
              handleEditAdmin(selectedAdmin);
              setSelectedAdmin(null);
            }}
            onDelete={() => {
              handleDeleteAdmin(selectedAdmin.id);
              setSelectedAdmin(null);
            }}
            onClose={() => setSelectedAdmin(null)}
          />
        </Modal>
      )}

      {/* Create Admin Modal */}
      {showCreateAdmin && (
        <Modal onClose={() => setShowCreateAdmin(false)}>
          <CreateAdminModal
            newAdmin={newAdmin}
            onNewAdminChange={setNewAdmin}
            onUploadImage={handleUploadImage}
            uploadingImage={uploadingImage}
            bankList={bankList}
            onAddBankAccount={handleAddBankAccount}
            onRemoveBankAccount={handleRemoveBankAccount}
            onBankAccountChange={handleBankAccountChange}
            onSubmit={handleCreateAdmin}
            onClose={() => setShowCreateAdmin(false)}
          />
        </Modal>
      )}

      {/* Edit Admin Modal */}
      {showEditAdmin && editAdminData && (
        <Modal onClose={() => setShowEditAdmin(false)}>
          <EditAdminModal
            admin={editAdminData}
            tempServices={tempServices}
            onAdminChange={setEditAdminData}
            onTempServicesChange={setTempServices}
            onUploadImage={handleUploadImage}
            uploadingImage={uploadingImage}
            bankList={bankList}
            onAddBankAccount={handleAddBankAccount}
            onRemoveBankAccount={handleRemoveBankAccount}
            onBankAccountChange={handleBankAccountChange}
            onSubmit={handleUpdateAdmin}
            onClose={() => setShowEditAdmin(false)}
          />
        </Modal>
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

// =============== COMPONENTS ===============

const PendingReportCard = ({ report, type, onApprove, onReject, onView }) => (
  <div className="border border-red-800 rounded-lg p-4 hover:bg-red-900 hover:bg-opacity-10">
    <div className="flex flex-col md:flex-row justify-between items-start mb-3">
      <div>
        <div className="font-mono font-bold text-lg text-red-400">
          {type === "account" ? report.account_number : report.url}
        </div>
        <div className="text-sm">
          {type === "account"
            ? `${report.account_name} | ${
                report.bank_name || "Không có ngân hàng"
              }`
            : `Thể loại: ${report.category}`}
        </div>
        <div className="text-xs text-gray-400 mt-1">
          {type === "account"
            ? `Người báo cáo: ${report.reporter_name} | Zalo: ${report.reporter_zalo}`
            : `Email: ${report.reporter_email}`}
        </div>
      </div>
      <div className="mt-2 md:mt-0 flex space-x-2">
        <button
          onClick={onApprove}
          className="px-4 py-2 bg-green-700 border border-green-500 rounded hover:bg-green-600"
        >
          ✅ DUYỆT
        </button>
        <button
          onClick={onReject}
          className="px-4 py-2 bg-yellow-700 border border-yellow-500 rounded hover:bg-yellow-600"
        >
          ❌ TỪ CHỐI
        </button>
        <button
          onClick={onView}
          className="px-4 py-2 bg-blue-700 border border-blue-500 rounded hover:bg-blue-600"
        >
          👁️ XEM
        </button>
      </div>
    </div>
    <div className="text-sm mb-3 line-clamp-2">
      {type === "account" ? report.content : report.description}
    </div>
    {type === "account" && report.evidence_images.length > 0 && (
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
);

const ReportTable = ({ reports, type, onView, onDelete }) => (
  <table className="w-full text-sm">
    <thead>
      <tr className="bg-green-900 bg-opacity-20">
        <th className="p-2 text-left">
          {type === "account" ? "STK/SĐT" : "URL"}
        </th>
        <th className="p-2 text-left">TRẠNG THÁI</th>
        <th className="p-2 text-left">HÀNH ĐỘNG</th>
      </tr>
    </thead>
    <tbody>
      {reports.map((report) => (
        <tr
          key={report.id}
          className="border-b border-green-800 hover:bg-green-900 hover:bg-opacity-10"
        >
          <td className="p-2 font-mono truncate max-w-xs">
            {type === "account" ? report.account_number : report.url}
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
                onClick={() => onView(report)}
                className="px-2 py-1 bg-blue-700 rounded text-xs hover:bg-blue-600"
              >
                XEM
              </button>
              <button
                onClick={() => onDelete(report.id)}
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
);

const EmptyState = ({ message }) => (
  <div className="text-center py-8">
    <div className="text-4xl mb-3">✅</div>
    <p className="text-green-400">{message}</p>
  </div>
);

const StatItem = ({ label, value }) => (
  <div className="flex justify-between items-center p-3 bg-black bg-opacity-30 rounded">
    <span>{label}</span>
    <span className="font-bold text-green-400">{value}</span>
  </div>
);

const SettingInput = ({ label, value, editMode, onChange }) => (
  <div>
    <label className="block text-sm mb-1">{label}:</label>
    {editMode ? (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-black border border-blue-600 text-green-400 px-3 py-2 rounded"
      />
    ) : (
      <div className="p-2 bg-black bg-opacity-30 rounded">
        {value || "Chưa cài đặt"}
      </div>
    )}
  </div>
);

const Modal = ({ children, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div
      className="absolute inset-0 bg-black bg-opacity-75"
      onClick={onClose}
    ></div>
    <div className="relative w-full max-w-4xl bg-black border-2 border-red-500 rounded-lg overflow-hidden max-h-[90vh] overflow-y-auto">
      {children}
    </div>
  </div>
);

const ReportDetailModal = ({ report, type, onClose, onImageClick }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("vi-VN");
  };

  return (
    <>
      <div className="bg-red-900 px-6 py-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">
          {type === "account"
            ? "💰 CHI TIẾT BÁO CÁO TK"
            : "🌐 CHI TIẾT BÁO CÁO WEBSITE"}
        </h2>
        <button onClick={onClose} className="text-xl hover:text-gray-300">
          ×
        </button>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>ID:</strong> {report.id}
            </div>
            <div>
              <strong>Trạng thái:</strong>{" "}
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
            <div>
              <strong>Lượt xem:</strong> {report.view_count || 0}
            </div>
            {type === "account" && (
              <div>
                <strong>Bình luận:</strong> {report.comment_count || 0}
              </div>
            )}
          </div>

          {type === "account" ? (
            <>
              <div>
                <strong>STK/SĐT:</strong>{" "}
                <span className="font-mono text-red-400">
                  {report.account_number}
                </span>
              </div>
              <div>
                <strong>Tên chủ TK:</strong> {report.account_name}
              </div>
              <div>
                <strong>Ngân hàng:</strong> {report.bank_name || "N/A"}
              </div>
              <div>
                <strong>Facebook:</strong>{" "}
                {report.facebook_link ? (
                  <a
                    href={report.facebook_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    {report.facebook_link}
                  </a>
                ) : (
                  "N/A"
                )}
              </div>
              <div>
                <strong>Zalo:</strong>{" "}
                {report.zalo_link ? (
                  <a
                    href={report.zalo_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400 hover:text-green-300"
                  >
                    {report.zalo_link}
                  </a>
                ) : (
                  "N/A"
                )}
              </div>
              <div>
                <strong>SĐT:</strong> {report.phone_number || "N/A"}
              </div>
              <div>
                <strong>Người báo cáo:</strong> {report.reporter_name}
              </div>
              <div>
                <strong>Zalo người báo cáo:</strong> {report.reporter_zalo}
              </div>
              <div>
                <strong>Là nạn nhân:</strong>{" "}
                {report.is_victim ? "Có" : "Không"}
              </div>
              <div>
                <strong>Báo cáo hộ:</strong>{" "}
                {report.is_proxy_report ? "Có" : "Không"}
              </div>
              <div>
                <strong>Nội dung:</strong>
                <p className="mt-2 p-3 bg-black bg-opacity-30 rounded whitespace-pre-wrap">
                  {report.content}
                </p>
              </div>
            </>
          ) : (
            <>
              <div>
                <strong>URL:</strong>{" "}
                <a
                  href={report.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 break-all"
                >
                  {report.url}
                </a>
              </div>
              <div>
                <strong>Thể loại:</strong>{" "}
                <span className="text-purple-400">{report.category}</span>
              </div>
              <div>
                <strong>Email liên hệ:</strong> {report.reporter_email}
              </div>
              <div>
                <strong>Mô tả:</strong>
                <p className="mt-2 p-3 bg-black bg-opacity-30 rounded whitespace-pre-wrap">
                  {report.description}
                </p>
              </div>
            </>
          )}

          {/* Evidence Images */}
          {report.evidence_images && report.evidence_images.length > 0 && (
            <div>
              <strong className="block mb-2">Hình ảnh bằng chứng:</strong>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {report.evidence_images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Evidence ${idx + 1}`}
                    className="w-full h-32 object-cover rounded border border-green-600 cursor-pointer hover:opacity-80"
                    onClick={() => window.open(img, "_blank")}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-400">
            <div>
              <strong>Ngày tạo:</strong> {formatDate(report.created_at)}
            </div>
            <div>
              <strong>Ngày cập nhật:</strong> {formatDate(report.updated_at)}
            </div>
            {report.approved_at && (
              <div>
                <strong>Ngày duyệt:</strong> {formatDate(report.approved_at)}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 border border-gray-500 rounded hover:bg-gray-600"
          >
            ĐÓNG
          </button>
        </div>
      </div>
    </>
  );
};

const AdminDetailModal = ({ admin, onEdit, onDelete, onClose }) => {
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

  return (
    <>
      <div className="bg-blue-900 px-6 py-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">ADMIN #{admin.order_number}</h2>
        <button onClick={onClose} className="text-xl hover:text-gray-300">
          ×
        </button>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Avatar & Basic Info */}
          <div className="md:col-span-1">
            <div className="text-center">
              {admin.avatar_url ? (
                <img
                  src={admin.avatar_url}
                  alt={admin.full_name}
                  className="w-32 h-32 rounded-full mx-auto mb-4 border-2 border-blue-600 object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-blue-700 flex items-center justify-center text-4xl mx-auto mb-4 border-2 border-blue-600">
                  👤
                </div>
              )}
              <h3 className="text-xl font-bold mb-2">{admin.full_name}</h3>
              <div
                className={`px-3 py-1 rounded-full text-sm inline-block mb-4 ${
                  admin.is_active
                    ? "bg-green-900 text-green-300"
                    : "bg-gray-700 text-gray-400"
                }`}
              >
                {admin.is_active ? "ĐANG HOẠT ĐỘNG" : "NGỪNG HOẠT ĐỘNG"}
              </div>
            </div>
          </div>

          {/* Right Column - Detailed Info */}
          <div className="md:col-span-2 space-y-4">
            {/* Quỹ Bảo Hiểm */}
            <div>
              <h4 className="font-bold mb-2 text-green-400">QUỸ BẢO HIỂM</h4>
              <div className="bg-blue-900 bg-opacity-30 p-3 rounded">
                <div className="text-2xl font-bold text-green-400 mb-1">
                  {formatCurrency(admin.insurance_amount)}
                </div>
                {admin.insurance_start_date && (
                  <div className="text-xs text-gray-400">
                    Bắt đầu: {formatDate(admin.insurance_start_date)}
                  </div>
                )}
              </div>
            </div>

            {/* Liên hệ */}
            <div>
              <h4 className="font-bold mb-2 text-green-400">
                THÔNG TIN LIÊN HỆ
              </h4>
              <div className="space-y-2">
                {admin.zalo && (
                  <div className="flex items-center">
                    <span className="w-24 text-sm">Zalo:</span>
                    <span className="font-mono">{admin.zalo}</span>
                  </div>
                )}
                {admin.phone && (
                  <div className="flex items-center">
                    <span className="w-24 text-sm">SĐT:</span>
                    <span className="font-mono">{admin.phone}</span>
                  </div>
                )}
                {admin.fb_main && (
                  <a
                    href={admin.fb_main}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-blue-800 hover:bg-blue-700 px-3 py-2 rounded text-center"
                  >
                    Facebook Chính
                  </a>
                )}
                {admin.fb_backup && (
                  <a
                    href={admin.fb_backup}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-blue-800 hover:bg-blue-700 px-3 py-2 rounded text-center"
                  >
                    Facebook Dự phòng
                  </a>
                )}
                {admin.website && (
                  <a
                    href={admin.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-purple-800 hover:bg-purple-700 px-3 py-2 rounded text-center"
                  >
                    Website
                  </a>
                )}
              </div>
            </div>

            {/* Dịch vụ */}
            {admin.services && admin.services.length > 0 && (
              <div>
                <h4 className="font-bold mb-2 text-green-400">
                  DỊCH VỤ CUNG CẤP
                </h4>
                <div className="flex flex-wrap gap-2">
                  {admin.services.map((service, index) => (
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

            {/* Tài khoản ngân hàng */}
            {admin.bank_accounts && admin.bank_accounts.length > 0 && (
              <div>
                <h4 className="font-bold mb-2 text-green-400">
                  TÀI KHOẢN NGÂN HÀNG
                </h4>
                <div className="space-y-2">
                  {admin.bank_accounts.map((account, index) => (
                    <div key={index} className="bg-gray-900 p-3 rounded">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold">{account.bank}</span>
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

            {/* Thông tin khác */}
            <div className="text-sm text-gray-400">
              <div>Ngày tạo: {formatDate(admin.created_at)}</div>
              <div>Ngày cập nhật: {formatDate(admin.updated_at)}</div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex space-x-3">
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-green-700 border border-green-500 rounded hover:bg-green-600"
          >
            SỬA
          </button>
          <button
            onClick={onDelete}
            className="px-4 py-2 bg-red-700 border border-red-500 rounded hover:bg-red-600"
          >
            XÓA
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 border border-gray-500 rounded hover:bg-gray-600"
          >
            ĐÓNG
          </button>
        </div>
      </div>
    </>
  );
};

const CreateAdminModal = ({
  newAdmin,
  onNewAdminChange,
  onUploadImage,
  uploadingImage,
  bankList,
  onAddBankAccount,
  onRemoveBankAccount,
  onBankAccountChange,
  onSubmit,
  onClose,
}) => {
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = await onUploadImage(file);
    if (url) {
      onNewAdminChange({ ...newAdmin, avatar_url: url });
    }
  };

  const handleAddService = () => {
    const service = prompt("Nhập tên dịch vụ:");
    if (service && service.trim()) {
      onNewAdminChange({
        ...newAdmin,
        services: [...newAdmin.services, service.trim()],
      });
    }
  };

  const handleRemoveService = (index) => {
    const newServices = [...newAdmin.services];
    newServices.splice(index, 1);
    onNewAdminChange({ ...newAdmin, services: newServices });
  };

  return (
    <>
      <div className="bg-green-900 px-6 py-4">
        <h2 className="text-xl font-bold">THÊM ADMIN MỚI</h2>
      </div>
      <div className="p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1">
                  <span className="text-red-400">*</span> Số thứ tự
                </label>
                <input
                  type="number"
                  value={newAdmin.order_number}
                  onChange={(e) =>
                    onNewAdminChange({
                      ...newAdmin,
                      order_number: e.target.value,
                    })
                  }
                  className="w-full bg-black border border-green-600 text-green-400 px-3 py-2 rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-1">
                  <span className="text-red-400">*</span> Họ tên
                </label>
                <input
                  type="text"
                  value={newAdmin.full_name}
                  onChange={(e) =>
                    onNewAdminChange({ ...newAdmin, full_name: e.target.value })
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
                      onChange={handleImageUpload}
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
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Zalo</label>
                <input
                  type="text"
                  value={newAdmin.zalo}
                  onChange={(e) =>
                    onNewAdminChange({ ...newAdmin, zalo: e.target.value })
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
                    onNewAdminChange({ ...newAdmin, phone: e.target.value })
                  }
                  className="w-full bg-black border border-green-600 text-green-400 px-3 py-2 rounded"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Facebook Chính</label>
                <input
                  type="url"
                  value={newAdmin.fb_main}
                  onChange={(e) =>
                    onNewAdminChange({ ...newAdmin, fb_main: e.target.value })
                  }
                  className="w-full bg-black border border-green-600 text-green-400 px-3 py-2 rounded"
                  placeholder="https://facebook.com/..."
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Facebook Dự phòng</label>
                <input
                  type="url"
                  value={newAdmin.fb_backup}
                  onChange={(e) =>
                    onNewAdminChange({ ...newAdmin, fb_backup: e.target.value })
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
                    onNewAdminChange({ ...newAdmin, website: e.target.value })
                  }
                  className="w-full bg-black border border-green-600 text-green-400 px-3 py-2 rounded"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          {/* Insurance Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Quỹ bảo hiểm (VNĐ)</label>
              <input
                type="number"
                value={newAdmin.insurance_amount}
                onChange={(e) =>
                  onNewAdminChange({
                    ...newAdmin,
                    insurance_amount: e.target.value,
                  })
                }
                className="w-full bg-black border border-green-600 text-green-400 px-3 py-2 rounded"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Ngày bắt đầu quỹ</label>
              <input
                type="date"
                value={newAdmin.insurance_start_date}
                onChange={(e) =>
                  onNewAdminChange({
                    ...newAdmin,
                    insurance_start_date: e.target.value,
                  })
                }
                className="w-full bg-black border border-green-600 text-green-400 px-3 py-2 rounded"
              />
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
            <label className="block text-sm mb-1">Tài khoản ngân hàng</label>
            {newAdmin.bank_accounts.map((account, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2"
              >
                <select
                  value={account.bank}
                  onChange={(e) =>
                    onBankAccountChange(index, "bank", e.target.value)
                  }
                  className="bg-black border border-green-600 text-green-400 px-3 py-2 rounded"
                >
                  <option value="">Chọn ngân hàng</option>
                  {bankList.map((bank) => (
                    <option key={bank} value={bank}>
                      {bank}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Số tài khoản"
                  value={account.account_number}
                  onChange={(e) =>
                    onBankAccountChange(index, "account_number", e.target.value)
                  }
                  className="bg-black border border-green-600 text-green-400 px-3 py-2 rounded"
                />
                <input
                  type="text"
                  placeholder="Tên chủ TK"
                  value={account.account_name}
                  onChange={(e) =>
                    onBankAccountChange(index, "account_name", e.target.value)
                  }
                  className="bg-black border border-green-600 text-green-400 px-3 py-2 rounded"
                />
                <button
                  type="button"
                  onClick={() => onRemoveBankAccount(index)}
                  className="px-3 py-2 bg-red-700 rounded hover:bg-red-600 text-sm"
                  disabled={newAdmin.bank_accounts.length === 1}
                >
                  XÓA
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={onAddBankAccount}
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
                  onNewAdminChange({ ...newAdmin, is_active: e.target.checked })
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
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 border border-gray-500 rounded hover:bg-gray-600"
            >
              HỦY
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-700 border border-green-500 rounded hover:bg-green-600"
            >
              THÊM ADMIN
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

const EditAdminModal = ({
  admin,
  tempServices,
  onAdminChange,
  onTempServicesChange,
  onUploadImage,
  uploadingImage,
  bankList,
  onAddBankAccount,
  onRemoveBankAccount,
  onBankAccountChange,
  onSubmit,
  onClose,
}) => {
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = await onUploadImage(file);
    if (url) {
      onAdminChange({ ...admin, avatar_url: url });
    }
  };

  const handleAddService = () => {
    const service = prompt("Nhập tên dịch vụ:");
    if (service && service.trim()) {
      const servicesArray = tempServices
        ? tempServices.split(",").map((s) => s.trim())
        : [];
      servicesArray.push(service.trim());
      onTempServicesChange(servicesArray.join(", "));
    }
  };

  const handleRemoveService = (index) => {
    const servicesArray = tempServices.split(",").map((s) => s.trim());
    servicesArray.splice(index, 1);
    onTempServicesChange(servicesArray.join(", "));
  };

  return (
    <>
      <div className="bg-green-900 px-6 py-4">
        <h2 className="text-xl font-bold">
          CHỈNH SỬA ADMIN #{admin.order_number}
        </h2>
      </div>
      <div className="p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Họ tên</label>
                <input
                  type="text"
                  value={admin.full_name}
                  onChange={(e) =>
                    onAdminChange({ ...admin, full_name: e.target.value })
                  }
                  className="w-full bg-black border border-green-600 text-green-400 px-3 py-2 rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Ảnh đại diện</label>
                <div className="flex items-center space-x-3">
                  {admin.avatar_url ? (
                    <img
                      src={admin.avatar_url}
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
                      onChange={handleImageUpload}
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
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Zalo</label>
                <input
                  type="text"
                  value={admin.zalo || ""}
                  onChange={(e) =>
                    onAdminChange({ ...admin, zalo: e.target.value })
                  }
                  className="w-full bg-black border border-green-600 text-green-400 px-3 py-2 rounded"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">SĐT</label>
                <input
                  type="text"
                  value={admin.phone || ""}
                  onChange={(e) =>
                    onAdminChange({ ...admin, phone: e.target.value })
                  }
                  className="w-full bg-black border border-green-600 text-green-400 px-3 py-2 rounded"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Quỹ bảo hiểm (VNĐ)</label>
                <input
                  type="number"
                  value={admin.insurance_amount}
                  onChange={(e) =>
                    onAdminChange({
                      ...admin,
                      insurance_amount: e.target.value,
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
              {tempServices.split(",").map(
                (service, index) =>
                  service.trim() && (
                    <div
                      key={index}
                      className="flex items-center justify-between mb-1"
                    >
                      <span className="text-green-300">• {service.trim()}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveService(index)}
                        className="text-red-500 hover:text-red-400"
                      >
                        ×
                      </button>
                    </div>
                  )
              )}
            </div>
            <div className="flex gap-2">
              <textarea
                value={tempServices}
                onChange={(e) => onTempServicesChange(e.target.value)}
                rows="2"
                className="flex-1 bg-black border border-green-600 text-green-400 px-3 py-2 rounded"
                placeholder="GDTG Liên Quân, Bán Acc Free Fire, Nạp game..."
              />
              <button
                type="button"
                onClick={handleAddService}
                className="px-3 py-1 bg-green-700 border border-green-500 rounded text-sm hover:bg-green-600"
              >
                +
              </button>
            </div>
          </div>

          {/* Bank Accounts */}
          <div>
            <label className="block text-sm mb-1">Tài khoản ngân hàng</label>
            {admin.bank_accounts.map((account, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2"
              >
                <select
                  value={account.bank}
                  onChange={(e) =>
                    onBankAccountChange(index, "bank", e.target.value)
                  }
                  className="bg-black border border-green-600 text-green-400 px-3 py-2 rounded"
                >
                  <option value="">Chọn ngân hàng</option>
                  {bankList.map((bank) => (
                    <option key={bank} value={bank}>
                      {bank}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Số tài khoản"
                  value={account.account_number}
                  onChange={(e) =>
                    onBankAccountChange(index, "account_number", e.target.value)
                  }
                  className="bg-black border border-green-600 text-green-400 px-3 py-2 rounded"
                />
                <input
                  type="text"
                  placeholder="Tên chủ TK"
                  value={account.account_name}
                  onChange={(e) =>
                    onBankAccountChange(index, "account_name", e.target.value)
                  }
                  className="bg-black border border-green-600 text-green-400 px-3 py-2 rounded"
                />
                <button
                  type="button"
                  onClick={() => onRemoveBankAccount(index)}
                  className="px-3 py-2 bg-red-700 rounded hover:bg-red-600 text-sm"
                  disabled={admin.bank_accounts.length === 1}
                >
                  XÓA
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={onAddBankAccount}
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
                checked={admin.is_active}
                onChange={(e) =>
                  onAdminChange({ ...admin, is_active: e.target.checked })
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
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 border border-gray-500 rounded hover:bg-gray-600"
            >
              HỦY
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-700 border border-green-500 rounded hover:bg-green-600"
            >
              CẬP NHẬT
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AdminPanel;
