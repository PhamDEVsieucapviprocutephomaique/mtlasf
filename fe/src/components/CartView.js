import React, { useState, useEffect } from "react";
import { getCartItems, removeFromCart } from "../utils/cartUtils";

const CartView = ({ isOpen, onClose }) => {
  const [localCartItems, setLocalCartItems] = useState([]);
  const [showConsultForm, setShowConsultForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // const API_BASE_URL = "http://api.thanhdanhluxury.vn/api";
  const API_BASE_URL = "http://localhost:8000/api";

  useEffect(() => {
    if (isOpen) {
      setLocalCartItems(getCartItems());
    }
  }, [isOpen]);

  const handleRemove = (productId) => {
    removeFromCart(productId);
    setLocalCartItems(getCartItems());
  };

  const handleIncreaseQuantity = (productId) => {
    setLocalCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const handleDecreaseQuantity = (productId) => {
    setLocalCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  const parsePrice = (priceStr) => {
    return parseFloat(priceStr.replace(/[^\d]/g, "")) || 0;
  };

  const calculateTotal = () => {
    return localCartItems.reduce((total, item) => {
      const price = parsePrice(item.price);
      return total + price * item.quantity;
    }, 0);
  };

  const totalQuantity = localCartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.address) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    if (localCartItems.length === 0) {
      alert("Giỏ hàng trống, vui lòng thêm sản phẩm!");
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        customer_name: formData.name,
        customer_phone: formData.phone,
        customer_address: formData.address,
        items: localCartItems.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
        })),
      };

      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const result = await response.json();
        alert(
          `✅ Đơn hàng #${
            result.id
          } đã được gửi thành công!\nTổng tiền: ${result.total_price.toLocaleString(
            "vi-VN"
          )} VNĐ`
        );

        localStorage.removeItem("shoppingCart");
        setLocalCartItems([]);
        setFormData({ name: "", phone: "", address: "" });
        setShowConsultForm(false);
        onClose();
      } else {
        const error = await response.json();
        alert("❌ Lỗi: " + (error.detail || "Không thể gửi đơn hàng"));
      }
    } catch (error) {
      console.error("Lỗi khi gửi đơn hàng:", error);
      alert("❌ Lỗi kết nối API. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const CartItem = ({ item }) => {
    const itemPrice = parsePrice(item.price);
    const itemTotal = itemPrice * item.quantity;

    return (
      <div className="flex justify-between items-start py-4 px-4 bg-white border border-gray-200 rounded-lg mb-4">
        <div className="flex items-center space-x-4 flex-grow">
          <img
            src={item.image}
            alt={item.name}
            className="w-16 h-16 object-cover rounded flex-shrink-0"
          />

          <div className="flex-grow min-w-0">
            <h4 className="font-semibold text-gray-800 text-base line-clamp-2">
              {item.name}
            </h4>
            <p className="text-sm text-gray-500">Hãng: {item.brand}</p>
            <p className="text-sm text-red-600 font-bold mt-1">
              {itemPrice.toLocaleString("vi-VN")} VNĐ
            </p>

            <div className="flex items-center space-x-2 mt-3">
              <button
                onClick={() => handleDecreaseQuantity(item.id)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold w-7 h-7 rounded transition text-sm"
              >
                −
              </button>
              <span className="text-blue-600 font-bold w-8 text-center text-base">
                {item.quantity}
              </span>
              <button
                onClick={() => handleIncreaseQuantity(item.id)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold w-7 h-7 rounded transition text-sm"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end ml-3 flex-shrink-0">
          <p className="text-sm text-red-600 font-bold">
            {itemTotal.toLocaleString("vi-VN")} VNĐ
          </p>
          <button
            onClick={() => handleRemove(item.id)}
            className="text-red-500 hover:text-red-700 text-xl font-bold mt-2"
            title="Xóa sản phẩm"
          >
            ✕
          </button>
        </div>
      </div>
    );
  };

  const totalPrice = calculateTotal();

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-lg bg-white shadow-2xl overflow-hidden flex flex-col mt-16">
        <div className="p-5 border-b flex justify-between items-center bg-white flex-shrink-0">
          <h3 className="text-2xl font-bold text-blue-800">
            🛒 Giỏ Hàng ({localCartItems.length})
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 text-3xl font-light leading-none w-10 h-10 flex items-center justify-center"
            title="Đóng giỏ hàng"
          >
            ✕
          </button>
        </div>

        {!showConsultForm ? (
          <>
            <div className="flex-grow overflow-y-auto p-5">
              {localCartItems.length === 0 ? (
                <p className="text-center text-gray-500 py-10 text-lg">
                  Giỏ hàng của bạn hiện đang trống.
                </p>
              ) : (
                <div>
                  {localCartItems.map((item, index) => (
                    <CartItem key={index} item={item} />
                  ))}
                </div>
              )}
            </div>

            <div className="p-5 border-t bg-gray-50 flex-shrink-0">
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <div className="flex justify-between mb-3">
                  <span className="text-base text-gray-700">Số sản phẩm:</span>
                  <span className="font-bold text-gray-800 text-base">
                    {localCartItems.length}
                  </span>
                </div>
                <div className="flex justify-between mb-3">
                  <span className="text-base text-gray-700">
                    Tổng số lượng:
                  </span>
                  <span className="font-bold text-gray-800 text-base">
                    {totalQuantity}
                  </span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="font-bold text-gray-800 text-lg">
                    Tổng tiền:
                  </span>
                  <span className="font-bold text-xl text-red-600">
                    {totalPrice.toLocaleString("vi-VN")} VNĐ
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowConsultForm(true)}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition duration-200 mb-3 text-center text-lg"
              >
                TƯ VẤN NGAY VỀ ĐƠN HÀNG
              </button>
              <button
                onClick={onClose}
                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-lg transition duration-200 text-lg"
              >
                Tiếp tục mua hàng
              </button>
            </div>
          </>
        ) : (
          <>
            <form
              onSubmit={handleSubmitOrder}
              className="flex-grow overflow-y-auto p-5"
            >
              <h3 className="text-xl font-bold text-blue-800 mb-5">
                Thông tin đặt hàng
              </h3>

              <div className="space-y-4 mb-5">
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    Tên khách hàng *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    placeholder="Nhập tên của bạn"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500 text-base"
                    required
                  />
                </div>

                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    Số điện thoại *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                    placeholder="Nhập số điện thoại"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500 text-base"
                    required
                  />
                </div>

                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    Địa chỉ giao hàng *
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleFormChange}
                    placeholder="Nhập địa chỉ chi tiết"
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500 text-base resize-none"
                    required
                  ></textarea>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h4 className="font-bold text-gray-800 mb-3 text-base">
                    Tóm tắt đơn hàng
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Số sản phẩm:</span>
                      <span className="font-bold text-base">
                        {localCartItems.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tổng số lượng:</span>
                      <span className="font-bold text-base">
                        {totalQuantity}
                      </span>
                    </div>
                    <div className="border-t pt-2 flex justify-between">
                      <span className="font-bold text-gray-800 text-base">
                        Tổng tiền:
                      </span>
                      <span className="font-bold text-red-600 text-lg">
                        {totalPrice.toLocaleString("vi-VN")} VNĐ
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </form>

            <div className="p-5 border-t bg-white flex space-x-3 flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowConsultForm(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-lg transition text-base"
              >
                Quay lại
              </button>
              <button
                onClick={handleSubmitOrder}
                disabled={isSubmitting}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition text-base"
              >
                {isSubmitting ? "Đang gửi..." : "Gửi đơn hàng"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartView;
