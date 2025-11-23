import React, { useState, useEffect } from "react";

const News = () => {
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE_URL = "http://api.thanhdanhluxury.vn/api";

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/news`);
        const data = await response.json();
        if (Array.isArray(data)) {
          setNews(data);
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
      <div className="pt-24 py-12 min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl text-blue-600 font-medium">Đang tải tin tức...</p>
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="pt-24 py-12 min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Chưa có tin tức nào
          </h1>
          <p className="text-gray-600">Vui lòng quay lại sau</p>
        </div>
      </div>
    );
  }

  const featuredNews = news[0];
  const otherNews = news.slice(1);

  return (
    <div className="pt-24 py-12 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-center text-blue-800 mb-10"></h1>

        {/* Featured news */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-12 hover:shadow-xl transition duration-300">
          <div className="flex flex-col lg:flex-row">
            <div className="lg:w-2/5">
              <div className="h-80 lg:h-full bg-gray-100 flex items-center justify-center overflow-hidden">
                {featuredNews.images && featuredNews.images[0] ? (
                  <img
                    src={featuredNews.images[0]}
                    alt={featuredNews.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400 text-lg">Không có ảnh</div>
                )}
              </div>
            </div>
            <div className="lg:w-3/5 p-8">
              <span className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4 inline-block">
                Tin tức nổi bật
              </span>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                {featuredNews.title}
              </h2>
              <div className="text-gray-700 text-base leading-relaxed mb-4 whitespace-pre-line">
                {featuredNews.content}
              </div>
              <div className="flex items-center text-sm text-gray-500 mt-6">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
                {new Date(featuredNews.created_at).toLocaleDateString("vi-VN")}
              </div>
            </div>
          </div>
        </div>

        {/* Other news grid */}
        {otherNews.length > 0 && (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Tin tức khác
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {otherNews.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition duration-300"
                >
                  <div className="h-56 bg-gray-100 flex items-center justify-center overflow-hidden">
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
                  <div className="p-6">
                    <h3 className="font-bold text-xl mb-3 text-gray-800 line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-base mb-4 line-clamp-3 leading-relaxed">
                      {item.content}
                    </p>
                    <div className="flex items-center text-sm text-gray-500">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {new Date(item.created_at).toLocaleDateString("vi-VN")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default News;
