import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-blue-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Thông tin công ty */}
          <div>
            <h3 className="text-xl font-bold mb-4">THANHDANHLUXURY</h3>
            <p className="text-blue-200 mb-4">
              Chuyên cung cấp các loại sơn cao cấp chính hãng: KOVA, JOTUN,
              DULUX, TOA, SIKA, NIPPON, MYLAN, MAXILITE, SEAMASTER, BOSS.
            </p>
            <div className="text-blue-200">
              <p>số 123 thanh danh ha nội</p>
              <p>0969745670</p>
              <p> thanhdanhluxury@gmail.com</p>
            </div>
          </div>

          {/* Các hãng sơn */}
          <div>
            <h4 className="font-bold mb-4">HÃNG SƠN</h4>
            <ul className="space-y-2 text-blue-200">
              <li>• KOVA - Sơn Việt Nam</li>
              <li>• JOTUN - Sơn Na Uy</li>
              <li>• DULUX - Sơn Anh Quốc</li>
              <li>• TOA - Sơn Nhật Bản</li>
              <li>• SIKA - Sơn Thụy Sĩ</li>
              <li>• NIPPON - Sơn Singapore</li>
              <li>• MYLAN - Sơn Hàn Quốc</li>
              <li>• MAXILITE - Sơn Malaysia</li>
            </ul>
          </div>

          {/* Loại sơn */}
          <div>
            <h4 className="font-bold mb-4">LOẠI SƠN</h4>
            <ul className="space-y-2 text-blue-200">
              <li>• Sơn nội thất</li>
              <li>• Sơn ngoại thất</li>
              <li>• Sơn chống thấm</li>
              <li>• Sơn chống nóng</li>
              <li>• Sơn kháng khuẩn</li>
              <li>• Sơn epoxy</li>
              <li>• Sơn gỗ</li>
              <li>• Sơn kim loại</li>
            </ul>
          </div>

          {/* Dịch vụ */}
          <div>
            <h4 className="font-bold mb-4">DỊCH VỤ</h4>
            <ul className="space-y-2 text-blue-200">
              <li>• Tư vấn màu sắc</li>
              <li>• Thi công sơn</li>
              <li>• Bảo hành sản phẩm</li>
              <li>• Giao hàng tận nơi</li>
              <li>• Hỗ trợ kỹ thuật</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-blue-700 mt-8 pt-6 text-center text-blue-300">
          <p>
            &copy; 2024 THANHDANHLUXURY. Chuyên sơn cao cấp chính hãng -
            Hotline: 0969745670
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
