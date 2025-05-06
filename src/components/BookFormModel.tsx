"use client";
import React, { useState, useEffect } from "react";
import { supabaseClient } from "@/lib/client";

const BookFormModal = ({
  isOpen,
  isEdit,
  book,
  categories,
  onClose,
}: {
  isOpen: boolean;
  isEdit: boolean;
  book?: any;
  categories: string[];
  onClose: () => void;
}) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const [formValues, setFormValues] = useState({
    title: "",
    author: "",
    publication_year: "",
    isbn: "",
    language: "",
    edition: "",
    acquisition_date: "",
    price: "",
    category: "",
    publisher_id: "",
    shelf_id: "",
    description: "",
    cover_image: "",
  });

  useEffect(() => {
    console.log("Dữ liệu sách được truyền vào:", book);
    if (isEdit && book) {
      setFormValues({
        title: book.title || "",
        author: book.iswrittenby?.[0]?.author?.author_name || "",
        publication_year: book.publication_year || "",
        isbn: book.isbn || "",
        language: book.language || "",
        edition: book.edition || "",
        acquisition_date: book.bookcopy?.[0]?.acquisition_date || "",
        price: book.bookcopy?.[0]?.price || "",
        category: book.category?.category_name || "",
        publisher_id: book.publisher?.publisher_name || "",
        shelf_id: book.shelf?.location || "",
        description: book.description || "",
        cover_image: book.cover_image || "",
      });
    }
  }, [isEdit, book]);

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
            value={formValues.title}
            onChange={(e) => setFormValues({ ...formValues, title: e.target.value })}
            className="rounded-md border border-gray-300 bg-input px-4 py-2"
          />
          <input
            type="text"
            placeholder="Tác giả"
            value={formValues.author}
            onChange={(e) => setFormValues({ ...formValues, author: e.target.value })}
            className="rounded-md border border-gray-300 bg-input px-4 py-2"
          />
          <input
            type="text"
            placeholder="Nhà xuất bản"
            value={formValues.publisher_id}
            onChange={(e) => setFormValues({ ...formValues, publisher_id: e.target.value })}
            className="rounded-md border border-gray-300 bg-input px-4 py-2"
          />
          <input
            type="text"
            placeholder="Năm xuất bản"
            value={formValues.publication_year}
            onChange={(e) => setFormValues({ ...formValues, publication_year: e.target.value })}
            className="rounded-md border border-gray-300 bg-input px-4 py-2"
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="ISBN"
              value={formValues.isbn}
              onChange={(e) => setFormValues({ ...formValues, isbn: e.target.value })}
              className="rounded-md border border-gray-300 bg-input px-4 py-2"
            />
            <input
            type="text"
            placeholder="Kệ sách"
            value={formValues.shelf_id}
            onChange={(e) => setFormValues({ ...formValues, shelf_id: e.target.value })}
            className="rounded-md border border-gray-300 bg-input px-4 py-2"
          />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Ngôn ngữ"
              value={formValues.language}
              onChange={(e) => setFormValues({ ...formValues, language: e.target.value })}
              className="rounded-md border border-gray-300 bg-input px-4 py-2"
            />
            <input
              type="text"
              placeholder="Lần sửa đổi"
              value={formValues.edition}
              onChange={(e) => setFormValues({ ...formValues, edition: e.target.value })}
              className="rounded-md border border-gray-300 bg-input px-4 py-2"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Ngày mua"
              value={formValues.acquisition_date}
              onChange={(e) => setFormValues({ ...formValues, acquisition_date: e.target.value })}
              className="rounded-md border border-gray-300 bg-input px-4 py-2"
            />
            <input
              type="text"
              placeholder="Giá tiền"
              value={formValues.price}
              onChange={(e) => setFormValues({ ...formValues, price: e.target.value })}
              className="rounded-md border border-gray-300 bg-input px-4 py-2"
            />
          </div>
          <select
            value={formValues.category}
            onChange={(e) => setFormValues({ ...formValues, category: e.target.value })}
            className="rounded-md border border-gray-300 bg-input px-4 py-2"
          >
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
            value={formValues.description}
            onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
            rows={4}
            className="rounded-md border border-gray-300 bg-input px-4 py-2"
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
          <button
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-[#005f9e]"
          >
            Lưu sách
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookFormModal;
