"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

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

  const handleAdd = () => {
    if (newCategory.trim()) {
      onAdd(newCategory.trim());
      setNewCategory("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Quản lý thể loại</DialogTitle>
        </DialogHeader>

        {/* Thêm thể loại mới */}
        <div className="flex space-x-2">
          <Input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Tên thể loại mới"
          />
          <Button onClick={handleAdd}>Thêm</Button>
        </div>

        {/* Danh sách thể loại */}
        <ScrollArea className="max-h-60 space-y-2 pr-2">
          <ul className="space-y-2">
            {categories.map((category, index) => (
              <li
                key={index}
                className="flex items-center justify-between border-b border-border pb-1"
              >
                <span>{category}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => onDelete(category)}
                >
                  Xóa
                </Button>
              </li>
            ))}
          </ul>
        </ScrollArea>

        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryModal;
