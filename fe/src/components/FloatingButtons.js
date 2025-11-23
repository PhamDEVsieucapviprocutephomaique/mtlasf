import React from "react";

const FloatingButtons = () => {
  return (
    <div className="fixed bottom-6 right-6 z-40 space-y-3">
      {/* Zalo Button */}
      <a
        href="https://zalo.me/0969745670"
        target="_blank"
        rel="noopener noreferrer"
        className="w-12.5 h-14 bg-[#0068FF] rounded-xl shadow-xl flex items-center justify-center text-white hover:bg-[#0055D4] transition duration-300 animate-pulse block"
        title="Chat Zalo"
      >
        {/* Logo Zalo trắng chiếm gần hết */}
        <div className="w-11 h-11 bg-white rounded-lg flex items-center justify-center">
          <span className="text-[#0068FF] font-bold text-1xl leading-none">
            Zalo
          </span>
        </div>
      </a>

      {/* Facebook Button */}
      <a
        href="https://www.facebook.com/ocbuoc.601474"
        target="_blank"
        rel="noopener noreferrer"
        className="w-14 h-14 bg-blue-800 rounded-full shadow-xl flex items-center justify-center text-white text-2xl hover:bg-blue-900 transition duration-300 animate-bounce block"
        title="Facebook"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      </a>

      {/* Phone Button */}
      <a
        href="tel:0969745670"
        className="w-14 h-14 bg-green-500 rounded-full shadow-xl flex items-center justify-center text-white text-2xl hover:bg-green-600 transition duration-300 animate-pulse block"
        title="Gọi ngay"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 15.5c-1.2 0-2.4-.2-3.6-.6-.3-.1-.7 0-1 .2l-2.2 2.2c-2.8-1.4-5.1-3.8-6.6-6.6l2.2-2.2c.3-.3.4-.7.2-1-.3-1.1-.5-2.3-.5-3.5 0-.6-.4-1-1-1H4c-.6 0-1 .4-1 1 0 9.4 7.6 17 17 17 .6 0 1-.4 1-1v-3.5c0-.6-.4-1-1-1zM19 12h2c0-4.9-4-9-9-9v2c3.9 0 7 3.1 7 7zm-4 0h2c0-2.8-2.2-5-5-5v2c1.7 0 3 1.3 3 3z" />
        </svg>
      </a>
    </div>
  );
};

export default FloatingButtons;
