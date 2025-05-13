import React from "react";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";

const BookCopyDetail = ({
  bookTitle,
  bookCopy,
  onBack,
}: {
  bookTitle: any;
  bookCopy: any;
  onBack: () => void;
}) => {
  if (!bookCopy) return null;

  return (
    <div className="w-full px-4 py-2">
      <button
        onClick={onBack}
        className="mb-4 inline-flex items-center text-primary hover:text-blue-700"
      >
        <ArrowLeftIcon className="mr-2 h-4 w-4" />
        Quay lại
      </button>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Ảnh bìa */}
        <div className="lg:col-span-1">
          <img
            src={bookTitle.cover_image || "/api/placeholder/300/450"}
            alt={`Ảnh bìa ${bookTitle.title}`}
            className="w-full rounded-md object-cover shadow-md"
          />
        </div>

        {/* Thông tin bản sao */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-semibold text-primary mb-2">
            {bookTitle.title}{" "}
            <span className="text-base text-muted-foreground">
              - Bản sao #{bookCopy.copy_id}
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="rounded-md bg-accent p-4 text-accent-foreground">
              <h3 className="mb-3 text-lg font-medium text-primary">
                Thông tin bản sao
              </h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>
                  <strong className="text-primary">Mã bản sao:</strong>{" "}
                  {bookCopy.copy_id}
                </li>
                <li>
                  <strong className="text-primary">Tình trạng:</strong>{" "}
                  {bookCopy.condition?.condition_name || "Không rõ"}
                </li>
                <li>
                  <strong className="text-primary">Ngày nhập:</strong>{" "}
                  {new Date(bookCopy.acquisition_date).toLocaleDateString("vi-VN")}
                </li>
                <li>
                  <strong className="text-primary">Giá tiền:</strong>{" "}
                  {bookCopy.price.toLocaleString("vi-VN")} VNĐ
                </li>
              </ul>
            </div>

            <div className="rounded-md border border-gray-200 p-4">
              <h3 className="mb-3 text-lg font-medium text-primary">
                Thông tin sách
              </h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>
                  <strong className="text-primary">Tác giả:</strong>{" "}
                  {bookTitle.iswrittenby?.[0]?.author?.author_name ?? "Không rõ"}
                </li>
                <li>
                  <strong className="text-primary">Thể loại:</strong>{" "}
                  {bookTitle.category?.category_name ?? "Không rõ"}
                </li>
                <li>
                  <strong className="text-primary">Nhà xuất bản:</strong>{" "}
                  {bookTitle.publisher?.publisher_name ?? "Không rõ"}
                </li>
                <li>
                  <strong className="text-primary">Vị trí:</strong>{" "}
                  {bookTitle.shelf?.location ?? "N/A"}
                </li>
                <li>
                  <strong className="text-primary">ISBN:</strong>{" "}
                  {bookTitle.isbn ?? "N/A"}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookCopyDetail;
