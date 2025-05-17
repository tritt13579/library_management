"use client";
import React, { useState, useEffect } from "react";
import { supabaseClient } from "@/lib/client";
import { Input } from "@/components/ui/input";
import NoticeModal from "@/components/NoticeModel";
import { useToast } from "@/hooks/use-toast";

function numberToVietnameseWords(n: number): string {
  if (n === 0) return "không";
  const units = ["", "nghìn", "triệu", "tỷ"];
  const numberWords = [
    "không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín",
  ];
  function readThreeDigits(num: number): string {
    const hundred = Math.floor(num / 100);
    const tenUnit = num % 100;
    const ten = Math.floor(tenUnit / 10);
    const unit = tenUnit % 10;
    let result = "";
    if (hundred > 0) {
      result += numberWords[hundred] + " trăm";
      if (ten === 0 && unit > 0) result += " linh";
    }
    if (ten > 1) {
      result += " " + numberWords[ten] + " mươi";
      if (unit === 1) result += " mốt";
      else if (unit === 5) result += " lăm";
      else if (unit > 0) result += " " + numberWords[unit];
    } else if (ten === 1) {
      result += " mười";
      if (unit === 1) result += " một";
      else if (unit === 5) result += " lăm";
      else if (unit > 0) result += " " + numberWords[unit];
    } else if (unit > 0) {
      result += " " + numberWords[unit];
    }
    return result.trim();
  }
  const parts: string[] = [];
  let unitIndex = 0;
  while (n > 0) {
    const block = n % 1000;
    if (block > 0) {
      const blockText = readThreeDigits(block);
      parts.unshift(`${blockText} ${units[unitIndex]}`.trim());
    }
    n = Math.floor(n / 1000);
    unitIndex++;
  }
  return parts.join(" ").replace(/\s+/g, " ");
}

export default function NoticePage() {
  const { toast } = useToast();
  const today = new Date();
  const [selectedBorrower, setSelectedBorrower] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
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
  }, [refreshTrigger]);

  const borrowedBooks = loan.flatMap((l) =>
    l.loandetail.map((detail: any) => ({
      id: detail.bookcopy.copy_id,
      title: detail.bookcopy.booktitle.title,
      coverUrl: detail.bookcopy.booktitle.cover_image,
      borrowedAt: l.transaction_date,
      dueAt: l.due_date,
      returnAt: detail.return_date,
      borrower: l.librarycard.reader.last_name + " " + l.librarycard.reader.first_name,
      birthdate: l.librarycard.reader.date_of_birth,
      address: l.librarycard.reader.address,
      phone: l.librarycard.reader.phone,
      status: l.loan_status,
      price: detail.bookcopy.price,
      loan_transaction_id: l.loan_transaction_id,
      loan_detail_id: detail.loan_detail_id,
    }))
  );

  const overdueBooks = borrowedBooks.filter(
    (book) => new Date(book.dueAt) < today && book.status !== 'Đã trả'
  );

  const filteredOverdues = overdueBooks.filter((book) =>
    book.title.toLowerCase().includes(searchText.toLowerCase()) ||
    book.borrower.toLowerCase().includes(searchText.toLowerCase())
  );

  const groupedOverdues = overdueBooks.reduce((acc: any, book) => {
    if (!acc[book.borrower]) acc[book.borrower] = [];
    acc[book.borrower].push(book);
    return acc;
  }, {});

  const handleSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
    toast({
      title: "Thành công",
      description: "Dữ liệu đã được cập nhật thành công.",
      variant: "success",
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Chậm trả</h1>

      <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="min-w-[150px] flex-1 py-6"
          />
        </div>
      </div>

      {filteredOverdues.map((book, index) => {
        const borrowedDate = new Date(book.borrowedAt);
        const dueDate = new Date(book.dueAt);
        const daysBorrowed = Math.floor((today.getTime() - borrowedDate.getTime()) / (1000 * 60 * 60 * 24));

        return (
          <div
            key={index}
            onClick={() => setSelectedBorrower(book.borrower)}
            className="mt-6 mb-6 space-y-4 cursor-pointer flex items-start space-x-4 rounded-lg border p-4 shadow-sm bg-background border-red-300"
          >
            <img src={book.coverUrl} alt={book.title} className="w-20 h-28 object-cover rounded" />
            <div className="flex-1 space-y-1">
              <div className="font-medium text-lg">{book.title}</div>
              <div className="text-sm text-gray-600">Người mượn: {book.borrower}</div>
              <div className="text-sm">Ngày mượn: {borrowedDate.toLocaleString()}</div>
              <div className="text-sm">Số ngày đã mượn: {daysBorrowed} ngày</div>
              <div className="text-sm text-red-500">Trạng thái: {book.status}</div>
            </div>
          </div>
        );
      })}

      {selectedBorrower && (
        <NoticeModal
          open={!!selectedBorrower}
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
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
