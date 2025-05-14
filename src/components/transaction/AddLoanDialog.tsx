"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { supabaseClient } from "@/lib/client";
import { toast } from "@/hooks/use-toast";

interface LibraryCard {
  card_id: number;
  card_number: string;
  reader: {
    first_name: string;
    last_name: string;
  };
}

interface BookCopy {
  copy_id: number;
  book_title_id: number;
  booktitle: {
    title: string;
  };
  condition: {
    condition_name: string;
  };
}

interface Staff {
  staff_id: number;
  first_name: string;
  last_name: string;
}

interface AddLoanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddLoanDialog: React.FC<AddLoanDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState<LibraryCard[]>([]);
  const [availableBooks, setAvailableBooks] = useState<BookCopy[]>([]);
  const [selectedBooks, setSelectedBooks] = useState<BookCopy[]>([]);
  const [staffMembers, setStaffMembers] = useState<Staff[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<BookCopy[]>([]);

  const form = useForm({
    defaultValues: {
      card_id: "",
      staff_id: "",
      transaction_date: new Date(),
      due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Default to 14 days from now
      borrow_type: "standard", // Default borrow type
    },
  });

  useEffect(() => {
    // Fetch data for dropdowns
    const fetchData = async () => {
      try {
        // Fetch active library cards
        const { data: cardData, error: cardError } = await supabaseClient()
          .from("librarycard")
          .select(
            `
            card_id,
            card_number,
            reader:reader_id (
              first_name,
              last_name
            )
          `,
          )
          .eq("card_status", "active");

        if (cardError) throw cardError;
        setCards(
          (cardData || []).map((card: any) => ({
            ...card,
            reader: Array.isArray(card.reader) ? card.reader[0] : card.reader,
          })),
        );

        // Fetch available books (not currently on loan)
        const { data: bookData, error: bookError } = await supabaseClient()
          .from("bookcopy")
          .select(
            `
            copy_id,
            book_title_id,
            booktitle:book_title_id (
              title
            ),
            condition:condition_id (
              condition_name
            )
          `,
          )
          .not(
            "copy_id",
            "in",
            `(
            SELECT copy_id FROM loandetail
            JOIN loantransaction ON loandetail.loan_transaction_id = loantransaction.loan_transaction_id
            WHERE return_date IS NULL AND loan_status = 'active'
          )`,
          );

        if (bookError) throw bookError;
        setAvailableBooks(
          (bookData || []).map((book: any) => ({
            ...book,
            booktitle: Array.isArray(book.booktitle)
              ? book.booktitle[0]
              : book.booktitle,
            condition: Array.isArray(book.condition)
              ? book.condition[0]
              : book.condition,
          })),
        );

        // Fetch staff members
        const { data: staffData, error: staffError } = await supabaseClient()
          .from("staff")
          .select("staff_id, first_name, last_name");

        if (staffError) throw staffError;
        setStaffMembers(staffData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Lỗi",
          description: "Không thể tải dữ liệu. Vui lòng thử lại sau.",
          variant: "destructive",
        });
      }
    };

    if (open) {
      fetchData();
    }
  }, [open]);

  useEffect(() => {
    // Filter books based on search term
    if (searchTerm.trim() === "") {
      setSearchResults([]);
      return;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    const filteredBooks = availableBooks.filter(
      (book) =>
        book.booktitle.title.toLowerCase().includes(lowerSearchTerm) &&
        !selectedBooks.some((selected) => selected.copy_id === book.copy_id),
    );
    setSearchResults(filteredBooks);
  }, [searchTerm, availableBooks, selectedBooks]);

  const handleAddBook = (book: BookCopy) => {
    setSelectedBooks([...selectedBooks, book]);
    setSearchTerm("");
    setSearchResults([]);
  };

  const handleRemoveBook = (copyId: number) => {
    setSelectedBooks(selectedBooks.filter((book) => book.copy_id !== copyId));
  };

  const onSubmit = async (values: any) => {
    if (selectedBooks.length === 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn ít nhất một cuốn sách để mượn.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Format dates
      const transactionDate = format(values.transaction_date, "yyyy-MM-dd");
      const dueDate = format(values.due_date, "yyyy-MM-dd");

      // First, create the loan transaction
      const { data: transactionData, error: transactionError } =
        await supabaseClient()
          .from("loantransaction")
          .insert({
            card_id: parseInt(values.card_id),
            staff_id: parseInt(values.staff_id),
            transaction_date: transactionDate,
            due_date: dueDate,
            loan_status: "active",
            borrow_type: values.borrow_type,
          })
          .select("loan_transaction_id")
          .single();

      if (transactionError) throw transactionError;

      // Then, create loan details for each book
      const loanDetailsPromises = selectedBooks.map((book) =>
        supabaseClient().from("loandetail").insert({
          copy_id: book.copy_id,
          loan_transaction_id: transactionData.loan_transaction_id,
          renewal_count: 0,
          return_date: null,
        }),
      );

      await Promise.all(loanDetailsPromises);

      toast({
        title: "Thành công",
        description: "Đã tạo giao dịch mượn sách mới.",
      });

      // Reset form and selected books
      form.reset();
      setSelectedBooks([]);

      // Close the dialog
      onOpenChange(false);

      // Refresh the page to show the new loan
      router.refresh();
    } catch (error: any) {
      console.error("Error creating loan transaction:", error);
      toast({
        title: "Lỗi",
        description:
          error.message ||
          "Không thể tạo giao dịch mượn sách. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo giao dịch mượn sách mới</DialogTitle>
          <DialogDescription>
            Điền đầy đủ thông tin để tạo giao dịch mượn sách mới
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {/* Library Card Selection */}
              <FormField
                control={form.control}
                name="card_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thẻ thư viện</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn thẻ thư viện" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cards.map((card) => (
                          <SelectItem
                            key={card.card_id}
                            value={card.card_id.toString()}
                          >
                            {card.card_number} - {card.reader.first_name}{" "}
                            {card.reader.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Staff Selection */}
              <FormField
                control={form.control}
                name="staff_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nhân viên</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn nhân viên" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {staffMembers.map((staff) => (
                          <SelectItem
                            key={staff.staff_id}
                            value={staff.staff_id.toString()}
                          >
                            {staff.first_name} {staff.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Transaction Date */}
              <FormField
                control={form.control}
                name="transaction_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Ngày mượn</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="pl-3 text-left font-normal"
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy")
                            ) : (
                              <span>Chọn ngày</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Due Date */}
              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Ngày hẹn trả</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="pl-3 text-left font-normal"
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy")
                            ) : (
                              <span>Chọn ngày</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Borrow Type */}
              <FormField
                control={form.control}
                name="borrow_type"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Loại mượn</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn loại mượn" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="standard">Tiêu chuẩn</SelectItem>
                        <SelectItem value="short_term">Ngắn hạn</SelectItem>
                        <SelectItem value="extended">Kéo dài</SelectItem>
                        <SelectItem value="in_library">Đọc tại chỗ</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Book Selection */}
            <div className="space-y-4">
              <div>
                <FormLabel>Tìm sách</FormLabel>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Nhập tên sách để tìm kiếm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="max-h-32 overflow-y-auto rounded-md border p-2">
                  {searchResults.map((book) => (
                    <div
                      key={book.copy_id}
                      className="flex cursor-pointer items-center justify-between px-2 py-1 hover:bg-muted"
                      onClick={() => handleAddBook(book)}
                    >
                      <span>
                        {book.booktitle.title} ({book.condition.condition_name})
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddBook(book);
                        }}
                      >
                        Thêm
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Selected Books */}
              <div>
                <h3 className="mb-2 text-sm font-medium">Sách đã chọn</h3>
                {selectedBooks.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Chưa có sách nào được chọn
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedBooks.map((book) => (
                      <div
                        key={book.copy_id}
                        className="flex items-center justify-between rounded-md border p-2"
                      >
                        <div>
                          <p className="font-medium">{book.booktitle.title}</p>
                          <Badge variant="outline">
                            {book.condition.condition_name}
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveBook(book.copy_id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Đang xử lý..." : "Xác nhận"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddLoanDialog;
