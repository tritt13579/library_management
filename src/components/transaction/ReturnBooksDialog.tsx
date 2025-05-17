"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { formatDate } from "@/lib/utils";
import { supabaseClient } from "@/lib/client";
import { BookCheck, Clock, AlertCircle, Ban, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

// Define the book item interface
interface BookItem {
  id: number;
  loanDetailId: number;
  title: string;
  author: string;
  condition: string;
  returnDate: string | null;
}

interface ReturnBooksDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  books: BookItem[];
  dueDate: string;
  loanTransactionId: number;
  onReturnComplete: () => void;
}

const BookConditionOptions = [
  { value: "Bình thường", label: "Bình thường" },
  { value: "Hư hỏng nhẹ", label: "Hư hỏng nhẹ" },
  { value: "Hư hỏng nặng", label: "Hư hỏng nặng" },
  { value: "Mất sách", label: "Mất sách" },
];

export const ReturnBooksDialog: React.FC<ReturnBooksDialogProps> = ({
  open,
  onOpenChange,
  books,
  dueDate,
  loanTransactionId,
  onReturnComplete,
}) => {
  const [selectedBooks, setSelectedBooks] = useState<number[]>([]);
  const [returnStatus, setReturnStatus] = useState<
    Record<number, { condition: string; fine: number }>
  >({});
  const [returning, setReturning] = useState(false);

  // Initialize returnStatus for each book
  React.useEffect(() => {
    const initialReturnStatus: Record<
      number,
      { condition: string; fine: number }
    > = {};
    books
      .filter((book) => !book.returnDate)
      .forEach((book) => {
        initialReturnStatus[book.loanDetailId] = {
          condition: "Bình thường",
          fine: 0,
        };
      });
    setReturnStatus(initialReturnStatus);
  }, [books]);

  const handleSelectAllBooks = (checked: boolean) => {
    if (checked) {
      setSelectedBooks(
        books
          .filter((book) => !book.returnDate)
          .map((book) => book.loanDetailId),
      );
    } else {
      setSelectedBooks([]);
    }
  };

  const handleBookSelect = (loanDetailId: number, checked: boolean) => {
    if (checked) {
      setSelectedBooks([...selectedBooks, loanDetailId]);
    } else {
      setSelectedBooks(selectedBooks.filter((id) => id !== loanDetailId));
    }
  };

  const handleConditionChange = (loanDetailId: number, condition: string) => {
    setReturnStatus({
      ...returnStatus,
      [loanDetailId]: {
        ...returnStatus[loanDetailId],
        condition,
        fine:
          condition === "Hư hỏng nhẹ"
            ? 50000
            : condition === "Hư hỏng nặng"
              ? 150000
              : condition === "Mất sách"
                ? 300000
                : 0,
      },
    });
  };

  const calculateLateFee = (dueDate: string): number => {
    const today = new Date();
    const due = new Date(dueDate);

    // If today is before or equal to the due date, no late fee
    if (today <= due) return 0;

    // Calculate days difference
    const diffTime = Math.abs(today.getTime() - due.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Assume late fee is 5,000 VND per day
    return diffDays * 5000;
  };

  const handleReturnBooks = async () => {
    if (selectedBooks.length === 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn ít nhất một cuốn sách để trả",
        variant: "destructive",
      });
      return;
    }

    try {
      setReturning(true);
      const supabase = supabaseClient();
      const today = formatDate(new Date());
      const lateFee = calculateLateFee(dueDate);

      // Update return date for selected loan details
      for (const loanDetailId of selectedBooks) {
        // Update return date
        await supabase
          .from("loandetail")
          .update({ return_date: today })
          .eq("loan_detail_id", loanDetailId);

        // Create fine transaction if needed (for damaged books or late returns)
        const bookCondition = returnStatus[loanDetailId].condition;
        const damageFine = returnStatus[loanDetailId].fine;

        if (damageFine > 0) {
          await supabase.from("finetransaction").insert({
            loan_detail_id: loanDetailId,
            fine_type: "Sách hư hỏng",
            amount: damageFine,
          });
        }
      }

      // If there's a late fee, create a fine transaction for the lateness
      if (lateFee > 0) {
        // Using the first selected book's loan detail for the late fee
        await supabase.from("finetransaction").insert({
          loan_detail_id: selectedBooks[0],
          fine_type: "Trả trễ",
          amount: lateFee,
        });
      }

      // Check if all books in the transaction have been returned
      const { data: remainingBooks } = await supabase
        .from("loandetail")
        .select("loan_detail_id")
        .eq("loan_transaction_id", loanTransactionId)
        .is("return_date", null);

      // If all books are returned, update the loan transaction status
      if (!remainingBooks?.length) {
        await supabase
          .from("loantransaction")
          .update({ loan_status: "Đã trả" })
          .eq("loan_transaction_id", loanTransactionId);
      }

      toast({
        title: "Thành công",
        description: "Đã trả sách thành công",
        variant: "default",
      });

      onReturnComplete();
      onOpenChange(false);
    } catch (error) {
      console.error("Error returning books:", error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi trả sách",
        variant: "destructive",
      });
    } finally {
      setReturning(false);
    }
  };

  // Filter out already returned books
  const availableBooksToReturn = books.filter((book) => !book.returnDate);
  const allBooksReturned = availableBooksToReturn.length === 0;

  // Calculate total fine
  const totalFine =
    selectedBooks.reduce(
      (sum, loanDetailId) => sum + returnStatus[loanDetailId]?.fine || 0,
      0,
    ) + (selectedBooks.length > 0 ? calculateLateFee(dueDate) : 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Trả sách</DialogTitle>
          <DialogDescription>
            Chọn sách bạn muốn trả và cập nhật tình trạng sách
          </DialogDescription>
        </DialogHeader>

        {allBooksReturned ? (
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
            <p className="mt-4 text-center text-lg">
              Tất cả sách đã được trả thành công!
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="select-all"
                    checked={
                      selectedBooks.length === availableBooksToReturn.length &&
                      availableBooksToReturn.length > 0
                    }
                    onCheckedChange={handleSelectAllBooks}
                  />
                  <label
                    htmlFor="select-all"
                    className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Chọn tất cả
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <p className="text-sm text-muted-foreground">
                    Hạn trả: <span className="font-medium">{dueDate}</span>
                  </p>
                  {calculateLateFee(dueDate) > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      <Clock className="mr-1 h-3 w-3" />
                      Trễ hạn
                    </Badge>
                  )}
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Tên sách</TableHead>
                    <TableHead>Tác giả</TableHead>
                    <TableHead>Tình trạng khi trả</TableHead>
                    <TableHead className="text-right">Phí đền bù</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {availableBooksToReturn.map((book) => (
                    <TableRow key={book.loanDetailId}>
                      <TableCell>
                        <Checkbox
                          checked={selectedBooks.includes(book.loanDetailId)}
                          onCheckedChange={(checked) =>
                            handleBookSelect(book.loanDetailId, !!checked)
                          }
                        />
                      </TableCell>
                      <TableCell>{book.title}</TableCell>
                      <TableCell>{book.author}</TableCell>
                      <TableCell>
                        <select
                          className="w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                          value={
                            returnStatus[book.loanDetailId]?.condition || ""
                          }
                          onChange={(e) =>
                            handleConditionChange(
                              book.loanDetailId,
                              e.target.value,
                            )
                          }
                          disabled={!selectedBooks.includes(book.loanDetailId)}
                        >
                          {BookConditionOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </TableCell>
                      <TableCell className="text-right">
                        {returnStatus[book.loanDetailId]?.fine
                          ? `${returnStatus[book.loanDetailId].fine.toLocaleString()} VNĐ`
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {calculateLateFee(dueDate) > 0 && (
                <div className="rounded-md bg-amber-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle
                        className="h-5 w-5 text-amber-400"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-amber-800">
                        Sách trả trễ hạn
                      </h3>
                      <div className="mt-2 text-sm text-amber-700">
                        <p>
                          Phí trả trễ:{" "}
                          <span className="font-semibold">
                            {calculateLateFee(dueDate).toLocaleString()} VNĐ
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedBooks.length > 0 && (
                <div className="flex justify-between rounded-md bg-slate-50 p-4">
                  <div>
                    <p className="text-sm font-medium">Tổng phí thanh toán:</p>
                    <p className="text-xs text-muted-foreground">
                      Bao gồm phí trả trễ và phí đền bù sách
                    </p>
                  </div>
                  <p className="text-lg font-bold">
                    {totalFine.toLocaleString()} VNĐ
                  </p>
                </div>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={returning}
              >
                Hủy
              </Button>
              <Button
                onClick={handleReturnBooks}
                disabled={selectedBooks.length === 0 || returning}
                className="relative"
              >
                {returning && (
                  <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
                )}
                <BookCheck className="mr-2 h-4 w-4" />
                Xác nhận trả sách
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
