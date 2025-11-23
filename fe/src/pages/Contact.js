import React from "react";
import anh from "../image/anhdiachi.png";

const Contact = () => {
  const handleMapClick = () => {
    window.open(
      "https://www.google.com/maps/place/Ng.+143+%C4%90.+Xu%C3%A2n+Ph%C6%B0%C6%A1ng,+H%C3%A0+N%E1%BB%99i,+Vi%E1%BB%87t+Nam/@21.0356365,105.7391554,17z/data=!3m1!4b1!4m6!3m5!1s0x3134548bfe9279e1:0x719b1ca457a12f54!8m2!3d21.0356365!4d105.7417357!16s%2Fg%2F11bymxvfnz?entry=ttu&g_ep=EgoyMDI1MTExNy4wIKXMDSoASAFQAw%3D%3D",
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
              <br></br>
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
                    143 Xuân Phương, Hà Nội, Việt Nam
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
                className="h-64 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition duration-300"
              >
                <img
                  src={anh}
                  alt="Bản đồ địa chỉ Thanhdanhluxury"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-center text-gray-600 mt-2">
                Click vào ảnh để xem bản đồ Google Maps
              </p>
            </div>
          </div>

          {/* GIỚI THIỆU VỀ THANHDANHLUXURY */}
          <div>
            <h2 className="text-2xl font-bold text-blue-800 mb-6">
              <br></br>
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
