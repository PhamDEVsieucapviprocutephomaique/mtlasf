import React, { useState } from "react";
import { api } from "../services/api";

const Report = () => {
  const [reportType, setReportType] = useState("account"); // 'account' or 'website'
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Account Report Form
  const [accountForm, setAccountForm] = useState({
    account_number: "",
    account_name: "",
    bank_name: "",
    facebook_link: "",
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
    category: "GDTG_MMO",
    evidence_images: [],
    description: "",
    reporter_email: "",
  });

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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Chỉ chấp nhận file ảnh");
      return;
    }

    setLoading(true);
    try {
      const result = await api.uploadImage(file);
      if (result.success) {
        if (reportType === "account") {
          setAccountForm((prev) => ({
            ...prev,
            evidence_images: [...prev.evidence_images, result.url],
          }));
        } else {
          setWebsiteForm((prev) => ({
            ...prev,
            evidence_images: [...prev.evidence_images, result.url],
          }));
        }
      } else {
        setError("Upload ảnh thất bại");
      }
    } catch (err) {
      setError("Lỗi upload ảnh: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await api.createAccountReport(accountForm);
      if (result.id) {
        setSuccess(true);
        // Reset form
        setAccountForm({
          account_number: "",
          account_name: "",
          bank_name: "",
          facebook_link: "",
          evidence_images: [],
          content: "",
          reporter_name: "",
          reporter_zalo: "",
          is_victim: false,
          is_proxy_report: false,
        });
      } else {
        setError("Gửi báo cáo thất bại");
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
    setLoading(true);
    setError(null);

    try {
      const result = await api.createWebsiteReport(websiteForm);
      if (result.id) {
        setSuccess(true);
        // Reset form
        setWebsiteForm({
          url: "",
          category: "GDTG_MMO",
          evidence_images: [],
          description: "",
          reporter_email: "",
        });
      } else {
        setError("Gửi báo cáo thất bại");
      }
    } catch (err) {
      setError("Lỗi kết nối server");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 glow-green">🚨 TỐ CÁO SCAM</h1>
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
          <span className="mr-2">💰</span>
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
          <span className="mr-2">🌐</span>
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
              <p className="text-red-300">{error}</p>
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
                  <span className="mr-2">👤</span>
                  THÔNG TIN TÀI KHOẢN SCAM
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm mb-1">STK/SĐT *</label>
                    <input
                      type="text"
                      name="account_number"
                      value={accountForm.account_number}
                      onChange={handleAccountChange}
                      required
                      className="w-full bg-black border border-green-600 text-green-400 px-3 py-2 rounded focus:outline-none focus:border-green-500"
                      placeholder="Ví dụ: 0123456789"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-1">
                      Tên chủ tài khoản *
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
                </div>
              </div>

              <div className="bg-black bg-opacity-50 border border-green-700 rounded-lg p-4">
                <h3 className="font-bold mb-3 border-b border-green-700 pb-2">
                  <span className="mr-2">📸</span>
                  HÌNH ẢNH BẰNG CHỨNG
                </h3>
                <div className="space-y-3">
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full"
                      disabled={loading}
                    />
                    <p className="text-xs text-green-400 mt-1">
                      Upload ảnh giao dịch, chat log, screenshot...
                    </p>
                  </div>

                  {accountForm.evidence_images.length > 0 && (
                    <div>
                      <p className="text-sm mb-2">Ảnh đã upload:</p>
                      <div className="flex flex-wrap gap-2">
                        {accountForm.evidence_images.map((url, index) => (
                          <div key={index} className="relative">
                            <img
                              src={url}
                              alt={`Evidence ${index + 1}`}
                              className="w-20 h-20 object-cover rounded border border-green-600"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newImages = [
                                  ...accountForm.evidence_images,
                                ];
                                newImages.splice(index, 1);
                                setAccountForm((prev) => ({
                                  ...prev,
                                  evidence_images: newImages,
                                }));
                              }}
                              className="absolute -top-1 -right-1 w-5 h-5 bg-red-700 rounded-full text-xs"
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

            {/* Right Column */}
            <div className="space-y-4">
              <div className="bg-black bg-opacity-50 border border-green-700 rounded-lg p-4">
                <h3 className="font-bold mb-3 border-b border-green-700 pb-2">
                  <span className="mr-2">📝</span>
                  NỘI DUNG TỐ CÁO
                </h3>
                <div>
                  <label className="block text-sm mb-1">
                    Chi tiết vụ lừa đảo *
                  </label>
                  <textarea
                    name="content"
                    value={accountForm.content}
                    onChange={handleAccountChange}
                    required
                    rows="6"
                    className="w-full bg-black border border-green-600 text-green-400 px-3 py-2 rounded focus:outline-none focus:border-green-500"
                    placeholder="Mô tả chi tiết sự việc, cách thức lừa đảo, số tiền bị mất..."
                  />
                </div>
              </div>

              <div className="bg-black bg-opacity-50 border border-green-700 rounded-lg p-4">
                <h3 className="font-bold mb-3 border-b border-green-700 pb-2">
                  <span className="mr-2">👥</span>
                  THÔNG TIN NGƯỜI BÁO CÁO
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm mb-1">Họ tên *</label>
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
                    <label className="block text-sm mb-1">Zalo liên hệ *</label>
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
              disabled={loading}
              className="px-8 py-3 bg-red-700 border border-red-500 rounded-lg hover:bg-red-600 transition-all font-bold text-lg"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
                  ĐANG GỬI BÁO CÁO...
                </>
              ) : (
                "🚨 GỬI BÁO CÁO SCAM"
              )}
            </button>
            <p className="text-sm text-green-400 mt-3">
              Báo cáo sẽ được kiểm duyệt trong vòng 24h. Cảm ơn bạn đã đóng góp!
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
                    URL Website scam *
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
                    Thể loại lừa đảo *
                  </label>
                  <select
                    name="category"
                    value={websiteForm.category}
                    onChange={handleWebsiteChange}
                    className="w-full bg-black border border-purple-600 text-green-400 px-3 py-2 rounded focus:outline-none focus:border-purple-500"
                  >
                    <option value="GDTG_MMO">GDTG MMO</option>
                    <option value="FREE_FIRE">Free Fire</option>
                    <option value="LIEN_QUAN">Liên Quân</option>
                    <option value="ROBLOX">Roblox</option>
                    <option value="FC_ONLINE">FC Online</option>
                    <option value="VALORANT">Valorant</option>
                    <option value="ZING_SPEED">Zing Speed</option>
                    <option value="NRO">NRO</option>
                    <option value="PR_STORY">Pr Story</option>
                    <option value="NAP_GAME">Nạp game</option>
                    <option value="MUA_GACH_THE">Mua, gạch thẻ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-1">Email liên hệ *</label>
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
                  <label className="block text-sm mb-1">Mô tả chi tiết *</label>
                  <textarea
                    name="description"
                    value={websiteForm.description}
                    onChange={handleWebsiteChange}
                    required
                    rows="6"
                    className="w-full bg-black border border-purple-600 text-green-400 px-3 py-2 rounded focus:outline-none focus:border-purple-500"
                    placeholder="Mô tả website scam, cách thức lừa đảo..."
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">
                    Hình ảnh bằng chứng
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full"
                    disabled={loading}
                  />
                  {websiteForm.evidence_images.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs mb-1">Ảnh đã upload:</p>
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
                              onClick={() => {
                                const newImages = [
                                  ...websiteForm.evidence_images,
                                ];
                                newImages.splice(index, 1);
                                setWebsiteForm((prev) => ({
                                  ...prev,
                                  evidence_images: newImages,
                                }));
                              }}
                              className="absolute -top-1 -right-1 w-4 h-4 bg-red-700 rounded-full text-xs"
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
              disabled={loading}
              className="px-8 py-3 bg-purple-700 border border-purple-500 rounded-lg hover:bg-purple-600 transition-all font-bold text-lg"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
                  ĐANG GỬI BÁO CÁO...
                </>
              ) : (
                "🌐 GỬI BÁO CÁO WEBSITE SCAM"
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Report;
