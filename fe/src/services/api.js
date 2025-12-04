const API_BASE_URL = "http://localhost:8000";

export const api = {
  // Account Reports
  getAccountReports: (params = {}) => {
    const queryParams = new URLSearchParams(params);
    return fetch(`${API_BASE_URL}/api/account-reports?${queryParams}`).then(
      (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      }
    );
  },

  createAccountReport: (data) =>
    fetch(`${API_BASE_URL}/api/account-reports/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    }),

  getAccountReport: (id) =>
    fetch(`${API_BASE_URL}/api/account-reports/${id}`).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    }),

  getReportsByPerson: (accountNumber) =>
    fetch(
      `${API_BASE_URL}/api/account-reports/by-person/${accountNumber}`
    ).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    }),

  updateAccountReport: (id, data) =>
    fetch(`${API_BASE_URL}/api/account-reports/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    }),

  deleteAccountReport: (id) =>
    fetch(`${API_BASE_URL}/api/account-reports/${id}`, {
      method: "DELETE",
    }).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    }),

  // Website Reports
  getWebsiteReports: (params = {}) => {
    const queryParams = new URLSearchParams(params);
    return fetch(`${API_BASE_URL}/api/website-reports?${queryParams}`).then(
      (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      }
    );
  },

  createWebsiteReport: (data) =>
    fetch(`${API_BASE_URL}/api/website-reports/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    }),

  getWebsiteCategories: () =>
    fetch(`${API_BASE_URL}/api/website-reports/categories`).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    }),

  getWebsiteReport: (id) =>
    fetch(`${API_BASE_URL}/api/website-reports/${id}`).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    }),

  updateWebsiteReport: (id, data) =>
    fetch(`${API_BASE_URL}/api/website-reports/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    }),

  deleteWebsiteReport: (id) =>
    fetch(`${API_BASE_URL}/api/website-reports/${id}`, {
      method: "DELETE",
    }).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    }),

  // Comments
  getComments: (reportType, reportId, params = {}) => {
    const queryParams = new URLSearchParams(params);
    return fetch(
      `${API_BASE_URL}/api/comments/${reportType}/${reportId}?${queryParams}`
    ).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    });
  },

  createComment: (reportType, reportId, data) =>
    fetch(`${API_BASE_URL}/api/comments/${reportType}/${reportId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    }),

  // Insurance Admins
  getInsuranceAdmins: (params = {}) => {
    const queryParams = new URLSearchParams(params);
    return fetch(`${API_BASE_URL}/api/insurance-admins?${queryParams}`).then(
      (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      }
    );
  },

  createInsuranceAdmin: (data) =>
    fetch(`${API_BASE_URL}/api/insurance-admins/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    }),

  getInsuranceAdminById: (id) =>
    fetch(`${API_BASE_URL}/api/insurance-admins/${id}`).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    }),

  getInsuranceAdminByOrder: (orderNumber) =>
    fetch(`${API_BASE_URL}/api/insurance-admins/order/${orderNumber}`).then(
      (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      }
    ),

  updateInsuranceAdmin: (id, data) =>
    fetch(`${API_BASE_URL}/api/insurance-admins/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    }),

  deleteInsuranceAdmin: (id) =>
    fetch(`${API_BASE_URL}/api/insurance-admins/${id}`, {
      method: "DELETE",
    }).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    }),

  // Search
  searchReports: (query) =>
    fetch(`${API_BASE_URL}/api/search/?q=${encodeURIComponent(query)}`).then(
      (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      }
    ),

  quickCheck: (identifier) =>
    fetch(
      `${API_BASE_URL}/api/search/check/${encodeURIComponent(identifier)}`
    ).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    }),

  getTopSearchesToday: (limit = 10) =>
    fetch(`${API_BASE_URL}/api/search/top/searches-today?limit=${limit}`).then(
      (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      }
    ),

  getTopReported7Days: (limit = 10) =>
    fetch(`${API_BASE_URL}/api/search/top/reported-7days?limit=${limit}`).then(
      (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      }
    ),

  getReportsToday: () =>
    fetch(`${API_BASE_URL}/api/search/reports/today`).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    }),

  searchInsuranceAdmin: (query) =>
    fetch(
      `${API_BASE_URL}/api/search/admin/find?q=${encodeURIComponent(query)}`
    ).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    }),

  // Dashboard
  getDashboardStats: () =>
    fetch(`${API_BASE_URL}/api/dashboard/stats`).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    }),

  getSystemSettings: () =>
    fetch(`${API_BASE_URL}/api/dashboard/settings`).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    }),

  updateSystemSettings: (data) =>
    fetch(`${API_BASE_URL}/api/dashboard/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    }),

  refreshSystemStats: () =>
    fetch(`${API_BASE_URL}/api/dashboard/refresh-stats`, {
      method: "POST",
    }).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    }),

  // Upload
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return fetch(`${API_BASE_URL}/api/upload/single`, {
      method: "POST",
      body: formData,
    }).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    });
  },

  uploadMultipleImages: (files) => {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`files`, file);
    });
    return fetch(`${API_BASE_URL}/api/upload/multiple`, {
      method: "POST",
      body: formData,
    }).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    });
  },

  // System
  getHealth: () =>
    fetch(`${API_BASE_URL}/health`).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    }),
};

// SCAM CATEGORIES theo API backend
export const SCAM_CATEGORIES = [
  "GDTG_MMO",
  "FREE_FIRE",
  "LIEN_QUAN",
  "ROBLOX",
  "FC_ONLINE",
  "VALORANT",
  "ZING_SPEED",
  "NRO",
  "PR_STORY",
  "NAP_GAME",
  "MUA_GACH_THE",
  "DV_GOOGLE",
  "DV_TIKTOK",
  "DV_YOUTUBE",
  "DV_FACEBOOK",
  "DV_WECHAT",
  "FANPAGE_GROUP",
  "PAYPAL",
  "PUBG_MOBILE",
  "GAME_PASS",
  "CHAT_GPT",
  "CAY_THUE_GAME",
  "TIEN_DIEN_TU",
  "RUT_VI_TRA_SAU",
  "THIET_KE_WEB",
  "HOSTING_VPS",
  "THANH_TOAN_CUOC",
  "TK_NETFLIX",
  "THE_PLAYERDUO",
  "CHUYEN_TIEN_QT",
  "TAI_KHOAN_SIM",
];

export const REPORT_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

export const REPORT_TYPES = {
  ACCOUNT_SCAM: "account_scam",
  WEBSITE_SCAM: "website_scam",
};

export const BANK_LIST = [
  "Vietcombank",
  "Techcombank",
  "BIDV",
  "Agribank",
  "VietinBank",
  "MB Bank",
  "ACB",
  "Sacombank",
  "VPBank",
  "TPBank",
  "HDBank",
  "SHB",
  "VIB",
  "Eximbank",
  "OCB",
  "MSB",
  "PVcomBank",
  "BaoVietBank",
  "Saigonbank",
  "BacABank",
  "NamABank",
  "VietBank",
  "KienLongBank",
  "NCB",
  "OceanBank",
  "GPBank",
  "ABBank",
  "PG Bank",
  "DongABank",
  "VietCapitalBank",
];

export const API_ENDPOINTS = {
  ACCOUNT_REPORTS: "/api/account-reports",
  WEBSITE_REPORTS: "/api/website-reports",
  SEARCH: "/api/search",
  DASHBOARD: "/api/dashboard",
  INSURANCE_ADMINS: "/api/insurance-admins",
  COMMENTS: "/api/comments",
  UPLOAD: "/api/upload",
};
