"use client";

import React, { useState } from "react";
import { Button } from "./ui/button";

const BookCopyModal = ({
  isOpen,
  onClose,
  bookTitle,
  bookTitleId,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  bookTitle: { title: string };
  bookTitleId: string;
  onSuccess: () => void;
}) => {
  const [acquisitionDate, setAcquisitionDate] = useState("");
  const [price, setPrice] = useState("");
  const [conditionId, setConditionId] = useState("1"); 

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append(
      "bookCopyData",
      JSON.stringify({
        book_title_id: bookTitleId,
        acquisition_date: acquisitionDate,
        price: parseFloat(price),
        condition_id: parseInt(conditionId),
      })
    );

    try {
      const res = await fetch("/api/book/addcopy", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        alert(result.error || "Lỗi khi thêm bản sao");
        return;
      }

      alert("Thêm bản sao thành công");
      onSuccess(); 
      onClose();
      setAcquisitionDate("");
      setPrice("");
      setConditionId("1");
      window.location.reload();
    } catch (error) {
      console.error("Lỗi khi gửi yêu cầu:", error);
      alert("Lỗi hệ thống.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-gray-500 bg-opacity-50">
      <div className="w-full max-w-md rounded-xl bg-background p-6 shadow-xl relative">
        <h2 className="mb-4 text-xl font-semibold text-primary">
          Thêm bản sao mới
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground">
              Tiêu đề sách
            </label>
            <input
              type="text"
              value={bookTitle.title}
              readOnly
              className="mt-1 w-full rounded-md border bg-primary-foreground px-3 py-2 text-muted-foreground"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Ngày nhập</label>
            <input
              type="date"
              value={acquisitionDate}
              onChange={(e) => setAcquisitionDate(e.target.value)}
              className="mt-1 w-full rounded-md border px-3 py-2 bg-primary-foreground"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Giá mua (VNĐ)</label>
            <input
              type="number"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="mt-1 w-full rounded-md border px-3 py-2 bg-primary-foreground"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleSubmit}>Lưu</Button>
        </div>
      </div>
    </div>
  );
};

export default BookCopyModal;
