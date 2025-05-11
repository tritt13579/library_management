"use client";
import React, { useState, useEffect } from "react";
import { supabaseClient } from "@/lib/client";
import NotificationModal from "@/components/NotificationModel";

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
  const [selectedLoanStatus, setSelectedLoanStatus] = useState('');
  const [loan, setLoan] = useState<any[]>([]);

  useEffect(() => {
    const fetchLoan = async () => {
      const supabase = supabaseClient();
      const { data, error } = await supabase
        .from("loantransaction")
        .select(`
          *,
          librarycard:card_id(*, reader(*)),
          staff:staff_id(*),
          loandetail!inner (
            *,bookcopy:copy_id (*, booktitle(*))
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
      id: detail.bookcopy.copy_id,
      title: detail.bookcopy.booktitle.title,
      coverUrl: detail.bookcopy.booktitle.cover_url,
      borrowedAt: l.transaction_date,
      dueAt: l.due_date,
      returnAt: detail.return_date,
      borrower: l.librarycard.reader.last_name + " " + l.librarycard.reader.first_name,
      birthdate: l.librarycard.reader.date_of_birth,
      address: l.librarycard.reader.address,
      phone: l.librarycard.reader.phone,
      status: l.loan_status,
      notifyStatus: l.notify_status || 'Chưa gửi',
      price: detail.bookcopy.price,
    }))
  );

  const overdueBooks = borrowedBooks.filter(
    (book) => new Date(book.dueAt) < today && book.status !== 'Đã trả'
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

    const isOverdue = new Date(book.dueAt) < today && book.status !== 'Đã trả';

    const matchesDue =
      !selectedDueStatus ||
      (selectedDueStatus === 'onTime' && book.status === 'Đã trả') ||
      (selectedDueStatus === 'overdue' && isOverdue);

    const matchesLoanStatus =
      !selectedLoanStatus || book.status === selectedLoanStatus;

    return matchesSearch && matchesNotify && matchesDue && matchesLoanStatus;
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Giao dịch mượn/trả</h1>

      {/* Filter Section */}
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
            value={selectedLoanStatus}
            onChange={(e) => setSelectedLoanStatus(e.target.value)}
            className="rounded-md border border-gray-300 bg-input px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
          >
            <option value="">Tất cả trạng thái mượn</option>
            <option value="Đã trả">Đã trả</option>
            <option value="Trả muộn">Trả muộn</option>
          </select>
        </div>
      </div>

      {filteredBooks.map((book, index) => {
        const borrowedDate = new Date(book.borrowedAt);
        const dueDate = new Date(book.dueAt);
        const isOverdue = dueDate < today && book.status !== 'Đã trả';
        const daysBorrowed = Math.floor((today.getTime() - borrowedDate.getTime()) / (1000 * 60 * 60 * 24));

        let borderColor = 'border-gray-200';
        if (book.status === 'Đã trả') borderColor = 'border-green-400';
        else if (isOverdue) borderColor = 'border-red-300';

        return (
          <div
            key={index}
            onClick={() => isOverdue && setSelectedBorrower(book.borrower)}
            className={`mt-6 mb-6 space-y-4 cursor-pointer flex items-start space-x-4 rounded-lg border p-4 shadow-sm bg-background ${borderColor}`}
          >
            <img src={book.coverUrl} alt={book.title} className="w-20 h-28 object-cover rounded" />
            <div className="flex-1 space-y-1">
              <div className="font-medium text-lg">{book.title}</div>
              <div className="text-sm text-gray-600">Người mượn: {book.borrower}</div>
              <div className="text-sm">Ngày mượn: {borrowedDate.toLocaleString()}</div>
              {book.status !== 'Đã trả' && (
                <div className="text-sm">Số ngày đã mượn: {daysBorrowed} ngày</div>
              )}
              {book.status === 'Đã trả' && book.returnAt && (
                <div className="text-sm">Ngày trả: {new Date(book.returnAt).toLocaleString()}</div>
              )}
              <div className={`text-sm ${isOverdue ? 'text-red-500' : book.status === 'Đã trả' ? 'text-green-600' : ''}`}>
                Trạng thái: {book.status}
              </div>
              <div className="text-sm">Thông báo: <span className="font-medium">{book.notifyStatus}</span></div>
            </div>
          </div>
        );
      })}

      {selectedBorrower && (
        <NotificationModal
          today={today}
          books={groupedOverdues[selectedBorrower]}
            borrowerInfo={{
            borrower: groupedOverdues[selectedBorrower][0]?.borrower,
            birthdate: groupedOverdues[selectedBorrower][0]?.birthdate,
            address: groupedOverdues[selectedBorrower][0]?.address,
            phone: groupedOverdues[selectedBorrower][0]?.phone,
          }}
          onClose={() => setSelectedBorrower(null)}
          numberToVietnameseWords={numberToVietnameseWords}
        />
      )}
    </div>
  );
}
