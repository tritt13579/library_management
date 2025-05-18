"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  ArrowLeft,
  BookCheck,
  AlertCircle,
  CreditCard,
  CheckCircle2,
  Receipt,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import {
  BookReturnStatus,
  Condition,
  ReturnBookDialogProps,
} from "@/interfaces/ReturnBook";

export const ReturnBookDialog: React.FC<ReturnBookDialogProps> = ({
  selectedLoan,
  dialogOpen,
  setDialogOpen,
  closeDialog,
  onReturnComplete,
  returnToLoanDetails,
}) => {
  const [step, setStep] = useState(1);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [lateFeeRate, setLateFeeRate] = useState<number>(0);
  const [booksStatus, setBooksStatus] = useState<BookReturnStatus[]>([]);
  const [allSelected, setAllSelected] = useState(true);
  const [totalFine, setTotalFine] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<string>("Tiền mặt");
  const [isProcessing, setIsProcessing] = useState(false);
  const [receiptNo, setReceiptNo] = useState("");

  useEffect(() => {
    if (dialogOpen && selectedLoan) {
      const fetchConditions = async () => {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/loan-transactions/return-book/conditions`,
          );
          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.error);
          }

          setConditions(result.data || []);
        } catch (error) {
          console.error("Error fetching conditions:", error);
          toast({
            title: "Lỗi",
            description: "Không thể tải dữ liệu tình trạng sách",
            variant: "destructive",
          });
        }
      };

      const fetchLateFeeRate = async () => {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/loan-transactions/return-book/late-fee-rate`,
          );
          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.error);
          }

          setLateFeeRate(result.data);
        } catch (error) {
          console.error("Error fetching late fee rate:", error);
        }
      };

      const initializeBooksStatus = async () => {
        if (selectedLoan && selectedLoan.books) {
          // Filter books that haven't been returned yet
          const unreturned = selectedLoan.books.filter(
            (book) => !book.returnDate,
          );

          if (unreturned.length === 0) {
            toast({
              title: "Thông báo",
              description: "Tất cả sách trong mượn này đã được trả",
              variant: "default",
            });
            return;
          }

          try {
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_BASE_URL}/api/loan-transactions/return-book/book-details`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  loanId: selectedLoan.id,
                  books: unreturned,
                }),
              },
            );

            const result = await response.json();

            if (!response.ok) {
              throw new Error(result.error);
            }

            // Calculate late fee for each book
            const booksWithLateFee = result.data.map((bookDetail: any) => {
              let lateFee = 0;
              const today = new Date();
              const dueDate = new Date(selectedLoan.dueDate);

              if (today > dueDate) {
                const daysLate = Math.ceil(
                  (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24),
                );
                lateFee = daysLate * lateFeeRate;
              }

              return {
                ...bookDetail,
                isSelected: true,
                newCondition: bookDetail.book.condition_id,
                isLost: false,
                lateFee: lateFee,
                damageFee: 0,
              };
            });

            setBooksStatus(booksWithLateFee);

            if (booksWithLateFee.length === 0) {
              toast({
                title: "Lỗi",
                description: "Không thể tải thông tin sách cho mượn",
                variant: "destructive",
              });
            }
          } catch (error) {
            console.error("Error fetching book details:", error);
            toast({
              title: "Lỗi",
              description: "Không thể tải thông tin sách cho mượn",
              variant: "destructive",
            });
          }
        }
      };

      fetchConditions();
      fetchLateFeeRate();
      initializeBooksStatus();
      setStep(1);
      setAllSelected(true);
    }
  }, [dialogOpen, selectedLoan, lateFeeRate]);

  // Calculate total fine whenever booksStatus changes
  useEffect(() => {
    let total = 0;
    booksStatus.forEach((bookStatus) => {
      if (bookStatus.isSelected) {
        total += bookStatus.lateFee;
        total += bookStatus.damageFee;
      }
    });
    setTotalFine(total);
  }, [booksStatus]);

  // Update all books selection
  useEffect(() => {
    const allBooksSelected = booksStatus.every((book) => book.isSelected);
    setAllSelected(allBooksSelected);
  }, [booksStatus]);

  const handleToggleSelectAll = () => {
    const newValue = !allSelected;
    setAllSelected(newValue);
    setBooksStatus((prevStatus) =>
      prevStatus.map((status) => ({
        ...status,
        isSelected: newValue,
      })),
    );
  };

  const handleToggleSelect = (index: number) => {
    setBooksStatus((prevStatus) => {
      const newStatus = [...prevStatus];
      newStatus[index] = {
        ...newStatus[index],
        isSelected: !newStatus[index].isSelected,
      };
      return newStatus;
    });
  };

  const handleConditionChange = (index: number, value: string) => {
    const conditionId = parseInt(value);
    const bookStatus = booksStatus[index];
    const isLost = conditionId === 4; // Thất lạc has ID 4
    const isDamaged = conditionId === 3; // Bị hư hại has ID 3

    // Validate condition change (can only decrease, not increase)
    if (conditionId < bookStatus.book.condition_id) {
      toast({
        title: "Lỗi",
        description:
          "Không thể cập nhật tình trạng sách tốt hơn tình trạng hiện tại",
        variant: "destructive",
      });
      return;
    }

    let damageFee = 0;

    // Calculate damage fee based on condition
    if (isLost) {
      // Lost book: 100% of book price
      damageFee = bookStatus.book.price;
    } else if (isDamaged) {
      // Damaged book: 50% of book price
      damageFee = bookStatus.book.price * 0.5;
    }

    setBooksStatus((prevStatus) => {
      const newStatus = [...prevStatus];
      newStatus[index] = {
        ...newStatus[index],
        newCondition: conditionId,
        isLost,
        damageFee,
      };
      return newStatus;
    });
  };

  const handleNextStep = () => {
    if (step === 1) {
      const selectedBooks = booksStatus.filter((status) => status.isSelected);
      if (selectedBooks.length === 0) {
        toast({
          title: "Lỗi",
          description: "Vui lòng chọn ít nhất một cuốn sách để trả",
          variant: "destructive",
        });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handlePreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      returnToLoanDetails();
    }
  };

  const generateReceiptNo = () => {
    const date = new Date();
    const timestamp = date.getTime();
    return `REC-${timestamp}-${Math.floor(Math.random() * 1000)}`;
  };

  const handleSubmit = async () => {
    if (!selectedLoan) return;

    setIsProcessing(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/loan-transactions/return-book/process`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            loanId: selectedLoan.id,
            readerId: selectedLoan.reader.id,
            booksStatus,
            totalFine,
            paymentMethod,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error);
      }

      setReceiptNo(result.receiptNumber);
      setStep(4); // Move to success step
    } catch (error) {
      console.error("Error processing return:", error);
      toast({
        title: "Lỗi",
        description: "Không thể hoàn tất quá trình trả sách. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleComplete = () => {
    closeDialog();
    onReturnComplete();
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="max-w-4xl">
        {selectedLoan && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePreviousStep}
                  className="h-8 w-8"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                {step === 1 && "Trả sách - Chọn sách và cập nhật tình trạng"}
                {step === 2 && "Trả sách - Xác nhận thông tin chi phí"}
                {step === 3 && "Trả sách - Xác nhận thanh toán"}
                {step === 4 && "Trả sách - Hoàn tất"}
              </DialogTitle>
              <DialogDescription>
                ID Giao dịch: {selectedLoan.id} | Độc giả:{" "}
                {selectedLoan.reader.name}
              </DialogDescription>
            </DialogHeader>

            {/* Step 1: Select books and update conditions */}
            {step === 1 && (
              <div className="space-y-4">
                {booksStatus.length > 0 ? (
                  <>
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
                                onCheckedChange={() =>
                                  handleToggleSelect(index)
                                }
                              />
                            </TableCell>
                            <TableCell>{bookStatus.book.title}</TableCell>
                            <TableCell>{bookStatus.book.author}</TableCell>
                            <TableCell>{bookStatus.book.condition}</TableCell>
                            <TableCell>
                              <Select
                                value={bookStatus.newCondition?.toString()}
                                onValueChange={(value) =>
                                  handleConditionChange(index, value)
                                }
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
                                        condition.condition_id <
                                        bookStatus.book.condition_id
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
                      Lưu ý: Tình trạng sách chỉ có thể cập nhật giảm (xấu đi).
                      Sách "Thất lạc" sẽ tính phí bằng 100% giá trị sách, "Hư
                      hại" tính 50% giá trị sách.
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <BookCheck className="mb-4 h-16 w-16 text-gray-300" />
                    <p className="text-xl font-medium text-gray-600">
                      Không có sách chưa trả
                    </p>
                    <p className="text-sm text-gray-400">
                      Tất cả sách trong mượn này đã được trả
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Review fees */}
            {step === 2 && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Chi tiết phí phạt</CardTitle>
                    <CardDescription>
                      Các khoản phí phạt phát sinh trong quá trình trả sách
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tên sách</TableHead>
                          <TableHead>Loại phí</TableHead>
                          <TableHead className="text-right">Số tiền</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {booksStatus
                          .filter((status) => status.isSelected)
                          .map((status, index) => (
                            <React.Fragment key={index}>
                              {status.lateFee > 0 && (
                                <TableRow>
                                  <TableCell>{status.book.title}</TableCell>
                                  <TableCell>Phí trả trễ</TableCell>
                                  <TableCell className="text-right">
                                    {status.lateFee.toLocaleString("vi-VN")} VNĐ
                                  </TableCell>
                                </TableRow>
                              )}
                              {status.damageFee > 0 && (
                                <TableRow>
                                  <TableCell>{status.book.title}</TableCell>
                                  <TableCell>
                                    {status.isLost
                                      ? "Phí thất lạc"
                                      : "Phí hư hại"}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {status.damageFee.toLocaleString("vi-VN")}{" "}
                                    VNĐ
                                  </TableCell>
                                </TableRow>
                              )}
                              {status.lateFee === 0 &&
                                status.damageFee === 0 && (
                                  <TableRow>
                                    <TableCell>{status.book.title}</TableCell>
                                    <TableCell>-</TableCell>
                                    <TableCell className="text-right">
                                      0 VNĐ
                                    </TableCell>
                                  </TableRow>
                                )}
                            </React.Fragment>
                          ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="font-medium">Tổng tiền phạt:</div>
                    <div className="text-lg font-bold">
                      {totalFine.toLocaleString("vi-VN")} VNĐ
                    </div>
                  </CardFooter>
                </Card>
              </div>
            )}

            {/* Step 3: Payment confirmation */}
            {step === 3 && (
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
                          Tổng tiền cần thanh toán:{" "}
                          {totalFine.toLocaleString("vi-VN")} VNĐ
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="paymentMethod">
                            Phương thức thanh toán
                          </Label>
                          <Select
                            value={paymentMethod}
                            onValueChange={setPaymentMethod}
                          >
                            <SelectTrigger id="paymentMethod">
                              <SelectValue placeholder="Chọn phương thức thanh toán" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Tiền mặt">Tiền mặt</SelectItem>
                              <SelectItem value="Chuyển khoản">
                                Chuyển khoản
                              </SelectItem>
                              <SelectItem value="Thẻ tín dụng">
                                Thẻ tín dụng
                              </SelectItem>
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
            )}

            {/* Step 4: Success */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="flex flex-col items-center py-6">
                  <CheckCircle2 className="mb-4 h-16 w-16 text-green-500" />
                  <h2 className="mb-2 text-2xl font-bold">
                    Trả sách thành công!
                  </h2>
                  <p className="mb-4 text-center text-muted-foreground">
                    Quá trình trả sách đã được hoàn tất.
                  </p>

                  {totalFine > 0 && (
                    <Card className="w-full">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Receipt className="mr-2 h-5 w-5" />
                          Thông tin thanh toán
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Số hoá đơn:
                            </span>
                            <span>{receiptNo}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Phương thức:
                            </span>
                            <span>{paymentMethod}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Số tiền:
                            </span>
                            <span className="font-bold">
                              {totalFine.toLocaleString("vi-VN")} VNĐ
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              {step === 1 && (
                <>
                  <Button variant="outline" onClick={returnToLoanDetails}>
                    Huỷ
                  </Button>
                  <Button
                    onClick={handleNextStep}
                    disabled={booksStatus.length === 0}
                  >
                    Tiếp tục
                  </Button>
                </>
              )}

              {step === 2 && (
                <>
                  <Button variant="outline" onClick={handlePreviousStep}>
                    Quay lại
                  </Button>
                  <Button onClick={handleNextStep}>Tiếp tục</Button>
                </>
              )}

              {step === 3 && (
                <>
                  <Button
                    variant="outline"
                    onClick={handlePreviousStep}
                    disabled={isProcessing}
                  >
                    Quay lại
                  </Button>
                  <Button onClick={handleSubmit} disabled={isProcessing}>
                    {isProcessing ? "Đang xử lý..." : "Xác nhận trả sách"}
                  </Button>
                </>
              )}

              {step === 4 && <Button onClick={handleComplete}>Hoàn tất</Button>}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
