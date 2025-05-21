"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { supabaseClient } from "@/lib/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/AuthProvider";

interface LibraryCard {
  card_id: number;
  card_number: string;
  card_status: string;
  current_deposit_balance: number;
  reader: {
    first_name: string;
    last_name: string;
  };
}

interface BookCopy {
  copy_id: number;
  book_title_id: number;
  price: number;
  availability_status: string;
  booktitle: {
    title: string;
  };
  condition: {
    condition_name: string;
  };
}

interface AddLoanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoanCreated: () => void;
}

// Tối ưu hàm chuẩn hóa chuỗi tiếng Việt
const normalizeString = (str: string): string => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Loại bỏ dấu
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " "); // Chuẩn hóa khoảng trắng
};

const AddLoanDialog: React.FC<AddLoanDialogProps> = ({
  open,
  onOpenChange,
  onLoanCreated,
}) => {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState<LibraryCard[]>([]);
  const [availableBooks, setAvailableBooks] = useState<BookCopy[]>([]);
  const [selectedBooks, setSelectedBooks] = useState<BookCopy[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<BookCopy[]>([]);
  const [borrowType, setBorrowType] = useState("Mượn về");

  const supabase = supabaseClient();

  const form = useForm({
    defaultValues: {
      card_id: "",
      borrow_type: "Mượn về",
    },
  });

  // Watch cho sự thay đổi của borrowType từ form
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "borrow_type") {
        setBorrowType(value.borrow_type || "Mượn về");
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch thẻ thư viện đang hoạt động (unchanged)
        const { data: cardData, error: cardError } = await supabase
          .from("librarycard")
          .select(
            `
          card_id,
          card_number,
          card_status,
          current_deposit_balance,
          reader:reader_id (
            first_name,
            last_name
          )
        `,
          )
          .eq("card_status", "Hoạt động")
          .eq("card_type", "Thẻ mượn")
          .order("card_id", { ascending: true });

        if (cardError) {
          console.error("Card fetch error:", cardError);
          throw cardError;
        }

        const processedCards = cardData
          ? cardData.map((card) => ({
              ...card,
              reader: Array.isArray(card.reader)
                ? card.reader[0] || { first_name: "", last_name: "" }
                : card.reader || { first_name: "", last_name: "" },
            }))
          : [];

        setCards(processedCards);

        // UPDATED: Fetch sách có sẵn
        const { data: bookData, error: bookError } = await supabase
          .from("bookcopy")
          .select(
            `
          copy_id,
          book_title_id,
          price,
          availability_status,
          condition_id,
          booktitle:book_title_id (
            title
          ),
          condition:condition_id (
            condition_name
          )
        `,
          )
          .eq("availability_status", "Có sẵn"); // Chỉ lấy sách có sẵn - removed the broken filter

        if (bookError) {
          console.error("Book fetch error:", bookError);
          throw bookError;
        }

        // UPDATED: Process and filter damaged books at the client side
        const availableBookCopies = bookData
          ? bookData
              .map((book) => ({
                ...book,
                booktitle: Array.isArray(book.booktitle)
                  ? book.booktitle[0] || { title: "Không có tiêu đề" }
                  : book.booktitle || { title: "Không có tiêu đề" },
                condition: Array.isArray(book.condition)
                  ? book.condition[0] || { condition_name: "Không xác định" }
                  : book.condition || { condition_name: "Không xác định" },
              }))
              .filter((book) => book.condition.condition_name !== "Bị hư hại") // Filter out damaged books
          : [];

        setAvailableBooks(availableBookCopies);
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

  // Tối ưu tìm kiếm Tiếng Việt
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSearchResults([]);
      return;
    }

    const normalizedSearchTerm = normalizeString(searchTerm);
    const filteredBooks = availableBooks.filter((book) => {
      const normalizedTitle = normalizeString(book.booktitle.title);

      // Kiểm tra đã chọn chưa
      const isAlreadySelected = selectedBooks.some(
        (selected) => selected.copy_id === book.copy_id,
      );

      // Tìm kiếm chuỗi con và không hiển thị sách đã chọn
      return (
        normalizedTitle.includes(normalizedSearchTerm) && !isAlreadySelected
      );
    });

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
    if (!user?.staff_id) {
      toast({
        title: "Lỗi",
        description: "Không tìm thấy thông tin nhân viên.",
        variant: "destructive",
      });
      return;
    }

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
      const bookCopyIds = selectedBooks.map((book) => book.copy_id);

      // Gọi API tạo giao dịch mượn
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/loan-transactions/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cardId: parseInt(values.card_id),
            staffId: user.staff_id,
            bookCopies: bookCopyIds,
            borrowType: values.borrow_type,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Lỗi không xác định khi tạo giao dịch mượn.",
        );
      }

      toast({
        title: "Thành công",
        description: "Đã tạo giao dịch mượn sách mới.",
      });

      if (onLoanCreated) {
        onLoanCreated();
      }

      form.reset();
      setSelectedBooks([]);
      setBorrowType("Mượn về");

      onOpenChange(false);

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
                  <FormItem className="col-span-2">
                    <FormLabel>Thẻ thư viện</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger className="cursor-pointer hover:ring-2 hover:ring-primary/20 focus:ring-2">
                          <SelectValue placeholder="Chọn thẻ thư viện" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cards.map((card) => (
                          <SelectItem
                            key={card.card_id}
                            value={card.card_id.toString()}
                            className="cursor-pointer transition-colors hover:bg-primary/10 data-[highlighted]:bg-primary/20 data-[selected]:bg-primary/20 data-[selected]:font-medium data-[selected]:text-primary"
                          >
                            {card.card_number} - {card.reader.first_name}{" "}
                            {card.reader.last_name} - Số dư:{" "}
                            {card.current_deposit_balance.toLocaleString()}đ
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                        <SelectTrigger className="cursor-pointer hover:ring-2 hover:ring-primary/20 focus:ring-2">
                          <SelectValue placeholder="Chọn loại mượn" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem
                          value="Mượn về"
                          className="cursor-pointer transition-colors hover:bg-primary/10 data-[highlighted]:bg-primary/20 data-[selected]:bg-primary/20 data-[selected]:font-medium data-[selected]:text-primary"
                        >
                          Mượn về
                        </SelectItem>
                        <SelectItem
                          value="Đọc tại chỗ"
                          className="cursor-pointer transition-colors hover:bg-primary/10 data-[highlighted]:bg-primary/20 data-[selected]:bg-primary/20 data-[selected]:font-medium data-[selected]:text-primary"
                        >
                          Đọc tại chỗ
                        </SelectItem>
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
                        <span className="font-medium">
                          {book.booktitle.title}
                        </span>{" "}
                        -
                        <span className="text-sm text-muted-foreground">
                          {" "}
                          Mã bản sao: {book.copy_id}
                        </span>{" "}
                        -
                        <span className="text-sm">
                          {" "}
                          {book.condition.condition_name}
                        </span>{" "}
                        {borrowType !== "Đọc tại chỗ" && (
                          <span className="text-sm font-semibold">
                            {" "}
                            Giá: {book.price.toLocaleString()}đ
                          </span>
                        )}
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
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline">
                              Mã bản sao: {book.copy_id}
                            </Badge>
                            <Badge variant="outline">
                              {book.condition.condition_name}
                            </Badge>
                            {borrowType !== "Đọc tại chỗ" && (
                              <Badge variant="outline">
                                Giá: {book.price.toLocaleString()}đ
                              </Badge>
                            )}
                          </div>
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

                    {/* Hiển thị tổng tiền đặt cọc chỉ khi là Mượn về */}
                    {borrowType !== "Đọc tại chỗ" && (
                      <div className="mt-2 text-right">
                        <p className="text-sm font-medium">
                          Tổng tiền đặt cọc:{" "}
                          {selectedBooks
                            .reduce((sum, book) => sum + book.price, 0)
                            .toLocaleString()}
                          đ
                        </p>
                      </div>
                    )}

                    {/* Hiển thị thông báo khi là Đọc tại chỗ */}
                    {borrowType === "Đọc tại chỗ" && (
                      <div className="mt-2 rounded-md border border-border bg-muted p-3 text-muted-foreground">
                        <p className="text-sm">
                          Đọc tại chỗ: Không cần đặt cọc và sách phải được trả
                          trong ngày.
                        </p>
                      </div>
                    )}
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
