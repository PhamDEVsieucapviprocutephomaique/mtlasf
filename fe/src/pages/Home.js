import React, { useState, useEffect } from "react";
import HeroSlider from "../components/HeroSlider";
import ProductSection from "../components/ProductSection";
import CategoryNav from "../components/CategoryNav";
import NewsSection from "../components/NewsSection";
import VideoModal from "../components/VideoModal";

const Home = () => {
  const [productGroups, setProductGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const API_BASE_URL = "http://api.thanhdanhluxury.vn/api";

  // Data tin tức (Giữ nguyên)
  const news = [
    {
      id: 1,
      title: "Xu hướng màu sơn nội thất 2023",
      excerpt: "Khám phá những màu sắc thịnh hành cho không gian sống",
      date: "15/10/2023",
    },
    {
      id: 2,
      title: "Hướng dẫn chọn sơn phù hợp cho ngôi nhà",
      excerpt: "Bí quyết lựa chọn sơn theo phong cách và không gian",
      date: "10/10/2023",
    },
    {
      id: 3,
      title: "Công nghệ sơn thân thiện môi trường",
      excerpt: "Sơn không mùi, an toàn cho sức khỏe gia đình",
      date: "05/10/2023",
    },
    {
      id: 4,
      title: "Bí quyết bảo quản sơn đúng cách",
      excerpt: "Cách giữ sơn luôn trong tình trạng tốt nhất sau khi mở nắp",
      date: "01/10/2023",
    },
  ];

  const [activeCategory, setActiveCategory] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);

  // Kiểm tra trạng thái đăng nhập admin
  useEffect(() => {
    const checkAdminStatus = () => {
      const adminLoggedIn = localStorage.getItem("adminLoggedIn") === "true";
      setIsAdmin(adminLoggedIn);
    };

    checkAdminStatus();
    // Lắng nghe sự thay đổi localStorage
    window.addEventListener("storage", checkAdminStatus);

    return () => {
      window.removeEventListener("storage", checkAdminStatus);
    };
  }, []);

  // --- LOGIC LẤY DỮ LIỆU TỪ API ---
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Lấy danh sách BRANDS (Hãng Sơn)
      const brandsResponse = await fetch(
        `${API_BASE_URL}/products/brands/list`
      );
      const brandsData = await brandsResponse.json();

      // 2. Lấy danh sách CATEGORIES (Loại Sơn) để Lookup tên
      const categoriesResponse = await fetch(
        `${API_BASE_URL}/products/categories/list`
      );
      const categoriesData = await categoriesResponse.json();

      const categoryMap = categoriesData.reduce((map, cat) => {
        map[cat.id] = cat.name;
        return map;
      }, {});

      // 3. Lấy danh sách TOÀN BỘ sản phẩm
      const productsResponse = await fetch(`${API_BASE_URL}/products`);
      const allProducts = await productsResponse.json();

      // 4. Chuẩn hóa dữ liệu thành format productGroups theo Tên Hãng
      const groups = brandsData
        .map((brand) => {
          const productsInBrand = allProducts.filter(
            (p) =>
              p.brand_name &&
              brand.name &&
              p.brand_name.toUpperCase().trim() ===
                brand.name.toUpperCase().trim()
          );

          const items = productsInBrand.map((p) => {
            // Lookup Tên Loại Sơn
            const categoryNameFromId = p.category_id
              ? categoryMap[p.category_id]
              : p.category_name || "N/A";

            return {
              id: p.id,
              name: p.name,
              price: p.price
                ? p.price.toLocaleString("vi-VN") + " VNĐ"
                : "Liên hệ",
              brand: p.brand_name || brand.name || "N/A",
              categoryName: categoryNameFromId || "N/A",
              image:
                p.images && p.images.length > 0
                  ? p.images[0]
                  : "https://via.placeholder.com/300x200?text=Sơn",
              description:
                p.description || p.content || p.full_description || null,
            };
          });

          return {
            id: brand.id,
            name: brand.name,
            count: productsInBrand.length,
            products: items,
          };
        })
        .filter((group) => group.count > 0);

      setProductGroups(groups);

      if (groups.length > 0) {
        setActiveCategory(groups[0].id);
      }
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu trang chủ:", err);
      setProductGroups([]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- useEffect cho Data Fetching ---
  useEffect(() => {
    fetchData();
  }, []);

  // --- useEffect cho Video Modal ---
  useEffect(() => {
    const hasSeenVideo = localStorage.getItem("hasSeenVideo");
    if (!hasSeenVideo && !isLoading) {
      const timer = setTimeout(() => {
        setShowVideoModal(true);
        localStorage.setItem("hasSeenVideo", "true");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

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
        fetchData();
      } else {
        const error = await response.json();
        alert("❌ Lỗi khi xóa sản phẩm: " + (error.detail || "Không thể xóa"));
      }
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm:", error);
      alert("❌ Lỗi kết nối khi xóa sản phẩm!");
    }
  };

  // --- Logic Xử lý Click ---
  const handleCategoryClick = (categoryId) => {
    setActiveCategory(categoryId);
    const element = document.getElementById(`category-${categoryId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // --- Render UI ---

  if (isLoading) {
    return (
      <div className="pt-24 py-12 min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl text-blue-600 font-medium">
          Đang tải dữ liệu trang chủ...
        </p>
      </div>
    );
  }

  if (productGroups.length === 0 && !isLoading) {
    return (
      <div className="pt-24 py-12 min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl text-red-700 font-medium">
          Không thể tải dữ liệu Hãng Sơn và Sản phẩm. Vui lòng kiểm tra API
          Backend.
        </p>
      </div>
    );
  }

  return (
    <div className="pt-16">
      <VideoModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
      />

      <HeroSlider />

      <CategoryNav
        categories={productGroups}
        activeCategory={activeCategory}
        onCategoryClick={handleCategoryClick}
      />

      <div className="container mx-auto px-4 py-8">
        {productGroups.map((group, index) => (
          <div id={`category-${group.id}`} key={group.id}>
            <ProductSection
              group={group}
              isLast={index === productGroups.length - 1}
              isAdmin={isAdmin}
              onDeleteProduct={handleDeleteProduct}
            />
          </div>
        ))}
      </div>

      <NewsSection news={news} />
    </div>
  );
};

export default Home;
