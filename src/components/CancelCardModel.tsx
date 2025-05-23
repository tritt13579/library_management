"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface CancelCardModelProps {
  isOpen: boolean;
  onClose: () => void;
  reader: any;
  onSuccess?: () => void;
}

const CancelCardModel: React.FC<CancelCardModelProps> = ({
  isOpen,
  onClose,
  reader,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState("Tiền mặt");
  const [isLoading, setIsLoading] = useState(false);

  const card = reader?.librarycard?.[0];
  if (!card) return null;

  const depositAmount = card?.depositpackage?.package_amount || 0;

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/reader/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          readerId: reader.reader_id,
          paymentMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Hủy thẻ thất bại");
      }

      toast({
        title: "Hủy thẻ thành công",
        variant: "success",
      });

      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast({
        title: "Lỗi",
        description: err.message || "Có lỗi xảy ra",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Xác nhận hủy thẻ</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 text-sm text-gray-700">
          <p><strong>ID thẻ:</strong> {card.card_id}</p>
          <p><strong>Loại thẻ:</strong> {card.card_type}</p>
          <p><strong>Hạn mức hoàn:</strong> {depositAmount.toLocaleString()} VND</p>
          <p><strong>Ngày hết hạn:</strong> {card.expiry_date?.slice(0, 10)}</p>

          <div>
            <Label>Phương thức giao dịch</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Chọn phương thức" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tiền mặt">Tiền mặt</SelectItem>
                <SelectItem value="Chuyển khoản">Chuyển khoản</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-destructive text-white"
          >
            {isLoading ? "Đang xử lý..." : "Xác nhận hủy thẻ"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CancelCardModel;
