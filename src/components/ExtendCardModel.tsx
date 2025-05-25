"use client";

import { useRef, useState, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabaseClient } from "@/lib/client";
import { numberToVietnameseWords } from "@/lib/numbertpwords";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface ExtendCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  readerId: number;
  onSuccess?: () => void;
  fullName?: string;
}

export default function ExtendCardModal({
  isOpen,
  onClose,
  readerId,
  onSuccess,
  fullName,
}: ExtendCardModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Tiền mặt");
  const [extendFee, setExtendFee] = useState(0);
  const [creatorName, setCreatorName] = useState("");
  const invoiceRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      const supabase = supabaseClient();

      const { data: settingData } = await supabase
        .from("systemsetting")
        .select("setting_value")
        .eq("setting_id", 12)
        .single();

      if (settingData?.setting_value) {
        const fee = parseFloat(settingData.setting_value.toString().replace(/[^0-9.]/g, ""));
        setExtendFee(fee);
      }

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
      const res = await fetch("/api/reader/extend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ readerId, paymentMethod }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Gia hạn thất bại");

      toast({ title: "Gia hạn thành công", variant: "success" });
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
    pdf.save(`hoa-don-gia-han-${readerId}.pdf`);
  };

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

          <div className="text-center font-semibold text-base my-2">HÓA ĐƠN GIA HẠN THẺ</div>

          <p><strong>Mã bạn đọc:</strong> {readerId}</p>
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
                <td className="border px-2 py-1">Phí gia hạn</td>
                <td className="border px-2 py-1 text-right">
                  {extendFee.toLocaleString("vi-VN")}₫
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="font-medium bg-background text-destructive">
                <td className="border px-2 py-1">Tổng cộng</td>
                <td className="border px-2 py-1 text-right">
                  {extendFee.toLocaleString("vi-VN")}₫
                </td>
              </tr>
            </tfoot>
          </table>

          <p className="text-sm italic mt-1 text-gray-700">
              (Bằng chữ: {numberToVietnameseWords(Math.abs(extendFee))})
          </p>

          <p><strong>Phương thức thanh toán:</strong> {paymentMethod || "Chưa chọn"}</p>

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
          <Button onClick={handlePrint} disabled={!paymentMethod}>In hóa đơn</Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? "Đang xử lý..." : "Gia hạn"}
          </Button>
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
