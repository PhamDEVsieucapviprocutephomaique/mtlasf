import React, { useState, useEffect } from "react";
import Loading from "../components/Loading";

const Report = () => {
  const [reportType, setReportType] = useState("account");
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);

  // Account Report Form
  const [accountForm, setAccountForm] = useState({
    account_number: "",
    account_name: "",
    bank_name: "",
    facebook_link: "",
    zalo_link: "",
    phone_number: "",
    evidence_images: [],
    content: "",
    reporter_name: "",
    reporter_zalo: "",
    is_victim: false,
    is_proxy_report: false,
  });

  // Website Report Form
  const [websiteForm, setWebsiteForm] = useState({
    url: "",
    category: "",
    evidence_images: [],
    description: "",
    reporter_email: "",
  });

  // Upload progress
  const [uploadProgress, setUploadProgress] = useState({});

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/api/website-reports/categories"
      );
      const data = await response.json();
      setCategories(data.categories || []);
      if (data.categories && data.categories.length > 0) {
        setWebsiteForm((prev) => ({ ...prev, category: data.categories[0] }));
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleAccountChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAccountForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleWebsiteChange = (e) => {
    const { name, value } = e.target;
    setWebsiteForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMultipleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Kiểm tra số lượng ảnh
    const totalImages =
      reportType === "account"
        ? accountForm.evidence_images.length + files.length
        : websiteForm.evidence_images.length + files.length;

    if (totalImages > 10) {
      setError("Chỉ được upload tối đa 10 ảnh");
      return;
    }

    // Kiểm tra kích thước và định dạng
    const invalidFiles = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) {
        invalidFiles.push(`${file.name}: Không phải file ảnh`);
      } else if (file.size > 5 * 1024 * 1024) {
        invalidFiles.push(`${file.name}: Kích thước quá 5MB`);
      }
    }

    if (invalidFiles.length > 0) {
      setError(invalidFiles.join("\n"));
      return;
    }

    setUploadingImages(true);
    setError(null);

    const uploadedUrls = [];
    const errors = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      try {
        setUploadProgress((prev) => ({
          ...prev,
          [file.name]: { progress: 0, status: "uploading" },
        }));

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(
          "http://localhost:8000/api/upload/single",
          {
            method: "POST",
            body: formData,
          }
        );

        const result = await response.json();

        if (result.success) {
          uploadedUrls.push(result.url);
          setUploadProgress((prev) => ({
            ...prev,
            [file.name]: { progress: 100, status: "success" },
          }));
        } else {
          errors.push(`${file.name}: Upload thất bại`);
          setUploadProgress((prev) => ({
            ...prev,
            [file.name]: { progress: 0, status: "error" },
          }));
        }
      } catch (err) {
        errors.push(`${file.name}: ${err.message}`);
        setUploadProgress((prev) => ({
          ...prev,
          [file.name]: { progress: 0, status: "error" },
        }));
      }
    }

    // Cập nhật form với các ảnh đã upload thành công
    if (uploadedUrls.length > 0) {
      if (reportType === "account") {
        setAccountForm((prev) => ({
          ...prev,
          evidence_images: [...prev.evidence_images, ...uploadedUrls],
        }));
      } else {
        setWebsiteForm((prev) => ({
          ...prev,
          evidence_images: [...prev.evidence_images, ...uploadedUrls],
        }));
      }
    }

    if (errors.length > 0) {
      setError(errors.join("\n"));
    }

    setUploadingImages(false);
  };

  // Upload nhiều ảnh cùng lúc bằng endpoint /multiple
  const handleBulkImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Kiểm tra số lượng ảnh
    const totalImages =
      reportType === "account"
        ? accountForm.evidence_images.length + files.length
        : websiteForm.evidence_images.length + files.length;

    if (totalImages > 10) {
      setError("Chỉ được upload tối đa 10 ảnh");
      return;
    }

    // Kiểm tra kích thước và định dạng
    const invalidFiles = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) {
        invalidFiles.push(`${file.name}: Không phải file ảnh`);
      } else if (file.size > 5 * 1024 * 1024) {
        invalidFiles.push(`${file.name}: Kích thước quá 5MB`);
      }
    }

    if (invalidFiles.length > 0) {
      setError(invalidFiles.join("\n"));
      return;
    }

    setUploadingImages(true);
    setError(null);

    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }

      const response = await fetch(
        "http://localhost:8000/api/upload/multiple",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (result.success) {
        const uploadedUrls = result.uploaded.map((item) => item.url);

        if (reportType === "account") {
          setAccountForm((prev) => ({
            ...prev,
            evidence_images: [...prev.evidence_images, ...uploadedUrls],
          }));
        } else {
          setWebsiteForm((prev) => ({
            ...prev,
            evidence_images: [...prev.evidence_images, ...uploadedUrls],
          }));
        }

        if (result.errors && result.errors.length > 0) {
          setError("Một số ảnh upload thất bại:\n" + result.errors.join("\n"));
        }
      } else {
        setError("Upload ảnh thất bại");
      }
    } catch (err) {
      setError("Lỗi upload ảnh: " + err.message);
    } finally {
      setUploadingImages(false);
    }
  };

  const handleAccountSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!accountForm.account_number.trim()) {
      setError("Vui lòng nhập số tài khoản/số điện thoại");
      return;
    }

    if (!accountForm.account_name.trim()) {
      setError("Vui lòng nhập tên chủ tài khoản");
      return;
    }

    if (!accountForm.content.trim()) {
      setError("Vui lòng nhập nội dung tố cáo");
      return;
    }

    if (!accountForm.reporter_name.trim()) {
      setError("Vui lòng nhập họ tên người báo cáo");
      return;
    }

    if (!accountForm.reporter_zalo.trim()) {
      setError("Vui lòng nhập Zalo liên hệ");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        "http://localhost:8000/api/account-reports/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(accountForm),
        }
      );

      const result = await response.json();

      if (result.id) {
        setSuccess(true);
        // Reset form
        setAccountForm({
          account_number: "",
          account_name: "",
          bank_name: "",
          facebook_link: "",
          zalo_link: "",
          phone_number: "",
          evidence_images: [],
          content: "",
          reporter_name: "",
          reporter_zalo: "",
          is_victim: false,
          is_proxy_report: false,
        });
        setUploadProgress({});
      } else {
        setError("Gửi báo cáo thất bại: " + (result.detail || "Unknown error"));
      }
    } catch (err) {
      setError("Lỗi kết nối server");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleWebsiteSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!websiteForm.url.trim()) {
      setError("Vui lòng nhập URL website");
      return;
    }

    if (!websiteForm.category) {
      setError("Vui lòng chọn thể loại scam");
      return;
    }

    if (!websiteForm.description.trim()) {
      setError("Vui lòng nhập mô tả chi tiết");
      return;
    }

    if (!websiteForm.reporter_email.trim()) {
      setError("Vui lòng nhập email liên hệ");
      return;
    }

    // Basic URL validation
    try {
      new URL(websiteForm.url);
    } catch {
      setError("URL không hợp lệ");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(websiteForm.reporter_email)) {
      setError("Email không hợp lệ");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        "http://localhost:8000/api/website-reports/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(websiteForm),
        }
      );

      const result = await response.json();

      if (result.id) {
        setSuccess(true);
        // Reset form
        setWebsiteForm({
          url: "",
          category: categories[0] || "",
          evidence_images: [],
          description: "",
          reporter_email: "",
        });
        setUploadProgress({});
      } else {
        setError("Gửi báo cáo thất bại: " + (result.detail || "Unknown error"));
      }
    } catch (err) {
      setError("Lỗi kết nối server");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = (index, type) => {
    if (type === "account") {
      const newImages = [...accountForm.evidence_images];
      newImages.splice(index, 1);
      setAccountForm((prev) => ({ ...prev, evidence_images: newImages }));

      // Xóa progress của ảnh đã xóa
      const fileName = Object.keys(uploadProgress).find(
        (key) => uploadProgress[key]?.url === accountForm.evidence_images[index]
      );
      if (fileName) {
        setUploadProgress((prev) => {
          const newProgress = { ...prev };
          delete newProgress[fileName];
          return newProgress;
        });
      }
    } else {
      const newImages = [...websiteForm.evidence_images];
      newImages.splice(index, 1);
      setWebsiteForm((prev) => ({ ...prev, evidence_images: newImages }));

      // Xóa progress của ảnh đã xóa
      const fileName = Object.keys(uploadProgress).find(
        (key) => uploadProgress[key]?.url === websiteForm.evidence_images[index]
      );
      if (fileName) {
        setUploadProgress((prev) => {
          const newProgress = { ...prev };
          delete newProgress[fileName];
          return newProgress;
        });
      }
    }
  };

  const handleClearAllImages = (type) => {
    if (type === "account") {
      setAccountForm((prev) => ({ ...prev, evidence_images: [] }));
    } else {
      setWebsiteForm((prev) => ({ ...prev, evidence_images: [] }));
    }
    setUploadProgress({});
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const input = document.createElement("input");
      input.type = "file";
      input.multiple = true;
      input.accept = "image/*";
      input.onchange = (e) => handleMultipleImageUpload(e);
      input.click();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 glow-green">TỐ CÁO SCAM</h1>
        <p className="text-green-300">
          Gửi báo cáo lừa đảo giúp bảo vệ cộng đồng
        </p>
      </div>

      {/* Report Type Selector */}
      <div className="flex border border-green-700 rounded-lg overflow-hidden">
        <button
          onClick={() => setReportType("account")}
          className={`flex-1 py-3 text-center font-bold ${
            reportType === "account"
              ? "bg-green-800 text-white"
              : "bg-black hover:bg-green-900"
          }`}
        >
          TÀI KHOẢN SCAM (STK/SĐT)
        </button>
        <button
          onClick={() => setReportType("website")}
          className={`flex-1 py-3 text-center font-bold ${
            reportType === "website"
              ? "bg-purple-800 text-white"
              : "bg-black hover:bg-purple-900"
          }`}
        >
          WEBSITE/LINK SCAM
        </button>
      </div>

      {/* Success Message */}
      {success && (
        <div className="p-4 bg-green-900 border border-green-600 rounded-lg">
          <div className="flex items-center">
            <div className="text-2xl mr-3">✅</div>
            <div>
              <h3 className="font-bold">GỬI BÁO CÁO THÀNH CÔNG!</h3>
              <p className="text-green-300">
                Báo cáo đã được gửi đến hệ thống và đang chờ duyệt. Cảm ơn bạn
                đã đóng góp!
              </p>
            </div>
          </div>
          <button
            onClick={() => setSuccess(false)}
            className="mt-3 px-4 py-1 bg-green-700 border border-green-500 rounded hover:bg-green-600"
          >
            GỬI BÁO CÁO MỚI
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-900 border border-red-700 rounded-lg">
          <div className="flex items-center">
            <div className="text-2xl mr-3">❌</div>
            <div>
              <h3 className="font-bold">LỖI</h3>
              <p className="text-red-300 whitespace-pre-line">{error}</p>
            </div>
          </div>
          <button
            onClick={() => setError(null)}
            className="mt-3 px-4 py-1 bg-red-700 border border-red-500 rounded hover:bg-red-600"
          >
            ĐÓNG
          </button>
        </div>
      )}

      {/* Account Report Form */}
      {reportType === "account" && !success && (
        <form onSubmit={handleAccountSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="bg-black bg-opacity-50 border border-green-700 rounded-lg p-4">
                <h3 className="font-bold mb-3 border-b border-green-700 pb-2">
                  THÔNG TIN TÀI KHOẢN SCAM
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm mb-1">
                      <span className="text-red-400">*</span> Số tài khoản/SĐT
                    </label>
                    <input
                      type="text"
                      name="account_number"
                      value={accountForm.account_number}
                      onChange={handleAccountChange}
                      required
                      className="w-full bg-black border border-green-600 text-green-400 px-3 py-2 rounded focus:outline-none focus:border-green-500"
                      placeholder="Ví dụ: 0123456789 hoặc 1234567890123"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Số điện thoại</label>
                    <input
                      type="text"
                      name="phone_number"
                      value={accountForm.phone_number}
                      onChange={handleAccountChange}
                      className="w-full bg-black border border-green-600 text-green-400 px-3 py-2 rounded focus:outline-none focus:border-green-500"
                      placeholder="Ví dụ: 0912345678"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-1">
                      <span className="text-red-400">*</span> Tên chủ tài khoản
                    </label>
                    <input
                      type="text"
                      name="account_name"
                      value={accountForm.account_name}
                      onChange={handleAccountChange}
                      required
                      className="w-full bg-black border border-green-600 text-green-400 px-3 py-2 rounded focus:outline-none focus:border-green-500"
                      placeholder="Ví dụ: NGUYEN VAN A"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Ngân hàng</label>
                    <input
                      type="text"
                      name="bank_name"
                      value={accountForm.bank_name}
                      onChange={handleAccountChange}
                      className="w-full bg-black border border-green-600 text-green-400 px-3 py-2 rounded focus:outline-none focus:border-green-500"
                      placeholder="Ví dụ: Vietcombank, Techcombank..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-1">
                      Link Facebook scammer
                    </label>
                    <input
                      type="url"
                      name="facebook_link"
                      value={accountForm.facebook_link}
                      onChange={handleAccountChange}
                      className="w-full bg-black border border-green-600 text-green-400 px-3 py-2 rounded focus:outline-none focus:border-green-500"
                      placeholder="https://facebook.com/..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-1">
                      Link Zalo scammer
                    </label>
                    <input
                      type="url"
                      name="zalo_link"
                      value={accountForm.zalo_link}
                      onChange={handleAccountChange}
                      className="w-full bg-black border border-green-600 text-green-400 px-3 py-2 rounded focus:outline-none focus:border-green-500"
                      placeholder="https://zalo.me/..."
                    />
                  </div>
                </div>
              </div>

              <div className="bg-black bg-opacity-50 border border-green-700 rounded-lg p-4">
                <h3 className="font-bold mb-3 border-b border-green-700 pb-2">
                  HÌNH ẢNH BẰNG CHỨNG ({accountForm.evidence_images.length}/10)
                </h3>
                <div className="space-y-3">
                  {/* Drag & Drop Area */}
                  <div
                    className="border-2 border-dashed border-green-600 rounded-lg p-6 text-center hover:border-green-500 hover:bg-green-900 hover:bg-opacity-10 cursor-pointer transition-all"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, "account")}
                    onClick={() =>
                      document.getElementById("account-image-upload").click()
                    }
                  >
                    <div className="text-4xl mb-3">📤</div>
                    <p className="font-bold mb-2">KÉO & THẢ ẢNH VÀO ĐÂY</p>
                    <p className="text-sm text-green-400 mb-3">
                      hoặc click để chọn ảnh
                    </p>
                    <p className="text-xs text-gray-400">
                      Hỗ trợ: JPG, PNG, GIF • Tối đa 5MB/ảnh • Tối đa 10 ảnh
                    </p>
                  </div>

                  <input
                    type="file"
                    id="account-image-upload"
                    accept="image/*"
                    multiple
                    onChange={handleMultipleImageUpload}
                    className="hidden"
                  />

                  {uploadingImages && (
                    <div className="p-3 bg-yellow-900 bg-opacity-30 rounded border border-yellow-600">
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                        <span className="text-yellow-300">
                          Đang upload ảnh...
                        </span>
                      </div>
                    </div>
                  )}

                  {accountForm.evidence_images.length > 0 && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-bold">Ảnh đã upload:</p>
                        <button
                          type="button"
                          onClick={() => handleClearAllImages("account")}
                          className="text-xs px-2 py-1 bg-red-700 rounded hover:bg-red-600"
                        >
                          XÓA TẤT CẢ
                        </button>
                      </div>
                      <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                        {accountForm.evidence_images.map((url, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={url}
                              alt={`Evidence ${index + 1}`}
                              className="w-full h-24 object-cover rounded border border-green-600 group-hover:opacity-80 transition-all"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveImage(index, "account")
                              }
                              className="absolute -top-1 -right-1 w-6 h-6 bg-red-700 rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                            >
                              ×
                            </button>
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-xs p-1 text-center truncate">
                              Ảnh {index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="bg-black bg-opacity-50 border border-green-700 rounded-lg p-4">
                <h3 className="font-bold mb-3 border-b border-green-700 pb-2">
                  <span className="text-red-400">*</span> NỘI DUNG TỐ CÁO
                </h3>
                <div>
                  <label className="block text-sm mb-1">
                    Chi tiết vụ lừa đảo
                  </label>
                  <textarea
                    name="content"
                    value={accountForm.content}
                    onChange={handleAccountChange}
                    required
                    rows="10"
                    className="w-full bg-black border border-green-600 text-green-400 px-3 py-2 rounded focus:outline-none focus:border-green-500"
                    placeholder="Mô tả chi tiết sự việc, cách thức lừa đảo, số tiền bị mất..."
                  />
                </div>
              </div>

              <div className="bg-black bg-opacity-50 border border-green-700 rounded-lg p-4">
                <h3 className="font-bold mb-3 border-b border-green-700 pb-2">
                  THÔNG TIN NGƯỜI BÁO CÁO
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm mb-1">
                      <span className="text-red-400">*</span> Họ tên
                    </label>
                    <input
                      type="text"
                      name="reporter_name"
                      value={accountForm.reporter_name}
                      onChange={handleAccountChange}
                      required
                      className="w-full bg-black border border-green-600 text-green-400 px-3 py-2 rounded focus:outline-none focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-1">
                      <span className="text-red-400">*</span> Zalo liên hệ
                    </label>
                    <input
                      type="text"
                      name="reporter_zalo"
                      value={accountForm.reporter_zalo}
                      onChange={handleAccountChange}
                      required
                      className="w-full bg-black border border-green-600 text-green-400 px-3 py-2 rounded focus:outline-none focus:border-green-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="is_victim"
                        checked={accountForm.is_victim}
                        onChange={handleAccountChange}
                        className="mr-2"
                      />
                      <span className="text-sm">
                        Tôi là nạn nhân của vụ lừa đảo này
                      </span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="is_proxy_report"
                        checked={accountForm.is_proxy_report}
                        onChange={handleAccountChange}
                        className="mr-2"
                      />
                      <span className="text-sm">
                        Tôi báo cáo hộ (thấy trên group)
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              disabled={loading || uploadingImages}
              className="px-8 py-3 bg-red-700 border border-red-500 rounded-lg hover:bg-red-600 transition-all font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
                  ĐANG GỬI BÁO CÁO...
                </>
              ) : (
                "GỬI BÁO CÁO SCAM"
              )}
            </button>
            <p className="text-sm text-green-400 mt-3">
              <span className="text-red-400">*</span> Thông tin bắt buộc. Báo
              cáo sẽ được kiểm duyệt trong vòng 24h.
            </p>
          </div>
        </form>
      )}

      {/* Website Report Form */}
      {reportType === "website" && !success && (
        <form onSubmit={handleWebsiteSubmit} className="space-y-6">
          <div className="bg-black bg-opacity-50 border border-purple-700 rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-1">
                    <span className="text-red-400">*</span> URL Website scam
                  </label>
                  <input
                    type="url"
                    name="url"
                    value={websiteForm.url}
                    onChange={handleWebsiteChange}
                    required
                    className="w-full bg-black border border-purple-600 text-green-400 px-3 py-2 rounded focus:outline-none focus:border-purple-500"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">
                    <span className="text-red-400">*</span> Thể loại lừa đảo
                  </label>
                  <select
                    name="category"
                    value={websiteForm.category}
                    onChange={handleWebsiteChange}
                    required
                    className="w-full bg-black border border-purple-600 text-green-400 px-3 py-2 rounded focus:outline-none focus:border-purple-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-1">
                    <span className="text-red-400">*</span> Email liên hệ
                  </label>
                  <input
                    type="email"
                    name="reporter_email"
                    value={websiteForm.reporter_email}
                    onChange={handleWebsiteChange}
                    required
                    className="w-full bg-black border border-purple-600 text-green-400 px-3 py-2 rounded focus:outline-none focus:border-purple-500"
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-1">
                    <span className="text-red-400">*</span> Mô tả chi tiết
                  </label>
                  <textarea
                    name="description"
                    value={websiteForm.description}
                    onChange={handleWebsiteChange}
                    required
                    rows="10"
                    className="w-full bg-black border border-purple-600 text-green-400 px-3 py-2 rounded focus:outline-none focus:border-purple-500"
                    placeholder="Mô tả website scam, cách thức lừa đảo..."
                  />
                </div>

                <div className="bg-black bg-opacity-50 border border-purple-600 rounded-lg p-4">
                  <h3 className="font-bold mb-2">
                    HÌNH ẢNH BẰNG CHỨNG ({websiteForm.evidence_images.length}
                    /10)
                  </h3>

                  {/* Drag & Drop Area */}
                  <div
                    className="border-2 border-dashed border-purple-600 rounded-lg p-4 text-center hover:border-purple-500 hover:bg-purple-900 hover:bg-opacity-10 cursor-pointer transition-all mb-3"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, "website")}
                    onClick={() =>
                      document.getElementById("website-image-upload").click()
                    }
                  >
                    <div className="text-3xl mb-2">📤</div>
                    <p className="font-bold mb-1">KÉO & THẢ ẢNH VÀO ĐÂY</p>
                    <p className="text-xs text-purple-400">
                      Chọn nhiều ảnh • Tối đa 10 ảnh
                    </p>
                  </div>

                  <input
                    type="file"
                    id="website-image-upload"
                    accept="image/*"
                    multiple
                    onChange={handleMultipleImageUpload}
                    className="hidden"
                  />

                  {uploadingImages && (
                    <div className="p-2 bg-yellow-900 bg-opacity-30 rounded border border-yellow-600 mb-3">
                      <div className="flex items-center">
                        <div className="w-3 h-3 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                        <span className="text-yellow-300 text-sm">
                          Đang upload...
                        </span>
                      </div>
                    </div>
                  )}

                  {websiteForm.evidence_images.length > 0 && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-xs">Ảnh đã upload:</p>
                        <button
                          type="button"
                          onClick={() => handleClearAllImages("website")}
                          className="text-xs px-2 py-1 bg-red-700 rounded hover:bg-red-600"
                        >
                          XÓA TẤT CẢ
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {websiteForm.evidence_images.map((url, index) => (
                          <div key={index} className="relative">
                            <img
                              src={url}
                              alt={`Evidence ${index + 1}`}
                              className="w-16 h-16 object-cover rounded border border-purple-600"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveImage(index, "website")
                              }
                              className="absolute -top-1 -right-1 w-4 h-4 bg-red-700 rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              disabled={loading || uploadingImages}
              className="px-8 py-3 bg-purple-700 border border-purple-500 rounded-lg hover:bg-purple-600 transition-all font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
                  ĐANG GỬI BÁO CÁO...
                </>
              ) : (
                "GỬI BÁO CÁO WEBSITE SCAM"
              )}
            </button>
            <p className="text-sm text-green-400 mt-3">
              <span className="text-red-400">*</span> Thông tin bắt buộc
            </p>
          </div>
        </form>
      )}
    </div>
  );
};

export default Report;
