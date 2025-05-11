"use client";
import React, { useState } from "react";
import {
  PencilSquareIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import BookCopyDetail from "./BookCopyDetail";
import { Button } from "./ui/button";

const BookTitleDetail = ({
  book,
  onClose,
  onEdit,
}: {
  book: any;
  onClose: () => void;
  onEdit: () => void;
}) => {
  const [selectedCopy, setSelectedCopy] = useState<any>(null);
  const [showCopies, setShowCopies] = useState(false);

  if (!book) return null;

  const handleCopyClick = (copy: any) => {
    setSelectedCopy(copy);
  };

  const handleBackToTitle = () => {
    setSelectedCopy(null);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-gray-500 bg-opacity-50">
      <div className="flex max-h-[90vh] w-5/6 max-w-5xl flex-col overflow-y-auto rounded-lg bg-background p-8 lg:flex-row">
        {selectedCopy ? (
          <BookCopyDetail
            bookTitle={book}
            bookCopy={selectedCopy}
            onBack={handleBackToTitle}
          />
        ) : (
          <>
            <div className="mb-2 w-full pr-2 lg:mb-0 lg:w-2/3">
              <h2 className="text-3xl font-semibold text-primary">
                {book.title}
              </h2>
              <p className="mt-2 text-lg text-muted-foreground">
                Tác giả:{" "}
                {book.iswrittenby?.[0]?.author?.author_name ?? "Không rõ"}
              </p>
              <div className="mt-6 space-y-3 text-muted-foreground">
                <p>
                  <strong className="text-primary">Thể loại:</strong>{" "}
                  {book.category?.category_name ?? "Không rõ"}
                </p>
                <p>
                  <strong className="text-primary">Năm xuất bản:</strong>{" "}
                  {book.publication_year ?? "N/A"}
                </p>
                <p>
                  <strong className="text-primary">ISBN:</strong>{" "}
                  {book.isbn ?? "N/A"}
                </p>
                <p>
                  <strong className="text-primary">Kệ sách:</strong>{" "}
                  {book.shelf?.location ?? "N/A"}
                </p>
                <p>
                  <strong className="text-primary">Ngôn ngữ:</strong>{" "}
                  {book.language ?? "Tiếng Việt"}
                </p>
                <p>
                  <strong className="text-primary">Nhà xuất bản:</strong>{" "}
                  {book.publisher?.publisher_name ?? "Không rõ"}
                </p>
                <p>
                  <strong className="text-primary">Lần sửa đổi:</strong>{" "}
                  {book.edition ?? "N/A"}
                </p>
              </div>
              <div className="mt-6">
                <strong className="text-primary">Mô tả:</strong>
                <p className="mt-2 text-muted-foreground">
                  {book.description ?? "Không có mô tả."}
                </p>
              </div>

              {/* Book Copies Section */}
              <div className="mt-6">
                <div
                  className="flex cursor-pointer items-center"
                  onClick={() => setShowCopies(!showCopies)}
                >
                  {showCopies ? (
                    <ChevronDownIcon className="h-5 w-5 text-primary" />
                  ) : (
                    <ChevronRightIcon className="h-5 w-5 text-primary" />
                  )}
                  <h3 className="ml-1 text-lg font-semibold text-primary">
                    Các bản sao ({book.bookcopy?.length || 0})
                  </h3>
                </div>

                {showCopies && book.bookcopy && book.bookcopy.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {book.bookcopy.map((copy: any, index: number) => (
                      <div
                        key={copy.copy_id}
                        className="cursor-pointer rounded-md border border-border p-3 hover:bg-muted"
                        onClick={() => handleCopyClick(copy)}
                      >
                        <div className="flex justify-between">
                          <p className="font-medium text-primary">
                            Mã bản sao: {copy.copy_id}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Trạng thái:{" "}
                            {copy.condition?.condition_name || "Không rõ"}
                          </p>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Ngày nhập:{" "}
                          {new Date(copy.acquisition_date).toLocaleDateString(
                            "vi-VN",
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Giá: {copy.price.toLocaleString("vi-VN")} VNĐ
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {showCopies &&
                  (!book.bookcopy || book.bookcopy.length === 0) && (
                    <p className="mt-2 text-sm italic text-muted-foreground">
                      Không có bản sao nào
                    </p>
                  )}
              </div>

              <div className="mt-6 flex space-x-3">
                <Button variant="default" onClick={onClose}>
                  <XMarkIcon className="h-5 w-5" />
                  Đóng
                </Button>
                <Button variant="default" onClick={onEdit}>
                  <PencilSquareIcon className="h-5 w-5" />
                  Sửa
                </Button>
                <Button variant="destructive">
                  <TrashIcon className="h-5 w-5" />
                  Xóa
                </Button>
              </div>
            </div>
            <div className="w-full lg:w-1/2">
              <img
                src={book.cover_image || "/api/placeholder/400/600"}
                alt={`Ảnh bìa ${book.title}`}
                className="h-full w-full rounded-lg object-cover shadow-lg"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BookTitleDetail;
