import React from "react";

const News = () => {
  const featuredNews = {
    id: 1,
    title: "KOVA - Giải Pháp Sơn Thông Minh Cho Mọi Công Trình",
    excerpt:
      "Sơn KOVA với công nghệ Nano tiên tiến, mang đến khả năng chống thấm vượt trội và độ bền màu theo thời gian. Sản phẩm thân thiện với môi trường và an toàn cho sức khỏe. KOVA cung cấp đa dạng sản phẩm từ sơn nội thất, ngoại thất đến sơn chống thấm đặc biệt.",
    image:
      "https://image.thanhdanhluxury.vn/img_f72fb88c-6c4b-405d-9098-e679e8bc659d.webp",
    category: "Sơn Cao Cấp",
    features: [
      "Chống thấm vượt trội",
      "Độ bền cao",
      "Thân thiện môi trường",
      "Màu sắc đa dạng",
    ],
  };

  const otherNews = [
    {
      id: 2,
      title: "JOTUN - Sơn Công Nghiệp Chất Lượng Quốc Tế",
      excerpt:
        "JOTUN mang đến các dòng sơn công nghiệp đáp ứng tiêu chuẩn khắt khe nhất, bảo vệ công trình trước tác động của thời tiết và môi trường. Với kinh nghiệm hơn 100 năm.",
      image:
        "https://image.thanhdanhluxury.vn/img_2f385803-82c2-4741-b5b2-dec8f3fc8a4b.webp",
      features: [
        "Chống ăn mòn",
        "Bền với thời tiết",
        "Tiết kiệm chi phí",
        "Dễ thi công",
      ],
    },
    {
      id: 3,
      title: "DULUX - Thương Hiệu Sơn Số 1 Thế Giới",
      excerpt:
        "Dulux với công thức độc quyền cho màu sắc chuẩn xác và độ phủ cao, tiết kiệm thời gian và chi phí thi công cho mọi dự án. Là thương hiệu thuộc tập đoàn AkzoNobel.",
      image:
        "https://image.thanhdanhluxury.vn/img_d1ba3a95-827f-47ed-9e51-5cc65279472c.webp",
      features: ["Độ phủ cao", "Màu sắc chuẩn", "Kháng khuẩn", "Không mùi"],
    },
    {
      id: 4,
      title: "SIKA - Giải Pháp Sơn Chuyên Dụng",
      excerpt:
        "Sika chuyên về các dòng sơn kỹ thuật cao, đặc biệt cho các công trình yêu cầu tính chuyên môn và kỹ thuật đặc biệt. Với hệ thống sản phẩm đa dạng từ sơn sàn công nghiệp.",
      image:
        "https://image.thanhdanhluxury.vn/img_5c7bff11-1a57-4325-9566-fdd5ee200b8d.webp",
      features: ["Chuyên dụng", "Độ bền cao", "Chịu lực tốt", "An toàn"],
    },
    {
      id: 5,
      title: "TOA - Sơn Công Nghệ Nhật Bản",
      excerpt:
        "TOA ứng dụng công nghệ sơn hàng đầu từ Nhật Bản, mang đến sự hoàn hảo trong từng lớp sơn với độ bền vượt trội. Với tiêu chuẩn chất lượng Nhật Bản.",
      image:
        "https://image.thanhdanhluxury.vn/img_b8de0dfe-5c09-4233-a2b9-d2ff26ceff54.webp",
      features: ["Công nghệ Nhật", "Chống nấm mốc", "Dễ vệ sinh", "Tiết kiệm"],
    },
  ];

  return (
    <div className="pt-16 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-blue-800 mb-8"></h1>

        {/* Featured news */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8 hover:shadow-lg transition duration-300">
          <div className="flex flex-col lg:flex-row">
            <div className="lg:w-2/5">
              <div className="relative h-64 sm:h-80 lg:h-full">
                <img
                  src={featuredNews.image}
                  alt={featuredNews.title}
                  className="w-full h-full object-contain p-4 bg-gray-50"
                />
              </div>
            </div>
            <div className="lg:w-3/5 p-4 sm:p-6">
              <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium mb-4 inline-block">
                {featuredNews.category}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
                {featuredNews.title}
              </h2>
              <p className="text-gray-600 mb-4 leading-relaxed text-sm sm:text-base">
                {featuredNews.excerpt}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {featuredNews.features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Other news grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {otherNews.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300"
            >
              <div className="flex flex-col sm:flex-row h-auto sm:h-64">
                <div className="sm:w-2/5 h-48 sm:h-auto">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-contain p-4 bg-gray-50"
                  />
                </div>
                <div className="sm:w-3/5 p-4">
                  <h3 className="font-bold text-lg mb-3 text-gray-800 line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 leading-relaxed line-clamp-3">
                    {item.excerpt}
                  </p>
                  <div className="space-y-1">
                    {item.features.map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 flex-shrink-0"></span>
                        <span className="text-xs text-gray-700 line-clamp-1">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
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
