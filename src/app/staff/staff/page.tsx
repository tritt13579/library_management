"use client";

import React, { useState } from "react";
import {
  FolderPlusIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

// Dữ liệu giả
const allStaff = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  position: i % 3 === 0 ? "Giám đốc" : i % 3 === 1 ? "Trưởng phòng" : "Nhân viên",
  name: `Nhân viên ${i + 1}`,
  birthdate: "01/01/1990",
  gender: i % 2 === 0 ? "Nam" : "Nữ",
  email: `nhanvien${i + 1}@example.com`,
}));

const categories = ["Tất cả", "Giám đốc", "Trưởng phòng", "Nhân viên"];

const StaffPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const staffPerPage = 10;
  const indexOfLast = currentPage * staffPerPage;
  const indexOfFirst = indexOfLast - staffPerPage;

  const filteredStaff =
    selectedCategory === "Tất cả"
      ? allStaff
      : allStaff.filter((s) => s.position === selectedCategory);

  const currentStaff = filteredStaff.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredStaff.length / staffPerPage);

  const handleAdd = () => setIsAddOpen(true);
  const closeAdd = () => {
    setIsAddOpen(false);
    setIsEditOpen(false);
  };

  const handleCardClick = () => {
    setIsDetailOpen(true);
    setIsAddOpen(false);
  };

  const closeModal = () => {
    setIsDetailOpen(false);
  };

  const handleEdit = () => {
    setIsEditOpen(true);
    setIsAddOpen(false);
    setIsDetailOpen(false);
  };

  return (
    <div className="p-6">
      {/* Bộ lọc + Tìm kiếm + Thêm */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="w-64 rounded-md border border-gray-300 bg-input px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-md border border-gray-300 bg-input px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
          >
            {categories.map((cat, index) => (
              <option key={index} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <button className="flex items-center justify-center rounded-md bg-primary px-4 py-3 text-white transition hover:bg-[#005f9e]">
            <MagnifyingGlassIcon className="h-5 w-5 text-primary-foreground" />
          </button>
        </div>

        <div className="hidden space-x-2 md:flex">
          <FilterButton
            icon={<FolderPlusIcon className="h-4 w-4 text-[#0071BC]" />}
            label="Thêm nhân viên"
            onClick={handleAdd}
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

      {/* Menu mobile */}
      {isMobileMenuOpen && (
        <div className="mt-4 flex flex-col space-y-4 md:hidden">
          <FilterButton
            icon={<FolderPlusIcon className="h-4 w-4 text-[#0071BC]" />}
            label="Thêm nhân viên"
            onClick={handleAdd}
          />
        </div>
      )}

      {/* Popup thêm/chỉnh sửa */}
      {(isAddOpen || isEditOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <div className="max-h-[90vh] w-5/6 max-w-2xl space-y-4 overflow-y-auto rounded-lg bg-background p-8">
            <h2 className="mb-4 text-2xl font-semibold text-primary">
              {isAddOpen ? "Thêm nhân viên" : "Chỉnh sửa"}
            </h2>

            <div className="grid grid-cols-1 gap-4">
              <input
                type="text"
                placeholder="Họ nhân viên"
                className="rounded-md border border-gray-300 bg-input px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
              />

              <input
                type="text"
                placeholder="Tên nhân viên"
                className="rounded-md border border-gray-300 bg-input px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
              />

              <div className="flex flex-col">
                <label className="mb-1 text-sm font-medium text-gray-700">Ngày sinh</label>
                <input
                  type="date"
                  className="rounded-md border border-gray-300 bg-input px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <select
                  defaultValue=""
                  className="rounded-md border border-gray-300 bg-input px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                >
                  <option value="" disabled>
                    Chọn giới tính
                  </option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>

                <input
                  type="text"
                  placeholder="Email"
                  className="rounded-md border border-gray-300 bg-input px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <select className="rounded-md border border-gray-300 bg-input px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0071BC]">
                  <option value="">Chọn chức vụ</option>
                  {categories
                    .filter((c) => c !== "Tất cả")
                    .map((cat, index) => (
                      <option key={index} value={cat}>
                        {cat}
                      </option>
                    ))}
                </select>

                <input
                  type="text"
                  placeholder="Số điện thoại"
                  className="rounded-md border border-gray-300 bg-input px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                />
              </div>

              <input
                type="text"
                placeholder="Địa chỉ"
                className="rounded-md border border-gray-300 bg-input px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
              />

              <div className="flex flex-col">
                <label className="mb-1 text-sm font-medium text-gray-700">Ngày làm việc</label>
                <input
                  type="date"
                  className="rounded-md border border-gray-300 bg-input px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={closeAdd}
                className="rounded-md bg-accent-foreground px-4 py-2 text-muted-foreground"
              >
                Hủy
              </button>

              <button className="rounded-md bg-[#0071BC] px-4 py-2 text-white hover:bg-[#005f9e]">
                Lưu nhân viên
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup chi tiết nhân viên */}
      {isDetailOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <div className="max-h-[90vh] w-5/6 max-w-2xl space-y-4 overflow-y-auto rounded-lg bg-background p-8">
            <div className="flex items-center space-x-4 mb-4">
              <img
                src="images/logo/avatar.jpg"
                alt="Avatar"
                className="h-10 w-10 rounded-full object-cover"
              />
              <h2 className="text-2xl font-semibold text-primary">Thông tin nhân viên</h2>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center space-x-2">
                <span className="font-semibold">Họ nhân viên:</span>
                <span className="text-gray-700">Nguyễn Văn A</span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="font-semibold">Tên nhân viên:</span>
                <span className="text-gray-700">Nguyễn Văn A</span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="font-semibold">Ngày sinh:</span>
                <span className="text-gray-700">01/01/1990</span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="font-semibold">Giới tính:</span>
                <span className="text-gray-700">Nam</span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="font-semibold">Email:</span>
                <span className="text-gray-700">nguyenvana@example.com</span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="font-semibold">Chức vụ:</span>
                <span className="text-gray-700">Quản lý</span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="font-semibold">Số điện thoại:</span>
                <span className="text-gray-700">0123456789</span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="font-semibold">Địa chỉ:</span>
                <span className="text-gray-700">123 Đường ABC, Quận 1, TP.HCM</span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="font-semibold">Ngày làm việc:</span>
                <span className="text-gray-700">01/01/2021</span>
              </div>
            </div>

            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={handleEdit}
                className="rounded-md bg-[#0071BC] px-4 py-2 text-white hover:bg-blue-600"
              >
                Chỉnh sửa
              </button>
              <button
                className="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600"
              >
                Xóa
              </button>
              <button
                onClick={closeModal}
                className="rounded-md bg-accent-foreground px-4 py-2 text-muted-foreground"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Danh sách nhân viên */}
      <h1 className="mb-4 mt-6 text-2xl font-bold text-primary">Danh sách nhân viên</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              {["ID", "Chức vụ", "Họ và Tên", "Ngày sinh", "Giới tính", "Email", "Xem chi tiết"].map((header, i) => (
                <th key={i} className="px-4 py-2 text-left text-sm font-medium text-gray-700">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-background divide-y divide-gray-200">
            {currentStaff.map((staff) => (
              <tr key={staff.id}>
                <td className="px-4 py-2 text-sm">{staff.id}</td>
                <td className="px-4 py-2 text-sm">{staff.position}</td>
                <td className="px-4 py-2 text-sm">{staff.name}</td>
                <td className="px-4 py-2 text-sm">{staff.birthdate}</td>
                <td className="px-4 py-2 text-sm">{staff.gender}</td>
                <td className="px-4 py-2 text-sm">{staff.email}</td>
                <td onClick={handleCardClick} className="px-4 py-2 text-sm text-[#0071BC] hover:underline cursor-pointer">Xem</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Phân trang với nút Trước / Tiếp */}
      <div className="mt-4 flex justify-center space-x-2">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 text-sm rounded border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
        >
          Trước
        </button>

        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            className={`px-3 py-1 text-sm rounded border ${
              currentPage === i + 1
                ? "bg-[#0071BC] text-white"
                : "border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}

        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 text-sm rounded border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
        >
          Tiếp
        </button>
      </div>
    </div>
  );
};

// Nút bộ lọc chung
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

// Dòng thông tin trong chi tiết
const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center space-x-2">
    <span className="font-semibold">{label}:</span>
    <span className="text-gray-700">{value}</span>
  </div>
);

export default StaffPage;
