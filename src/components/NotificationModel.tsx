"use client";
import React from "react";

interface Book {
  id: string;
  title: string;
  dueAt: string;
  price: number;
}

interface BorrowerInfo {
  borrower: string;
  birthdate: string;
  address: string;
  phone: string;
}

interface Props {
  borrowerInfo: BorrowerInfo;
  books: Book[];
  today: Date;
  onClose: () => void;
  numberToVietnameseWords: (n: number) => string;
}

export default function NotificationModal({
  borrowerInfo,
  books,
  today,
  onClose,
  numberToVietnameseWords,
}: Props) {
  // Tính số ngày quá hạn và tiền phạt cho từng sách
  const penaltyBooks = books.map((b) => {
    const dueDate = new Date(b.dueAt);
    const diffDays = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    const overdueDays = Math.max(diffDays, 0);
    const daysToCharge = Math.max(overdueDays - 2, 0); // phạt từ ngày thứ 3
    const penalty = daysToCharge * 100;
    return { ...b, overdueDays, penalty };
  });

  const totalPenalty = penaltyBooks.reduce((sum, b) => sum + b.penalty, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-50">
      <div className="max-h-[90vh] w-11/12 max-w-3xl overflow-y-auto rounded-lg bg-background p-6 relative">
        <h2 className="text-xl font-bold mb-4 text-primary">THÔNG BÁO SÁCH QUÁ HẠN</h2>
        <div className="space-y-2">
          <p>Ngày {today.getDate()} tháng {today.getMonth() + 1} năm {today.getFullYear()}</p>
          <p>Họ và tên người mượn: <strong>{borrowerInfo.borrower}</strong></p>
          <p>Ngày sinh: {borrowerInfo.birthdate}</p>
          <p>Địa chỉ: {borrowerInfo.address}</p>
          <p>Số điện thoại: {borrowerInfo.phone}</p>

          <p className="mt-4 font-semibold">Danh sách mượn</p>
          <table className="w-full table-auto border border-collapse border-gray-300">
            <thead>
              <tr className="bg-gray-500">
                <th className="border px-2 py-1 text-primary-foreground">STT</th>
                <th className="border px-2 py-1 text-primary-foreground">Mã sách</th>
                <th className="border px-2 py-1 text-primary-foreground">Tên sách</th>
                <th className="border px-2 py-1 text-primary-foreground">Số ngày quá hạn</th>
                <th className="border px-2 py-1 text-primary-foreground">Tiền phạt</th>
              </tr>
            </thead>
            <tbody>
              {penaltyBooks.map((book, idx) => (
                <tr key={book.id}>
                  <td className="border px-2 py-1 text-center">{idx + 1}</td>
                  <td className="border px-2 py-1 text-center">{book.id}</td>
                  <td className="border px-2 py-1">{book.title}</td>
                  <td className="border px-2 py-1 text-center">{book.overdueDays}</td>
                  <td className="border px-2 py-1 text-right">{book.penalty.toLocaleString()}đ</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="mt-2">
            Tổng tiền phạt: <strong>{totalPenalty.toLocaleString()}đ</strong>{" "}
            (Viết bằng chữ: <strong>
              {Number.isNaN(totalPenalty)
                ? "Không xác định"
                : numberToVietnameseWords(Math.round(totalPenalty)) + " đồng"}
            </strong>)
          </p>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="rounded-md bg-primary text-primary-foreground px-4 py-2 hover:bg-gray-300"
          >
            Đóng
          </button>
          <button
            onClick={() => alert("Đã gửi thông báo!")}
            className="rounded-md bg-primary text-primary-foreground px-4 py-2 hover:bg-[#0071BC]"
          >
            Gửi thông báo
          </button>
          <button
            className="rounded-md bg-primary text-primary-foreground px-4 py-2 hover:bg-[#0071BC]"
          >
            Đã trả
          </button>
        </div>
      </div>
    </div>
  );
}
