"use client";

import React from "react";

// icons
import {
 
} from "@heroicons/react/24/solid";

const ReaderHomePage = () => {
  return (
    <>
      {/* ===== BANNER ===== */}
      <section className="pt-20">
        <img
          src="images/banner/bannerClient.png"
          alt="Banner Thư viện Khánh Hòa"
          className="w-full h-auto object-contain"
        />
      </section>

      {/* ===== NAVBAR ===== */}
      <nav className="bg-background shadow-md">
        <div className="flex flex-wrap items-start justify-between px-4 py-2">
          <div className="flex items-center space-x-2 font-semibold">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span>Browse Categories</span>
          </div>

          <div className="flex flex-row items-center space-x-4 text-sm font-medium mt-2">
            {["Trang chủ", "Giới thiệu", "Thư viện", "Thiếu nhi", "Liên hệ", "Tin tức"].map((item, idx) => (
              <a
                key={idx}
                href="#"
                className={`${item === "Trang chủ" ? "text-primary" : ""} hover:underline`}
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* ===== TUYÊN TRUYỀN ===== */}
      <div className="relative bg-[#0071BC] text-white font-bold px-4 py-2 text-sm uppercase flex items-center">
        TUYÊN TRUYỀN
      </div>

      {/* ===== MARQUEE ===== */}
      <div className="overflow-hidden whitespace-nowrap flex-1">
        <div className="animate-marquee inline-block py-2 text-sm text-primary">
          <span className="mx-6">
            Hoạt động hưởng ứng Tuần lễ Quốc gia phòng chống thiên tai năm 2025
          </span>
          <span className="mx-6">•</span>
          <span className="mx-6">
            Tuyên truyền, hưởng ứng Cuộc thi và Triển lãm ảnh nghệ thuật cấp Quốc gia “Tổ quốc bên bờ sóng”
          </span>
          <span className="mx-6">•</span>
          <span className="mx-6">Thông tin mới nhất về các hoạt động của thư viện Khánh Hòa</span>
          <span className="mx-6">•</span>
          <span className="mx-6">
            Tuyên truyền kỷ niệm 50 năm Ngày giải phóng tỉnh Khánh Hòa và 50 năm Ngày giải phóng miền Nam, thống nhất đất nước
          </span>
        </div>
      </div>

      {/* ===== BANNER SECTION 2 ===== */}
      <div className="w-full h-[350px] relative overflow-hidden">
        <img src="/images/banner/banner1.jpg" alt="Banner" className="w-full h-full object-cover" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full max-w-7xl px-6 mx-auto flex items-center justify-between">
            <div className="text-white space-y-4 max-w-md">
              <h2 className="text-3xl font-bold leading-snug">
                Thư viện thiếu nhi<br />vì tương lai
              </h2>
              <button className="inline-flex items-center px-6 py-2 border border-white text-white hover:bg-white hover:text-black transition rounded-full">
                Đến ngay →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===== THƯ VIỆN + DANH MỤC ===== */}
      <div className="bg-background w-full py-8 px-4 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-x-1 gap-y-4 items-start">
          {/* Cột bên trái - Thư viện */}
          <div className="text-center md:text-left">
            <h2 className="text-primary text-2xl md:text-3xl font-bold mb-4">THƯ VIỆN TỈNH KHÁNH HÒA</h2>
            <div className="relative w-full max-w-md mx-auto md:mx-0">
              <img
                src="/images/banner/banner2.png"
                alt="Thư viện Tỉnh Khánh Hòa"
                className="w-full h-auto rounded shadow-md"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="w-14 h-14 bg-white/70 rounded-full flex items-center justify-center shadow-md hover:scale-105 transition">
                  <svg className="w-6 h-6 text-gray-800" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6 4l10 6-10 6V4z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Cột bên phải - Danh mục */}
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-6 text-center md:text-left">TRUY CẬP NHANH DANH MỤC</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-center text-sm">
              {[
                { label: "Tổng hợp", icon: "📚" },
                { label: "Triết học và các khoa học liên quan", icon: "🧠" },
                { label: "Tôn giáo", icon: "🙏" },
                { label: "Các khoa học xã hội", icon: "🧬" },
                { label: "Ngôn ngữ học", icon: "💬" },
                { label: "Các khoa học chính xác", icon: "⚛️" },
                { label: "Các khoa học ứng dụng", icon: "🧪" },
                { label: "Nghệ thuật", icon: "🎨" },
                { label: "Văn học", icon: "📜" },
              ].map(({ label, icon }) => (
                <div key={label} className="flex flex-col items-center space-y-2">
                  <div className="text-[#0071BC] text-3xl">{icon}</div>
                  <div className="text-primary text-center">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <main className="px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Chào mừng đến với Thư viện Khánh Hòa</h1>
        <p>Đây là nội dung trang web...</p>
      </main>
    </>
  );
};

export default ReaderHomePage;
