import React from "react";

const Loading = ({ message = "ĐANG TẢI..." }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative">
        <div className="absolute inset-0 overflow-hidden rounded-lg">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute text-green-500 text-xs font-bold"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `matrix ${1 + Math.random() * 2}s linear infinite`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            >
              {Math.random() > 0.5 ? "1" : "0"}
            </div>
          ))}
        </div>

        <div className="relative">
          <div className="w-20 h-20 border-4 border-green-700 rounded-full">
            <div className="w-full h-full border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          </div>

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 border-2 border-green-600 rounded-full animate-ping"></div>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <div className="text-green-400 font-bold mb-2">{message}</div>
        <div className="flex space-x-1 justify-center">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-green-500 rounded-full animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            ></div>
          ))}
        </div>
        <div className="text-xs text-green-600 mt-4">
          ĐANG KẾT NỐI VỚI HỆ THỐNG...
        </div>
      </div>
    </div>
  );
};

export default Loading;
