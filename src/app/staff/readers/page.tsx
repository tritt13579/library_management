"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  CreditCardIcon,
  QueueListIcon,
  TrashIcon,
  PencilSquareIcon,
  CalendarDaysIcon,
  BookOpenIcon,
} from "@heroicons/react/24/solid";
import ReaderFormModal from "@/components/ReaderFormModal";

const ReadersPage = () => {
  const [selectedLoaiThe, setSelectedLoaiThe] = useState("Tất cả");
  const [searchLimit, setSearchLimit] = useState("");
  const [cardStatus, setCardStatus] = useState("Tất cả");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCardOpen, setIsCardOpen] = useState(false);
  const [isExtendOpen, setIsExtendOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

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
    currentPage * readersPerPage,
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const opendModel = (model: "detail" | "card" | "extend" | "create" | "edit") => {
    setIsDetailOpen(model === "detail");
    setIsCardOpen(model === "card");
    setIsExtendOpen(model === "extend");
    setIsCreateOpen(model === "create");
    setIsEditOpen(model === "edit");
  }

  const closeModal = () => {
    setIsDetailOpen(false);
    setIsCardOpen(false);
    setIsExtendOpen(false);
    setIsCreateOpen(false);
    setIsEditOpen(false);
  }

  return (
    <div className="p-6">
      {/* BỘ LỌC & MENU */}
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
            onClick={() => opendModel("create")}
          />
          <Link href="/staff/queue">
            <FilterButton
              icon={<QueueListIcon className="h-4 w-4 text-[#0071BC]" />}
              label="Hàng đợi"
            />
          </Link>
          <Link href="/staff/borrows">
            <FilterButton
              icon={<BookOpenIcon className="h-4 w-4 text-[#0071BC]" />}
              label="Sách mượn"
            />
          </Link>
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
            onClick={() => opendModel("create")}
          />
          <Link href="/staff/queue">
            <FilterButton
              icon={<QueueListIcon className="h-4 w-4 text-[#0071BC]" />}
              label="Hàng đợi"
            />
          </Link>
          <Link href="/staff/borrows">
            <FilterButton
              icon={<BookOpenIcon className="h-4 w-4 text-[#0071BC]" />}
              label="Sách mượn"
            />
          </Link>
        </div>
      )}

      {/* MODAL CHI TIẾT */}
      {isDetailOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <div className="flex max-h-[90vh] w-5/6 max-w-5xl flex-col overflow-y-auto rounded-lg bg-background p-8 lg:flex-row">
            <div className="mb-4 w-full pr-4 lg:mb-0 lg:w-2/3">
              <h2 className="text-3xl font-semibold text-primary">
                Nguyễn Văn A
              </h2>
              <p className="mt-2 text-lg text-muted-foreground">ID: DG00123</p>
              <div className="mt-6 space-y-3 text-muted-foreground">
                <p>
                  <strong className="text-primary">Ngày sinh:</strong>{" "}
                  01/01/1990
                </p>
                <p>
                  <strong className="text-primary">Giới tính:</strong> Nam
                </p>
                <p>
                  <strong className="text-primary">Email:</strong>{" "}
                  nguyenvana@example.com
                </p>
                <p>
                  <strong className="text-primary">SĐT:</strong> 0123456789
                </p>
                <p>
                  <strong className="text-primary">Địa chỉ:</strong> 123 Đường
                  ABC, Quận 1, TP.HCM
                </p>
              </div>
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={closeModal}
                  className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-[#005f9e]"
                >
                  Đóng
                </button>
                <button
                  onClick={() => opendModel("card")}
                  className="flex items-center space-x-2 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-[#005f9e]"
                >
                  <CreditCardIcon className="h-4 w-4" />
                  <span>Thẻ</span>
                </button>
                <button
                  onClick={() => opendModel("edit")}
                  className="flex items-center space-x-2 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-[#005f9e]"
                >
                  <PencilSquareIcon className="h-4 w-4" />
                  <span>Sửa</span>
                </button>
                <button className="flex items-center space-x-2 rounded-md bg-destructive px-4 py-2 text-primary-foreground hover:bg-red-700">
                  <TrashIcon className="h-4 w-4" />
                  <span>Xóa</span>
                </button>
              </div>
            </div>
            <div className="w-full lg:w-1/2">
              <img
                src="images/logo/avatar.jpg"
                alt="Ảnh độc giả"
                className="h-full w-full rounded-lg object-cover shadow-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* TẠO THẺ - CHỈNH SỬA */}
      <ReaderFormModal
        isCreateOpen={isCreateOpen}
        isEditOpen={isEditOpen}
        closeCreate={closeModal}
      />

      {/* THẺ */}
      {isCardOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <div className="flex max-h-[90vh] w-5/6 max-w-xl flex-col overflow-y-auto rounded-lg bg-background p-6">
            {/* Khung thẻ */}
            <div className="relative w-full rounded-xl border bg-background p-5 shadow-lg">
              <div className="flex items-start gap-6">
                {/* Ảnh */}
                <div className="flex-shrink-0">
                  <img
                    src="images/logo/avatar.jpg"
                    alt="Ảnh thẻ"
                    className="h-36 w-24 rounded-md border object-cover shadow"
                  />
                </div>

                {/* Nội dung thẻ */}
                <div className="flex flex-col justify-start space-y-1 text-sm text-muted-foreground">
                  <p className="mb-2 text-base font-semibold text-primary">
                    THẺ THƯ VIỆN
                  </p>
                  <p>
                    <strong className="text-gray-700">ID Thẻ:</strong> THE123456
                  </p>
                  <p>
                    <strong className="text-gray-700">Loại thẻ:</strong> Thẻ
                    mượn
                  </p>
                  <p>
                    <strong className="text-gray-700">Hạn mức:</strong> 200.000
                    VND
                  </p>
                  <p>
                    <strong className="text-gray-700">Số thẻ:</strong> 9876 5432
                    1234 5678
                  </p>
                  <p>
                    <strong className="text-gray-700">Ngày tạo:</strong>{" "}
                    01/01/2023
                  </p>
                  <p>
                    <strong className="text-gray-700">Ngày hết hạn:</strong>{" "}
                    01/01/2025
                  </p>
                </div>
              </div>
            </div>

            {/* Trạng thái + giao dịch */}
            <div className="mt-4 w-full rounded-md border bg-background p-4 text-sm shadow-sm">
              <p className="text-gray-700">
                <strong className="text-primary">Trạng thái thẻ:</strong> Còn
                hạn
              </p>
              <p className="text-gray-700">
                <strong className="text-primary">ID giao dịch:</strong>{" "}
                GD987654321
              </p>
            </div>

            {/* Nút đóng - Gia hạn*/}
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="min-h-[44px] rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-[#005f9e]"
              >
                Đóng
              </button>
              <button
                className="flex min-h-[44px] items-center space-x-2 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-[#005f9e]"
                onClick={() => opendModel("extend")}
              >
                <CalendarDaysIcon className="h-5 w-5" />
                <span>Gia hạn</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GIA HẠN */}
      {isExtendOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-primary">
              Gia hạn thẻ
            </h3>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Chọn ngày hết hạn mới
            </label>
            <input
              type="date"
              className="mb-4 w-full rounded border bg-background px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-primary focus:outline-none"
            />
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="rounded-md border px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Hủy
              </button>
              <button className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-[#005f9e]">
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DANH SÁCH ĐỘC GIẢ */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {currentReaders.map((reader, index) => (
          <div
            key={index}
            onClick={() => opendModel("detail")}
            className="rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md"
          >
            <img
              src={reader.image}
              alt={reader.name}
              className="mx-auto h-32 w-32 rounded-full object-cover"
            />
            <h3 className="mt-4 text-center text-lg font-semibold">
              {reader.name}
            </h3>
            <p className="text-center text-sm text-gray-600">
              {reader.cardType}
            </p>
            <p className="mt-1 text-center text-sm text-gray-500">
              Hạn mức: {reader.limit} VND
            </p>
            <p className="mt-1 text-center text-sm text-gray-500">
              Tình trạng: {reader.status}
            </p>
            <p className="mt-2 text-center text-sm text-gray-700">
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
    className="flex w-full items-center space-x-2 rounded-md border border-gray-300 bg-background px-3 py-2 shadow-sm transition hover:shadow-md md:w-auto"
  >
    {icon}
    <span className="text-sm">{label}</span>
  </button>
);

export default ReadersPage;
