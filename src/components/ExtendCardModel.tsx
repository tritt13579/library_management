"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabaseClient } from '@/lib/client';

interface ExtendCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  readerId: number;
  onSuccess?: () => void;
}

const ExtendCardModal: React.FC<ExtendCardModalProps> = ({
  isOpen,
  onClose,
  readerId,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("Tiền mặt");
  const [extendFee, setExtendFee] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = supabaseClient();

      const { data: settingData, error: settingError } = await supabase
        .from('systemsetting')
        .select('setting_value')
        .eq('setting_id', 12)
        .single();

      if (settingError) {
        console.error('Lỗi khi lấy phí gia hạn:', settingError);
      } else if (settingData?.setting_value) {
        const fee = parseFloat(settingData.setting_value.toString().replace(/[^0-9.]/g, ""));
        setExtendFee(fee);
      }
    };

    fetchData();
  }, []);

  const handleConfirm = async () => {
    setIsLoading(true);

    try {
      const res = await fetch("/api/reader/extend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ readerId, paymentMethod }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gia hạn thất bại");
      }

      toast({ title: "Gia hạn thành công", variant: "success" });
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Hoa đơn thanh toán</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div>
            <Label>Mã bạn đọc:</Label>
            <div className="mt-1 text-muted-foreground">{readerId}</div>
          </div>

          <div>
            <Label htmlFor="payment-method">Phương thức thanh toán</Label>
            <Select
              value={paymentMethod}
              onValueChange={(val) => setPaymentMethod(val)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Chọn phương thức" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tiền mặt">Tiền mặt</SelectItem>
                <SelectItem value="Chuyển khoản">Chuyển khoản</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Phí gia hạn:</Label>
            <div className="mt-1 font-semibold text-foreground">
              {extendFee.toLocaleString("vi-VN", {
                style: "currency",
                currency: "VND",
              })}
            </div>
          </div>

          <Label>
            Nhấn <strong>Gia hạn</strong> để gia hạn thẻ theo thời hạn mặc định.
          </Label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? "Đang xử lý..." : "Gia hạn"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExtendCardModal;
