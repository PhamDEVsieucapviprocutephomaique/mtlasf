import React, { useState, useEffect, useCallback } from "react";
import { addToCart } from "../utils/cartUtils";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  // State cho bộ lọc, sử dụng 0 để đại diện cho "Tất cả"
  const [selectedBrandId, setSelectedBrandId] = useState(0);
  const [selectedCategoryId, setSelectedCategoryId] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = "http://api.thanhdanhluxury.vn/api";

  // Kiểm tra trạng thái đăng nhập admin
  useEffect(() => {
    const checkAdminStatus = () => {
      const adminLoggedIn = localStorage.getItem("adminLoggedIn") === "true";
      setIsAdmin(adminLoggedIn);
    };

    checkAdminStatus();
    window.addEventListener("storage", checkAdminStatus);

    return () => {
      window.removeEventListener("storage", checkAdminStatus);
    };
  }, []);

  // --- HÀM GỌI API LẤY SẢN PHẨM ---
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let queryString = "";

      if (selectedBrandId > 0) {
        queryString += `brand_id=${selectedBrandId}`;
      }

      if (selectedCategoryId > 0) {
        queryString +=
          (queryString.length > 0 ? "&" : "") +
          `category_id=${selectedCategoryId}`;
      }

      const url = `${API_BASE_URL}/products${
        queryString ? "?" + queryString : ""
      }`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Lỗi HTTP: ${response.status}`);
      }

      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error("Lỗi khi lấy dữ liệu sản phẩm:", err);
      setError("Không thể tải sản phẩm. Vui lòng kiểm tra kết nối API.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedBrandId, selectedCategoryId]);

  // --- HÀM GỌI API LẤY DỮ LIỆU LỌC ---
  const fetchFilters = async () => {
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
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu lọc:", err);
    }
  };

  // --- Hàm xóa sản phẩm ---
  const handleDeleteProduct = async (productId, productName) => {
    if (!window.confirm(`Bạn có chắc muốn xóa sản phẩm "${productName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("✅ Xóa sản phẩm thành công!");
        // Load lại dữ liệu
        fetchProducts();
      } else {
        const error = await response.json();
        alert("❌ Lỗi khi xóa sản phẩm: " + (error.detail || "Không thể xóa"));
      }
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm:", error);
      alert("❌ Lỗi kết nối khi xóa sản phẩm!");
    }
  };

  // --- EFFECTS ---
  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // --- Xử lý Thay đổi Bộ lọc ---
  const handleBrandChange = (e) => {
    setSelectedBrandId(parseInt(e.target.value));
  };

  const handleCategoryChange = (e) => {
    setSelectedCategoryId(parseInt(e.target.value));
  };

  // --- Xử lý Thêm vào giỏ ---
  const handleAddToCart = (product) => {
    const cartItem = {
      id: product.id,
      name: product.name,
      brand: product.brand_name || "N/A",
      categoryName: product.category_name || "N/A",
      price: product.price
        ? product.price.toLocaleString("vi-VN") + " VNĐ"
        : "Liên hệ",
      image:
        product.images && product.images.length > 0
          ? product.images[0]
          : "https://via.placeholder.com/300x200?text=Sơn",
      quantity: 1,
    };
    addToCart(cartItem);
    alert("✅ Đã thêm vào giỏ hàng!");
  };

  // --- Render UI ---
  if (isLoading) {
    return (
      <div className="pt-24 py-12 min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl text-blue-600 font-medium">
          Đang tải sản phẩm...
        </p>
      </div>
    );
  }

  return (
    <div className="pt-24 py-12 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center text-blue-800 mb-10"></h1>

        {/* Khu vực Lọc */}
        <div className="bg-white p-6 rounded-lg shadow-xl mb-8 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Bộ lọc sản phẩm
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Lọc theo Hãng (Brand) */}
            <div className="md:col-span-1">
              <label
                htmlFor="brand-filter"
                className="block text-sm font-medium mb-2 text-gray-700"
              >
                Hãng (Brand):
              </label>
              <select
                id="brand-filter"
                value={selectedBrandId}
                onChange={handleBrandChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={0}>-- Tất cả các Hãng --</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Lọc theo Loại Sơn (Category) */}
            <div className="md:col-span-1">
              <label
                htmlFor="category-filter"
                className="block text-sm font-medium mb-2 text-gray-700"
              >
                Loại Sơn (Category):
              </label>
              <select
                id="category-filter"
                value={selectedCategoryId}
                onChange={handleCategoryChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={0}>-- Tất cả các Loại --</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Danh sách sản phẩm */}
        {error && (
          <div className="text-center text-xl text-red-700 py-4 bg-red-100 border border-red-300 rounded-lg mb-6">
            {error}
          </div>
        )}

        {products.length === 0 ? (
          <div className="text-center text-xl text-gray-500 py-16 bg-white rounded-lg shadow-md">
            Không tìm thấy sản phẩm nào phù hợp với bộ lọc hiện tại.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition duration-300 overflow-hidden border border-gray-200 relative"
              >
                {/* Nút xóa sản phẩm - chỉ hiện khi là admin */}
                {isAdmin && (
                  <button
                    onClick={() =>
                      handleDeleteProduct(product.id, product.name)
                    }
                    className="absolute -top-0 -right-0 bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold hover:bg-red-700 transition duration-300 z-10"
                    title="Xóa sản phẩm"
                  >
                    X
                  </button>
                )}

                {/* Ảnh sản phẩm */}
                <div className="h-32 bg-gray-100 overflow-hidden flex items-center justify-center">
                  <img
                    src={
                      product.images && product.images.length > 0
                        ? product.images[0]
                        : "https://via.placeholder.com/200x128?text=No+Image"
                    }
                    alt={product.name}
                    className="max-w-full max-h-full object-scale-down p-1"
                  />
                </div>

                {/* Nội dung sản phẩm */}
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-gray-800 mb-1 h-10 overflow-hidden leading-tight">
                    {product.name}
                  </h3>

                  {/* Thông tin thêm (brand/category) */}
                  <div className="text-xs text-gray-500 mb-2">
                    <p>
                      Hãng:{" "}
                      <span className="font-medium text-red-600">
                        {product.brand_name || "N/A"}
                      </span>
                    </p>
                    <p>
                      Loại:{" "}
                      <span className="font-medium text-blue-700">
                        {product.category_name || "N/A"}
                      </span>
                    </p>
                  </div>

                  {/* Giá */}
                  <div className="text-lg font-bold text-red-600 mb-3">
                    {product.price ? product.price.toLocaleString("vi-VN") : 0}{" "}
                    VNĐ
                  </div>

                  {/* Nút Hành động */}
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="w-full bg-blue-800 text-white text-sm py-1.5 rounded-md hover:bg-blue-900 transition duration-300 font-semibold"
                  >
                    🛒 Thêm vào giỏ
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
