"use client";

import React, { useRef } from "react";
import html2canvas from "html2canvas";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  ArrowDownTrayIcon,
  CalendarDaysIcon,
  NoSymbolIcon,
} from "@heroicons/react/24/solid";

interface CardDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExtend: (reader: any) => void;
  onCancel: (reader: any) => void;
  extendMonths: number;
  reader: any;
}

const CardDetailModal = ({
  isOpen,
  onClose,
  onExtend,
  onCancel,
  reader,
}: CardDetailModalProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  if (!reader) return null;

  const card = reader.librarycard?.[0];

  const getCardStatus = () => {
    switch (card?.card_status) {
      case "Đã hủy":
        return { text: "Đã hủy", className: "text-gray-500 font-semibold" };
      case "Chưa gia hạn":
        return {
          text: "Chưa gia hạn",
          className: "text-red-600 font-semibold",
        };
      case "Hoạt động":
        return {
          text: "Hoạt động",
          className: "text-green-600 font-semibold",
        };
      default:
        return {
          text: "Không rõ",
          className: "text-gray-400 font-semibold",
        };
    }
  };

  const status = getCardStatus();

  const handleDownloadImage = async () => {
    if (!cardRef.current) return;

    // Đảm bảo tất cả ảnh đã tải xong
    const images = cardRef.current.querySelectorAll("img");
    await Promise.all(
      Array.from(images).map((img) => {
        if (!img.complete) {
          return new Promise((resolve) => {
            img.onload = img.onerror = resolve;
          });
        }
        return Promise.resolve();
      })
    );

    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
      });
      const dataUrl = canvas.toDataURL("image/png");

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `the_thu_vien_${card?.card_number || "unknown"}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Lỗi khi tải ảnh thẻ:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-full md:max-h-[90vh] overflow-x-auto py-3 px-3">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-primary">
            Thẻ Thư Viện
          </DialogTitle>
        </DialogHeader>

        {/* Card Info Section */}
        <div
          ref={cardRef}
          className="flex flex-col bg-white rounded-lg border shadow-md p-6 py-4 min-w-[480px] min-h-[220px] relative"
        >
          {/* Header logo + tên thư viện */}
          <div className="flex items-center gap-3 mb-4">
            <img
              src="/images/logo/logoKH.jpg"
              alt="Logo Khánh Hòa"
              width={32}
              height={32}
              className="rounded-sm object-contain"
            />
            <span className="text-primary font-semibold text-base whitespace-nowrap">
              Thư viện Tỉnh Khánh Hòa
            </span>
          </div>

          {/* Nội dung thẻ: ảnh và thông tin */}
          <div className="flex flex-row gap-6 w-full h-[180px]">
            {/* Ảnh thẻ */}
            <div className="flex-shrink-0">
              <img
                src={reader.photo_url || "/images/logo/avatar.jpg"}
                alt="Ảnh thẻ"
                width={120}
                height={180}
                className="rounded-md border object-cover shadow-md"
              />
            </div>

            {/* Thông tin thẻ */}
            <div className="flex flex-col justify-start text-primary w-full">
              <p className="text-lg font-semibold mb-4">THẺ THƯ VIỆN</p>
              <div className="flex flex-col gap-1 text-sm sm:text-base text-gray-800">
                <div>
                  <span className="font-semibold">Số thẻ:</span>{" "}
                  {card?.card_number || "N/A"}
                </div>
                <div>
                  <span className="font-semibold">Họ tên:</span>{" "}
                  {(reader.last_name || "") +
                    " " +
                    (reader.first_name || "") || "Họ tên"}
                </div>
                <div>
                  <span className="font-semibold">Loại thẻ:</span>{" "}
                  {card?.card_type || "Không rõ"}
                </div>
                <div>
                  <span className="font-semibold">Ngày hết hạn:</span>{" "}
                  {card?.expiry_date?.slice(0, 10) || "N/A"}
                </div>
              </div>
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
          <Button type="button" className="gap-2" onClick={handleDownloadImage}>
            <ArrowDownTrayIcon className="h-4 w-4" />
            Tải xuống
          </Button>
          <Button type="button" onClick={() => onCancel(reader)} className="gap-2">
            <NoSymbolIcon className="h-4 w-4" />
            Hủy thẻ
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
