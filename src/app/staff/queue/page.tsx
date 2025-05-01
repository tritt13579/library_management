'use client';

import React, { useState } from 'react';
import {
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

const books = [
  {
    id: 1,
    code: 'MS001',
    title: 'Dế Mèn Phiêu Lưu Ký',
    author: 'Tô Hoài',
    category: 'Thiếu nhi',
    cover: '/images/books/vidubook.jpg',
    status: 'Đang chờ',
    statusColor: 'text-yellow-600',
    currentReader: 'Trần Thị B',
    queue: ['Nguyễn Văn C', 'Phạm Thị D', 'Lê Thị E', 'Hồ Thị N', 'Phan Văn M'],
  },
  {
    id: 2,
    code: 'MS002',
    title: 'Harry Potter và Hòn Đá Phù Thủy',
    author: 'J.K. Rowling',
    category: 'Giả tưởng',
    cover: '/images/books/vidubook.jpg',
    status: 'Đã mượn',
    statusColor: 'text-green-600',
    currentReader: 'Lê Văn H',
    queue: ['Ngô Thị I', 'Phạm Văn K'],
  },
  {
    id: 3,
    code: 'MS003',
    title: 'Lão Hạc',
    author: 'Nam Cao',
    category: 'Văn học Việt Nam',
    cover: '/images/books/vidubook.jpg',
    status: 'Chưa mượn',
    statusColor: 'text-gray-500',
    currentReader: '',
    queue: [],
  },
];

const categories = ['Tất cả', 'Thiếu nhi', 'Giả tưởng', 'Văn học Việt Nam'];
const statuses = ['Tất cả', 'Đang chờ', 'Đã mượn', 'Chưa mượn'];

export default function QueuePage() {
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [selectedStatus, setSelectedStatus] = useState('Tất cả');
  const [expandedQueues, setExpandedQueues] = useState<number[]>([]);
  const maxVisible = 3;

  const filteredBooks = books.filter((book) => {
    const search = searchText.toLowerCase();
    const matchesText =
      book.title.toLowerCase().includes(search) ||
      book.currentReader.toLowerCase().includes(search) ||
      book.queue.some((name) => name.toLowerCase().includes(search));

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
                <p className="text-sm">Mã sách: <strong>{book.code}</strong></p>
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
                    {visibleQueue.map((name, idx) => (
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

const FilterButton = ({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className="flex items-center space-x-2 rounded-md border border-gray-300 bg-background px-3 py-2 shadow-sm transition hover:shadow-md"
  >
    {icon}
    <span className="text-sm">{label}</span>
  </button>
);
