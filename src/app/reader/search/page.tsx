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

const booksPerPage = 8;

const SearchPage = () => {
  const [book, setBook] = useState<any[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const [titleFilter, setTitleFilter] = useState("");
  const [codeFilter, setCodeFilter] = useState("");
  const [authorFilter, setAuthorFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [shelfFilter, setShelfFilter] = useState("all");
  const [publisherFilter, setPublisherFilter] = useState("all");
  const [sortOption, setSortOption] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
  const startIdx = (currentPage - 1) * booksPerPage;
  const currentBooks = filteredBooks.slice(startIdx, startIdx + booksPerPage);

  const goToPrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const goToNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  
  function shuffleArray(array: any[]) {
    return array
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
  }

  useEffect(() => {
    const fetchBook = async () => {
      const supabase = supabaseClient();
      const { data, error } = await supabase
        .from("booktitle")
        .select(
          `*, category:category_id(category_name), iswrittenby!inner (author:author_id ( author_name )), bookcopy(*, condition:condition_id(condition_name, description), loandetail(*, loantransaction(*))), shelf:shelf_id(location), publisher:publisher_id(publisher_name)`
        );

      if (error) {
        console.error("Error fetching books:", error);
      } else {
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
            }))
          )
          .filter(Boolean);

        const shuffledCopies = shuffleArray(allCopies);

        setBook(shuffledCopies);
        setFilteredBooks(shuffledCopies);
      }
    };

    fetchBook();
  }, []);

  const handleSearch = () => {
    let filtered = [...book];

    if (titleFilter.trim()) {
      filtered = filtered.filter((b) =>
        b.title?.toLowerCase().includes(titleFilter.toLowerCase())
      );
    }

    if (codeFilter.trim()) {
      filtered = filtered.filter((b) => {
        const copyId = b.copy_id;
        if (!copyId) return false; 
        return String(copyId).toLowerCase() === codeFilter.toLowerCase();
      });
    }

    if (authorFilter !== "all") {
      filtered = filtered.filter((b) =>
        b.authors?.some(
          (a: any) => a.author_name?.toLowerCase() === authorFilter.toLowerCase()
        )
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (b) => b.category?.category_name?.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    if (shelfFilter !== "all") {
      filtered = filtered.filter(
        (b) => b.shelf?.location?.toLowerCase() === shelfFilter.toLowerCase()
      );
    }

    if (publisherFilter !== "all") {
      filtered = filtered.filter(
        (b) =>
          b.publisher?.publisher_name?.toLowerCase() === publisherFilter.toLowerCase()
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((b) => {
        const isBorrowed = b.loandetail?.some((ld: any) =>
          ld.loantransaction?.loan_status === "Đang mượn" ||
          ld.loantransaction?.loan_status === "Quá hạn"
        );
        return statusFilter === "borrowed" ? isBorrowed : !isBorrowed;
      });
    }

    if (sortOption === "moinhat") {
      filtered.sort(
        (a, b) =>
          new Date(b.acquisition_date).getTime() - new Date(a.acquisition_date).getTime()
      );
    } else if (sortOption === "cunhat") {
      filtered.sort(
        (a, b) =>
          new Date(a.acquisition_date).getTime() - new Date(b.acquisition_date).getTime()
      );
    } else if (sortOption === "theoten") {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    setFilteredBooks(filtered);
    setCurrentPage(1);
  };

  return (
    <div className="pt-20 px-4 sm:px-6 lg:px-12 space-y-6 w-full">
      <h1 className="text-2xl font-bold text-gray-800">Tìm kiếm tài liệu</h1>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
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
          <MagnifyingGlassIcon className="w-5 h-5" />
          Tìm kiếm
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select onValueChange={setAuthorFilter}>
          <SelectTrigger className="flex-1 min-w-[160px]">
            <SelectValue placeholder="Tác giả" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            {[...new Set(book.flatMap((b) => b.authors?.map((a: any) => a.author_name)))]
              .filter(Boolean)
              .map((name, i) => (
                <SelectItem key={i} value={name.toLowerCase()}>
                  {name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        <Select onValueChange={setCategoryFilter}>
          <SelectTrigger className="flex-1 min-w-[160px]">
            <SelectValue placeholder="Thể loại" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            {[...new Set(book.map((b) => b.category?.category_name))]
              .filter(Boolean)
              .map((cat, i) => (
                <SelectItem key={i} value={cat.toLowerCase()}>
                  {cat}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        <Select onValueChange={setShelfFilter}>
          <SelectTrigger className="flex-1 min-w-[160px]">
            <SelectValue placeholder="Kệ sách" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            {[...new Set(book.map((b) => b.shelf?.location))]
              .filter(Boolean)
              .map((loc, i) => (
                <SelectItem key={i} value={loc.toLowerCase()}>
                  {loc}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        <Select onValueChange={setPublisherFilter}>
          <SelectTrigger className="flex-1 min-w-[160px]">
            <SelectValue placeholder="Nhà xuất bản" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            {[...new Set(book.map((b) => b.publisher?.publisher_name))]
              .filter(Boolean)
              .map((pub, i) => (
                <SelectItem key={i} value={pub.toLowerCase()}>
                  {pub}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        <Select onValueChange={setStatusFilter}>
          <SelectTrigger className="flex-1 min-w-[160px]">
            <SelectValue placeholder="Tình trạng" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="borrowed">Đang được mượn</SelectItem>
            <SelectItem value="available">Chưa được mượn</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={setSortOption}>
          <SelectTrigger className="flex-1 min-w-[160px]">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-10">
        {currentBooks.map((copy, index) => {
          const isBorrowed = copy.loandetail?.some(
            (ld: any) =>
              ld.loantransaction?.loan_status === "Đang mượn" ||
              ld.loantransaction?.loan_status === "Quá hạn"
          );

          return (
            <div
              key={index}
              className="group border rounded-xl overflow-hidden shadow-sm bg-white hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
            >
              <img
                src={copy.cover_image || "/placeholder.jpg"}
                alt={copy.title}
                className="w-full h-52 object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="p-4 space-y-1">
                <h2 className="text-lg font-semibold text-gray-800">{copy.title}</h2>
                <p className="text-sm text-gray-600">Mã sách: {copy.book_copy_id}</p>
                <p className="text-sm text-gray-600">
                  Tác giả: {copy.authors?.[0]?.author_name || "Không rõ"}
                </p>
                <p className="text-sm text-gray-600">
                  Thể loại: {copy.category?.category_name || "Không rõ"}
                </p>
                <p className="text-sm text-gray-600">
                  NXB: {copy.publisher?.publisher_name || "Không rõ"}
                </p>
                <p className="text-sm text-gray-600">Kệ: {copy.shelf?.location || "Không rõ"}</p>
                <p
                  className={`text-sm font-medium ${
                    isBorrowed ? "text-red-600" : "text-green-600"
                  }`}
                >
                  Tình trạng: {isBorrowed ? "Đang được mượn" : "Chưa được mượn"}
                </p>
                <Button className="mt-2 w-full" variant="secondary">
                  Đặt sách
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center items-center gap-4 mt-4 pb-4">
        <Button onClick={goToPrev} disabled={currentPage === 1} variant="outline">
          Trước
        </Button>
        <span className="text-sm text-gray-600">
          Trang {currentPage} / {totalPages || 1}
        </span>
        <Button onClick={goToNext} disabled={currentPage === totalPages} variant="outline">
          Sau
        </Button>
      </div>
    </div>
  );
};

export default SearchPage;
