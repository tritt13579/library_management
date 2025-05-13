"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";


interface StaffDetailModalProps {
  isOpen: boolean;
  staff: any;
  onClose: () => void;
  onEdit: (staff: any) => void;
  onDelete: (deletedId: string) => void;
}

const StaffDetailModal = ({
  isOpen,
  staff,
  onClose,
  onEdit,
  onDelete,
}: StaffDetailModalProps) => {
  if (!isOpen || !staff) return null;

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa nhân viên này?");
    if (!confirmDelete) return;

    try {
      const res = await fetch("/api/staff/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ staffId: staff.staff_id }),
      });

      const result = await res.json();

      if (!res.ok) {
        alert(result.error || "Xóa nhân viên thất bại.");
        return;
      }

      alert("Xóa nhân viên thành công.");
      onDelete(staff.staff_id);
      onClose();
    } catch (error) {
      console.error("Lỗi khi xóa nhân viên:", error);
      alert("Lỗi hệ thống.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] w-5/6 max-w-2xl space-y-4 overflow-y-auto rounded-lg bg-background p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-primary">Thông tin nhân viên</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4">
          <InfoRow label="Họ và Tên" value={`${staff.last_name} ${staff.first_name}`} />
          <InfoRow label="Ngày sinh" value={staff.date_of_birth} />
          <InfoRow
            label="Giới tính"
            value={staff.gender === "F" ? "Nữ" : staff.gender === "M" ? "Nam" : "Khác"}
          />
          <InfoRow label="Email" value={staff.email} />
          <InfoRow label="Chức vụ" value={staff.role?.role_name || "Không rõ"} />
          <InfoRow label="Số điện thoại" value={staff.phone} />
          <InfoRow label="Địa chỉ" value={staff.address} />
          <InfoRow label="Ngày làm việc" value={staff.hire_date} />
        </div>
        <DialogFooter>
          <Button
            onClick={() => onEdit(staff)}
            className="bg-[#0071BC] text-white hover:bg-blue-600"
          >
            Chỉnh sửa
          </Button>
          <Button
            onClick={handleDelete}
            className="bg-red-500 text-white hover:bg-red-600"
          >
            Xóa
          </Button>
          <Button
            onClick={onClose}
            className="bg-accent-foreground text-muted-foreground"
          >
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center space-x-2">
    <span className="font-semibold">{label}:</span>
    <span className="text-gray-700">{value}</span>
  </div>
);

export default StaffDetailModal;
