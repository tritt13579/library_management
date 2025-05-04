"use client";
import React, { useState, useEffect } from "react";
import { supabaseClient } from "@/lib/client";

const BookFormModal = ({
  isOpen,
  isEdit,
  categories,
  onClose,
}: {
  isOpen: boolean;
  isEdit: boolean;
  categories: string[];
  onClose: () => void;
}) => {
  const [publisher, setPublisher] = useState<any[]>([]);
  const [shelf, setShelf] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);


  useEffect(() => {
    const fetchPublisher = async () => {
      const supabase = supabaseClient();
      const { data, error } = await supabase.from("publisher").select("*");

      if (error) {
        console.error("Error fetching publishers:", error);
      } else {
        setPublisher(data || []);
      }
    };

    fetchPublisher();
  }, []);

  useEffect(() => {
    const fetchShelf = async () => {
      const supabase = supabaseClient();
      const { data, error } = await supabase.from("shelf").select("*");

      if (error) {
        console.error("Error fetching publishers:", error);
      } else {
        setShelf(data || []);
      }
    };

    fetchShelf();
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-50">
      <div className="max-h-[90vh] w-5/6 max-w-2xl space-y-4 overflow-y-auto rounded-lg bg-background p-8">
        <h2 className="mb-4 text-2xl font-semibold text-primary">
          {isEdit ? "Chỉnh sửa sách" : "Thêm sách mới"}
        </h2>
        <div className="grid grid-cols-1 gap-4">
          <input
            type="text"
            placeholder="Tên sách"
            className="rounded-md border border-gray-300 bg-input px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
          />
          <input
            type="text"
            placeholder="Tác giả"
            className="rounded-md border border-gray-300 bg-input px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
          />
          <select className="rounded-md border border-gray-300 bg-input px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0071BC]">
            <option value="">Chọn nhà xuất bản</option>
            {publisher.map((pub, index) => (
              <option key={index} value={pub.publisher_id}>
                {pub.publisher_name}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Năm xuất bản"
            className="rounded-md border border-gray-300 bg-input px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="ISBN"
              className="rounded-md border border-gray-300 bg-input px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
            />
            <select className="rounded-md border border-gray-300 bg-input px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0071BC]">
              <option value="">Kệ sách</option>
              {shelf.map((she,index) => (
                <option key={index} value={she.shelf__id}>
                  {she.location}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Ngôn ngữ"
              className="rounded-md border border-gray-300 bg-input px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
            />
            <input
              type="text"
              placeholder="Lần sửa đổi"
              className="rounded-md border border-gray-300 bg-input px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Ngày mua"
              className="rounded-md border border-gray-300 bg-input px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
            />
            <input
              type="text"
              placeholder="Giá tiền"
              className="rounded-md border border-gray-300 bg-input px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
            />
          </div>
          <select className="rounded-md border border-gray-300 bg-input px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0071BC]">
            <option value="">Chọn thể loại</option>
            {categories
              .filter((c) => c !== "Tất cả")
              .map((cat, index) => (
                <option key={index} value={cat}>
                  {cat}
                </option>
              ))}
          </select>
          <textarea
            placeholder="Mô tả sách"
            rows={4}
            className="rounded-md border border-gray-300 bg-input px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
          />
          <div>
            <label className="mb-2 block font-medium text-gray-700">Ảnh bìa sách</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setSelectedImage(file);
              }}
              className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-[#0071BC] file:py-2 file:px-4 file:text-sm file:font-semibold file:text-white hover:file:bg-[#005f9e]"
            />
            {selectedImage && (
              <div className="mt-2">
                <img
                  src={URL.createObjectURL(selectedImage)}
                  alt="Xem trước ảnh"
                  className="max-h-48 rounded-md border"
                />
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="rounded-md bg-accent-foreground px-4 py-2 text-muted-foreground"
          >
            Hủy
          </button>
          <button className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-[#005f9e]">
            Lưu sách
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookFormModal;
