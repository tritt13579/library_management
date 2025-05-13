"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  CreditCardIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import Image from "next/image";
import React from "react";

interface ReaderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onCard: () => void;
  reader: any;
  onDeleted?: () => void;
}

const ReaderDetailModal: React.FC<ReaderDetailModalProps> = ({
  isOpen,
  onClose,
  onEdit,
  onCard,
  reader,
  onDeleted,
}) => {
  if (!reader) return null;

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      `Bạn có chắc chắn muốn xóa độc giả ${reader.last_name} ${reader.first_name}?`
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch("/api/reader/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reader_id: reader.reader_id }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Xóa độc giả thất bại");
      }

      alert("Đã xóa độc giả thành công.");
      onClose();
      window.location.reload();
      if (onDeleted) onDeleted();
    } catch (error: any) {
      console.error("Lỗi khi xóa:", error);
      alert(error.message || "Đã xảy ra lỗi khi xóa.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {reader.last_name} {reader.first_name}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Left: Info */}
          <div className="lg:w-2/3 space-y-3 text-muted-foreground">
            <p className="text-sm text-gray-500">ID: {reader.reader_id}</p>
            <p>
              <strong className="text-primary">Ngày sinh:</strong>{" "}
              {reader.date_of_birth}
            </p>
            <p>
              <strong className="text-primary">Giới tính:</strong>{" "}
              {reader.gender === "M" ? "Nam" : "Nữ"}
            </p>
            <p>
              <strong className="text-primary">Email:</strong> {reader.email}
            </p>
            <p>
              <strong className="text-primary">SĐT:</strong> {reader.phone}
            </p>
            <p>
              <strong className="text-primary">Địa chỉ:</strong> {reader.address}
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <Button onClick={onClose} variant="outline">
                Đóng
              </Button>
              <Button onClick={onCard} className="gap-2">
                <CreditCardIcon className="h-4 w-4" />
                Thẻ
              </Button>
              <Button onClick={onEdit} className="gap-2">
                <PencilSquareIcon className="h-4 w-4" />
                Sửa
              </Button>
              <Button
                onClick={handleDelete}
                variant="destructive"
                className="gap-2"
              >
                <TrashIcon className="h-4 w-4" />
                Xóa
              </Button>
            </div>
          </div>

          {/* Right: Avatar */}
          <div className="lg:w-1/2 w-full h-80">
            <Image
              src={reader.photo_url || "/images/logo/avatar.jpg"}
              alt="Ảnh độc giả"
              width={400}
              height={300}
              className="h-full w-full rounded-lg object-cover shadow-lg"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReaderDetailModal;
