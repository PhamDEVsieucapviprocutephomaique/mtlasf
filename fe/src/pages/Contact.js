import React from "react";

const Contact = () => {
  const handleMapClick = () => {
    window.open(
      "https://www.google.com/maps/search/h%E1%BB%8Dc+vi%E1%BB%87n+c%C3%B4ng+ngh%E1%BB%87+b%C6%B0u+ch%C3%ADnh+vi%E1%BB%85n+th%C3%B4ng+/@20.9813479,105.7914022,14z/data=!3m1!4b1?hl=vi&entry=ttu&g_ep=EgoyMDI1MTExNy4wIKXMDSoASAFQAw%3D%3D",
      "_blank"
    );
  };

  return (
    <div className="pt-24 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center text-blue-800 mb-8"></h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* THÔNG TIN LIÊN HỆ */}
          <div>
            <h2 className="text-2xl font-bold text-blue-800 mb-6">
              THÔNG TIN LIÊN HỆ
            </h2>

            <div className="space-y-4 mb-8">
              <div className="flex items-start">
                <div className="bg-blue-800 text-white p-3 rounded-lg mr-4">
                  📍
                </div>
                <div>
                  <h3 className="font-bold text-lg">Địa chỉ</h3>
                  <p className="text-gray-600">
                    Học viện Công nghệ Bưu chính Viễn thông, Hà Nội
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-blue-800 text-white p-3 rounded-lg mr-4">
                  📞
                </div>
                <div>
                  <h3 className="font-bold text-lg">Điện thoại</h3>
                  <p className="text-gray-600">0969745670</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-blue-800 text-white p-3 rounded-lg mr-4">
                  ✉️
                </div>
                <div>
                  <h3 className="font-bold text-lg">Email</h3>
                  <p className="text-gray-600">info@thanhdanhluxury.com</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-blue-800 text-white p-3 rounded-lg mr-4">
                  ⏰
                </div>
                <div>
                  <h3 className="font-bold text-lg">Giờ làm việc</h3>
                  <p className="text-gray-600">Thứ 2 - Thứ 7: 8:00 - 18:00</p>
                  <p className="text-gray-600">Chủ nhật: 8:00 - 12:00</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-100 p-6 rounded-lg">
              <h3 className="font-bold text-lg mb-4">Bản đồ</h3>
              <div
                onClick={handleMapClick}
                className="h-64 bg-gradient-to-br from-blue-200 to-blue-300 rounded-lg flex items-center justify-center cursor-pointer hover:from-blue-300 hover:to-blue-400 transition duration-300"
              >
                <span className="text-blue-800 font-medium text-center">
                  Click để xem bản đồ Google Maps
                </span>
              </div>
            </div>
          </div>

          {/* GIỚI THIỆU VỀ THANHDANHLUXURY */}
          <div>
            <h2 className="text-2xl font-bold text-blue-800 mb-6">
              VỀ THANHDANHLUXURY
            </h2>
            <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-blue-800 mb-3">
                    Sơn Thanhdanhluxury - Chất lượng vượt trội
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Chúng tôi tự hào là đơn vị cung cấp các sản phẩm sơn cao
                    cấp, chính hãng với chất lượng được kiểm định nghiêm ngặt.
                    Với nhiều năm kinh nghiệm trong ngành, Thanhdanhluxury cam
                    kết mang đến cho khách hàng những giải pháp sơn tốt nhất.
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-bold text-blue-800 mb-3">
                    Cam kết của chúng tôi:
                  </h4>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">✓</span>
                      <span>Hàng chính hãng 100%, xuất xứ rõ ràng</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">✓</span>
                      <span>Giá cả cạnh tranh, hợp lý nhất thị trường</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">✓</span>
                      <span>Tư vấn chuyên nghiệp, nhiệt tình</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">✓</span>
                      <span>Giao hàng nhanh chóng, đúng hẹn</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">✓</span>
                      <span>Bảo hành uy tín, hậu mãi chu đáo</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gradient-to-r from-blue-800 to-blue-900 p-6 rounded-lg text-white">
                  <h4 className="font-bold text-xl mb-3">
                    Sứ mệnh của chúng tôi
                  </h4>
                  <p className="leading-relaxed">
                    Mang đến không gian sống đẹp và bền vững cho mọi gia đình
                    Việt Nam với những sản phẩm sơn chất lượng cao, an toàn và
                    thân thiện với môi trường.
                  </p>
                </div>

                <div className="text-center pt-4">
                  <p className="text-gray-600 italic mb-4">
                    "Chất lượng tạo nên thương hiệu - Uy tín tạo nên sự tin
                    tưởng"
                  </p>
                  <a
                    href="tel:0969745670"
                    className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300"
                  >
                    📞 Liên hệ tư vấn: 0969745670
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
