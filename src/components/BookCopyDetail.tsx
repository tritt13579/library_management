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
    <div className="w-full">
      <button
        onClick={onBack}
        className="mb-4 flex items-center text-primary hover:text-blue-700"
      >
        <ArrowLeftIcon className="mr-1 h-4 w-4" />
        Quay lại thông tin sách
      </button>

      <div className="flex flex-col lg:flex-row">
        <div className="mb-6 w-full lg:mb-0 lg:w-2/3 lg:pr-6">
          <h2 className="text-3xl font-semibold text-primary">
            {bookTitle.title}{" "}
            <span className="text-lg text-muted-foreground">
              - Bản sao #{bookCopy.copy_id}
            </span>
          </h2>

          <div className="mt-6 space-y-3">
            <div className="rounded-md bg-accent p-4 text-accent-foreground">
              <h3 className="mb-2 text-lg font-medium text-primary">
                Thông tin bản sao
              </h3>
              <div className="space-y-2 text-muted-foreground">
                <p>
                  <strong className="text-primary">Mã bản sao:</strong>{" "}
                  {bookCopy.copy_id}
                </p>
                <p>
                  <strong className="text-primary">Tình trạng:</strong>{" "}
                  {bookCopy.condition?.condition_name || "Không rõ"}
                </p>
                <p>
                  <strong className="text-primary">Ngày nhập:</strong>{" "}
                  {new Date(bookCopy.acquisition_date).toLocaleDateString(
                    "vi-VN",
                  )}
                </p>
                <p>
                  <strong className="text-primary">Giá tiền:</strong>{" "}
                  {bookCopy.price.toLocaleString("vi-VN")} VNĐ
                </p>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="mb-2 text-lg font-medium text-primary">
                Lịch sử mượn trả
              </h3>
              <div className="rounded-md border p-4">
                <p className="text-center text-sm italic text-muted-foreground">
                  Chưa có thông tin mượn trả
                </p>
                {/* In a real app, you would map through the borrowing history here */}
              </div>
            </div>

            <div className="mt-4">
              <h3 className="mb-2 text-lg font-medium text-primary">Ghi chú</h3>
              <div className="rounded-md border p-4">
                <p className="text-sm text-muted-foreground">
                  Không có ghi chú cho bản sao này
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/3">
          <div className="rounded-md border border-gray-200 p-4">
            <h3 className="mb-3 text-lg font-medium text-primary">
              Thông tin sách
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <strong className="text-primary">Tác giả:</strong>{" "}
                {bookTitle.iswrittenby?.[0]?.author?.author_name ?? "Không rõ"}
              </p>
              <p>
                <strong className="text-primary">Thể loại:</strong>{" "}
                {bookTitle.category?.category_name ?? "Không rõ"}
              </p>
              <p>
                <strong className="text-primary">Nhà xuất bản:</strong>{" "}
                {bookTitle.publisher?.publisher_name ?? "Không rõ"}
              </p>
              <p>
                <strong className="text-primary">Vị trí:</strong>{" "}
                {bookTitle.shelf?.location ?? "N/A"}
              </p>
              <p>
                <strong className="text-primary">ISBN:</strong>{" "}
                {bookTitle.isbn ?? "N/A"}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <img
              src={bookTitle.cover_image || "/api/placeholder/300/450"}
              alt={`Ảnh bìa ${bookTitle.title}`}
              className="w-full rounded-lg object-cover shadow-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookCopyDetail;
