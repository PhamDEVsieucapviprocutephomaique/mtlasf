const API_BASE_URL = "http://localhost:8000"; // Cập nhật URL backend của bạn

export const api = {
  // Account Reports
  getAccountReports: (params = {}) =>
    fetch(
      `${API_BASE_URL}/api/account-reports?${new URLSearchParams(params)}`
    ).then((res) => res.json()),

  createAccountReport: (data) =>
    fetch(`${API_BASE_URL}/api/account-reports/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((res) => res.json()),

  getTopScammers: (days = 7) =>
    fetch(`${API_BASE_URL}/api/account-reports/top/scammers?days=${days}`).then(
      (res) => res.json()
    ),

  // Website Reports
  getWebsiteReports: (params = {}) =>
    fetch(
      `${API_BASE_URL}/api/website-reports?${new URLSearchParams(params)}`
    ).then((res) => res.json()),

  createWebsiteReport: (data) =>
    fetch(`${API_BASE_URL}/api/website-reports/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((res) => res.json()),

  // Search
  searchReports: (query) =>
    fetch(`${API_BASE_URL}/api/search/?q=${encodeURIComponent(query)}`).then(
      (res) => res.json()
    ),

  quickCheck: (accountNumber) =>
    fetch(`${API_BASE_URL}/api/search/check/${accountNumber}`).then((res) =>
      res.json()
    ),

  // Dashboard Stats
  getDashboardStats: () =>
    fetch(`${API_BASE_URL}/api/dashboard/stats`).then((res) => res.json()),

  getSystemSettings: () =>
    fetch(`${API_BASE_URL}/api/dashboard/settings`).then((res) => res.json()),

  // Insurance Fund Admins
  getInsuranceAdmins: () =>
    fetch(`${API_BASE_URL}/api/insurance-admins/`).then((res) => res.json()),

  // Comments
  getComments: (reportType, reportId) =>
    fetch(`${API_BASE_URL}/api/comments/${reportType}/${reportId}`).then(
      (res) => res.json()
    ),

  createComment: (reportType, reportId, data) =>
    fetch(`${API_BASE_URL}/api/comments/${reportType}/${reportId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((res) => res.json()),

  // Upload Images
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return fetch(`${API_BASE_URL}/api/upload/single`, {
      method: "POST",
      body: formData,
    }).then((res) => res.json());
  },

  getAccountReports: (params = {}) =>
    fetch(
      `${API_BASE_URL}/api/account-reports?${new URLSearchParams(params)}`
    ).then((res) => res.json()),

  getWebsiteReports: (params = {}) =>
    fetch(
      `${API_BASE_URL}/api/website-reports?${new URLSearchParams(params)}`
    ).then((res) => res.json()),

  updateReportStatus: (type, id, status) =>
    fetch(
      `${API_BASE_URL}/api/${
        type === "account" ? "account-reports" : "website-reports"
      }/${id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }
    ).then((res) => res.json()),

  deleteReport: (type, id) =>
    fetch(
      `${API_BASE_URL}/api/${
        type === "account" ? "account-reports" : "website-reports"
      }/${id}`,
      {
        method: "DELETE",
      }
    ).then((res) => res.json()),

  deleteComment: (commentId) =>
    fetch(`${API_BASE_URL}/api/comments/${commentId}`, {
      method: "DELETE",
    }).then((res) => res.json()),

  updateSystemSettings: (settings) =>
    fetch(`${API_BASE_URL}/api/dashboard/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    }).then((res) => res.json()),

  refreshSystemStats: () =>
    fetch(`${API_BASE_URL}/api/dashboard/refresh-stats`, {
      method: "POST",
    }).then((res) => res.json()),

  getSystemLogs: () =>
    fetch(`${API_BASE_URL}/api/admin/logs`).then((res) => res.json()),
};
