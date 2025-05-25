"use client";

import { useRef, useState, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";
import { supabaseClient } from '@/lib/client';
import { numberToVietnameseWords } from "@/lib/numbertpwords";
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
  fullName?: string;
}

export default function PaymentCardModel({
  cardFee,
  depositFee,
  paymentMethod,
  setPaymentMethod,
  oldDepositAmount = 0,
  isEdit = false,
  fullName,
}: PaymentCardModelProps) {
  const [open, setOpen] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [creatorName, setCreatorName] = useState<string>("");

  const diffDeposit = depositFee - oldDepositAmount;
  const total = isEdit ? diffDeposit : cardFee + depositFee;

  useEffect(() => {
    if (!open) return;

    const fetchEmployeeName = async () => {
      const supabase = supabaseClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("staff")
        .select("first_name, last_name")
        .eq("auth_user_id", user.id)
        .single();

      if (!error && data) {
        setCreatorName(`${data.last_name} ${data.first_name}`);
      }
    };

    fetchEmployeeName();
  }, [open]);

  const handleExportPDF = async () => {
    if (!invoiceRef.current) return;
    const canvas = await html2canvas(invoiceRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [110, 140],
    });

    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 10, width, height);
    pdf.save("hoa-don.pdf");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          setPaymentMethod(""); 
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="default" onClick={() => setOpen(true)}>Xem hóa đơn</Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl"></DialogTitle>
        </DialogHeader>

        <div ref={invoiceRef} className="space-y-4 text-sm font-sans bg-background p-4 rounded shadow-sm">
          <div className="text-center">
            <h2 className="font-bold text-base uppercase">Thư Viện Tỉnh Khánh Hòa</h2>
            <p>Số 8 Trần Hưng Đạo, TP Nha Trang</p>
            <p>ĐT: 84.258.3525189 | tvt.svhtt@khanhhoa.gov.vn</p>
          </div>

          <div className="text-center font-semibold text-base my-2">HÓA ĐƠN THANH TOÁN</div>

          <p><strong>Ngày:</strong> {new Date().toLocaleDateString("vi-VN")}</p>

          <Separator />

          {/* Table of items */}
          <table className="w-full text-left border border-gray-300 text-xs">
            <thead>
              <tr className="bg-background text-primary">
                <th className="border px-2 py-1">Mục</th>
                <th className="border px-2 py-1 text-right">Thành tiền</th>
                <th className="border px-2 py-1">Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border px-2 py-1">Chi phí tạo thẻ</td>
                <td className="border px-2 py-1 text-right">
                  {isEdit ? <span className="line-through text-gray-500">{cardFee.toLocaleString("vi-VN")}₫</span> : cardFee.toLocaleString("vi-VN") + "₫"}
                </td>
                <td className="border px-2 py-1">Phí khởi tạo thẻ thư viện</td>
              </tr>
              <tr>
                <td className="border px-2 py-1">Chi phí hạn mức</td>
                <td className="border px-2 py-1 text-right">
                  {isEdit
                    ? diffDeposit >= 0
                      ? diffDeposit.toLocaleString("vi-VN") + "₫"
                      : `- ${Math.abs(diffDeposit).toLocaleString("vi-VN")}₫`
                    : depositFee.toLocaleString("vi-VN") + "₫"}
                </td>
                <td className="border px-2 py-1">
                  {isEdit
                    ? diffDeposit >= 0
                      ? "Tăng hạn mức"
                      : "Hoàn tiền"
                    : "Đặt cọc sử dụng dịch vụ"}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="font-medium bg-background text-destructive">
                <td className="border px-2 py-1">Tổng cộng</td>
                <td className="border px-2 py-1 text-right">
                  {total >= 0
                    ? total.toLocaleString("vi-VN") + "₫"
                    : `- ${Math.abs(total).toLocaleString("vi-VN")}₫`}
                </td>
                <td className="border px-2 py-1">
                  {total < 0 ? "Hoàn tiền cho khách hàng" : ""}
                </td>
              </tr>
            </tfoot>
          </table>
          
          <p className="text-sm italic mt-1 text-gray-700">
            (Bằng chữ: {numberToVietnameseWords(Math.abs(total))})
          </p>

          <p><strong>Phương thức thanh toán:</strong> {paymentMethod || "Chưa chọn"}</p>

          <div className="flex justify-between mt-6 text-xs">
            <div className="text-center w-1/2">
              <p>Người lập</p>
              <p className="italic">(Ký tên)</p>
              <p>{creatorName}</p>
            </div>
            <div className="text-center w-1/2">
              <p>Khách hàng</p>
              <p className="italic">(Ký tên)</p>
              <p>{fullName}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-6">
          <Button variant="outline" onClick={() => setOpen(false)}>Đóng</Button>
          <Button onClick={handleExportPDF} disabled={!paymentMethod}>In hóa đơn</Button>
        </div>

        <div className="mt-3">
          <span className="block text-sm mb-1 font-medium">Phương thức thanh toán</span>
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
      </DialogContent>
    </Dialog>
  );
}
