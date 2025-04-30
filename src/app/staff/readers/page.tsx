"use client";
import React, { useState } from "react";
import {
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  CreditCardIcon,
  QueueListIcon,
  BellIcon,
} from "@heroicons/react/24/solid";

const ReadersPage = () => {
  const [selectedLoaiThe, setSelectedLoaiThe] = useState("Tất cả");
  const [searchLimit, setSearchLimit] = useState("");
  const [cardStatus, setCardStatus] = useState("Tất cả");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const readersPerPage = 6;

  const loaiThes = ["Tất cả", "Thẻ mượn", "Thẻ thiếu nhi"];
  const cardStatuses = ["Tất cả", "Còn hạn", "Chưa gia hạn"];

  const readers = [
    {
      name: "Nguyễn Văn A",
      cardType: "Thẻ mượn",
      image: "/images/logo/avatar.jpg",
      limit: "200.000",
      address: "123 Lê Lợi Nha Trang Khánh Hòa",
      status: "Còn hạn",
    },
    {
      name: "Trần Thị B",
      cardType: "Thẻ thiếu nhi",
      image: "/images/logo/avatar.jpg",
      limit: "100.000",
      address: "123 Lê Lợi Nha Trang Khánh Hòa",
      status: "Chưa gia hạn",
    },
    {
      name: "Lê Văn C",
      cardType: "Thẻ mượn",
      image: "/images/logo/avatar.jpg",
      limit: "300.000",
      address: "123 Lê Lợi Nha Trang Khánh Hòa",
      status: "Còn hạn",
    },
    {
      name: "Phạm Thị D",
      cardType: "Thẻ thiếu nhi",
      image: "/images/logo/avatar.jpg",
      limit: "150.000",
      address: "456 Trần Phú Nha Trang",
      status: "Còn hạn",
    },
    {
      name: "Võ Văn E",
      cardType: "Thẻ mượn",
      image: "/images/logo/avatar.jpg",
      limit: "250.000",
      address: "789 Hùng Vương Nha Trang",
      status: "Chưa gia hạn",
    },
    {
      name: "Đặng Thị F",
      cardType: "Thẻ thiếu nhi",
      image: "/images/logo/avatar.jpg",
      limit: "120.000",
      address: "1010 Lạc Long Quân Nha Trang",
      status: "Còn hạn",
    },
    {
      name: "Ngô Văn G",
      cardType: "Thẻ mượn",
      image: "/images/logo/avatar.jpg",
      limit: "280.000",
      address: "999 Hòa Bình Nha Trang",
      status: "Còn hạn",
    },
    {
      name: "Hồ Thị H",
      cardType: "Thẻ thiếu nhi",
      image: "/images/logo/avatar.jpg",
      limit: "180.000",
      address: "202 Đống Đa Nha Trang",
      status: "Chưa gia hạn",
    },
  ];

  const parseCurrency = (str: string) => parseInt(str.replace(/\./g, ""));

  const getFilteredReaders = () => {
    return readers.filter((r) => {
      const matchLoaiThe =
        selectedLoaiThe === "Tất cả" || r.cardType === selectedLoaiThe;
      const matchLimit =
        searchLimit === "" || parseCurrency(r.limit) >= parseInt(searchLimit);
      const matchStatus = cardStatus === "Tất cả" || r.status === cardStatus;
      return matchLoaiThe && matchLimit && matchStatus;
    });
  };

  const filteredReaders = getFilteredReaders();
  const totalPages = Math.ceil(filteredReaders.length / readersPerPage);

  const currentReaders = filteredReaders.slice(
    (currentPage - 1) * readersPerPage,
    currentPage * readersPerPage
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Tìm kiếm độc giả..."
            className="w-64 rounded-md border border-gray-300 bg-input px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
          />
          <select
            value={selectedLoaiThe}
            onChange={(e) => {
              setSelectedLoaiThe(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-md border border-gray-300 bg-input px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
          >
            {loaiThes.map((loai, index) => (
              <option key={index} value={loai}>
                {loai}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Hạn mức từ..."
            value={searchLimit}
            onChange={(e) => {
              setSearchLimit(e.target.value);
              setCurrentPage(1);
            }}
            className="w-40 rounded-md border border-gray-300 bg-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
          />
          <select
            value={cardStatus}
            onChange={(e) => {
              setCardStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-md border border-gray-300 bg-input px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
          >
            {cardStatuses.map((status, index) => (
              <option key={index} value={status}>
                {status}
              </option>
            ))}
          </select>
          <button className="flex items-center justify-center rounded-md bg-primary px-4 py-3 text-white transition hover:bg-[#005f9e]">
            <MagnifyingGlassIcon className="h-5 w-5 text-primary-foreground" />
          </button>
        </div>

        <div className="hidden space-x-2 md:flex">
          <FilterButton
            icon={<CreditCardIcon className="h-4 w-4 text-[#0071BC]" />}
            label="Tạo thẻ"
          />
          <FilterButton
            icon={<QueueListIcon className="h-4 w-4 text-[#0071BC]" />}
            label="Hàng đợi"
          />
          <FilterButton
            icon={<BellIcon className="h-4 w-4 text-[#0071BC]" />}
            label="Trả sách"
          />
        </div>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="rounded-md border border-gray-300 p-2 text-[#0071BC] md:hidden"
        >
          {isMobileMenuOpen ? (
            <XMarkIcon className="h-5 w-5" />
          ) : (
            <Bars3Icon className="h-5 w-5" />
          )}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="mt-4 flex flex-col space-y-4 md:hidden">
          <FilterButton
            icon={<CreditCardIcon className="h-4 w-4 text-[#0071BC]" />}
            label="Tạo thẻ"
          />
          <FilterButton
            icon={<QueueListIcon className="h-4 w-4 text-[#0071BC]" />}
            label="Hàng đợi"
          />
          <FilterButton
            icon={<BellIcon className="h-4 w-4 text-[#0071BC]" />}
            label="Trả sách"
          />
        </div>
      )}

      {/* Danh sách độc giả */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {currentReaders.map((reader, index) => (
          <div
            key={index}
            className="rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md"
          >
            <img
              src={reader.image}
              alt={reader.name}
              className="h-32 w-32 rounded-full object-cover mx-auto"
            />
            <h3 className="mt-4 text-center text-lg font-semibold">
              {reader.name}
            </h3>
            <p className="text-center text-sm text-gray-600">
              {reader.cardType}
            </p>
            <p className="text-center text-sm text-gray-500 mt-1">
              Hạn mức: {reader.limit} VND
            </p>
            <p className="text-center text-sm text-gray-500 mt-1">
              Tình trạng: {reader.status}
            </p>
            <p className="mt-2 text-sm text-gray-700 text-center">
              {reader.address}
            </p>
          </div>
        ))}
      </div>

      {/* PHÂN TRANG */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="rounded border px-3 py-1 text-sm disabled:opacity-50"
          >
            Trước
          </button>
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => handlePageChange(index + 1)}
              className={`rounded border px-3 py-1 text-sm ${
                currentPage === index + 1
                  ? "bg-[#0071BC] text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              {index + 1}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="rounded border px-3 py-1 text-sm disabled:opacity-50"
          >
            Tiếp
          </button>
        </div>
      )}
    </div>
  );
};

const FilterButton = ({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className="flex items-center space-x-2 rounded-md border border-gray-300 bg-background px-3 py-2 shadow-sm transition hover:shadow-md"
  >
    {icon}
    <span className="text-sm">{label}</span>
  </button>
);

export default ReadersPage;
