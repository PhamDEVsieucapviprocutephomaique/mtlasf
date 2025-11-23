import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const NewsSection = () => {
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE_URL = "http://api.thanhdanhluxury.vn/api";

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/news`);
        const data = await response.json();
        if (Array.isArray(data)) {
          setNews(data.slice(0, 4)); // Chỉ lấy 4 tin mới nhất
        }
      } catch (error) {
        console.error("Lỗi khi tải tin tức:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (isLoading) {
    return (
      <div className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-blue-800 mb-6">
            TIN TỨC NỔI BẬT
          </h2>
          <p className="text-center text-gray-500">Đang tải tin tức...</p>
        </div>
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-blue-800 mb-6">
            TIN TỨC NỔI BẬT
          </h2>
          <p className="text-center text-gray-500">Chưa có tin tức nào</p>
        </div>
      </div>
    );
  }

  const featuredNews = news[0];
  const otherNews = news.slice(1);

  return (
    <div className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-blue-800 mb-8">
          TIN TỨC NỔI BẬT
        </h2>

        {/* Featured News */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8 hover:shadow-xl transition duration-300">
          <div className="md:flex">
            <div className="md:w-2/5">
              <div className="h-64 bg-gray-100 flex items-center justify-center overflow-hidden">
                {featuredNews.images && featuredNews.images[0] ? (
                  <img
                    src={featuredNews.images[0]}
                    alt={featuredNews.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400">Không có ảnh</div>
                )}
              </div>
            </div>
            <div className="md:w-3/5 p-6">
              <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-medium mb-3 inline-block">
                Tin tức mới
              </span>
              <h2 className="text-2xl font-bold text-gray-800 mb-3 line-clamp-2">
                {featuredNews.title}
              </h2>
              <p className="text-gray-600 text-base mb-4 line-clamp-3">
                {featuredNews.content}
              </p>
              <Link
                to="/tin-tuc"
                className="inline-block bg-blue-800 hover:bg-blue-900 text-white px-5 py-2 rounded text-sm font-semibold transition duration-300"
              >
                Đọc tiếp →
              </Link>
            </div>
          </div>
        </div>

        {/* Other News */}
        {otherNews.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherNews.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition duration-300"
              >
                <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                  {item.images && item.images[0] ? (
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-400">Không có ảnh</div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 text-gray-800 line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {item.content}
                  </p>
                  <Link
                    to="/tin-tuc"
                    className="text-blue-800 hover:text-blue-900 transition duration-300 text-sm font-medium inline-flex items-center"
                  >
                    Đọc thêm →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsSection;
