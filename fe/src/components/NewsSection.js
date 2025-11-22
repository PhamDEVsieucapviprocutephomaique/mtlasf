import React, { useState } from "react";

const NewsSection = ({ news }) => {
  const [imageLoaded, setImageLoaded] = useState({});

  // Sử dụng data từ prop news thay vì data cứng
  const featuredNews =
    news && news.length > 0
      ? news[0]
      : {
          id: 1,
          title: "KOVA - Giải Pháp Sơn Thông Minh",
          excerpt:
            "Sơn KOVA với công nghệ Nano tiên tiến, chống thấm vượt trội và độ bền cao.",
          image:
            "https://image.thanhdanhluxury.vn/img_f72fb88c-6c4b-405d-9098-e679e8bc659d.webp",
          category: "Sơn Cao Cấp",
        };

  const otherNews =
    news && news.length > 1
      ? news.slice(1)
      : [
          {
            id: 2,
            title: "JOTUN - Sơn Công Nghiệp",
            excerpt: "Sơn công nghiệp đáp ứng tiêu chuẩn chất lượng quốc tế.",
            image:
              "https://image.thanhdanhluxury.vn/img_2f385803-82c2-4741-b5b2-dec8f3fc8a4b.webp",
          },
          {
            id: 3,
            title: "DULUX - Thương Hiệu Số 1",
            excerpt: "Màu sắc chuẩn xác và độ phủ cao, tiết kiệm chi phí.",
            image:
              "https://image.thanhdanhluxury.vn/img_d1ba3a95-827f-47ed-9e51-5cc65279472c.webp",
          },
          {
            id: 4,
            title: "SIKA - Sơn Chuyên Dụng",
            excerpt: "Giải pháp sơn kỹ thuật cao cho công trình đặc biệt.",
            image:
              "https://image.thanhdanhluxury.vn/img_5c7bff11-1a57-4325-9566-fdd5ee200b8d.webp",
          },
        ];

  const handleImageLoad = (id) => {
    setImageLoaded((prev) => ({ ...prev, [id]: true }));
  };

  const handleReadMore = () => {
    window.location.href = "/tin-tuc";
  };

  return (
    <div className="py-8 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-center text-blue-800 mb-6">
          TIN TỨC NỔI BẬT
        </h2>

        {/* Featured News */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6 hover:shadow-lg transition duration-300">
          <div className="md:flex">
            <div className="md:w-2/5">
              <div className="relative h-48 bg-gray-100">
                {!imageLoaded[`featured-${featuredNews.id}`] && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                <img
                  src={featuredNews.image}
                  alt={featuredNews.title}
                  className={`w-full h-full object-scale-down p-2 bg-gray-50 ${
                    !imageLoaded[`featured-${featuredNews.id}`]
                      ? "opacity-0"
                      : "opacity-100"
                  } transition-opacity duration-200`}
                  onLoad={() => handleImageLoad(`featured-${featuredNews.id}`)}
                  loading="lazy"
                />
              </div>
            </div>
            <div className="md:w-3/5 p-4">
              <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-medium mb-2 inline-block">
                {featuredNews.category || "Tin Tức"}
              </span>
              <h2 className="text-lg font-bold text-gray-800 mb-2">
                {featuredNews.title}
              </h2>
              <p className="text-gray-600 text-sm mb-3">
                {featuredNews.excerpt}
              </p>
              <button
                onClick={handleReadMore}
                className="bg-blue-800 hover:bg-blue-900 text-white px-3 py-1 rounded text-sm transition duration-300"
              >
                Đọc tiếp
              </button>
            </div>
          </div>
        </div>

        {/* Other News */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {otherNews.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300"
            >
              <div className="h-36 bg-gray-100 relative">
                {!imageLoaded[`news-${item.id}`] && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                <img
                  src={item.image}
                  alt={item.title}
                  className={`w-full h-full object-scale-down p-1 bg-gray-50 ${
                    !imageLoaded[`news-${item.id}`]
                      ? "opacity-0"
                      : "opacity-100"
                  } transition-opacity duration-200`}
                  onLoad={() => handleImageLoad(`news-${item.id}`)}
                  loading="lazy"
                />
              </div>
              <div className="p-3">
                <h3 className="font-bold text-base mb-2 text-gray-800">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-xs mb-2">{item.excerpt}</p>
                <button
                  onClick={handleReadMore}
                  className="text-blue-800 hover:text-red-600 transition duration-300 text-xs font-medium"
                >
                  Đọc thêm
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewsSection;
