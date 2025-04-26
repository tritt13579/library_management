"use client";
import React, { useState } from "react";
import BookCard from "./bookCard";
import {
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  FolderPlusIcon,
  ArrowUpOnSquareIcon,
  ArrowDownOnSquareIcon,
  PencilSquareIcon,
  TrashIcon,
  CubeIcon
} from "@heroicons/react/24/solid";

const BooksPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isFileOpend, setIsFileOpend] = useState(false);
  const [isCategory, setIsCategory] = useState(false);

  const categories = ["Tất cả", "Văn học", "Lịch sử", "Khoa học", "Thiếu nhi"];
  const books = [
    {
      title: "Dế Mèn Phiêu Lưu Ký",
      author: "Tô Hoài",
      image: "/images/books/vidubook.jpg",
      category: "Thiếu nhi",
      description: "Một cuốn sách nổi tiếng trong văn học thiếu nhi Việt Nam.",
    },
    {
      title: "Sapiens: Lược sử loài người",
      author: "Yuval Noah Harari",
      image: "/images/books/vidubook.jpg",
      category: "Khoa học",
      description: "Cuốn sách này kể về lịch sử loài người từ thời kỳ nguyên thủy đến nay.",
    },
    {
      title: "Sapiens: Lược sử loài người",
      author: "Yuval Noah Harari",
      image: "/images/books/vidubook.jpg",
      category: "Khoa học",
      description: "Cuốn sách này kể về lịch sử loài người từ thời kỳ nguyên thủy đến nay.",
    },
    {
      title: "Sapiens: Lược sử loài người",
      author: "Yuval Noah Harari",
      image: "/images/books/vidubook.jpg",
      category: "Khoa học",
      description: "Cuốn sách này kể về lịch sử loài người từ thời kỳ nguyên thủy đến nay.",
    },
    {
      title: "Sapiens: Lược sử loài người",
      author: "Yuval Noah Harari",
      image: "/images/books/vidubook.jpg",
      category: "Khoa học",
      description: "Cuốn sách này kể về lịch sử loài người từ thời kỳ nguyên thủy đến nay.",
    },
    {
      title: "Sapiens: Lược sử loài người",
      author: "Yuval Noah Harari",
      image: "/images/books/vidubook.jpg",
      category: "Khoa học",
      description: "Cuốn sách này kể về lịch sử loài người từ thời kỳ nguyên thủy đến nay.",
    },
  ];

  const getBooksByCategory = (category: string) =>
    books.filter((book) => book.category === category);

  const toggleExpand = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleCardClick = (book: any) => {
    setSelectedBook(book);
    setIsDetailOpen(true);
    setIsAddOpen(false);
    setIsEditOpen(false);
    setIsFileOpend(false);
    setIsCategory(false);
  };

  const closeModal = () => {
    setIsDetailOpen(false);
    setSelectedBook(null);
  };

  const handleAdd = () => {
    setIsAddOpen(true);
    setIsDetailOpen(false);
    setSelectedBook(null);
    setIsEditOpen(false);
    setIsFileOpend(false);
    setIsCategory(false);
  }

  const closeAdd = () => {
    setIsAddOpen(false);
    setIsEditOpen(false);
  }

  const handleEdit = () => {
    setIsEditOpen(true);
    setIsAddOpen(false);
    setIsDetailOpen(false);
    setSelectedBook(null);
    setIsFileOpend(false);
    setIsCategory(false);
  }

  const handleFile = () => {
    setIsFileOpend(true);
    setIsAddOpen(false);
    setIsDetailOpen(false);
    setSelectedBook(null);
    setIsEditOpen(false);
    setIsCategory(false);
  }

  const closeFile = () => {
    setIsFileOpend(false)
  }

  const handleCat = () => {
    setIsCategory(true);
    setIsFileOpend(false);
    setIsAddOpen(false);
    setIsDetailOpen(false);
    setSelectedBook(null);
    setIsEditOpen(false);
    setIsFileOpend(false);
  }

  const closeCat = () => {
    setIsCategory(false);
  }

  return (
    <div className="p-6 space-y-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="border bg-input border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0071BC] w-64"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border bg-input border-gray-300 rounded-md px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
          >
            {categories.map((cat, index) => (
              <option key={index} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <button className="bg-primary text-white px-4 py-3 rounded-md hover:bg-[#005f9e] transition flex items-center justify-center">
            <MagnifyingGlassIcon className="w-5 h-5 text-primary-foreground" />
          </button>
        </div>

        <div className="hidden md:flex space-x-2">
          <FilterButton
            icon={<FolderPlusIcon className="w-4 h-4 text-[#0071BC]" />}
            label="Thêm sách"
            onClick={handleAdd}
          />
          <FilterButton
            icon={<ArrowUpOnSquareIcon className="w-4 h-4 text-[#0071BC]" />}
            label="Tải lên sách"
            onClick={handleFile}
          />
          <FilterButton
            icon={<CubeIcon className="w-4 h-4 text-[#0071BC]" />}
            label="Thể loại"
            onClick={handleCat}
          />
        </div>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden text-[#0071BC] p-2 border border-gray-300 rounded-md"
        >
          {isMobileMenuOpen ? (
            <XMarkIcon className="w-5 h-5" />
          ) : (
            <Bars3Icon className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Khi mở menu mobile */}
      {isMobileMenuOpen && (
        <div className="mt-4 flex flex-col space-y-4 md:hidden">
          {/* Danh mục mobile */}
          <div className="flex flex-col space-y-2">
            <FilterButton
              icon={<FolderPlusIcon className="w-4 h-4 text-[#0071BC]" />}
              label="Thêm sách"
              onClick={handleAdd}
            />
            <FilterButton
              icon={<ArrowUpOnSquareIcon className="w-4 h-4 text-[#0071BC]" />}
              label="Tải lên sách"
              onClick={handleFile}
            />
            <FilterButton
              icon={<CubeIcon className="w-4 h-4 text-[#0071BC]" />}
              label="Thể loại"
              onClick={handleCat}
            />
          </div>
        </div>
      )}

      {isCategory && (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-background rounded-lg p-8 w-full max-w-md space-y-6">
          <h2 className="text-2xl font-semibold text-primary">Quản lý thể loại</h2>

            {/* Thêm thể loại mới */}
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Tên thể loại mới"
                className="flex-1 border bg-input border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
              />
              <button
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-[#005f9e]"
              >
                Thêm
              </button>
            </div>

            {/* Danh sách thể loại */}
            <ul className="space-y-2 max-h-60 overflow-y-auto">
            {categories.map((category, index) => (
              <li
                key={index}
                className="flex justify-between items-center border-b border-gray-200 pb-1"
              >
                <span className="text-foreground">{category}</span>
                <button
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Xóa
                </button>
              </li>
            ))}
          </ul>

          <div className="flex justify-end pt-4">
            <button
              onClick={closeCat}
              className="bg-accent-foreground text-muted-foreground px-4 py-2 rounded-md"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
      )}


      {isFileOpend && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-background rounded-lg p-8 w-full max-w-md space-y-6">
          <h2 className="text-2xl font-semibold text-primary">Tải lên tài liệu</h2>
      
          <div className="space-y-3">
            <label className="block text-sm font-medium text-foreground">
              Chọn file (.xlsx, .xls, .docx, .doc)
            </label>
            <input
              type="file"
              accept=".xlsx,.xls,.docx,.doc"
              className="block w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 bg-input focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
              onChange={(e) => {
                const file = e.target.files?.[0];
                // xử lý file ở đây
                console.log(file);
              }}
            />
          </div>
      
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={closeFile}
              className="bg-accent-foreground text-muted-foreground px-4 py-2 rounded-md"
            >
              Hủy
            </button>
            <button
              onClick={() => console.log("Tải lên")}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-[#005f9e]"
            >
              Tải lên
            </button>
          </div>
        </div>
      </div>
      )}

      {(isAddOpen || isEditOpen) && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-background rounded-lg p-8 w-5/6 max-w-2xl space-y-4 max-h-[90vh] overflow-y-auto">
          <h2 className="text-2xl font-semibold text-primary mb-4">
            {isAddOpen ? "Thêm sách mới" : "Chỉnh sửa sách"}
          </h2>
          <div className="grid grid-cols-1 gap-4">
            <input
              type="text"
              placeholder="Tên sách"
              className="border bg-input border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
            />
            <input
              type="text"
              placeholder="Tác giả"
              className="border bg-input border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
            />
            <input
              type="text"
              placeholder="Năm xuất bản"
              className="border bg-input border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
            />
      
            {/* ISBN + Kệ sách cùng hàng */}
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="ISBN"
                className="border bg-input border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
              />
              <input
                type="text"
                placeholder="Kệ sách"
                className="border bg-input border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
              />
            </div>
      
            {/* Ngôn ngữ + Lần sửa đổi cùng hàng */}
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Ngôn ngữ"
                className="border bg-input border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
              />
              <input
                type="text"
                placeholder="Lần sửa đổi"
                className="border bg-input border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
              />
            </div>
      
            <select className="border bg-input border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0071BC]">
              <option value="">Chọn thể loại</option>
              {categories
                .filter((c) => c !== "Tất cả")
                .map((cat, index) => (
                  <option key={index} value={cat}>
                    {cat}
                  </option>
                ))}
            </select>
      
            <textarea
              placeholder="Mô tả sách"
              rows={4}
              className="border bg-input border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
            />
          </div>
      
          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={closeAdd}
              className="bg-accent-foreground text-muted-foreground px-4 py-2 rounded-md"
            >
              Hủy
            </button>
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-[#005f9e]">
              Lưu sách
            </button>
          </div>
        </div>
      </div>      
      )}

      {isDetailOpen && selectedBook && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-40">
          <div className="bg-background rounded-lg p-8 w-5/6 max-w-5xl flex flex-col lg:flex-row max-h-[90vh] overflow-y-auto">
            <div className="w-full lg:w-2/3 pr-2 mb-2 lg:mb-0">
              <h2 className="text-3xl font-semibold text-primary">
                {selectedBook.title}
              </h2>
              <p className="text-lg text-muted-foreground mt-2">Tác giả: {selectedBook.author}</p>

              <div className="mt-6 space-y-3 text-muted-foreground">
                <p>
                  <strong className="text-primary">Thể loại:</strong> {selectedBook.category}
                </p>
                <p>
                  <strong className="text-primary">Năm xuất bản:</strong> 1941
                </p>
                <p>
                  <strong className="text-primary">ISBN:</strong> 978-3-16-148410-0
                </p>
                <p>
                  <strong className="text-primary">Kệ sách:</strong> Kệ A3
                </p>
                <p>
                  <strong className="text-primary">Ngôn ngữ:</strong> Tiếng Việt
                </p>
                <p>
                  <strong className="text-primary">Người đăng:</strong> Phạm Hồ Như Thủy
                </p>
                <p>
                  <strong className="text-primary">Ngày đăng:</strong> 01/01/2023
                </p>
                <p>
                  <strong className="text-primary">Lần sửa đổi:</strong> lần thứ nhất
                </p>
              </div>

              <div className="mt-6">
                <strong className="text-primary">Mô tả:</strong>
                <p className="mt-2 text-muted-foreground">{selectedBook.description}</p>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={closeModal}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-[#005f9e] transition"
                >
                  Đóng
                </button>
                <button onClick={handleEdit} className="flex space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-[#005f9e] transition">
                  <PencilSquareIcon className="w-5 h-5" />
                  Sửa
                </button>
                <button className="flex space-x-2 bg-destructive text-primary-foreground px-4 py-2 rounded-md hover:bg-red-700 transition">
                  <TrashIcon className="w-5 h-5" />
                  Xóa
                </button>
              </div>
            </div>

            <div className="w-full lg:w-1/2">
              <img
                src={selectedBook.image}
                alt={`Ảnh bìa ${selectedBook.title}`}
                className="w-full h-full object-cover rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      )}

      {(selectedCategory === "Tất cả"
        ? categories.filter((c) => c !== "Tất cả")
        : [selectedCategory]
      ).map((category) => {
        const booksInCategory = getBooksByCategory(category);
        if (booksInCategory.length === 0) return null;

        const isExpanded = expandedCategories.includes(category);
        const visibleBooks = isExpanded
          ? booksInCategory
          : booksInCategory.slice(0, 4);

        return (
          <div key={category}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-primary">{category}</h2>
              {booksInCategory.length > 4 && (
                <button
                  className="text-sm text-[#005f9e] border border-[#005f9e] rounded-md px-3 py-1 hover:underline transition"
                  onClick={() => toggleExpand(category)}
                >
                  {isExpanded ? "Thu gọn ↑" : "Xem thêm →"}
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {visibleBooks.map((book, index) => (
                <div key={index} onClick={() => handleCardClick(book)}>
                  <BookCard
                    title={book.title}
                    author={book.author}
                    image={book.image}
                    category={book.category}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

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
    className="flex bg-background items-center space-x-2 border border-gray-300 rounded-md px-3 py-2 shadow-sm hover:shadow-md transition"
  >
    {icon}
    <span className="text-sm">{label}</span>
  </button>
);

export default BooksPage;
