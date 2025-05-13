"use client";
import React, { useState, useEffect } from "react";
import {
  FolderPlusIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { supabaseClient } from "@/lib/client";
import StaffFormModal from "@/components/StaffFormModal";
import StaffDetailModal from "@/components/StaffDetailModel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


const StaffPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [role, setRole] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<any | null>(null);
  const [staffToEdit, setStaffToEdit] = useState<any | null>(null);

  const staffPerPage = 10;
  const indexOfLast = currentPage * staffPerPage;
  const indexOfFirst = indexOfLast - staffPerPage;

  const filteredStaff = staff.filter((s) => {
    const matchesCategory =
      selectedCategory === "Tất cả" ||
      s.role?.role_id?.toString() === selectedCategory.toString();

    const fullName = `${s.last_name} ${s.first_name}`.toLowerCase();
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      s.staff_id.toString().includes(search) || fullName.includes(search);

    return matchesCategory && matchesSearch;
  });

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

  const openModal = (mode: "add" | "detail" | "edit", staff?: any) => {
    if (mode === "add") {
      setIsAddOpen(true);
      setStaffToEdit(null);
    } else if (mode === "detail") {
      setSelectedStaff(staff);
      setIsDetailOpen(true);
    } else if (mode === "edit") {
      setStaffToEdit(staff);
      setIsEditOpen(true);
    }
  };

  const closeModal = () => {
    setIsAddOpen(false);
    setIsDetailOpen(false);
    setIsEditOpen(false);
    setStaffToEdit(null);
    setSelectedStaff(null);
  };

  const handleDelete = (deletedId: string) => {
    setStaff((prev) => prev.filter((s) => s.staff_id !== deletedId));
    closeModal();
  };

  return (
    <div className="p-6">
      {/* Bộ lọc + Tìm kiếm + Thêm */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Input
            placeholder="ID / Tên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="min-w-[150px] flex-1 py-6"
          />

          <Select
            value={selectedCategory}
            onValueChange={(value) => setSelectedCategory(value)}
          >
            <SelectTrigger className="min-w-[150px] flex-1 py-6">
              <SelectValue placeholder="Chọn chức vụ" />
            </SelectTrigger>
            <SelectContent>
              {role.map((rol, index) => (
                <SelectItem key={index} value={rol.role_id?.toString()}>
                  {rol.role_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="hidden space-x-2 md:flex">
          <Button
            variant="outline"
            onClick={() => openModal("add")}
            className="flex items-center space-x-2 rounded-md border border-gray-300 bg-background px-3 py-2 shadow-sm transition hover:shadow-md"
          >
            <FolderPlusIcon className="h-4 w-4 text-[#0071BC]" />
            <span className="text-sm">Thêm nhân viên</span>
          </Button>
        </div>

        <Button
          variant="outline"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden flex justify-start p-4"
        >
        {isMobileMenuOpen ? (
          <XMarkIcon className="h-5 w-5" />
          ) : (
            <Bars3Icon className="h-5 w-5" />
          )}
        </Button>
      </div>

      {isMobileMenuOpen && (
        <div className="mt-4 flex flex-col space-y-4 md:hidden">
          <FilterButton
            icon={<FolderPlusIcon className="h-4 w-4 text-[#0071BC]" />}
            label="Thêm nhân viên"
            onClick={() => openModal("add")}
          />
        </div>
      )}

      <StaffDetailModal
        isOpen={isDetailOpen}
        staff={selectedStaff}
        onClose={() => setIsDetailOpen(false)}
        onEdit={(staff) => {
          openModal("edit", staff);
          setIsDetailOpen(false);
        }}
        onDelete={handleDelete}
      />

      <StaffFormModal
        isAddOpen={isAddOpen}
        isEditOpen={isEditOpen}
        staffData={staffToEdit}
        closeAdd={closeModal}
      />

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
                  onClick={() => openModal("detail", staff)}
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
