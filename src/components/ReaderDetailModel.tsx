"use client";
import React from "react";
import {
  CreditCardIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";

interface ReaderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onCard: () => void;
  reader: any;
  onDeleted?: () => void; // tùy chọn callback để reload danh sách sau khi xóa
}

const ReaderDetailModal: React.FC<ReaderDetailModalProps> = ({
  isOpen,
  onClose,
  onEdit,
  onCard,
  reader,
  onDeleted,
}) => {
  if (!isOpen || !reader) return null;

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
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-gray-500 bg-opacity-50">
      <div className="flex max-h-[90vh] w-5/6 max-w-5xl flex-col overflow-y-auto rounded-lg bg-background p-8 lg:flex-row">
        <div className="mb-4 w-full pr-4 lg:mb-0 lg:w-2/3">
          <h2 className="text-3xl font-semibold text-primary">
            {reader.last_name} {reader.first_name}
          </h2>
          <p className="mt-2 text-lg text-muted-foreground">
            ID: {reader.reader_id}
          </p>
          <div className="mt-6 space-y-3 text-muted-foreground">
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
          </div>
          <div className="mt-6 flex space-x-3">
            <button
              onClick={onClose}
              className="rounded-md bg-primary px-4 py-2 text-white hover:bg-[#005f9e]"
            >
              Đóng
            </button>
            <button
              onClick={onCard}
              className="flex items-center space-x-2 rounded-md bg-primary px-4 py-2 text-white hover:bg-[#005f9e]"
            >
              <CreditCardIcon className="h-4 w-4" />
              <span>Thẻ</span>
            </button>
            <button
              onClick={onEdit}
              className="flex items-center space-x-2 rounded-md bg-primary px-4 py-2 text-white hover:bg-[#005f9e]"
            >
              <PencilSquareIcon className="h-4 w-4" />
              <span>Sửa</span>
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center space-x-2 rounded-md bg-destructive px-4 py-2 text-white hover:bg-red-700"
            >
              <TrashIcon className="h-4 w-4" />
              <span>Xóa</span>
            </button>
          </div>
        </div>
        <div className="w-full h-80 lg:w-1/2">
          <img
            src={reader.photo_url || "/images/logo/avatar.jpg"}
            alt="Ảnh độc giả"
            className="h-full w-full rounded-lg object-cover shadow-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default ReaderDetailModal;
