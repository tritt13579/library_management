"use client";

import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AlertCircle, BookCheck } from "lucide-react";
import { BookReturnStatus, Condition } from "@/interfaces/ReturnBook";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SelectBooksStepProps {
  booksStatus: BookReturnStatus[];
  conditions: Condition[];
  allSelected: boolean;
  handleToggleSelectAll: () => void;
  handleToggleSelect: (index: number) => void;
  handleConditionChange: (index: number, value: string) => void;
}

export const SelectBooksStep: React.FC<SelectBooksStepProps> = ({
  booksStatus,
  conditions,
  allSelected,
  handleToggleSelectAll,
  handleToggleSelect,
  handleConditionChange,
}) => {
  if (booksStatus.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <BookCheck className="mb-4 h-16 w-16 text-gray-300" />
        <p className="text-xl font-medium text-gray-600">
          Không có sách chưa trả
        </p>
        <p className="text-sm text-gray-400">
          Tất cả sách trong mượn này đã được trả
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="selectAll"
          checked={allSelected}
          onCheckedChange={handleToggleSelectAll}
        />
        <Label htmlFor="selectAll">Chọn tất cả</Label>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Tên sách</TableHead>
            <TableHead>Tác giả</TableHead>
            <TableHead>Tình trạng hiện tại</TableHead>
            <TableHead>Cập nhật tình trạng</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {booksStatus.map((bookStatus, index) => (
            <TableRow key={index}>
              <TableCell>
                <Checkbox
                  checked={bookStatus.isSelected}
                  onCheckedChange={() => handleToggleSelect(index)}
                />
              </TableCell>
              <TableCell>{bookStatus.book.title}</TableCell>
              <TableCell>{bookStatus.book.author}</TableCell>
              <TableCell>{bookStatus.book.condition}</TableCell>
              <TableCell>
                <Select
                  value={bookStatus.newCondition?.toString()}
                  onValueChange={(value) => handleConditionChange(index, value)}
                  disabled={!bookStatus.isSelected}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn tình trạng" />
                  </SelectTrigger>
                  <SelectContent>
                    {conditions.map((condition) => (
                      <SelectItem
                        key={condition.condition_id}
                        value={condition.condition_id.toString()}
                        disabled={
                          condition.condition_id < bookStatus.book.condition_id
                        }
                      >
                        {condition.condition_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="text-sm text-muted-foreground">
        <AlertCircle className="mr-1 inline h-4 w-4" />
        Lưu ý: Tình trạng sách chỉ có thể cập nhật giảm (xấu đi). Sách "Thất
        lạc" sẽ tính phí bằng 100% giá trị sách, "Hư hại" tính 50% giá trị sách.
      </div>
    </div>
  );
};
