"use client";
import React, { useState } from "react";

interface ExtendCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newDate: string) => void;
}

const ExtendCardModal: React.FC<ExtendCardModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [selectedDate, setSelectedDate] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-xl">
        <h3 className="mb-4 text-lg font-semibold text-primary">Gia hạn thẻ</h3>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Chọn ngày hết hạn mới
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="mb-4 w-full rounded border bg-background px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-primary focus:outline-none"
        />
        <div className="mt-4 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="rounded-md border px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Hủy
          </button>
          <button
            onClick={() => onConfirm(selectedDate)}
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-[#005f9e]"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExtendCardModal;
