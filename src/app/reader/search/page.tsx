"use client";
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabaseClient } from "@/lib/client";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";

// Định nghĩa types
type Author = {
  author_id?: string;
  author_name: string;
};

type Category = {
  category_id?: string;
  category_name: string;
};

type Shelf = {
  shelf_id?: string;
  location: string;
};

type Publisher = {
  publisher_id?: string;
  publisher_name: string;
};

type Condition = {
  condition_id?: string;
  condition_name: string;
  description?: string;
};

type BookCopy = {
  book_copy_id: string;
  copy_id?: string;
  condition_id?: string;
  condition?: Condition;
  acquisition_date?: string;
  availability_status: "Có sẵn" | "Đang mượn" | "Thất lạc" | "Đặt trước";
  // Các trường được thêm vào từ booktitle
  title?: string;
  cover_image?: string;
  category?: Category;
  shelf?: Shelf;
  publisher?: Publisher;
  authors?: Author[];
};

const booksPerPage = 8;

// Hàm chuẩn hóa dấu cho tiếng Việt
const normalizeVietnamese = (str: string | undefined): string => {
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

const SearchPage = () => {
  const [books, setBooks] = useState<BookCopy[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<BookCopy[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const [titleFilter, setTitleFilter] = useState("");
  const [codeFilter, setCodeFilter] = useState("");
  const [authorFilter, setAuthorFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [shelfFilter, setShelfFilter] = useState("all");
  const [publisherFilter, setPublisherFilter] = useState("all");
  const [sortOption, setSortOption] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");

  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
  const startIdx = (currentPage - 1) * booksPerPage;
  const currentBooks = filteredBooks.slice(startIdx, startIdx + booksPerPage);

  const goToPrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const goToNext = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  function shuffleArray<T>(array: T[]): T[] {
    return [...array]
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
  }

  useEffect(() => {
    const fetchBooks = async () => {
      const supabase = supabaseClient();
      const { data, error } = await supabase
        .from("booktitle")
        .select(
          `*, category:category_id(category_name), iswrittenby!inner (author:author_id ( author_name )), bookcopy(*, condition:condition_id(condition_name, description)), shelf:shelf_id(location), publisher:publisher_id(publisher_name)`,
        );

      if (error) {
        console.error("Error fetching books:", error);
      } else if (data) {
        // Chuyển đổi dữ liệu thành danh sách các bản sách (bookcopy)
        const allCopies = data
          .flatMap((booktitle: any) =>
            booktitle.bookcopy?.map((copy: any) => ({
              ...copy,
              title: booktitle.title,
              cover_image: booktitle.cover_image,
              category: booktitle.category,
              shelf: booktitle.shelf,
              publisher: booktitle.publisher,
              authors: booktitle.iswrittenby?.map((w: any) => w.author),
            })),
          )
          .filter(Boolean) as BookCopy[];

        const shuffledCopies = shuffleArray(allCopies);

        setBooks(shuffledCopies);
        setFilteredBooks(shuffledCopies);
      }
    };

    fetchBooks();
  }, []);

  const handleSearch = () => {
    let filtered = [...books];

    // Tìm kiếm theo tiêu đề với chuẩn hóa dấu tiếng Việt
    if (titleFilter.trim()) {
      const normalizedTitle = normalizeVietnamese(titleFilter);
      filtered = filtered.filter((b) =>
        normalizeVietnamese(b.title).includes(normalizedTitle),
      );
    }

    // Tìm kiếm theo mã sách
    if (codeFilter.trim()) {
      filtered = filtered.filter((b) => {
        const copyId = b.book_copy_id || b.copy_id;
        if (!copyId) return false;
        return String(copyId).toLowerCase().includes(codeFilter.toLowerCase());
      });
    }

    // Lọc theo tác giả
    if (authorFilter !== "all") {
      filtered = filtered.filter((b) =>
        b.authors?.some(
          (a) =>
            normalizeVietnamese(a.author_name) ===
            normalizeVietnamese(authorFilter),
        ),
      );
    }

    // Lọc theo thể loại
    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (b) =>
          normalizeVietnamese(b.category?.category_name) ===
          normalizeVietnamese(categoryFilter),
      );
    }

    // Lọc theo kệ sách
    if (shelfFilter !== "all") {
      filtered = filtered.filter(
        (b) =>
          normalizeVietnamese(b.shelf?.location) ===
          normalizeVietnamese(shelfFilter),
      );
    }

    // Lọc theo nhà xuất bản
    if (publisherFilter !== "all") {
      filtered = filtered.filter(
        (b) =>
          normalizeVietnamese(b.publisher?.publisher_name) ===
          normalizeVietnamese(publisherFilter),
      );
    }

    // Lọc theo trạng thái có sẵn
    if (availabilityFilter !== "all") {
      filtered = filtered.filter(
        (b) => b.availability_status === availabilityFilter,
      );
    }

    // Sắp xếp
    if (sortOption === "moinhat") {
      filtered.sort((a, b) => {
        const dateA = a.acquisition_date
          ? new Date(a.acquisition_date).getTime()
          : 0;
        const dateB = b.acquisition_date
          ? new Date(b.acquisition_date).getTime()
          : 0;
        return dateB - dateA;
      });
    } else if (sortOption === "cunhat") {
      filtered.sort((a, b) => {
        const dateA = a.acquisition_date
          ? new Date(a.acquisition_date).getTime()
          : 0;
        const dateB = b.acquisition_date
          ? new Date(b.acquisition_date).getTime()
          : 0;
        return dateA - dateB;
      });
    } else if (sortOption === "theoten") {
      filtered.sort((a, b) => {
        const titleA = normalizeVietnamese(a.title || "");
        const titleB = normalizeVietnamese(b.title || "");
        return titleA.localeCompare(titleB);
      });
    }

    setFilteredBooks(filtered);
    setCurrentPage(1);
  };

  // Hàm lấy màu dựa trên trạng thái sách
  const getStatusColor = (status: string | undefined): string => {
    switch (status) {
      case "Có sẵn":
        return "text-green-600";
      case "Đang mượn":
        return "text-orange-500";
      case "Thất lạc":
        return "text-red-600";
      case "Đặt trước":
        return "text-blue-500";
      default:
        return "text-gray-600";
    }
  };

  // Hàm xác định text cho nút đặt sách
  const getBookingButtonText = (status: string | undefined): string => {
    switch (status) {
      case "Có sẵn":
        return "Đặt sách";
      case "Thất lạc":
        return "Không khả dụng";
      case "Đặt trước":
        return "Đã đặt trước";
      case "Đang mượn":
        return "Vào danh sách chờ";
      default:
        return "Đặt sách";
    }
  };

  // Hàm kiểm tra nút "Đặt sách" có nên bị vô hiệu hóa không
  const isBookingDisabled = (status: string | undefined): boolean => {
    return status === "Thất lạc";
  };

  return (
    <div className="w-full space-y-6 px-4 pt-20 sm:px-6 lg:px-12">
      <h1 className="text-2xl font-bold text-gray-800">Tìm kiếm tài liệu</h1>

      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <Input
          type="text"
          placeholder="Nhập tên sách..."
          className="flex-1"
          value={titleFilter}
          onChange={(e) => setTitleFilter(e.target.value)}
        />
        <Input
          type="text"
          placeholder="Nhập mã sách..."
          className="flex-1"
          value={codeFilter}
          onChange={(e) => setCodeFilter(e.target.value)}
        />
        <Button className="flex gap-1" onClick={handleSearch}>
          <MagnifyingGlassIcon className="h-5 w-5" />
          Tìm kiếm
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={authorFilter} onValueChange={setAuthorFilter}>
          <SelectTrigger className="min-w-[160px] flex-1">
            <SelectValue placeholder="Tác giả" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            {[
              ...new Set(
                books.flatMap((b) => b.authors?.map((a) => a.author_name)),
              ),
            ]
              .filter(Boolean)
              .map((name, i) => (
                <SelectItem key={i} value={name || ""}>
                  {name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="min-w-[160px] flex-1">
            <SelectValue placeholder="Thể loại" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            {[...new Set(books.map((b) => b.category?.category_name))]
              .filter(Boolean)
              .map((cat, i) => (
                <SelectItem key={i} value={cat || ""}>
                  {cat}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        <Select value={shelfFilter} onValueChange={setShelfFilter}>
          <SelectTrigger className="min-w-[160px] flex-1">
            <SelectValue placeholder="Kệ sách" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            {[...new Set(books.map((b) => b.shelf?.location))]
              .filter(Boolean)
              .map((loc, i) => (
                <SelectItem key={i} value={loc || ""}>
                  {loc}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        <Select value={publisherFilter} onValueChange={setPublisherFilter}>
          <SelectTrigger className="min-w-[160px] flex-1">
            <SelectValue placeholder="Nhà xuất bản" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            {[...new Set(books.map((b) => b.publisher?.publisher_name))]
              .filter(Boolean)
              .map((pub, i) => (
                <SelectItem key={i} value={pub || ""}>
                  {pub}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        <Select
          value={availabilityFilter}
          onValueChange={setAvailabilityFilter}
        >
          <SelectTrigger className="min-w-[160px] flex-1">
            <SelectValue placeholder="Tình trạng" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="Có sẵn">Có sẵn</SelectItem>
            <SelectItem value="Đang mượn">Đang mượn</SelectItem>
            <SelectItem value="Đặt trước">Đặt trước</SelectItem>
            <SelectItem value="Thất lạc">Thất lạc</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortOption} onValueChange={setSortOption}>
          <SelectTrigger className="min-w-[160px] flex-1">
            <SelectValue placeholder="Sắp xếp theo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="moinhat">Mới nhất</SelectItem>
            <SelectItem value="cunhat">Cũ nhất</SelectItem>
            <SelectItem value="theoten">Theo tên (A-Z)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p>Tổng số {filteredBooks.length} tài liệu</p>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {currentBooks.map((copy, index) => (
          <div
            key={index}
            className="group transform overflow-hidden rounded-xl border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="h-52 overflow-hidden">
              <img
                src={copy.cover_image || "/placeholder.jpg"}
                alt={copy.title || "Sách"}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="space-y-1 p-4">
              <h2 className="text-lg font-semibold text-gray-800">
                {copy.title}
              </h2>
              <p className="text-sm text-gray-600">
                Mã sách: {copy.book_copy_id || copy.copy_id}
              </p>
              <p className="text-sm text-gray-600">
                Tác giả: {copy.authors?.[0]?.author_name || "Không rõ"}
              </p>
              <p className="text-sm text-gray-600">
                Thể loại: {copy.category?.category_name || "Không rõ"}
              </p>
              <p className="text-sm text-gray-600">
                NXB: {copy.publisher?.publisher_name || "Không rõ"}
              </p>
              <p className="text-sm text-gray-600">
                Kệ: {copy.shelf?.location || "Không rõ"}
              </p>
              <p
                className={`text-sm font-medium ${getStatusColor(copy.availability_status)}`}
              >
                Tình trạng: {copy.availability_status || "Không rõ"}
              </p>
              <Button
                className="mt-2 w-full"
                variant="secondary"
                disabled={isBookingDisabled(copy.availability_status)}
              >
                {getBookingButtonText(copy.availability_status)}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 0 && (
        <div className="mt-4 flex items-center justify-center gap-4 pb-4">
          <Button
            onClick={goToPrev}
            disabled={currentPage === 1}
            variant="outline"
          >
            Trước
          </Button>
          <span className="text-sm text-gray-600">
            Trang {currentPage} / {totalPages}
          </span>
          <Button
            onClick={goToNext}
            disabled={currentPage === totalPages}
            variant="outline"
          >
            Sau
          </Button>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
