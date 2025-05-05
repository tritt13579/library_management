'use client';
import React, { useState, useEffect } from "react";
import { supabaseClient } from "@/lib/client";
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
const statuses = ['Tất cả', 'Đang chờ', 'Đã xác nhận', 'Chưa mượn'];
export default function QueuePage() {
  const [books, setBooks] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [selectedStatus, setSelectedStatus] = useState('Tất cả');
  const [expandedQueues, setExpandedQueues] = useState<number[]>([]);
  const maxVisible = 3;
  useEffect(() => {
    const fetchBooks = async () => {
      const supabase = supabaseClient();
      const { data, error } = await supabase
        .from("booktitle")
        .select(`
          *,
          category:category_id(category_name),
          iswrittenby!inner (
            author:author_id ( author_name )
          ),
          bookcopy(*),
          reservation(*, librarycard(*, reader(*)), reservationqueue(*))
        `);
      if (error) {
        console.error("Error fetching books:", error);
      } else {
        const normalized = data.map((book: any) => {
          const currentReservation = book.reservation?.[0];
          const readerInfo = currentReservation?.librarycard?.reader;
          return {
            ...book,
            title: book.title || 'Không tiêu đề',
            category: book.category?.category_name || 'Không rõ',
            author: book.iswrittenby?.[0]?.author?.author_name || 'Không rõ',
            queue: book.queue || [],
            status: currentReservation?.reservation_status || 'Chưa mượn',
            statusColor: getStatusColor(currentReservation?.reservation_status),
            currentReader: readerInfo
              ? `${readerInfo.last_name} ${readerInfo.first_name}`
              : '',
            copyCode: book.bookcopy?.[0]?.copy_id || 'N/A',
            cover: book.cover_image || '/default-cover.jpg',
          };
        });
        setBooks(normalized);
      }
    };
    fetchBooks();
  }, []);
  useEffect(() => {
    const fetchCategories = async () => {
      const supabase = supabaseClient();
      const { data, error } = await supabase.from("category").select("*");
      if (error) {
        console.error("Error fetching categories:", error);
      } else {
        const categoryNames = data.map((cat: any) => cat.category_name);
        setCategories(["Tất cả", ...categoryNames]);
      }
    };
    fetchCategories();
  }, []);
  const filteredBooks = books.filter((book) => {
    const search = searchText.toLowerCase();
    const matchesText =
      book.title.toLowerCase().includes(search) ||
      book.currentReader.toLowerCase().includes(search) ||
      book.queue.some((name: string) => name.toLowerCase().includes(search));
    const matchesCategory =
      selectedCategory === 'Tất cả' || book.category === selectedCategory;
    const matchesStatus =
      selectedStatus === 'Tất cả' || book.status === selectedStatus;
    return matchesText && matchesCategory && matchesStatus;
  });
  const toggleQueue = (bookId: number) => {
    setExpandedQueues((prev) =>
      prev.includes(bookId) ? prev.filter((id) => id !== bookId) : [...prev, bookId]
    );
  };
  return (
    <div className="space-y-6 p-6">
      {/* --- Filter Menu --- */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-64 rounded-md border border-gray-300 bg-input px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-md border border-gray-300 bg-input px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
          >
            {categories.map((cat, index) => (
              <option key={index} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-md border border-gray-300 bg-input px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
          >
            {statuses.map((status, index) => (
              <option key={index} value={status}>
                {status}
              </option>
            ))}
          </select>
          <button className="flex items-center justify-center rounded-md bg-primary px-4 py-3 text-white transition hover:bg-[#005f9e]">
            <MagnifyingGlassIcon className="h-5 w-5 text-primary-foreground" />
          </button>
        </div>
      </div>
      {/* --- Danh sách sách hàng đợi --- */}
      {filteredBooks.map((book) => {
        const isExpanded = expandedQueues.includes(book.id);
        const visibleQueue = isExpanded
          ? book.queue
          : book.queue.slice(0, maxVisible);
        return (
          <div
            key={book.id}
            className="w-full p-4 shadow-sm border rounded-xl bg-background"
          >
            <div className="flex items-start justify-between">
              <img
                src={book.cover}
                alt="Ảnh sách"
                className="h-28 w-20 object-cover rounded-md border"
              />
              <div className="flex-1 ml-4 space-y-1">
                <h3 className="text-lg font-semibold text-primary">{book.title}</h3>
                <p className="text-sm text-muted-foreground">Tác giả: {book.author}</p>
                <p className="text-sm">Mã sách: <strong>{book.copyCode}</strong></p>
                <p className="text-sm">Thể loại: <strong>{book.category}</strong></p>
                <p className="text-sm">
                  <strong>Trạng thái:</strong>{' '}
                  <span className={`${book.statusColor} font-medium`}>{book.status}</span>
                </p>
                {book.currentReader && (
                  <p className="text-sm">
                    <strong>Độc giả mượn:</strong> {book.currentReader}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-3 border-t pt-2">
              <p className="text-sm font-medium text-gray-700">Hàng đợi:</p>
              {book.queue.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">Không có độc giả chờ</p>
              ) : (
                <>
                  <ul className="list-disc ml-5 text-sm text-muted-foreground space-y-0.5">
                    {visibleQueue.map((name: string, idx: number) => (
                      <li key={idx}>{name}</li>
                    ))}
                  </ul>
                  {book.queue.length > maxVisible && (
                    <button
                      onClick={() => toggleQueue(book.id)}
                      className="mt-2 text-sm text-[#005f9e] hover:underline"
                    >
                      {isExpanded ? 'Ẩn bớt' : 'Xem thêm'}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
// Hàm helper để lấy màu trạng thái
function getStatusColor(status: string = '') {
  switch (status) {
    case 'Đang chờ':
      return 'text-yellow-600';
    case 'Đã xác nhận':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
}