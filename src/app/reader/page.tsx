"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import CategoryQuickAccess from "@/components/readerpage/CategoryQuickAccess";
import Propagate from "@/components/readerpage/Propagate";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700"],
});

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
      <nav className="bg-background shadow-md">
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
      <Propagate />

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
      <div className="bg-background w-full py-8 px-4 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 items-start">
          {/* Thư viện */}
          <div className="text-center md:text-left">
            <h2 className="text-primary text-2xl md:text-3xl font-bold mb-4">
              THƯ VIỆN TỈNH KHÁNH HÒA
            </h2>
            <div className="relative w-full max-w-xl mx-auto md:mx-0">
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

          {/* Danh mục */}
          <div>
            <CategoryQuickAccess />
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

      <section className="bg-gradient-to-r from-blue-100 to-blue-300 py-12 rounded-xl shadow-inner mt-10 mb-10 px-6 text-center">
        <h2 className={`text-2xl md:text-3xl font-bold text-gray-800 mb-4 ${playfair.className}`}>"Đọc sách là cách bạn trò chuyện với những bộ óc vĩ đại nhất lịch sử."</h2>
        <p className="text-gray-700 text-sm md:text-base mb-6">– René Descartes</p>
      </section>

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
