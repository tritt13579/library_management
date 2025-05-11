"use client";
import React, { useState } from "react";

interface CategoryModalProps {
  isOpen: boolean;
  categories: string[];
  onClose: () => void;
  onAdd: (newCategory: string) => void;
  onDelete: (category: string) => void;
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  categories,
  onClose,
  onAdd,
  onDelete,
}) => {
  const [newCategory, setNewCategory] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-50">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-background p-8">
        <h2 className="text-2xl font-semibold text-primary">Quản lý thể loại</h2>

        {/* Thêm thể loại mới */}
        <div className="flex space-x-2">
          <input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            type="text"
            placeholder="Tên thể loại mới"
            className="flex-1 rounded-md border border-gray-300 bg-input px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
          />
          <button
            onClick={() => {
              if (newCategory.trim()) {
                onAdd(newCategory.trim());
                setNewCategory("");
              }
            }}
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-[#005f9e]"
          >
            Thêm
          </button>
        </div>

        {/* Danh sách thể loại */}
        <ul className="max-h-60 space-y-2 overflow-y-auto">
          {categories.map((category, index) => (
            <li
              key={index}
              className="flex items-center justify-between border-b border-gray-200 pb-1"
            >
              <span className="text-foreground">{category}</span>
              <button
                onClick={() => onDelete(category)}
                className="text-sm text-red-500 hover:text-red-700"
              >
                Xóa
              </button>
            </li>
          ))}
        </ul>

        <div className="flex justify-end pt-4">
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

export default CategoryModal;
