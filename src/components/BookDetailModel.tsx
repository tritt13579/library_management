"use client";
import React from "react";
import {
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";

const BookDetailModal = ({
  book,
  onClose,
  onEdit,
}: {
  book: any;
  onClose: () => void;
  onEdit: () => void;
}) => {
  if (!book) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-gray-500 bg-opacity-50">
      <div className="flex max-h-[90vh] w-5/6 max-w-5xl flex-col overflow-y-auto rounded-lg bg-background p-8 lg:flex-row">
        <div className="mb-2 w-full pr-2 lg:mb-0 lg:w-2/3">
          <h2 className="text-3xl font-semibold text-primary">
            {book.title}
          </h2>
          <p className="mt-2 text-lg text-muted-foreground">
            Tác giả: {book.iswrittenby?.[0]?.author?.author_name ?? "Không rõ"}
          </p>
          <div className="mt-6 space-y-3 text-muted-foreground">
            <p>
              <strong className="text-primary">Mã sách:</strong> {book.bookcopy?.[0]?.copy_id ?? "N/A"}
            </p>
            <p>
              <strong className="text-primary">Thể loại:</strong> {book.category?.category_name ?? "Không rõ"}
            </p>
            <p>
              <strong className="text-primary">Năm xuất bản:</strong> {book.publication_year ?? "N/A"}
            </p>
            <p>
              <strong className="text-primary">ISBN:</strong> {book.isbn ?? "N/A"}
            </p>
            <p>
              <strong className="text-primary">Kệ sách:</strong> {book.shelf?.location ?? "N/A"}
            </p>
            <p>
              <strong className="text-primary">Ngôn ngữ:</strong> {book.language ?? "Tiếng Việt"}
            </p>
            <p>
              <strong className="text-primary">Nhà xuất bản:</strong> {book.publisher?.publisher_name ?? "Không rõ"}
            </p>
            <p>
              <strong className="text-primary">Lần sửa đổi:</strong> {book.edition ?? "N/A"}
            </p>
            <p>
              <strong className="text-primary">Ngày mua:</strong> {book.bookcopy?.[0]?.acquisition_date ?? "N/A"}
            </p>
            <p>
              <strong className="text-primary">Giá tiền:</strong> {book.bookcopy?.[0]?.price ?? "N/A"}
            </p>
          </div>
          <div className="mt-6">
            <strong className="text-primary">Mô tả:</strong>
            <p className="mt-2 text-muted-foreground">{book.description}</p>
          </div>
          <div className="mt-6 flex space-x-3">
            <button
              onClick={onClose}
              className="rounded-md bg-primary px-4 py-2 text-primary-foreground transition hover:bg-[#005f9e]"
            >
              Đóng
            </button>
            <button
              onClick={onEdit}
              className="flex space-x-2 rounded-md bg-primary px-4 py-2 text-primary-foreground transition hover:bg-[#005f9e]"
            >
              <PencilSquareIcon className="h-5 w-5" />
              Sửa
            </button>
            <button className="flex space-x-2 rounded-md bg-destructive px-4 py-2 text-primary-foreground transition hover:bg-red-700">
              <TrashIcon className="h-5 w-5" />
              Xóa
            </button>
          </div>
        </div>
        <div className="w-full lg:w-1/2">
          <img
            src={book.cover_image}
            alt={`Ảnh bìa ${book.title}`}
            className="h-full w-full rounded-lg object-cover shadow-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default BookDetailModal;
