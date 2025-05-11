"use client";
import React from "react";

interface StaffDetailModalProps {
  isOpen: boolean;
  staff: any;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const StaffDetailModal = ({
  isOpen,
  staff,
  onClose,
  onEdit,
  onDelete,
}: StaffDetailModalProps) => {
  if (!isOpen || !staff) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-50">
      <div className="max-h-[90vh] w-5/6 max-w-2xl space-y-4 overflow-y-auto rounded-lg bg-background p-8">
        <div className="mb-4 flex items-center space-x-4">
          <img
            src="images/logo/avatar.jpg"
            alt="Avatar"
            className="h-10 w-10 rounded-full object-cover"
          />
          <h2 className="text-2xl font-semibold text-primary">
            Thông tin nhân viên
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <InfoRow label="Họ và Tên" value={`${staff.last_name} ${staff.first_name}`} />
          <InfoRow label="Ngày sinh" value={staff.date_of_birth} />
          <InfoRow label="Giới tính" value={staff.gender === "F" ? "Nữ" : staff.gender === "M" ? "Nam" : "Khác"} />
          <InfoRow label="Email" value={staff.email} />
          <InfoRow label="Chức vụ" value={staff.role?.role_name || "Không rõ"} />
          <InfoRow label="Số điện thoại" value={staff.phone} />
          <InfoRow label="Địa chỉ" value={staff.address} />
          <InfoRow label="Ngày làm việc" value={staff.hire_date} />
        </div>
        <div className="mt-4 flex justify-end space-x-3">
          <button
            onClick={onEdit}
            className="rounded-md bg-[#0071BC] px-4 py-2 text-white hover:bg-blue-600"
          >
            Chỉnh sửa
          </button>
          <button
            onClick={onDelete}
            className="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600"
          >
            Xóa
          </button>
          <button
            onClick={onClose}
            className="rounded-md bg-accent-foreground px-4 py-2 text-muted-foreground"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center space-x-2">
    <span className="font-semibold">{label}:</span>
    <span className="text-gray-700">{value}</span>
  </div>
);

export default StaffDetailModal;
