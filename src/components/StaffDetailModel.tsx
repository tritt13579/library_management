"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Pencil, Trash2, X } from "lucide-react";

interface StaffDetailModalProps {
  isOpen: boolean;
  staff: any;
  onClose: () => void;
  onEdit: (staff: any) => void;
  onDelete: (deletedId: string) => void;
  onSuccess?: () => void;
}

const StaffDetailModal = ({
  isOpen,
  staff,
  onClose,
  onEdit,
  onDelete,
  onSuccess,
}: StaffDetailModalProps) => {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!isOpen || !staff) return null;

  const handleDeleteConfirmed = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch("/api/staff/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffId: staff.staff_id }),
      });

      const result = await res.json();
      if (!res.ok) {
        toast({
          title: "Xóa thất bại",
          description: result.error || "Không thể xóa nhân viên.",
          variant: "destructive",
        });
        return;
      }

      onDelete(staff.staff_id);
      toast({ title: "Xóa nhân viên thành công", variant: "success" });
      onSuccess?.();
      onClose();
    } catch (error) {
      toast({
        title: "Lỗi hệ thống",
        description: "Không thể xóa nhân viên. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setConfirmOpen(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md lg:max-w-3xl max-h-[90vh] sm:max-w-xl overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-primary">
              Chi tiết nhân viên
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
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

          <DialogFooter className="flex flex-wrap justify-end gap-3 pt-6">
            <Button
              onClick={() => onEdit(staff)}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </Button>
            <Button
              onClick={() => setConfirmOpen(true)}
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={isDeleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Xóa
            </Button>
            <Button
              onClick={onClose}
              className="bg-muted text-muted-foreground hover:bg-muted/80"
            >
              <X className="mr-2 h-4 w-4" />
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Xác nhận xóa */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-sm rounded-xl p-6 space-y-4">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-destructive">
              Xác nhận xóa
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Bạn có chắc chắn muốn xóa nhân viên{" "}
            <span className="font-semibold text-foreground">
              {staff.last_name} {staff.first_name}
            </span>{" "}
            không? Hành động này không thể hoàn tác.
          </p>
          <DialogFooter className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => setConfirmOpen(false)}
              disabled={isDeleting}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirmed}
              disabled={isDeleting}
            >
              {isDeleting ? "Đang xóa..." : "Xác nhận xóa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col">
    <span className="text-sm font-medium text-muted-foreground">{label}</span>
    <span className="text-base text-foreground">{value || "—"}</span>
  </div>
);

export default StaffDetailModal;
