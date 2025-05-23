"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { CheckCircle2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaymentStepProps {
  totalFine: number;
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
}

export const PaymentStep: React.FC<PaymentStepProps> = ({
  totalFine,
  paymentMethod,
  setPaymentMethod,
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Xác nhận thanh toán</CardTitle>
          <CardDescription>
            {totalFine > 0
              ? "Vui lòng chọn phương thức thanh toán"
              : "Không có khoản phí phát sinh"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {totalFine > 0 ? (
            <div className="space-y-4">
              <div className="text-xl font-bold">
                Tổng tiền cần thanh toán: {totalFine.toLocaleString("vi-VN")}{" "}
                VNĐ
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Phương thức thanh toán</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger id="paymentMethod">
                    <SelectValue placeholder="Chọn phương thức thanh toán" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tiền mặt">Tiền mặt</SelectItem>
                    <SelectItem value="Chuyển khoản">Chuyển khoản</SelectItem>
                    <SelectItem value="Thẻ tín dụng">Thẻ tín dụng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center py-6">
              <CheckCircle2 className="mb-4 h-16 w-16 text-green-500" />
              <p className="text-xl">Không có khoản phí phát sinh</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
