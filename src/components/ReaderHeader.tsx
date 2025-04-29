"use client";

import React, { useState } from "react";
import {
  UserIcon,
  UserPlusIcon,
  MagnifyingGlassIcon,
  CreditCardIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon,
} from "@heroicons/react/24/solid";

const ReaderHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="bg-background text-foreground">
      {/* ===== HEADER ===== */}
      <header className="fixed top-0 left-0 w-full z-50 bg-background shadow-md">
        <div className="flex items-center justify-between p-4">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img
              src="images/logo/logoKH.jpg"
              alt="Logo Thư viện Khánh Hòa"
              className="w-12 h-12 object-cover rounded-full"
            />
            <p className="text-xl font-semibold">Thư viện Tỉnh Khánh Hòa</p>
          </div>

          {/* Toggle menu button (mobile) */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-foreground focus:outline-none"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-8 w-8" />
              ) : (
                <Bars3Icon className="h-8 w-8" />
              )}
            </button>
          </div>

          {/* Desktop menu */}
          <div className="hidden lg:flex items-center space-x-6 w-2/3">
            {/* Search */}
            <div className="flex items-center relative w-1/2">
              <input
                type="text"
                placeholder="Tìm kiếm sách, tài liệu..."
                className="w-full py-2 pl-4 pr-10 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
              />
              <MagnifyingGlassIcon className="h-5 w-5 text-muted-foreground absolute right-3 top-1/2 transform -translate-y-1/2" />
            </div>

            {/* Auth buttons */}
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 bg-primary text-primary-foreground font-medium py-2 px-4 rounded-lg hover:bg-primary/90 transition">
                <UserIcon className="h-5 w-5" />
                <span>Đăng nhập</span>
              </button>
              <button className="flex items-center space-x-2 bg-secondary text-secondary-foreground font-medium py-2 px-4 rounded-lg hover:bg-secondary/90 transition">
                <UserPlusIcon className="h-5 w-5" />
                <span>Đăng ký</span>
              </button>
            </div>

            {/* Icons */}
            <div className="flex items-center space-x-4">
              <button
                title="Thông báo"
                className="p-2 rounded-full bg-accent text-accent-foreground hover:bg-accent/80 transition"
                onClick={() => (location.href = "/library")}
              >
                <BellIcon className="h-6 w-6" />
              </button>
              <button
                title="Thẻ thư viện"
                className="p-2 rounded-full bg-accent text-accent-foreground hover:bg-accent/80 transition"
                onClick={() => (location.href = "/library-card")}
              >
                <CreditCardIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="flex flex-col items-center space-y-3 pb-4 lg:hidden">
            <div className="flex items-center relative w-11/12">
              <input
                type="text"
                placeholder="Tìm kiếm sách, tài liệu..."
                className="w-full py-2 pl-4 pr-10 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
              />
              <MagnifyingGlassIcon className="h-5 w-5 text-muted-foreground absolute right-3 top-1/2 transform -translate-y-1/2" />
            </div>

            {[
              {
                icon: <UserIcon className="h-5 w-5 text-primary" />,
                label: "Đăng nhập",
                href: "/login",
              },
              {
                icon: <UserPlusIcon className="h-5 w-5 text-primary" />,
                label: "Đăng ký",
                href: "/register",
              },
              {
                icon: <BellIcon className="h-5 w-5 text-primary" />,
                label: "Thông báo",
                href: "/notifications",
              },
              {
                icon: <CreditCardIcon className="h-5 w-5 text-primary" />,
                label: "Thẻ thư viện",
                href: "/library-card",
              },
            ].map(({ icon, label, href }, idx) => (
              <button
                key={idx}
                onClick={() => (location.href = href)}
                className="flex items-center justify-start w-11/12 space-x-3 px-4 py-2 rounded-lg bg-muted hover:bg-muted/70 transition"
              >
                {icon}
                <span className="text-base font-medium text-foreground">{label}</span>
              </button>
            ))}
          </div>
        )}
      </header>
    </div>
  );
};

export default ReaderHeader;
