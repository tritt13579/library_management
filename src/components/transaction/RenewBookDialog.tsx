"use client";

import React, { useState, useEffect } from "react";
import { FormattedLoanTransaction } from "@/interfaces/library";
import { Button } from "@/components/ui/button";
import { format, addDays } from "date-fns";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  CalendarRange,
  RefreshCw,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabaseClient } from "@/lib/client";
import { toast } from "@/hooks/use-toast";

interface RenewBookDialogProps {
  selectedLoan: FormattedLoanTransaction | null;
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  closeDialog: () => void;
  onRenewComplete?: () => void;
  returnToLoanDetails: () => void;
}

export const RenewBookDialog: React.FC<RenewBookDialogProps> = ({
  selectedLoan,
  dialogOpen,
  setDialogOpen,
  closeDialog,
  onRenewComplete,
  returnToLoanDetails,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [renewalSettings, setRenewalSettings] = useState({
    maxRenewals: 2,
    renewalDays: 20,
  });
  const [currentRenewalCount, setCurrentRenewalCount] = useState(0);
  const [canRenew, setCanRenew] = useState(true);
  const [renewalErrorMessage, setRenewalErrorMessage] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [unreturnedBookCount, setUnreturnedBookCount] = useState(0);

  useEffect(() => {
    if (dialogOpen && selectedLoan) {
      fetchRenewalSettings();
      fetchCurrentRenewalCount();
    }
  }, [dialogOpen, selectedLoan]);

  const fetchRenewalSettings = async () => {
    try {
      const supabase = supabaseClient();
      const { data: maxRenewalsData, error: maxRenewalsError } = await supabase
        .from("systemsetting")
        .select("setting_value")
        .eq("setting_name", "Số lần gia hạn")
        .single();

      const { data: renewalDaysData, error: renewalDaysError } = await supabase
        .from("systemsetting")
        .select("setting_value")
        .eq("setting_name", "Thời gian mượn")
        .single();

      if (maxRenewalsError || renewalDaysError) {
        console.error(
          "Error fetching renewal settings:",
          maxRenewalsError || renewalDaysError,
        );
        return;
      }

      setRenewalSettings({
        maxRenewals: parseInt(maxRenewalsData?.setting_value || "2"),
        renewalDays: parseInt(renewalDaysData?.setting_value || "20"),
      });
    } catch (error) {
      console.error("Error fetching renewal settings:", error);
    }
  };

  const fetchCurrentRenewalCount = async () => {
    if (!selectedLoan) return;

    try {
      setIsLoading(true);
      const supabase = supabaseClient();

      // Fetch all loan details for this loan transaction
      const { data: loanDetails, error } = await supabase
        .from("loandetail")
        .select("renewal_count, return_date")
        .eq("loan_transaction_id", selectedLoan.id);

      if (error) {
        console.error("Error fetching renewal count:", error);
        return;
      }

      // Filter unreturned books (where return_date is null)
      const unreturnedBooks =
        loanDetails?.filter((book) => book.return_date === null) || [];
      setUnreturnedBookCount(unreturnedBooks.length);

      // Check if there are any unreturned books to renew
      if (unreturnedBooks.length === 0) {
        setCanRenew(false);
        setRenewalErrorMessage("Không thể gia hạn: Tất cả sách đã được trả.");
        return;
      }

      // Find the maximum renewal count among unreturned books
      const maxRenewalCount = unreturnedBooks.reduce(
        (max, detail) => Math.max(max, detail.renewal_count),
        0,
      );

      setCurrentRenewalCount(maxRenewalCount);

      // Check if renewal is possible
      if (maxRenewalCount >= renewalSettings.maxRenewals) {
        setCanRenew(false);
        setRenewalErrorMessage(
          `Không thể gia hạn: Đã đạt giới hạn ${renewalSettings.maxRenewals} lần gia hạn.`,
        );
      } else if (selectedLoan.status === "Quá hạn") {
        setCanRenew(false);
        setRenewalErrorMessage("Không thể gia hạn: Sách đã quá hạn.");
      } else {
        setCanRenew(true);
        setRenewalErrorMessage("");

        // Calculate new due date based on current due date and renewal days
        const currentDueDate = new Date(selectedLoan.dueDate);
        const newDate = addDays(currentDueDate, renewalSettings.renewalDays);
        setNewDueDate(format(newDate, "dd/MM/yyyy"));
      }
    } catch (error) {
      console.error("Error checking renewal eligibility:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRenewBooks = async () => {
    if (!selectedLoan) return;

    try {
      setIsLoading(true);
      const supabase = supabaseClient();

      // Update only loan details that don't have a return_date (unreturned books)
      const { error: loanDetailError } = await supabase
        .from("loandetail")
        .update({ renewal_count: currentRenewalCount + 1 })
        .eq("loan_transaction_id", selectedLoan.id)
        .is("return_date", null);

      if (loanDetailError) {
        console.error("Error updating loan details:", loanDetailError);
        toast({
          title: "Lỗi",
          description: "Không thể gia hạn sách. Vui lòng thử lại sau.",
          variant: "destructive",
        });
        return;
      }

      // Update loan transaction - extend due date
      const currentDueDate = new Date(selectedLoan.dueDate);
      const newDueDate = addDays(currentDueDate, renewalSettings.renewalDays);

      const { error: loanTransactionError } = await supabase
        .from("loantransaction")
        .update({
          due_date: format(newDueDate, "yyyy-MM-dd"),
          loan_status: "Đang mượn", // Reset status if it was close to overdue
        })
        .eq("loan_transaction_id", selectedLoan.id);

      if (loanTransactionError) {
        console.error("Error updating loan transaction:", loanTransactionError);
        toast({
          title: "Lỗi",
          description: "Không thể cập nhật hạn trả sách. Vui lòng thử lại sau.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Thành công",
        description: `Gia hạn ${unreturnedBookCount} sách thành công!`,
        variant: "default",
      });

      if (onRenewComplete) {
        onRenewComplete();
      }
    } catch (error) {
      console.error("Error renewing books:", error);
      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi khi gia hạn sách. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      closeDialog();
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="max-w-md">
        {selectedLoan && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl">Gia hạn sách</DialogTitle>
              <DialogDescription>
                Mã thẻ: {selectedLoan.reader.cardNumber} -{" "}
                {selectedLoan.reader.name}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Clock className="mr-2 h-4 w-4" />
                    Thông tin gia hạn
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Hạn trả hiện tại:
                    </span>
                    <span className="font-medium">{selectedLoan.dueDate}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Số lượng sách chưa trả:
                    </span>
                    <span className="font-medium">{unreturnedBookCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Số lần đã gia hạn:
                    </span>
                    <span className="font-medium">{currentRenewalCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Giới hạn gia hạn:
                    </span>
                    <span className="font-medium">
                      {renewalSettings.maxRenewals} lần
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Thời gian gia hạn:
                    </span>
                    <span className="font-medium">
                      {renewalSettings.renewalDays} ngày
                    </span>
                  </div>
                  {canRenew && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Hạn trả mới:
                      </span>
                      <span className="font-medium text-green-600">
                        {newDueDate}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {!canRenew && renewalErrorMessage && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Không thể gia hạn</AlertTitle>
                  <AlertDescription>{renewalErrorMessage}</AlertDescription>
                </Alert>
              )}

              {canRenew && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-700">
                    Sẵn sàng gia hạn
                  </AlertTitle>
                  <AlertDescription className="text-green-600">
                    Bạn có thể gia hạn thêm {renewalSettings.renewalDays} ngày
                    cho {unreturnedBookCount} sách chưa trả.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="default"
                onClick={handleRenewBooks}
                disabled={!canRenew || isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CalendarRange className="mr-2 h-4 w-4" />
                )}
                Gia hạn sách
              </Button>
              <Button
                variant="secondary"
                onClick={returnToLoanDetails}
                className="flex-1"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Quay lại
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
