"use client";
import React, { useState, useEffect } from "react";
import { supabaseClient } from "@/lib/client";
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

function numberToVietnameseWords(n: number): string {
  const units = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
  if (n === 0) return 'không';

  const parts: string[] = [];
  const number = Math.floor(n);

  const thousands = Math.floor(number / 1000);
  const hundreds = Math.floor((number % 1000) / 100);
  const tensDigit = Math.floor((number % 100) / 10);
  const ones = number % 10;

  if (thousands > 0) parts.push(`${units[thousands]} nghìn`);
  if (hundreds > 0) parts.push(`${units[hundreds]} trăm`);
  if (tensDigit > 1) {
    parts.push(`${units[tensDigit]} mươi`);
    if (ones > 0) parts.push(`${units[ones]}`);
  } else if (tensDigit === 1) {
    parts.push(`mười`);
    if (ones > 0) parts.push(`${units[ones]}`);
  } else if (ones > 0) {
    parts.push(`lẻ ${units[ones]}`);
  }

  return parts.join(' ');
}

export default function BorrowPage() {
  const today = new Date();
  const [selectedBorrower, setSelectedBorrower] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [selectedNotifyStatus, setSelectedNotifyStatus] = useState('');
  const [selectedDueStatus, setSelectedDueStatus] = useState('');
  const [loan, setLoan] = useState<any[]>([]);

  useEffect(() => {
    const fetchLoan = async () => {
      const supabase = supabaseClient();
      const { data, error } = await supabase
        .from("loantransaction")
        .select(`
          *,
          librarycard:card_id(*),
          staff:staff_id(*),
          loandetail!inner (
            bookcopy:copy_id (*, booktitle(*))
          )
        `);

      if (error) {
        console.error("Error fetching books:", error);
      } else {
        setLoan(data || []);
      }
    };

    fetchLoan();
  }, []);

  const borrowedBooks = loan.flatMap((l) =>
    l.loandetail.map((detail: any) => ({
      id: detail.bookcopy.id,
      title: detail.bookcopy.booktitle.title,
      author: detail.bookcopy.booktitle.author,
      coverUrl: detail.bookcopy.booktitle.cover_url,
      borrowedAt: l.borrowed_date,
      dueAt: l.due_date,
      borrower: l.librarycard.fullname,
      birthdate: l.librarycard.birthdate,
      address: l.librarycard.address,
      phone: l.librarycard.phone,
      notifyStatus: l.notify_status || 'Chưa gửi',
      price: detail.bookcopy.booktitle.price,
    }))
  );

  const overdueBooks = borrowedBooks.filter(
    (book) => new Date(book.dueAt) < today
  );

  const groupedOverdues = overdueBooks.reduce((acc: any, book) => {
    if (!acc[book.borrower]) acc[book.borrower] = [];
    acc[book.borrower].push(book);
    return acc;
  }, {});

  const filteredBooks = borrowedBooks.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchText.toLowerCase()) ||
      book.borrower.toLowerCase().includes(searchText.toLowerCase());

    const matchesNotify =
      !selectedNotifyStatus || book.notifyStatus === selectedNotifyStatus;

    const isOverdue = new Date(book.dueAt) < today;
    const matchesDue =
      !selectedDueStatus ||
      (selectedDueStatus === 'onTime' && !isOverdue) ||
      (selectedDueStatus === 'overdue' && isOverdue);

    return matchesSearch && matchesNotify && matchesDue;
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Sách đang mượn</h1>

      {/* --- Filter Menu --- */}
      <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-64 rounded-md border border-gray-300 bg-input px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
          />
          <select
            value={selectedNotifyStatus}
            onChange={(e) => setSelectedNotifyStatus(e.target.value)}
            className="rounded-md border border-gray-300 bg-input px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
          >
            <option value="">Tất cả trạng thái thông báo</option>
            <option value="Đã gửi">Đã gửi</option>
            <option value="Chưa gửi">Chưa gửi</option>
          </select>
          <select
            value={selectedDueStatus}
            onChange={(e) => setSelectedDueStatus(e.target.value)}
            className="rounded-md border border-gray-300 bg-input px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
          >
            <option value="">Tất cả trạng thái hạn</option>
            <option value="onTime">Đã trả</option>
            <option value="overdue">Trả muộn</option>
          </select>
          <button className="flex items-center justify-center rounded-md bg-primary px-4 py-3 text-white transition hover:bg-[#005f9e]">
            <MagnifyingGlassIcon className="h-5 w-5 text-primary-foreground" />
          </button>
        </div>
      </div>

      {filteredBooks.map((book, index) => {
        const borrowedDate = new Date(book.borrowedAt);
        const dueDate = new Date(book.dueAt);
        const daysBorrowed = Math.floor((today.getTime() - borrowedDate.getTime()) / (1000 * 60 * 60 * 24));
        const overdueDays = today > dueDate ? Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
        const isOverdue = overdueDays > 0;

        return (
          <div
            key={index}
            onClick={() => isOverdue && setSelectedBorrower(book.borrower)}
            className={`mt-6 mb-6 space-y-4 cursor-pointer flex items-start space-x-4 rounded-lg border p-4 shadow-sm ${isOverdue ? 'bg-background border-red-300' : 'bg-background border-gray-200'}`}
          >
            <img src={book.coverUrl} alt={book.title} className="w-20 h-28 object-cover rounded" />
            <div className="flex-1 space-y-1">
              <div className="font-medium text-lg">{book.title}</div>
              <div className="text-sm text-gray-500 italic">Tác giả: {book.author}</div>
              <div className="text-sm text-gray-600">Người mượn: {book.borrower}</div>
              <div className="text-sm">Ngày mượn: {borrowedDate.toLocaleString()}</div>
              <div className="text-sm">Số ngày đã mượn: {daysBorrowed} ngày</div>
              <div className="text-sm">
                Trạng thái:{' '}
                {isOverdue ? (
                  <span className="text-red-500 font-semibold">Trễ hạn {overdueDays} ngày</span>
                ) : (
                  <span className="text-green-600">Đúng hạn</span>
                )}
              </div>
              <div className="text-sm">Thông báo: <span className="font-medium">{book.notifyStatus}</span></div>
            </div>
          </div>
        );
      })}

      {selectedBorrower && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <div className="max-h-[90vh] w-11/12 max-w-3xl overflow-y-auto rounded-lg bg-background p-6 relative">
            <h2 className="text-xl font-bold mb-4 text-primary">THÔNG BÁO SÁCH QUÁ HẠN</h2>
            <div className="space-y-2">
              <p>Ngày {today.getDate()} tháng {today.getMonth() + 1} năm {today.getFullYear()}</p>
              <p>Họ và tên người mượn: <strong>{groupedOverdues[selectedBorrower][0].borrower}</strong></p>
              <p>Ngày sinh: {groupedOverdues[selectedBorrower][0].birthdate}</p>
              <p>Địa chỉ: {groupedOverdues[selectedBorrower][0].address}</p>
              <p>Số điện thoại: {groupedOverdues[selectedBorrower][0].phone}</p>
              <p>Ngày mượn: {new Date(groupedOverdues[selectedBorrower][0].borrowedAt).toLocaleDateString()}</p>
              <p className="mt-4 font-semibold">Danh sách mượn</p>
              <table className="w-full table-auto border border-collapse border-gray-300">
                <thead>
                  <tr className="bg-gray-500">
                    <th className="border px-2 py-1 text-primary-foreground">STT</th>
                    <th className="border px-2 py-1 text-primary-foreground">Mã sách</th>
                    <th className="border px-2 py-1 text-primary-foreground">Tên sách</th>
                    <th className="border px-2 py-1 text-primary-foreground">Đơn giá</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedOverdues[selectedBorrower].map((book: any, idx: number) => (
                    <tr key={idx}>
                      <td className="border px-2 py-1 text-center">{idx + 1}</td>
                      <td className="border px-2 py-1 text-center">{book.id}</td>
                      <td className="border px-2 py-1">{book.title}</td>
                      <td className="border px-2 py-1 text-right">{book.price.toLocaleString()}đ</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-2">Số ngày quá hạn: <strong>{Math.max(...groupedOverdues[selectedBorrower].map((b: any) => Math.floor((today.getTime() - new Date(b.dueAt).getTime()) / (1000 * 60 * 60 * 24))))}</strong></p>
              {
                (() => {
                  const penaltyBooks = groupedOverdues[selectedBorrower].map((b: any) => {
                    const overdueDays = Math.floor((today.getTime() - new Date(b.dueAt).getTime()) / (1000 * 60 * 60 * 24));
                    const penalty = Math.min(overdueDays * 0.01 * b.price, b.price);
                    return { ...b, overdueDays, penalty };
                  });
                  const totalPenalty = penaltyBooks.reduce((sum: number, b: any) => sum + b.penalty, 0);
                  return (
                    <p>Số tiền phạt: <strong>{totalPenalty.toLocaleString()}đ</strong> (Viết bằng chữ: <strong>{numberToVietnameseWords(totalPenalty)} đồng</strong>)</p>
                  );
                })()
              }
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedBorrower(null)}
                className="rounded-md bg-primary text-primary-foreground px-4 py-2 hover:bg-gray-300"
              >
                Đóng
              </button>
              <button
                onClick={() => alert('Đã gửi thông báo!')}
                className="rounded-md bg-primary text-primary-foreground px-4 py-2 hover:bg-[#0071BC]"
              >
                Gửi thông báo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
