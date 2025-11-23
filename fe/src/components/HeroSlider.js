import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE_URL = "http://api.thanhdanhluxury.vn/api";

  // Fetch banners từ API
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/banners`);
        const data = await response.json();

        // Chuyển đổi banners thành format slides
        const bannersAsSlides = data.map((banner) => ({
          id: banner.id,
          image: banner.image_url,
          title: banner.title || "", // Không có thì để rỗng, không tự bịa
          subtitle: banner.content || "", // Không có thì để rỗng, không tự bịa
        }));

        // Nếu không có banner nào, dùng slides mặc định
        if (bannersAsSlides.length === 0) {
          setSlides([
            {
              id: 1,
              image:
                "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
              title: "SƠN CAO CẤP - ĐẲNG CẤP HOÀN HẢO",
              subtitle:
                "Khám phá bộ sưu tập sơn đa dạng với chất lượng vượt trội",
            },
          ]);
        } else {
          setSlides(bannersAsSlides);
        }
      } catch (error) {
        console.error("Lỗi khi tải banners:", error);
        // Dùng slides mặc định nếu lỗi
        setSlides([
          {
            id: 1,
            image:
              "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
            title: "SƠN CAO CẤP - ĐẲNG CẤP HOÀN HẢO",
            subtitle:
              "Khám phá bộ sưu tập sơn đa dạng với chất lượng vượt trội",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // Tự động chuyển slide
  useEffect(() => {
    if (slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  if (isLoading) {
    return (
      <div className="h-[700px] flex items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-600">Đang tải banner...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden mt-0">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`${index === currentSlide ? "block" : "hidden"}`}
        >
          <div className="relative w-full">
            <img
              src={slide.image}
              alt={slide.title || "Banner"}
              className="w-full h-auto object-contain bg-gray-900"
              style={{
                imageRendering: "-webkit-optimize-contrast",
                maxHeight: "80vh",
              }}
              loading="eager"
              fetchpriority="high"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/20"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div className="text-center text-white px-4 sm:px-6 max-w-6xl pointer-events-auto">
              {slide.title && (
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4 md:mb-6 drop-shadow-2xl leading-tight">
                  {slide.title}
                </h1>
              )}
              {slide.subtitle && (
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl mb-4 sm:mb-6 md:mb-10 drop-shadow-2xl leading-relaxed">
                  {slide.subtitle}
                </p>
              )}
              {/* <Link
                to="/san-pham"
                className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-6 sm:py-3 sm:px-10 md:py-4 md:px-16 rounded-lg text-sm sm:text-base md:text-lg lg:text-xl transition duration-300 shadow-2xl hover:shadow-red-600/50"
              >
                KHÁM PHÁ NGAY
              </Link> */}
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows - chỉ hiện khi có nhiều hơn 1 slide */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white p-2 sm:p-3 rounded-full transition duration-300 z-20"
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white p-2 sm:p-3 rounded-full transition duration-300 z-20"
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 sm:space-x-3 z-20">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition duration-300 ${
                  index === currentSlide ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default HeroSlider;
