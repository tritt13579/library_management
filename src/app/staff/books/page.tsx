"use client";
import React, { useState, useEffect } from "react";
import BookDetailModal from "@/components/BookDetailModel";
import BookFormModal from "@/components/BookFormModel";
import FileUploadModal from "@/components/FileUploadModel";
import CategoryModal from "@/components/CategoryModel";
import BookCard from "./bookCard";
import { supabaseClient } from "@/lib/client";

import {
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  FolderPlusIcon,
  ArrowUpOnSquareIcon,
  CubeIcon,
} from "@heroicons/react/24/solid";

const BooksPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isFileOpend, setIsFileOpend] = useState(false);
  const [isCategory, setIsCategory] = useState(false);

  const [books, setBooks] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

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
          shelf:shelf__id(location),
          publisher:publisher_id(publisher_name)
        `);

      if (error) {
        console.error("Error fetching books:", error);
      } else {
        setBooks(data || []);
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

  const getBooksByCategory = (category: string) =>
    books.filter((book) => {
      const matchCategory =
        category === "Tất cả" || book.category?.category_name === category;
      const matchSearch =
        book.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.iswrittenby?.[0]?.author?.author_name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });

  const toggleExpand = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const opendModel = (
    model: "detail" | "add" | "edit" | "file" | "category",
    book: any = null
  ) => {
    setIsDetailOpen(model === "detail");
    setIsAddOpen(model === "add");
    setIsEditOpen(model === "edit");
    setIsFileOpend(model === "file");
    setIsCategory(model === "category");

    if (model === "detail" || model === "edit") {
      setSelectedBook(book);
    } else {
      setSelectedBook(null);
    }
  };

  const closeModal = () => {
    setIsDetailOpen(false);
    setSelectedBook(null);
    setIsAddOpen(false);
    setIsEditOpen(false);
    setIsFileOpend(false);
    setIsCategory(false);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Tác giả / Sách..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
        </div>

        <div className="hidden space-x-2 md:flex">
          <FilterButton
            icon={<FolderPlusIcon className="h-4 w-4 text-[#0071BC]" />}
            label="Thêm sách"
            onClick={() => opendModel("add")}
          />
          <FilterButton
            icon={<ArrowUpOnSquareIcon className="h-4 w-4 text-[#0071BC]" />}
            label="Tải lên sách"
            onClick={() => opendModel("file")}
          />
          <FilterButton
            icon={<CubeIcon className="h-4 w-4 text-[#0071BC]" />}
            label="Thể loại"
            onClick={() => opendModel("category")}
          />
        </div>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="rounded-md border border-gray-300 p-2 text-[#0071BC] md:hidden"
        >
          {isMobileMenuOpen ? (
            <XMarkIcon className="h-5 w-5" />
          ) : (
            <Bars3Icon className="h-5 w-5" />
          )}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="mt-4 flex flex-col space-y-4 md:hidden">
          <div className="flex flex-col space-y-2">
            <FilterButton
              icon={<FolderPlusIcon className="h-4 w-4 text-[#0071BC]" />}
              label="Thêm sách"
              onClick={() => opendModel("add")}
            />
            <FilterButton
              icon={<ArrowUpOnSquareIcon className="h-4 w-4 text-[#0071BC]" />}
              label="Tải lên sách"
              onClick={() => opendModel("file")}
            />
            <FilterButton
              icon={<CubeIcon className="h-4 w-4 text-[#0071BC]" />}
              label="Thể loại"
              onClick={() => opendModel("category")}
            />
          </div>
        </div>
      )}

      <CategoryModal
        isOpen={isCategory}
        categories={categories.filter((cat) => cat !== "Tất cả")}
        onClose={closeModal}
        onAdd={(newCat) => {
          setCategories((prev) => [...prev, newCat]);
          // Xử lý
        }}
        onDelete={(catToDelete) => {
          setCategories((prev) => prev.filter((c) => c !== catToDelete));
          // xử lý
        }}
      />

      <FileUploadModal
        isOpen={isFileOpend}
        onClose={closeModal}
        onUpload={(file) => {
        console.log("Đã chọn file:", file);
        // xử lý upload
        }}
      />
       
      <BookFormModal
        isOpen={isAddOpen || isEditOpen}
        isEdit={isEditOpen}
        book={selectedBook}
        categories={categories}
        onClose={closeModal}
      />

      {isDetailOpen && selectedBook && (
        <BookDetailModal
          book={selectedBook}
          onClose={closeModal}
          onEdit={() => opendModel("edit", selectedBook)}
        />
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
            <div className="mt-6 mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-primary">{category}</h2>
              {booksInCategory.length > 4 && (
                <button
                  className="rounded-md border border-[#005f9e] px-3 py-1 text-sm text-[#005f9e] transition hover:underline"
                  onClick={() => toggleExpand(category)}
                >
                  {isExpanded ? "Thu gọn ↑" : "Xem thêm →"}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-6 gap-x-4 mt-6">
              {visibleBooks.map((book, index) => (
                <div key={index} onClick={() => opendModel("detail", book)}>
                  <BookCard
                    title={book.title}
                    author={book.iswrittenby?.[0]?.author?.author_name ?? "Không rõ"}
                    image={book.cover_image}
                    category={book.category?.category_name}
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
    className="flex items-center space-x-2 rounded-md border border-gray-300 bg-background px-3 py-2 shadow-sm transition hover:shadow-md"
  >
    {icon}
    <span className="text-sm">{label}</span>
  </button>
);

export default BooksPage;
