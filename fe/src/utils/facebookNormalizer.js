export const normalizeFacebookLink = (link) => {
  // Nếu không có link hoặc rỗng
  if (!link || link.trim() === "") return null;

  let normalized = link.toLowerCase().trim();

  // Bước 1: Bỏ protocol (https://, http://)
  normalized = normalized.replace(/^https?:\/\//i, "");

  // Bước 2: Bỏ các prefix không cần thiết
  // www., m., business., vi-vn., touch.
  normalized = normalized.replace(
    /^(www\.|m\.|business\.|vi-vn\.|touch\.)/gi,
    ""
  );

  // Bước 3: Đổi fb.com → facebook.com
  normalized = normalized.replace(/^fb\.com/i, "facebook.com");

  // Bước 4: Bỏ trailing slash
  normalized = normalized.replace(/\/$/, "");

  // Bước 5: Xử lý nếu là link Facebook
  if (normalized.includes("facebook.com")) {
    const parts = normalized.split("facebook.com/");
    if (parts.length > 1) {
      let path = parts[1];

      // Trường hợp 1: profile.php?id=XXX
      if (path.includes("profile.php") && path.includes("id=")) {
        // Trích xuất ID
        const idMatch = path.match(/id=(\d+)/);
        if (idMatch && idMatch[1]) {
          const fbId = idMatch[1];
          return `facebook.com/profile.php?id=${fbId}`;
        }
      }

      // Trường hợp 2: Username (bỏ phần sau username)
      // Loại bỏ: /posts, /about, /photos, ?ref=xxx, &sk=xxx
      path = path.split("?")[0]; // Bỏ query params
      path = path.split("/")[0]; // Lấy phần đầu tiên (username)

      if (path && path.length > 0) {
        return `facebook.com/${path}`;
      }
    }
  }

  // Nếu không phải link Facebook chuẩn, trả về như ban đầu
  return normalized;
};

/**
 * KIỂM TRA CÓ PHẢI LINK FACEBOOK KHÔNG
 */
export const isFacebookLink = (link) => {
  if (!link) return false;
  const lower = link.toLowerCase();
  return lower.includes("facebook.com") || lower.includes("fb.com");
};

/**
 * TRÍCH XUẤT FACEBOOK ID (nếu có)
 *
 * Returns: Facebook numeric ID hoặc null
 */
export const extractFacebookId = (link) => {
  if (!link) return null;

  const normalized = normalizeFacebookLink(link);

  if (normalized && normalized.includes("profile.php?id=")) {
    const idMatch = normalized.match(/id=(\d+)/);
    if (idMatch && idMatch[1]) {
      return idMatch[1];
    }
  }

  return null;
};

/**
 * TRÍCH XUẤT FACEBOOK USERNAME (nếu có)
 *
 * Returns: Facebook username hoặc null
 */
export const extractFacebookUsername = (link) => {
  if (!link) return null;

  const normalized = normalizeFacebookLink(link);

  if (normalized && !normalized.includes("profile.php?id=")) {
    const username = normalized.replace("facebook.com/", "");
    if (username && username.length > 0 && username !== "facebook.com") {
      return username;
    }
  }

  return null;
};

// Export default
export default {
  normalizeFacebookLink,
  isFacebookLink,
  extractFacebookId,
  extractFacebookUsername,
};
