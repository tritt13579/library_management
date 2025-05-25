"use client";

import { useRef, useState, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabaseClient } from "@/lib/client";
import { useToast } from "@/hooks/use-toast";
import { numberToVietnameseWords } from "@/lib/numbertpwords";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface CancelCardModelProps {
  isOpen: boolean;
  onClose: () => void;
  reader: any;
  onSuccess?: () => void;
  fullName?: string;
}

export default function CancelCardModel({
  isOpen,
  onClose,
  reader,
  onSuccess,
  fullName,
}: CancelCardModelProps) {
  const [paymentMethod, setPaymentMethod] = useState("Tiền mặt");
  const [isLoading, setIsLoading] = useState(false);
  const [creatorName, setCreatorName] = useState("");
  const invoiceRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const card = reader?.librarycard?.[0];
  const depositAmount = card?.depositpackage?.package_amount || 0;

  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      const supabase = supabaseClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from("staff")
          .select("first_name, last_name")
          .eq("auth_user_id", user.id)
          .single();

        if (data) {
          setCreatorName(`${data.last_name} ${data.first_name}`);
        }
      }
    };

    fetchData();
  }, [isOpen]);

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

      if (!res.ok) throw new Error(data.error || "Hủy thẻ thất bại");

      toast({ title: "Hủy thẻ thành công", variant: "success" });
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast({
        title: "Lỗi",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = async () => {
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
    pdf.save(`hoa-don-huy-${reader.reader_id}.pdf`);
  };

  if (!card) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
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

          <div className="text-center font-semibold text-base my-2">HÓA ĐƠN HỦY THẺ</div>

          <p><strong>Mã bạn đọc:</strong> {reader.reader_id}</p>
          <p><strong>Ngày:</strong> {new Date().toLocaleDateString("vi-VN")}</p>

          <table className="w-full text-left border border-gray-300 text-xs mt-3">
            <thead>
              <tr className="bg-background text-primary">
                <th className="border px-2 py-1">Mục</th>
                <th className="border px-2 py-1 text-right">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border px-2 py-1">Hoàn tiền thẻ</td>
                <td className="border px-2 py-1 text-right">
                  - {depositAmount.toLocaleString("vi-VN")}₫
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="font-medium bg-background text-destructive">
                <td className="border px-2 py-1">Tổng cộng</td>
                <td className="border px-2 py-1 text-right">
                  - {depositAmount.toLocaleString("vi-VN")}₫
                </td>
              </tr>
            </tfoot>
          </table>

          <p className="text-sm italic mt-1 text-gray-700">
            (Bằng chữ: {numberToVietnameseWords(Math.abs(depositAmount))})
          </p>

          <p><strong>Phương thức hoàn tiền:</strong> {paymentMethod}</p>

          <div className="flex justify-between mt-6 text-xs">
            <div className="text-center w-1/2">
              <p>Người lập</p>
              <p className="italic">(Ký tên)</p>
              <p>{creatorName}</p>
            </div>
            <div className="text-center w-1/2">
              <p>Bạn đọc</p>
              <p className="italic">(Ký tên)</p>
              <p>{fullName}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-6">
          <Button variant="outline" onClick={onClose}>Đóng</Button>
          <Button onClick={handlePrint}>In hóa đơn</Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? "Đang xử lý..." : "Xác nhận hủy"}
          </Button>
        </div>

        <div className="mt-3">
          <Label className="block text-sm mb-1 font-medium">Phương thức hoàn tiền</Label>
          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn phương thức" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Tiền mặt">Tiền mặt</SelectItem>
              <SelectItem value="Chuyển khoản">Chuyển khoản</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </DialogContent>
    </Dialog>
  );
}
