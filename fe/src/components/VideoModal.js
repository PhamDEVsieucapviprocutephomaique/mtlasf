import React, { useEffect, useState } from "react";

const VideoModal = ({ isOpen, onClose }) => {
  const [youtubeEmbedUrl, setYoutubeEmbedUrl] = useState("");
  const API_BASE_URL = "http://api.thanhdanhluxury.vn/api";

  useEffect(() => {
    // Fetch Youtube URL từ settings API
    const fetchYoutubeUrl = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/settings/youtube/url`);
        const data = await response.json();

        if (data.youtube_url) {
          // Chuyển đổi Youtube URL sang embed URL
          const embedUrl = convertToEmbedUrl(data.youtube_url);
          setYoutubeEmbedUrl(embedUrl);
        } else {
          // Dùng URL mặc định nếu chưa có
          setYoutubeEmbedUrl("https://www.youtube.com/embed/VbDRho-BUTQ");
        }
      } catch (error) {
        console.error("Lỗi khi lấy Youtube URL:", error);
        // Dùng URL mặc định nếu lỗi
        setYoutubeEmbedUrl("https://www.youtube.com/embed/VbDRho-BUTQ");
      }
    };

    if (isOpen) {
      fetchYoutubeUrl();
    }
  }, [isOpen]);

  // Hàm chuyển đổi Youtube URL sang embed URL
  const convertToEmbedUrl = (url) => {
    if (!url) return "";

    // Nếu đã là embed URL, return luôn
    if (url.includes("youtube.com/embed/")) {
      return url;
    }

    // Xử lý các dạng URL khác nhau
    let videoId = "";

    // Dạng: https://www.youtube.com/watch?v=VIDEO_ID
    if (url.includes("youtube.com/watch?v=")) {
      videoId = url.split("v=")[1];
      const ampersandPosition = videoId.indexOf("&");
      if (ampersandPosition !== -1) {
        videoId = videoId.substring(0, ampersandPosition);
      }
    }
    // Dạng: https://youtu.be/VIDEO_ID
    else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1];
      const questionPosition = videoId.indexOf("?");
      if (questionPosition !== -1) {
        videoId = videoId.substring(0, questionPosition);
      }
    }

    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }

    // Nếu không parse được, return URL gốc
    return url;
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Background Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-80"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-4xl mx-auto">
        {/* Close Button */}
        <button
          className="absolute -top-10 right-0 text-white text-3xl hover:text-red-500 transition duration-300 z-10 bg-black bg-opacity-50 rounded-full w-8 h-8 flex items-center justify-center"
          onClick={onClose}
        >
          ✕
        </button>

        {/* Video Container */}
        <div className="relative pt-[56.25%] bg-black rounded-t-lg">
          {youtubeEmbedUrl ? (
            <iframe
              className="absolute top-0 left-0 w-full h-full rounded-t-lg"
              src={youtubeEmbedUrl}
              title="Video Popup"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
          ) : (
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-white">
              <p>Đang tải video...</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-100 rounded-b-lg text-center">
          <p className="text-gray-600 text-sm md:text-base">
            Công ty Thanhdanh - Chất lượng tạo nên thương hiệu
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;
