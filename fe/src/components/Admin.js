import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// --- COMPONENT MODAL CHI TIẾT ĐƠN HÀNG ---
const OrderDetailModal = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null;
  const items = order.items || [];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black bg-opacity-70"
        onClick={onClose}
      ></div>
      <div className="relative bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto">
        <button
          className="absolute top-3 right-3 text-2xl text-gray-500 hover:text-red-600 transition z-10 bg-white rounded-full w-8 h-8 flex items-center justify-center border"
          onClick={onClose}
        >
          ✕
        </button>
        <div className="p-6">
          <h2 className="text-2xl font-bold text-blue-800 mb-4 border-b pb-2">
            Chi Tiết Đơn Hàng #{order.id}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 p-3 bg-blue-50 rounded-lg border">
            <div>
              <p className="font-semibold text-gray-700 text-sm">Khách hàng:</p>
              <p className="font-bold text-lg text-blue-800">
                {order.customer_name}
              </p>
            </div>
            <div>
              <p className="font-semibold text-gray-700 text-sm">
                Số điện thoại:
              </p>
              <p className="font-bold text-lg text-blue-800">
                {order.customer_phone}
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="font-semibold text-gray-700 text-sm">Địa chỉ:</p>
              <p className="text-base font-medium text-gray-800">
                {order.customer_address}
              </p>
            </div>
            <div>
              <p className="font-semibold text-gray-700 text-sm">Ngày đặt:</p>
              <p className="font-bold text-lg text-blue-800">
                {new Date(order.created_at).toLocaleDateString("vi-VN")}
              </p>
            </div>
            <div>
              <p className="font-semibold text-gray-700 text-sm">Tổng tiền:</p>
              <p className="font-bold text-2xl text-red-600">
                {order.total_price
                  ? order.total_price.toLocaleString("vi-VN")
                  : 0}{" "}
                VNĐ
              </p>
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-3">
            Danh Sách Sản Phẩm ({items.length})
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-start p-3 border rounded-lg bg-white shadow-sm"
              >
                <div className="flex-1 min-w-0 pr-3">
                  <p className="font-bold text-base text-gray-800 break-words">
                    {item.product_name}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Mã SP:{" "}
                    <span className="font-medium">{item.product_id}</span>
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-base font-bold text-red-500">
                    {item.price ? item.price.toLocaleString("vi-VN") : 0} VNĐ
                  </p>
                  <p className="text-xs text-gray-600">x {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT CHÍNH ADMIN ---
const Admin = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");

  const [activeTab, setActiveTab] = useState("add-product");
  const [orders, setOrders] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]); // Đảm bảo khởi tạo là array rỗng
  const [youtubeUrl, setYoutubeUrl] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageUrls, setUploadedImageUrls] = useState([]);

  const [newProduct, setNewProduct] = useState({
    name: "",
    category_id: "",
    brand_id: "",
    price: "",
    description: "",
    images: [],
  });

  // State cho Banner
  const [newBanner, setNewBanner] = useState({
    title: "",
    content: "",
    image_url: "",
  });
  const [bannerImageUrl, setBannerImageUrl] = useState("");

  // const API_BASE_URL = "http://api.thanhdanhluxury.vn/api";
  const API_BASE_URL = "http://localhost:8000/api";

  useEffect(() => {
    const adminLoggedIn = localStorage.getItem("adminLoggedIn") === "true";
    setIsLoggedIn(adminLoggedIn);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginForm.username === "admin" && loginForm.password === "0969745670") {
      setIsLoggedIn(true);
      setLoginError("");
      localStorage.setItem("adminLoggedIn", "true");
    } else {
      setLoginError("Tài khoản hoặc mật khẩu không đúng!");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("adminLoggedIn");
    navigate("/");
  };

  const handleLoginClose = () => {
    navigate("/");
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchOrders();
      fetchBrandsAndCategories();
      fetchBanners();
      fetchYoutubeUrl();
    }
  }, [isLoggedIn]);

  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders`);
      const data = await response.json();
      const normalizedOrders = data.map((order) => ({
        ...order,
        items: order.items || [],
      }));
      setOrders(normalizedOrders);
    } catch (error) {
      console.error("Lỗi khi lấy đơn hàng:", error);
    }
  };

  const fetchBrandsAndCategories = async () => {
    try {
      const brandsResponse = await fetch(
        `${API_BASE_URL}/products/brands/list`
      );
      const brandsData = await brandsResponse.json();
      setBrands(brandsData);

      const categoriesResponse = await fetch(
        `${API_BASE_URL}/products/categories/list`
      );
      const categoriesData = await categoriesResponse.json();
      setCategories(categoriesData);

      if (brandsData.length > 0) {
        setNewProduct((prev) => ({ ...prev, brand_id: brandsData[0].id }));
      }
      if (categoriesData.length > 0) {
        setNewProduct((prev) => ({
          ...prev,
          category_id: categoriesData[0].id,
        }));
      }
    } catch (error) {
      console.error("Lỗi khi lấy brands/categories:", error);
    }
  };

  const fetchBanners = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/banners`);
      const data = await response.json();
      // Đảm bảo data là array và reverse để banner mới nhất ở cuối
      if (Array.isArray(data)) {
        setBanners(data); // Giữ nguyên thứ tự từ API (cũ -> mới)
      } else {
        console.error("Dữ liệu banners không phải array:", data);
        setBanners([]);
      }
    } catch (error) {
      console.error("Lỗi khi lấy banners:", error);
      setBanners([]);
    }
  };

  const fetchYoutubeUrl = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/settings`);
      const data = await response.json();
      setYoutubeUrl(data.youtube_url || "");
    } catch (error) {
      console.error("Lỗi khi lấy youtube URL:", error);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 10) {
      alert("Chỉ được chọn tối đa 10 ảnh!");
      return;
    }
    const validFiles = files.filter((file) => file.type.startsWith("image/"));
    if (validFiles.length !== files.length) {
      alert("Chỉ được chọn file ảnh!");
      return;
    }
    setSelectedFiles(validFiles);
    const previews = validFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(previews);
  };

  const handleRemovePreview = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previewUrls.filter((_, i) => i !== index);
    URL.revokeObjectURL(previewUrls[index]);
    setSelectedFiles(newFiles);
    setPreviewUrls(newPreviews);
  };

  const handleUploadImages = async () => {
    if (selectedFiles.length === 0) {
      alert("Vui lòng chọn ảnh trước khi upload!");
      return;
    }
    setIsUploading(true);
    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });
      const response = await fetch(`${API_BASE_URL}/upload/multiple`, {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const urls = result.uploaded.map((item) => item.url);
          setUploadedImageUrls(urls);
          setNewProduct((prev) => ({ ...prev, images: urls }));
          alert(`✅ Upload thành công ${result.total_uploaded} ảnh!`);
          previewUrls.forEach((url) => URL.revokeObjectURL(url));
          setSelectedFiles([]);
          setPreviewUrls([]);
        } else {
          alert(
            "❌ Upload thất bại: " +
              (result.errors ? result.errors.join(", ") : "Unknown error")
          );
        }
      } else {
        const error = await response.json();
        alert("❌ Lỗi upload: " + (error.detail || "Không thể upload"));
      }
    } catch (error) {
      console.error("Lỗi khi upload ảnh:", error);
      alert("❌ Lỗi kết nối khi upload ảnh!");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveUploadedImage = (index) => {
    const newUrls = uploadedImageUrls.filter((_, i) => i !== index);
    setUploadedImageUrls(newUrls);
    setNewProduct((prev) => ({ ...prev, images: newUrls }));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (uploadedImageUrls.length === 0) {
      alert("Vui lòng upload ít nhất 1 ảnh cho sản phẩm!");
      return;
    }
    const productData = {
      name: newProduct.name,
      brand_id: parseInt(newProduct.brand_id),
      category_id: parseInt(newProduct.category_id),
      price: parseFloat(newProduct.price),
      description: newProduct.description,
      images: uploadedImageUrls,
    };
    if (
      !productData.brand_id ||
      !productData.category_id ||
      isNaN(productData.price) ||
      productData.price <= 0
    ) {
      alert("Vui lòng điền đầy đủ thông tin hợp lệ (Hãng, Loại, Giá > 0).");
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });
      if (response.ok) {
        const result = await response.json();
        alert(`✅ Thêm sản phẩm "${result.name}" thành công!`);
        setNewProduct({
          name: "",
          category_id: categories.length > 0 ? categories[0].id : "",
          brand_id: brands.length > 0 ? brands[0].id : "",
          price: "",
          description: "",
          images: [],
        });
        setUploadedImageUrls([]);
        setSelectedFiles([]);
        setPreviewUrls([]);
      } else {
        const error = await response.json();
        alert(
          "❌ Lỗi khi thêm sản phẩm: " + JSON.stringify(error.detail || error)
        );
      }
    } catch (error) {
      console.error("Lỗi khi thêm sản phẩm:", error);
      alert("❌ Lỗi khi thêm sản phẩm!");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };

  // === BANNER FUNCTIONS ===
  const handleUploadBannerImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Chỉ được chọn file ảnh!");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        const result = await response.json();
        setBannerImageUrl(result.url);
        alert("✅ Upload ảnh banner thành công!");
      } else {
        alert("❌ Lỗi upload ảnh banner");
      }
    } catch (error) {
      console.error("Lỗi upload:", error);
      alert("❌ Lỗi kết nối");
    }
  };

  const handleAddBanner = async (e) => {
    e.preventDefault();
    if (!bannerImageUrl) {
      alert("Vui lòng upload ảnh banner!");
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/banners`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newBanner.title || null,
          content: newBanner.content || null,
          image_url: bannerImageUrl,
        }),
      });
      if (response.ok) {
        alert("✅ Thêm banner thành công!");
        setNewBanner({ title: "", content: "", image_url: "" });
        setBannerImageUrl("");
        fetchBanners();
      } else {
        alert("❌ Lỗi khi thêm banner");
      }
    } catch (error) {
      console.error("Lỗi:", error);
      alert("❌ Lỗi kết nối");
    }
  };

  const handleDeleteBanner = async (bannerId) => {
    if (!window.confirm("Bạn có chắc muốn xóa banner này?")) return;
    try {
      const response = await fetch(`${API_BASE_URL}/banners/${bannerId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        alert("✅ Xóa banner thành công!");
        fetchBanners();
      } else {
        alert("❌ Lỗi khi xóa banner");
      }
    } catch (error) {
      console.error("Lỗi:", error);
      alert("❌ Lỗi kết nối");
    }
  };

  // === YOUTUBE URL FUNCTION ===
  const handleUpdateYoutubeUrl = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ youtube_url: youtubeUrl }),
      });
      if (response.ok) {
        alert("✅ Cập nhật link Youtube thành công!");
      } else {
        alert("❌ Lỗi khi cập nhật");
      }
    } catch (error) {
      console.error("Lỗi:", error);
      alert("❌ Lỗi kết nối");
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-8">
          <button
            onClick={handleLoginClose}
            className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-red-600"
          >
            ✕
          </button>
          <h2 className="text-3xl font-bold text-blue-800 mb-6 text-center">
            Đăng Nhập Admin
          </h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Tài khoản
              </label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, username: e.target.value })
                }
                className="w-full p-3 border rounded-lg outline-none focus:border-blue-800"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Mật khẩu</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, password: e.target.value })
                }
                className="w-full p-3 border rounded-lg outline-none focus:border-blue-800"
                required
              />
            </div>
            {loginError && (
              <p className="text-red-600 text-sm text-center">{loginError}</p>
            )}
            <button
              type="submit"
              className="w-full bg-blue-800 text-white py-3 rounded-lg hover:bg-blue-900 transition font-semibold"
            >
              Đăng Nhập
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-28 md:pt-32 pb-6">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Layout: Sidebar + Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* SIDEBAR */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-lg p-4 sticky top-32">
              <h2 className="text-xl font-bold text-blue-800 mb-4">
                Admin Menu
              </h2>
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab("add-product")}
                  className={`w-full text-left px-4 py-3 rounded-lg transition ${
                    activeTab === "add-product"
                      ? "bg-blue-800 text-white font-semibold"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  Thêm Sản Phẩm
                </button>
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`w-full text-left px-4 py-3 rounded-lg transition ${
                    activeTab === "orders"
                      ? "bg-blue-800 text-white font-semibold"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  Đơn Hàng ({orders.length})
                </button>
                <button
                  onClick={() => setActiveTab("banners")}
                  className={`w-full text-left px-4 py-3 rounded-lg transition ${
                    activeTab === "banners"
                      ? "bg-blue-800 text-white font-semibold"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  Quản lý Banner
                </button>
                <button
                  onClick={() => setActiveTab("popup")}
                  className={`w-full text-left px-4 py-3 rounded-lg transition ${
                    activeTab === "popup"
                      ? "bg-blue-800 text-white font-semibold"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  Thay đổi Popup
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition"
                >
                  Đăng xuất
                </button>
              </nav>
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div className="flex-1">
            {/* Thêm Sản Phẩm */}
            {activeTab === "add-product" && (
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-6 text-blue-800">
                  Thêm Sản Phẩm Mới
                </h2>
                <form onSubmit={handleAddProduct}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Tên sản phẩm *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={newProduct.name}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Giá (VNĐ) *
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={newProduct.price}
                        onChange={handleInputChange}
                        required
                        min="0"
                        className="w-full p-3 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Loại sản phẩm *
                      </label>
                      <select
                        name="category_id"
                        value={newProduct.category_id}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border rounded-lg"
                      >
                        <option value="">Chọn loại</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Hãng *
                      </label>
                      <select
                        name="brand_id"
                        value={newProduct.brand_id}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border rounded-lg"
                      >
                        <option value="">Chọn hãng</option>
                        {brands.map((brand) => (
                          <option key={brand.id} value={brand.id}>
                            {brand.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                      Mô tả *
                    </label>
                    <textarea
                      name="description"
                      value={newProduct.description}
                      onChange={handleInputChange}
                      required
                      rows="3"
                      className="w-full p-3 border rounded-lg"
                    />
                  </div>
                  <div className="mb-4 p-4 border-2 border-dashed rounded-lg">
                    <label className="block text-sm font-medium mb-2">
                      Ảnh sản phẩm *
                    </label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="w-full p-2 border rounded-lg mb-2"
                    />
                    {previewUrls.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-medium mb-2">
                          Preview ({previewUrls.length} ảnh):
                        </p>
                        <div className="grid grid-cols-4 gap-2">
                          {previewUrls.map((url, index) => (
                            <div key={index} className="relative">
                              <img
                                src={url}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-20 object-cover rounded"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemovePreview(index)}
                                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={handleUploadImages}
                          disabled={isUploading}
                          className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg"
                        >
                          {isUploading ? "Đang upload..." : "Upload ảnh"}
                        </button>
                      </div>
                    )}
                    {uploadedImageUrls.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2 text-green-600">
                          ✅ Đã upload {uploadedImageUrls.length} ảnh:
                        </p>
                        <div className="grid grid-cols-4 gap-2">
                          {uploadedImageUrls.map((url, index) => (
                            <div key={index} className="relative">
                              <img
                                src={url}
                                alt={`Uploaded ${index + 1}`}
                                className="w-full h-20 object-cover rounded border-2 border-green-500"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveUploadedImage(index)}
                                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-blue-800 text-white py-3 rounded-lg hover:bg-blue-900"
                  >
                    Thêm Sản Phẩm
                  </button>
                </form>
              </div>
            )}

            {/* Đơn Hàng */}
            {activeTab === "orders" && (
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-6 text-blue-800">
                  Danh Sách Đơn Hàng
                </h2>
                {orders.length === 0 ? (
                  <p className="text-center text-gray-500 py-6">
                    Chưa có đơn hàng
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-blue-800 text-white">
                        <tr>
                          <th className="px-4 py-3 text-left">Mã ĐH</th>
                          <th className="px-4 py-3 text-left">Khách hàng</th>
                          <th className="px-4 py-3 text-left">SĐT</th>
                          <th className="px-4 py-3 text-right">Tổng tiền</th>
                          <th className="px-4 py-3 text-center">Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr
                            key={order.id}
                            className="border-b hover:bg-blue-50/50"
                          >
                            <td className="px-4 py-3 font-medium text-blue-600">
                              #{order.id}
                            </td>
                            <td className="px-4 py-3">{order.customer_name}</td>
                            <td className="px-4 py-3">
                              {order.customer_phone}
                            </td>
                            <td className="px-4 py-3 font-bold text-red-600 text-right">
                              {order.total_price
                                ? order.total_price.toLocaleString("vi-VN")
                                : 0}{" "}
                              VNĐ
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => handleViewOrderDetails(order)}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded"
                              >
                                Chi tiết
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Quản lý Banner */}
            {activeTab === "banners" && (
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-6 text-blue-800">
                  Quản lý Banner
                </h2>

                {/* Form thêm banner */}
                <form
                  onSubmit={handleAddBanner}
                  className="mb-8 p-4 bg-gray-50 rounded-lg border"
                >
                  <h3 className="text-lg font-bold mb-4">Thêm Banner Mới</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Tiêu đề (không bắt buộc)
                      </label>
                      <input
                        type="text"
                        value={newBanner.title}
                        onChange={(e) =>
                          setNewBanner({ ...newBanner, title: e.target.value })
                        }
                        className="w-full p-3 border rounded-lg"
                        placeholder="Nhập tiêu đề banner..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Nội dung (không bắt buộc)
                      </label>
                      <textarea
                        value={newBanner.content}
                        onChange={(e) =>
                          setNewBanner({
                            ...newBanner,
                            content: e.target.value,
                          })
                        }
                        rows="3"
                        className="w-full p-3 border rounded-lg"
                        placeholder="Nhập nội dung banner..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Ảnh Banner *
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUploadBannerImage}
                        className="w-full p-2 border rounded-lg mb-2"
                      />
                      {bannerImageUrl && (
                        <div className="mt-2">
                          <img
                            src={bannerImageUrl}
                            alt="Banner preview"
                            className="w-full max-w-md h-48 object-cover rounded border-2 border-green-500"
                          />
                        </div>
                      )}
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-blue-800 hover:bg-blue-900 text-white py-3 rounded-lg font-semibold"
                    >
                      Thêm Banner
                    </button>
                  </div>
                </form>

                {/* Danh sách banner */}
                <div>
                  <h3 className="text-lg font-bold mb-4">
                    Danh sách Banner ({banners.length})
                  </h3>
                  {banners.length === 0 ? (
                    <p className="text-center text-gray-500 py-6">
                      Chưa có banner nào
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {banners.map((banner) => (
                        <div
                          key={banner.id}
                          className="border rounded-lg p-4 bg-white shadow hover:shadow-lg transition relative"
                        >
                          <button
                            onClick={() => handleDeleteBanner(banner.id)}
                            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold hover:bg-red-700"
                          >
                            ✕
                          </button>
                          <img
                            src={banner.image_url}
                            alt={banner.title || "Banner"}
                            className="w-full h-40 object-cover rounded mb-3"
                          />
                          {banner.title && (
                            <h4 className="font-bold text-lg mb-2">
                              {banner.title}
                            </h4>
                          )}
                          {banner.content && (
                            <p className="text-gray-600 text-sm">
                              {banner.content}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-2">
                            ID: {banner.id}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Thay đổi Popup */}
            {activeTab === "popup" && (
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-6 text-blue-800">
                  Thay đổi Popup Video
                </h2>
                <form onSubmit={handleUpdateYoutubeUrl} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Link Youtube URL
                    </label>
                    <input
                      type="text"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      className="w-full p-3 border rounded-lg"
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Nhập link Youtube đầy đủ (ví dụ:
                      https://www.youtube.com/watch?v=VbDRho-BUTQ)
                    </p>
                  </div>
                  {youtubeUrl && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium mb-2">Preview:</p>
                      <p className="text-sm text-gray-700 break-all">
                        {youtubeUrl}
                      </p>
                    </div>
                  )}
                  <button
                    type="submit"
                    className="w-full bg-blue-800 hover:bg-blue-900 text-white py-3 rounded-lg font-semibold"
                  >
                    Cập nhật Link Youtube
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      <OrderDetailModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
};

export default Admin;
