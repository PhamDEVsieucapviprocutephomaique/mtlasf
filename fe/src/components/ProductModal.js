import React from "react";
import { addToCart } from "../utils/cartUtils";

const ProductModal = ({ product, isOpen, onClose }) => {
  if (!isOpen || !product) return null;

  const handleAddToCart = () => {
    addToCart(product);
    alert("✅ Đã thêm vào giỏ hàng!");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4">
      {/* Background */}
      <div
        className="absolute inset-0 bg-black bg-opacity-70"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Close Button */}
        <button
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-2xl sm:text-3xl text-gray-600 hover:text-red-600 transition z-10 bg-white rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center shadow"
          onClick={onClose}
        >
          ✕
        </button>

        <div className="flex flex-col md:flex-row h-full overflow-hidden">
          {/* LEFT: Image - Responsive size */}
          <div className="w-full md:w-2/5 bg-gray-100 overflow-hidden flex items-center justify-center min-h-[120px] md:min-h-[250px]">
            <img
              src={product.image}
              alt={product.name}
              className="max-w-[50%] max-h-[50%] md:max-w-[70%] md:max-h-[70%] object-scale-down p-2 md:p-4"
            />
          </div>

          {/* RIGHT: Product Info */}
          <div className="w-full md:w-3/5 flex flex-col overflow-hidden">
            {/* Scrollable Content */}
            <div className="flex-grow overflow-y-auto p-3 sm:p-5">
              {/* Header */}
              <div className="flex-shrink-0 pb-2 sm:pb-3 border-b">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-1 line-clamp-3">
                  {product.name}
                </h2>
                <p className="text-red-600 font-bold text-base sm:text-lg">
                  {product.price}
                </p>
              </div>

              {/* DESCRIPTION */}
              <div className="mt-3">
                <h3 className="text-base sm:text-lg font-bold text-blue-900 mb-1 sm:mb-2">
                  Mô tả sản phẩm
                </h3>
                <div className="overflow-y-auto max-h-[120px] sm:max-h-[180px]">
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line break-words w-full text-sm">
                    {product.description ||
                      "Không có mô tả chi tiết cho sản phẩm này."}
                  </p>
                </div>
              </div>
            </div>

            {/* FOOTER BUTTONS */}
            <div className="flex-shrink-0 border-t bg-white p-3">
              <div className="flex space-x-2">
                <a
                  href="tel:0969745670"
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg text-sm font-semibold transition text-center"
                >
                  Tư vấn ngay
                </a>
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-blue-800 hover:bg-blue-900 text-white py-2 px-3 rounded-lg text-sm font-semibold transition"
                >
                  Thêm vào giỏ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
