"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CalendarDaysIcon } from "@heroicons/react/24/solid";
import Image from "next/image";

interface CardDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExtend: (reader: any) => void;
  extendMonths: number;
  reader: any;
}

const CardDetailModal = ({
  isOpen,
  onClose,
  onExtend,
  extendMonths,
  reader,
}: CardDetailModalProps) => {
  if (!reader) return null;

  const card = reader.librarycard?.[0];
  const deposit = card?.depositpackage;

  const now = new Date();
  const expiryDate = card?.expiry_date ? new Date(card.expiry_date) : null;

  const isExpired = expiryDate && expiryDate < now;

  let isCanceled = false;

  if (expiryDate) {
    const extendedDate = new Date(expiryDate);
    extendedDate.setMonth(extendedDate.getMonth() + extendMonths);
    isCanceled = now > extendedDate;
  }

  const getCardStatus = () => {
    if (isCanceled) return { text: "Đã hủy", className: "text-gray-500 font-semibold" };
    if (isExpired) return { text: "Chưa gia hạn", className: "text-red-600 font-semibold" };
    return { text: "Hoạt động", className: "text-green-600 font-semibold" };
  };

  const status = getCardStatus();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md lg:max-w-xl max-h-full md:max-h-[90vh] sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-primary">
            Thẻ Thư Viện
          </DialogTitle>
        </DialogHeader>

        {/* Card Info Section */}
        <div className="w-full rounded-xl border bg-background p-5 shadow-sm">
          <div className="flex items-start gap-6">
            {/* Image */}
            <div className="flex-shrink-0">
              <Image
                src={reader.photo_url || "/images/logo/avatar.jpg"}
                alt="Ảnh thẻ"
                width={96}
                height={144}
                className="rounded-md border object-cover shadow w-24 h-36"
              />
            </div>

            {/* Info */}
            <div className="space-y-1 text-sm text-muted-foreground">
              <p className="mb-2 text-base font-semibold text-primary">
                THẺ THƯ VIỆN
              </p>
              <p>
                <strong className="text-gray-700">ID Thẻ:</strong>{" "}
                {card?.card_id || "Chưa có"}
              </p>
              <p>
                <strong className="text-gray-700">Loại thẻ:</strong>{" "}
                {card?.card_type || "Không rõ"}
              </p>
              <p>
                <strong className="text-gray-700">Hạn mức:</strong>{" "}
                {deposit?.package_amount || 0} VND
              </p>
              <p>
                <strong className="text-gray-700">Số thẻ:</strong>{" "}
                {card?.card_number || "N/A"}
              </p>
              <p>
                <strong className="text-gray-700">Ngày tạo:</strong>{" "}
                {card?.issue_date?.slice(0, 10) || "N/A"}
              </p>
              <p>
                <strong className="text-gray-700">Ngày hết hạn:</strong>{" "}
                {card?.expiry_date?.slice(0, 10) || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Status Section */}
        <div className="w-full rounded-md border bg-background p-4 text-sm shadow-sm">
          <p className="text-gray-700">
            <strong className="text-primary">Trạng thái thẻ:</strong>{" "}
            <span className={status.className}>{status.text}</span>
          </p>
          <p className="text-gray-700">
            <strong className="text-primary">ID giao dịch:</strong>{" "}
            {card?.payment_id || "N/A"}
          </p>
        </div>

        {/* Actions */}
        <div className="mt-4 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
          <Button onClick={() => onExtend(reader)} className="gap-2">
            <CalendarDaysIcon className="h-4 w-4" />
            Gia hạn
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CardDetailModal;
