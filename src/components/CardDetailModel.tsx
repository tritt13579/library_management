"use client";
import React from "react";
import { CalendarDaysIcon } from "@heroicons/react/24/solid";

interface CardDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExtend: () => void;
  reader: any;
}

const CardDetailModal = ({ isOpen, onClose, onExtend, reader }: CardDetailModalProps) => {
  if (!isOpen || !reader) return null;

  const card = reader.librarycard?.[0];
  const deposit = card?.depositpackage;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-gray-500 bg-opacity-50">
      <div className="flex max-h-[90vh] w-5/6 max-w-xl flex-col overflow-y-auto rounded-lg bg-background p-6">
        {/* Thẻ thư viện */}
        <div className="relative w-full rounded-xl border bg-background p-5 shadow-lg">
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              <img
                src={reader.photo_url || "/images/logo/avatar.jpg"}
                alt="Ảnh thẻ"
                className="h-36 w-24 rounded-md border object-cover shadow"
              />
            </div>
            <div className="flex flex-col justify-start space-y-1 text-sm text-muted-foreground">
              <p className="mb-2 text-base font-semibold text-primary">THẺ THƯ VIỆN</p>
              <p><strong className="text-gray-700">ID Thẻ:</strong> {card?.card_id || "Chưa có"}</p>
              <p><strong className="text-gray-700">Loại thẻ:</strong> {card?.card_type || "Không rõ"}</p>
              <p><strong className="text-gray-700">Hạn mức:</strong> {deposit?.package_amount || 0} VND</p>
              <p><strong className="text-gray-700">Số thẻ:</strong> {card?.card_number || "N/A"}</p>
              <p><strong className="text-gray-700">Ngày tạo:</strong> {card?.issue_date?.slice(0, 10) || "N/A"}</p>
              <p><strong className="text-gray-700">Ngày hết hạn:</strong> {card?.expiry_date?.slice(0, 10) || "N/A"}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 w-full rounded-md border bg-background p-4 text-sm shadow-sm">
          <p className="text-gray-700">
            <strong className="text-primary">Trạng thái thẻ:</strong>{" "}
            {card?.expiry_date && new Date(card.expiry_date) >= new Date() ? "Còn hạn" : "Chưa gia hạn"}
          </p>
          <p className="text-gray-700">
            <strong className="text-primary">ID giao dịch:</strong> {card?.payment_id || "N/A"}
          </p>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="min-h-[44px] rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-[#005f9e]"
          >
            Đóng
          </button>
          <button
            onClick={onExtend}
            className="flex min-h-[44px] items-center space-x-2 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-[#005f9e]"
          >
            <CalendarDaysIcon className="h-5 w-5" />
            <span>Gia hạn</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardDetailModal;
