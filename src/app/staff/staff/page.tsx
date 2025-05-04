"use client";
import React, { useState, useEffect } from "react";
import {
  FolderPlusIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { supabaseClient } from "@/lib/client";
import StaffFormModal from "@/components/StaffFormModal";
import StaffDetailModal from "@/components/StaffDetailModel";

const StaffPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [role, setRole] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<any | null>(null);

  const staffPerPage = 10;
  const indexOfLast = currentPage * staffPerPage;
  const indexOfFirst = indexOfLast - staffPerPage;

  const filteredStaff =
    selectedCategory === "Tất cả"
      ? staff
      : staff.filter(
          (s) => s.role?.role_id?.toString() === selectedCategory.toString()
        );

  const currentStaff = filteredStaff.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredStaff.length / staffPerPage);

  useEffect(() => {
    const fetchRole = async () => {
      const supabase = supabaseClient();
      const { data, error } = await supabase.from("role").select("*");

      if (error) {
        console.error("Error fetching roles:", error);
      } else {
        setRole([{ role_name: "Tất cả", role_id: "Tất cả" }, ...data]);
      }
    };

    fetchRole();
  }, []);

  useEffect(() => {
    const fetchStaff = async () => {
      const supabase = supabaseClient();
      const { data, error } = await supabase
        .from("staff")
        .select("*, role:role_id(*)");

      if (error) {
        console.error("Error fetching staff:", error);
      } else {
        setStaff(data);
      }
    };

    fetchStaff();
  }, []);

  const opendModel = (model: "add" | "detail" | "edit") => {
    setIsAddOpen(model === "add");
    setIsDetailOpen(model === "detail");
    setIsEditOpen(model === "edit");
  };

  const closeModal = () => {
    setIsDetailOpen(false);
    setIsAddOpen(false);
    setIsEditOpen(false);
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
            {role.map((rol, index) => (
              <option key={index} value={rol.role_id?.toString()}>
                {rol.role_name}
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
            onClick={() => opendModel("add")}
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
            onClick={() => opendModel("add")}
          />
        </div>
      )}

      <StaffDetailModal
        isOpen={isDetailOpen}
        staff={selectedStaff}
        onClose={closeModal}
        onEdit={() => opendModel("edit")}
        onDelete={() => {
          // xử lý xóa
        }}
      />

      <StaffFormModal
        isAddOpen={isAddOpen}
        isEditOpen={isEditOpen}
        closeAdd={closeModal}
      />

      {/* Danh sách nhân viên */}
      <h1 className="mb-4 mt-6 text-2xl font-bold text-primary">
        Danh sách nhân viên
      </h1>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              {[
                "ID",
                "Chức vụ",
                "Họ và Tên",
                "Ngày sinh",
                "Giới tính",
                "Email",
                "Xem chi tiết",
              ].map((header, i) => (
                <th
                  key={i}
                  className="px-4 py-2 text-left text-sm font-medium text-gray-700"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-background">
            {currentStaff.map((staff) => (
              <tr key={staff.staff_id}>
                <td className="px-4 py-2 text-sm">{staff.staff_id}</td>
                <td className="px-4 py-2 text-sm">
                  {staff.role?.role_name || "Không rõ"}
                </td>
                <td className="px-4 py-2 text-sm">
                  {staff.last_name} {staff.first_name}
                </td>
                <td className="px-4 py-2 text-sm">{staff.date_of_birth}</td>
                <td className="px-4 py-2 text-sm">
                  {staff.gender === "F"
                    ? "Nữ"
                    : staff.gender === "M"
                    ? "Nam"
                    : "Khác"}
                </td>
                <td className="px-4 py-2 text-sm">{staff.email}</td>
                <td
                  onClick={() => {
                    setSelectedStaff(staff);
                    opendModel("detail");
                  }}
                  className="cursor-pointer px-4 py-2 text-sm text-[#0071BC] hover:underline"
                >
                  Xem
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Phân trang */}
      <div className="mt-4 flex justify-center space-x-2">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="rounded border border-gray-300 px-3 py-1 text-sm text-primary hover:bg-gray-100 disabled:opacity-50"
        >
          Trước
        </button>

        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            className={`rounded border px-3 py-1 text-sm ${
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
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className="rounded border border-gray-300 px-3 py-1 text-sm text-primary hover:bg-gray-100 disabled:opacity-50"
        >
          Tiếp
        </button>
      </div>
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

export default StaffPage;
