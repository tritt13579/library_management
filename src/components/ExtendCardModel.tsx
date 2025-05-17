"use client";

import React from "react";
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
  const [isLoading, setIsLoading] = React.useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);

    try {
      const res = await fetch("/api/reader/extend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ readerId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gia hạn thất bại");
      }

      toast({ title: "Gia hạn thành công", variant: "success" });
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast({ title: "Lỗi", description: err.message || "Có lỗi xảy ra", variant: "destructive",});
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gia hạn thẻ thư viện</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <Label>Nhấn gia hạn để gia hạn thẻ theo thời hạn mặc định.</Label>
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
