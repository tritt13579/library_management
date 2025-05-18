"use client";
import { useState, useEffect } from "react";
// Import icon Heroicons
import {
  BookOpenIcon,
  AcademicCapIcon,
  SparklesIcon,
  UsersIcon,
  ChatBubbleLeftRightIcon,
  CubeIcon,
  BeakerIcon,
  PaintBrushIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/solid";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const categories = [
  { label: "Tổng hợp", icon: <BookOpenIcon className="w-8 h-8" style={{ color: "#0071BC" }} /> },
  { label: "Triết học và các khoa học liên quan", icon: <AcademicCapIcon className="w-8 h-8" style={{ color: "#0071BC" }} /> },
  { label: "Tôn giáo", icon: <SparklesIcon className="w-8 h-8" style={{ color: "#0071BC" }} /> },
  { label: "Các khoa học xã hội", icon: <UsersIcon className="w-8 h-8" style={{ color: "#0071BC" }} /> },
  { label: "Ngôn ngữ học", icon: <ChatBubbleLeftRightIcon className="w-8 h-8" style={{ color: "#0071BC" }} /> },
  { label: "Các khoa học chính xác", icon: <CubeIcon className="w-8 h-8" style={{ color: "#0071BC" }} /> },
  { label: "Các khoa học ứng dụng", icon: <BeakerIcon className="w-8 h-8" style={{ color: "#0071BC" }} /> },
  { label: "Nghệ thuật", icon: <PaintBrushIcon className="w-8 h-8" style={{ color: "#0071BC" }} /> },
  { label: "Văn học", icon: <DocumentTextIcon className="w-8 h-8" style={{ color: "#0071BC" }} /> },
];

const ReaderHomePage = () => {

  const navItems = [
    { label: "Trang chủ", href: "/" },
    { label: "Giới thiệu", href: "/about" },
    { label: "Thư viện", href: "/library" },
    { label: "Tìm kiếm", href: "/reader/search" },
    { label: "Liên hệ", href: "/contact" },
    { label: "Tin tức", href: "/news" },
] ;

  const sliderImages = [
    "/images/banner/banner4.jpg",
    "/images/banner/banner5.gif",
    "/images/banner/banner6.jpeg",
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? sliderImages.length - 1 : prev - 1
    );
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 2000); 

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* ===== BANNER ===== */}
      <section className="pt-20">
        <img
          src="/images/banner/bannerClient.png"
          alt="Banner Thư viện Khánh Hòa"
          className="w-full h-auto object-contain"
        />
      </section>

      {/* ===== NAVBAR ===== */}
      <nav className="bg-white shadow-md">
        <div className="flex flex-wrap items-start justify-between px-4 py-2">
          <div className="flex items-center space-x-2 font-semibold text-gray-900">
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

          <div className="flex flex-wrap gap-3 text-sm font-medium mt-2 justify-center md:justify-start text-gray-700">
            {navItems.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className={`hover:underline ${label === "Trang chủ" ? "text-blue-700 font-semibold" : ""}`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* ===== TUYÊN TRUYỀN + MARQUEE ===== */}
      <div className="flex items-center bg-[#0071BC] text-white font-bold px-4 py-2 text-sm uppercase whitespace-nowrap">
        <div className="flex-shrink-0 mr-6">TUYÊN TRUYỀN</div>
        <div className="overflow-hidden flex-1">
          <div
            className="inline-block text-white animate-[marquee_30s_linear_infinite]"
            style={{
              animationName: "marquee",
              animationDuration: "30s",
              animationTimingFunction: "linear",
              animationIterationCount: "infinite",
            }}
          >
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
      </div>

      {/* ===== BANNER SECTION 2 ===== */}
      <div className="w-full h-[350px] relative overflow-hidden mt-3">
        <img
          src="/images/banner/banner1.jpg"
          alt="Banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full max-w-7xl px-4 mx-auto flex items-center justify-between">
            <div className="text-white space-y-4 max-w-md text-center md:text-left">
              <h2 className="text-3xl font-bold leading-snug">
                Thư viện thiếu nhi<br />cho tương lai trẻ em
              </h2>
              <Button
                variant="outline"
                className="border-white text-gray-400 hover:bg-white hover:text-black rounded-full px-6 py-2"
              >
                Đến ngay →
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ===== THƯ VIỆN + DANH MỤC ===== */}
      <div className="bg-gray-50 w-full py-8 px-4 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 items-start">
          {/* Cột bên trái - Thư viện */}
          <div className="text-center md:text-left">
            <h2 className="text-primary text-2xl md:text-3xl font-bold mb-4">
              THƯ VIỆN TỈNH KHÁNH HÒA
            </h2>
            <div className="relative w-full max-w-md mx-auto md:mx-0">
              <img
                src="/images/banner/banner2.png"
                alt="Thư viện Tỉnh Khánh Hòa"
                className="w-full h-auto rounded shadow-md"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="w-14 h-14 bg-white/70 rounded-full flex items-center justify-center shadow-md hover:scale-105 transition">
                  <svg
                    className="w-6 h-6 text-gray-800"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M6 4l10 6-10 6V4z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Cột bên phải - Danh mục */}
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-6 text-center md:text-left">
              TRUY CẬP NHANH DANH MỤC
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-center text-sm text-primary">
              {categories.map(({ label, icon }) => (
                <div
                  key={label}
                  className="flex flex-col items-center space-y-2 hover:scale-105 transition-transform duration-300 cursor-pointer"
                >
                  {icon}
                  <div>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ===== IMAGE SLIDER ===== */}
      <div className="w-full mt-2 relative overflow-hidden">
        <div className="relative w-full h-[400px]">
          <img
            src={sliderImages[currentSlide]}
            alt={`Slide ${currentSlide + 1}`}
            className="w-full h-full object-cover transition-all duration-700"
          />
          {/* Prev Button */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/70 text-black rounded-full p-2 shadow hover:bg-white transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Next Button */}
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/70 text-black rounded-full p-2 shadow hover:bg-white transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <main className="px-4 py-8 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">Chào mừng đến với Thư viện Khánh Hòa</h1>
        <p className="text-gray-700">
          Sách
        </p>
      </main>

      {/* Tailwind animation marquee */}
      <style>
        {`
          @keyframes marquee {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
          .animate-[marquee_30s_linear_infinite] {
            animation: marquee 30s linear infinite;
          }
        `}
      </style>
    </>
  );
};

export default ReaderHomePage;
