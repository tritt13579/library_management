"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabaseClient } from "@/lib/client";
import {
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  CreditCardIcon,
  QueueListIcon,
  BookOpenIcon,
  PencilSquareIcon,
  TrashIcon
} from "@heroicons/react/24/solid";
import ReaderFormModal from "@/components/ReaderFormModal";
import ReaderDetailModal from "@/components/ReaderDetailModel";
import CardDetailModal from "@/components/CardDetailModel";
import ExtendCardModal from "@/components/ExtendCardModel";

const ReadersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [cardStatus, setCardStatus] = useState("Tất cả");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCardOpen, setIsCardOpen] = useState(false);
  const [isExtendOpen, setIsExtendOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [user, setUser] = useState<any[]>([]);
  const [selectedReader, setSelectedReader] = useState<any | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = supabaseClient();
      const { data, error } = await supabase
        .from("reader")
        .select(`
          *,
          librarycard (
            *,
            depositpackage (*)
          )
        `);

      if (error) {
        console.error("Error fetching readers:", error);
      } else {
        setUser(data);
      }
    };

    fetchUser();
  }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const readersPerPage = 6;
  const cardStatuses = ["Tất cả", "Còn hạn", "Chưa gia hạn"];

  const getFilteredReaders = () => {
    return user.filter((r) => {
      const card = r.librarycard?.[0];
      const pkg = card?.depositpackage;

      const matchName =
        searchTerm === "" ||
        `${r.first_name} ${r.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus =
        cardStatus === "Tất cả" ||
        (cardStatus === "Còn hạn" &&
          card?.expiry_date &&
          new Date(card.expiry_date) >= new Date()) ||
        (cardStatus === "Chưa gia hạn" &&
          card?.expiry_date &&
          new Date(card.expiry_date) < new Date());

      return matchName && matchStatus;
    });
  };

  const filteredReaders = getFilteredReaders();
  const totalPages = Math.ceil(filteredReaders.length / readersPerPage);

  const currentReaders = filteredReaders.slice(
    (currentPage - 1) * readersPerPage,
    currentPage * readersPerPage
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const opendModel = (
    model: "detail" | "card" | "extend" | "create" | "edit",
    reader?: any
  ) => {
    setSelectedReader(reader || null);
    setIsDetailOpen(model === "detail");
    setIsCardOpen(model === "card");
    setIsExtendOpen(model === "extend");
    setIsCreateOpen(model === "create");
    setIsEditOpen(model === "edit");
  };
  

  const closeModal = () => {
    setIsDetailOpen(false);
    setIsCardOpen(false);
    setIsExtendOpen(false);
    setIsCreateOpen(false);
    setIsEditOpen(false);
  };

  return (
    <div className="p-6">
      {/* BỘ LỌC & MENU */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên độc giả..."
            className="w-64 rounded-md border border-gray-300 bg-input px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
          <select
            value={cardStatus}
            onChange={(e) => {
              setCardStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-md border border-gray-300 bg-input px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
          >
            {cardStatuses.map((status, index) => (
              <option key={index} value={status}>
                {status}
              </option>
            ))}
          </select>
          <button className="flex items-center justify-center rounded-md bg-primary px-4 py-3 text-white transition hover:bg-[#005f9e]">
            <MagnifyingGlassIcon className="h-5 w-5 text-primary-foreground" />
          </button>
        </div>

        <div className="hidden space-x-2 md:flex">
          <FilterButton
            icon={<CreditCardIcon className="h-4 w-4 text-[#0071BC]" />}
            label="Tạo thẻ"
            onClick={() => opendModel("create")}
          />
          <Link href="/staff/queue">
            <FilterButton
              icon={<QueueListIcon className="h-4 w-4 text-[#0071BC]" />}
              label="Hàng đợi"
            />
          </Link>
          <Link href="/staff/borrows">
            <FilterButton
              icon={<BookOpenIcon className="h-4 w-4 text-[#0071BC]" />}
              label="Sách mượn"
            />
          </Link>
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
          <FilterButton
            icon={<CreditCardIcon className="h-4 w-4 text-[#0071BC]" />}
            label="Tạo thẻ"
            onClick={() => opendModel("create")}
          />
          <Link href="/staff/queue">
            <FilterButton
              icon={<QueueListIcon className="h-4 w-4 text-[#0071BC]" />}
              label="Hàng đợi"
            />
          </Link>
          <Link href="/staff/borrows">
            <FilterButton
              icon={<BookOpenIcon className="h-4 w-4 text-[#0071BC]" />}
              label="Sách mượn"
            />
          </Link>
        </div>
      )}

      <ExtendCardModal
        isOpen={isExtendOpen}
        onClose={closeModal}
        onConfirm={(newDate) => {
        console.log("Ngày hết hạn mới:", newDate);
        closeModal();
      }}
      />

      <CardDetailModal
        isOpen={isCardOpen}
        onClose={closeModal}
        onExtend={() => opendModel("extend")}
        reader={selectedReader}
      />

      <ReaderDetailModal
        isOpen={isDetailOpen}
        onClose={closeModal}
        onEdit={() => opendModel("edit", selectedReader)}
        onCard={() => opendModel("card", selectedReader)}
        reader={selectedReader}
      />

      <ReaderFormModal
        isCreateOpen={isCreateOpen}
        isEditOpen={isEditOpen}
        closeCreate={closeModal}
      />

      {/* DANH SÁCH ĐỘC GIẢ */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {currentReaders.map((reader, index) => (
          <div
            key={index}
            onClick={() => opendModel("detail", reader)}
            className="rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md"
          >
            <img
              src={reader.photo_url}
              alt="ảnh độc giả"
              className="mx-auto h-32 w-32 rounded-full object-cover"
            />
            <h3 className="mt-4 text-center text-lg font-semibold">
              {reader.last_name} {reader.first_name}
            </h3>
            <p className="text-center text-sm text-gray-600">
              {reader.librarycard?.[0]?.card_type || "Chưa đăng ký"}
            </p>
            <p className="mt-1 text-center text-sm text-gray-500">
              Hạn mức: {reader.librarycard?.[0]?.depositpackage?.package_amount || "0"} VND
            </p>
            <p className="mt-1 text-center text-sm text-gray-500">
              Tình trạng:{" "}
              {(() => {
                const expireDate = new Date(reader.librarycard?.[0]?.expiry_date);
                const now = new Date();
                const isValid =
                  reader.librarycard?.[0] && expireDate >= now;
                return isValid ? "Còn hạn" : "Chưa gia hạn";
              })()}
            </p>
            <p className="mt-2 text-center text-sm text-gray-700">
              {reader.address}
            </p>
          </div>
        ))}
      </div>

      {/* PHÂN TRANG */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="rounded border px-3 py-1 text-sm disabled:opacity-50"
          >
            Trước
          </button>
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => handlePageChange(index + 1)}
              className={`rounded border px-3 py-1 text-sm ${
                currentPage === index + 1
                  ? "bg-[#0071BC] text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              {index + 1}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="rounded border px-3 py-1 text-sm disabled:opacity-50"
          >
            Tiếp
          </button>
        </div>
      )}
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
    className="flex w-full items-center space-x-2 rounded-md border border-gray-300 bg-background px-3 py-2 shadow-sm transition hover:shadow-md md:w-auto"
  >
    {icon}
    <span className="text-sm">{label}</span>
  </button>
);

export default ReadersPage;