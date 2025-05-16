"use client";

import React, { useState, useEffect } from "react";
import {
  FormattedLoanTransaction,
  LoanManagementTabProps,
} from "@/interfaces/library";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { LoanManagementHeader } from "./LoanManagementHeader";
import { LoanFilters } from "./LoanFilters";
import { LoanTable } from "./LoanTable";
import { LoanPagination } from "./LoanPagination";
import { LoanDetailsDialog } from "./LoanDetailsDialog";

const LoanManagementTab: React.FC<LoanManagementTabProps> = ({
  loanTransactions,
  onLoanCreated,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterBorrowType, setFilterBorrowType] = useState("all");
  const [selectedLoan, setSelectedLoan] =
    useState<FormattedLoanTransaction | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const filteredLoans = loanTransactions.filter((loan) => {
    const matchesSearch =
      loan.reader.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.reader.cardNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.books.some((book) =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()),
      );

    const matchesStatusFilter =
      filterStatus === "all" ||
      loan.status.toLowerCase() === filterStatus.toLowerCase();

    const matchesBorrowTypeFilter =
      filterBorrowType === "all" ||
      loan.borrowType.toLowerCase() === filterBorrowType.toLowerCase();

    return matchesSearch && matchesStatusFilter && matchesBorrowTypeFilter;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredLoans.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLoans.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterBorrowType]);

  const handleRowClick = (loan: FormattedLoanTransaction): void => {
    setSelectedLoan(loan);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
  };

  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <Card>
      <LoanManagementHeader onLoanCreated={onLoanCreated} />

      <CardContent>
        <LoanFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          filterBorrowType={filterBorrowType}
          setFilterBorrowType={setFilterBorrowType}
        />

        <LoanTable
          currentItems={currentItems}
          handleRowClick={handleRowClick}
        />
      </CardContent>

      <CardFooter className="flex justify-between border-t p-4">
        <div className="text-sm text-muted-foreground">
          Hiển thị {indexOfFirstItem + 1}-
          {Math.min(indexOfLastItem, filteredLoans.length)} trong tổng số{" "}
          {filteredLoans.length} giao dịch
        </div>

        <LoanPagination
          currentPage={currentPage}
          totalPages={totalPages}
          paginate={paginate}
        />
      </CardFooter>

      <LoanDetailsDialog
        selectedLoan={selectedLoan}
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        closeDialog={closeDialog}
      />
    </Card>
  );
};

export default LoanManagementTab;
