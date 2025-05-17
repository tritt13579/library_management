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
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface ConditionModalProps {
  isOpen: boolean;
  onClose: () => void;
  copyId: number;
  currentConditionId?: string;
  conditions: { id: string; name: string }[];
  onSuccess?: (updatedCondition?: { condition_id: number; condition_name: string }) => void;
}

const ConditionModal: React.FC<ConditionModalProps> = ({
  isOpen,
  onClose,
  copyId,
  currentConditionId,
  conditions,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [selectedCondition, setSelectedCondition] = useState(currentConditionId || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!selectedCondition || !copyId) return;

    setLoading(true);
    try {
      const response = await fetch("/api/book/editcopy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          copy_id: copyId,
          new_condition_id: selectedCondition,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        console.error("Lỗi cập nhật:", result.error);
        alert("Không thể cập nhật tình trạng. Vui lòng thử lại.");
      } else {
        const updatedCond = conditions.find(
          (c) => c.id === selectedCondition
        );
        toast({ title: "Cập nhật thành công", variant: "success" });
        onSuccess?.({
          condition_id: Number(updatedCond?.id),
          condition_name: updatedCond?.name || "",
        });
        onClose();
      }
    } catch (err) {
      console.error("Lỗi khi gọi API:", err);
      alert("Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle>Cập nhật tình trạng bản sao</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <Select
            value={selectedCondition}
            onValueChange={setSelectedCondition}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn tình trạng" />
            </SelectTrigger>
            <SelectContent>
              {conditions.map((cond) => (
                <SelectItem key={cond.id} value={cond.id}>
                  {cond.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Đang lưu..." : "Lưu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConditionModal;
