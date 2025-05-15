'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabaseClient } from '@/lib/client';
import {
  Bars3Icon, XMarkIcon, CreditCardIcon,
  QueueListIcon, CalendarDateRangeIcon
} from '@heroicons/react/24/solid';

import ReaderFormModal from '@/components/ReaderFormModal';
import ReaderDetailModal from '@/components/ReaderDetailModel';
import CardDetailModal from '@/components/CardDetailModel';
import ExtendCardModal from '@/components/ExtendCardModel';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import {
  Select, SelectTrigger, SelectValue,
  SelectContent, SelectItem
} from '@/components/ui/select';

const cardStatuses = ['Tất cả', 'Còn hạn', 'Chưa gia hạn'];
const readersPerPage = 6;

const ReadersPage = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [cardStatus, setCardStatus] = useState('Tất cả');
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [modals, setModals] = useState({
    detail: false, card: false, extend: false,
    create: false, edit: false,
  });

  const [readers, setReaders] = useState<any[]>([]);
  const [selectedReader, setSelectedReader] = useState<any | null>(null);

  useEffect(() => {
    const fetchReaders = async () => {
      const supabase = supabaseClient();
      const { data, error } = await supabase
        .from('reader')
        .select(`
          *,
          librarycard (
            *,
            depositpackage (*)
          )
        `);

      if (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
      } else {
        setReaders(data || []);
      }
    };

    fetchReaders();
  }, [refreshTrigger]);

  const handleSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
    toast({
      title: "Thành công",
      description: "Dữ liệu đã được cập nhật thành công.",
      variant: "success",
    });
  };

  const filteredReaders = readers.filter((r) => {
    const card = r.librarycard?.[0];
    const name = `${r.first_name} ${r.last_name}`.toLowerCase();

    const matchName = name.includes(searchTerm.toLowerCase());
    const isExpired = card?.expiry_date && new Date(card.expiry_date) < new Date();
    const isValid = card?.expiry_date && new Date(card.expiry_date) >= new Date();

    const matchStatus =
      cardStatus === 'Tất cả' ||
      (cardStatus === 'Còn hạn' && isValid) ||
      (cardStatus === 'Chưa gia hạn' && isExpired);

    return matchName && matchStatus;
  });

  const totalPages = Math.ceil(filteredReaders.length / readersPerPage);
  const paginatedReaders = filteredReaders.slice(
    (currentPage - 1) * readersPerPage,
    currentPage * readersPerPage
  );

  const openModal = (type: keyof typeof modals, reader?: any) => {
    setModals({ detail: false, card: false, extend: false, create: false, edit: false, [type]: true });
    setSelectedReader(reader || null);
  };

  const closeModals = () => {
    setModals({ detail: false, card: false, extend: false, create: false, edit: false });
  };

  return (
    <div className="p-6">
      {/* Bộ lọc và menu */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Tên..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="min-w-[150px] py-6"
          />
          <Select value={cardStatus} onValueChange={(val) => { setCardStatus(val); setCurrentPage(1); }}>
            <SelectTrigger className="min-w-[150px] py-6">
              <SelectValue placeholder="Trạng thái thẻ" />
            </SelectTrigger>
            <SelectContent>
              {cardStatuses.map((status) => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="hidden md:flex space-x-2">
          <FilterButton icon={<CreditCardIcon className="icon text-[#0071BC] me-1" />} label="Tạo thẻ" onClick={() => openModal('create') } />
          <Link href="/staff/queue"><FilterButton icon={<QueueListIcon className="icon text-[#0071BC] me-1" />} label="Hàng đợi" /></Link>
          <Link href="/staff/notice"><FilterButton icon={<CalendarDateRangeIcon className="icon text-destructive me-1" />} label="Chậm trả" /></Link>
        </div>

        <Button
          variant="outline"
          size="icon"
          className="md:hidden w-full flex justify-start p-4"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
        >
          {isMobileMenuOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
        </Button>
      </div>

      {isMobileMenuOpen && (
        <div className="mt-4 flex flex-col space-y-4 md:hidden w-full">
          <FilterButton icon={<CreditCardIcon className="icon text-[#0071BC] me-1" />} label="Tạo thẻ" onClick={() => openModal('create')} />
          <Link href="/staff/queue" className='md:w-full'><FilterButton icon={<QueueListIcon className="icon text-[#0071BC] me-1" />} label="Hàng đợi" /></Link>
          <Link href="/staff/notice" className='md:w-full'><FilterButton icon={<CalendarDateRangeIcon className="icon text-destructive me-1" />} label="Chậm trả" /></Link>
        </div>
      )}

      {/* Danh sách độc giả */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {paginatedReaders.map((reader, i) => {
          const card = reader.librarycard?.[0];
          const isExpired = card?.expiry_date && new Date(card.expiry_date) < new Date();
          const status = card ? (isExpired ? 'Chưa gia hạn' : 'Còn hạn') : 'Chưa đăng ký';

          return (
            <div
              key={i}
              className="rounded-lg border p-4 shadow-sm hover:shadow-md cursor-pointer"
              onClick={() => openModal('detail', reader)}
            >
              <img
                src={reader.photo_url}
                alt="avatar"
                className="mx-auto h-32 w-32 rounded-full object-cover"
              />
              <h3 className="mt-4 text-center font-semibold">{reader.last_name} {reader.first_name}</h3>
              <p className="text-center text-sm text-gray-600">{card?.card_type || 'Chưa đăng ký'}</p>
              <p className="text-center text-sm text-gray-500 mt-1">Hạn mức: {card?.depositpackage?.package_amount || 0} VND</p>
              <p className="text-center text-sm text-gray-500">Tình trạng: {status}</p>
              <p className="text-center text-sm text-gray-700 mt-2">{reader.address}</p>
            </div>
          );
        })}
      </div>

      {/* Phân trang */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center space-x-2">
          <PageButton label="Trước" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} />
          {[...Array(totalPages)].map((_, idx) => (
            <PageButton
              key={idx}
              label={(idx + 1).toString()}
              onClick={() => setCurrentPage(idx + 1)}
              active={currentPage === idx + 1}
            />
          ))}
          <PageButton label="Tiếp" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} />
        </div>
      )}

      {/* Modals */}
      <ExtendCardModal
        isOpen={modals.extend}
        onClose={closeModals}
        readerId={selectedReader?.reader_id}
        onSuccess={handleSuccess}
      />

      <CardDetailModal isOpen={modals.card} onClose={closeModals} onExtend={(reader) => openModal('extend', reader)} reader={selectedReader} />

      <ReaderDetailModal
        isOpen={modals.detail}
        onClose={closeModals}
        onEdit={() => openModal('edit', selectedReader)}
        onCard={() => openModal('card', selectedReader)}
        reader={selectedReader}
        onSuccess={handleSuccess}
      />

      <ReaderFormModal
        isCreateOpen={modals.create}
        isEditOpen={modals.edit}
        closeCreate={closeModals}
        reader={selectedReader}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

const FilterButton = ({ icon, label, onClick }: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) => (
  <Button
    variant="outline"
    className="flex justify-start w-full space-x-2"
    onClick={onClick}
  >
    {icon}
    <span className="text-sm">{label}</span>
  </Button>
);

const PageButton = ({ label, onClick, disabled, active }: {
  label: string, onClick: () => void, disabled?: boolean, active?: boolean
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`rounded border px-3 py-1 text-sm ${active ? 'bg-[#0071BC] text-white' : 'hover:bg-gray-100'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    {label}
  </button>
);

export default ReadersPage;
