"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface PaymentCardModelProps {
  cardFee: number;
  depositFee: number;
  paymentMethod: string;
  setPaymentMethod: (value: string) => void;
  oldDepositAmount?: number;
  isEdit?: boolean;
}

export default function PaymentCardModel({
  cardFee,
  depositFee,
  paymentMethod,
  setPaymentMethod,
  oldDepositAmount = 0,
  isEdit = false,
}: PaymentCardModelProps) {

  const diffDeposit = depositFee - oldDepositAmount;

  const total = isEdit ? diffDeposit : cardFee + depositFee;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default">Xem hóa đơn</Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Hóa đơn thanh toán</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="flex justify-between">
            <span>Chi phí tạo thẻ</span>
            {isEdit ? (
              <span className="line-through text-gray-500">{cardFee.toLocaleString("vi-VN")}₫</span>
            ) : (
              <span>{cardFee.toLocaleString("vi-VN")}₫</span>
            )}
          </div>
          <div className="flex justify-between">
            <span>Chi phí hạn mức</span>
            {diffDeposit >= 0 
              ? diffDeposit.toLocaleString("vi-VN", { style: "currency", currency: "VND" }) 
              : `- ${Math.abs(diffDeposit).toLocaleString("vi-VN", { style: "currency", currency: "VND" })} (Hoàn tiền)`
            }
          </div>

          <Separator />

          <div className="flex justify-between font-medium text-base">
            <span>Tổng thanh toán</span>
            <span>
              {total >= 0 ? total.toLocaleString("vi-VN") + "₫" : `- ${Math.abs(total).toLocaleString("vi-VN")}₫ (Hoàn tiền)`}
            </span>
          </div>

          <div className="space-y-2 pt-4">
            <span className="font-medium">Phương thức thanh toán</span>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn phương thức" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Chuyển khoản">Chuyển khoản</SelectItem>
                <SelectItem value="Tiền mặt">Tiền mặt</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-6">
            <Button variant="outline">In hóa đơn</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
