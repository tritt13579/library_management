import { NextRequest, NextResponse } from "next/server";
import { supabaseClient } from "@/lib/client";

interface BookStatus {
  book: {
    id: number;
    title: string;
    author: string;
    condition: string;
    condition_id: number;
    price: number;
    copy_id: number;
    loan_detail_id: number;
  };
  isSelected: boolean;
  newCondition: number;
  isLost: boolean;
  lateFee: number;
  damageFee: number;
}

export async function POST(request: NextRequest) {
  const supabase = supabaseClient();

  try {
    const {
      loanId,
      readerId,
      booksStatus,
      totalFine,
      paymentMethod,
    }: {
      loanId: number;
      readerId: number;
      booksStatus: BookStatus[];
      totalFine: number;
      paymentMethod: string;
    } = await request.json();

    const selectedBookStatuses = booksStatus.filter(
      (status) => status.isSelected,
    );

    // Generate receipt number
    const date = new Date();
    const timestamp = date.getTime();
    const receiptNumber = `REC-${timestamp}-${Math.floor(Math.random() * 1000)}`;

    // 1. Create payment record if there's a fine
    let paymentId = null;
    if (totalFine > 0) {
      const { data: paymentData, error: paymentError } = await supabase
        .from("payment")
        .insert({
          reader_id: readerId,
          payment_date: new Date().toISOString().split("T")[0],
          amount: totalFine,
          reference_type: "finetransaction",
          payment_method: paymentMethod,
          receipt_no: receiptNumber,
        })
        .select();

      if (paymentError) throw paymentError;
      paymentId = paymentData?.[0]?.payment_id;
    }

    // 2. Process each selected book
    for (const bookStatus of selectedBookStatuses) {
      // Update book condition in bookcopy table
      if (bookStatus.newCondition !== bookStatus.book.condition_id) {
        const { error: conditionError } = await supabase
          .from("bookcopy")
          .update({ condition_id: bookStatus.newCondition })
          .eq("copy_id", bookStatus.book.copy_id);

        if (conditionError) throw conditionError;
      }

      // Update return date in loandetail
      const { error: returnError } = await supabase
        .from("loandetail")
        .update({
          return_date: new Date().toISOString().split("T")[0],
        })
        .eq("loan_detail_id", bookStatus.book.loan_detail_id);

      if (returnError) throw returnError;

      // Create fine transaction if needed
      if (bookStatus.lateFee > 0 || bookStatus.damageFee > 0) {
        // For late fee
        if (bookStatus.lateFee > 0) {
          const { error: lateFeeError } = await supabase
            .from("finetransaction")
            .insert({
              payment_id: paymentId,
              loan_detail_id: bookStatus.book.loan_detail_id,
              fine_type: "Trả trễ",
            });

          if (lateFeeError) throw lateFeeError;
        }

        // For damage/lost fee
        if (bookStatus.damageFee > 0) {
          const { error: damageFeeError } = await supabase
            .from("finetransaction")
            .insert({
              payment_id: paymentId,
              loan_detail_id: bookStatus.book.loan_detail_id,
              fine_type: bookStatus.isLost ? "Thất lạc" : "Hư hại",
            });

          if (damageFeeError) throw damageFeeError;
        }
      }
    }

    // 3. Check if all books in the loan have been returned
    const { data: remainingBooks, error: checkError } = await supabase
      .from("loandetail")
      .select("loan_detail_id")
      .eq("loan_transaction_id", loanId)
      .is("return_date", null);

    if (checkError) throw checkError;

    // If no remaining books, update loan status to "Đã trả"
    if (!remainingBooks || remainingBooks.length === 0) {
      const { error: updateLoanError } = await supabase
        .from("loantransaction")
        .update({ loan_status: "Đã trả" })
        .eq("loan_transaction_id", loanId);

      if (updateLoanError) throw updateLoanError;
    }

    // 4. Update library card deposit balance
    const totalBookValue = selectedBookStatuses.reduce((sum, bookStatus) => {
      return sum + (bookStatus.book.price || 0);
    }, 0);

    if (readerId && totalBookValue > 0) {
      const { data: currentCard, error: cardError } = await supabase
        .from("librarycard")
        .select("current_deposit_balance")
        .eq("card_id", readerId)
        .single();

      if (cardError) throw cardError;

      const newDepositBalance =
        (currentCard?.current_deposit_balance || 0) + totalBookValue;

      const { error: updateDepositError } = await supabase
        .from("librarycard")
        .update({ current_deposit_balance: newDepositBalance })
        .eq("card_id", readerId);

      if (updateDepositError) throw updateDepositError;
    }

    return NextResponse.json({
      success: true,
      receiptNumber,
      message: "Return processed successfully",
    });
  } catch (error) {
    console.error("Error processing return:", error);
    return NextResponse.json(
      { error: "Failed to process return" },
      { status: 500 },
    );
  }
}
