"use client";
import React, { useState, useEffect } from "react";
import { supabaseClient } from "@/lib/client";
import { XCircleIcon, PlusCircleIcon } from "@heroicons/react/24/solid";
import { useToast } from "@/hooks/use-toast";

const BookFormModal = ({
  isOpen,
  isEdit,
  book,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  isEdit: boolean;
  book?: any;
  onClose: () => void;
  onSuccess?: () => void;
}) => {
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [formValues, setFormValues] = useState({
    title: "",
    authors: [] as { id: string; name: string }[],
    publication_year: "",
    isbn: "",
    language: "",
    edition: "",
    category_id: "",
    publisher_id: "",
    shelf_id: "",
    description: "",
    cover_image: "",
  });

  const [shelves, setShelves] = useState<
    { shelf_id: string; location: string }[]
  >([]);
  const [publishers, setPublishers] = useState<
    { publisher_id: string; publisher_name: string }[]
  >([]);
  const [categoryOptions, setCategoryOptions] = useState<
    { category_id: string; category_name: string }[]
  >([]);
  const [authorOptions, setAuthorOptions] = useState<
    { author_id: string; author_name: string }[]
  >([]);

  const [authorSearch, setAuthorSearch] = useState("");
  const [showAuthorDropdown, setShowAuthorDropdown] = useState(false);

  useEffect(() => {
    const fetchDropdownData = async () => {
      const supabase = supabaseClient();

      const { data: shelfData, error: shelfError } = await supabase
        .from("shelf")
        .select("shelf_id, location");

      if (shelfError) console.error("Error fetching shelves:", shelfError);
      else setShelves(shelfData || []);

      const { data: publisherData, error: publisherError } = await supabase
        .from("publisher")
        .select("publisher_id, publisher_name");

      if (publisherError)
        console.error("Error fetching publishers:", publisherError);
      else setPublishers(publisherData || []);

      const { data: categoryData, error: categoryError } = await supabase
        .from("category")
        .select("category_id, category_name");

      if (categoryError)
        console.error("Error fetching categories:", categoryError);
      else setCategoryOptions(categoryData || []);

      const { data: authorData, error: authorError } = await supabase
        .from("author")
        .select("author_id, author_name");

      if (authorError) console.error("Error fetching authors:", authorError);
      else setAuthorOptions(authorData || []);
    };

    if (isOpen) {
      fetchDropdownData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isEdit && book) {
      const authors =
        book.iswrittenby?.map((relation: any) => ({
          id: relation.author.author_id,
          name: relation.author.author_name,
        })) || [];

      setFormValues({
        title: book.title || "",
        authors: authors,
        publication_year: book.publication_year?.toString() || "",
        isbn: book.isbn || "",
        language: book.language || "",
        edition: book.edition || "",
        category_id: book.category_id || "",
        publisher_id: book.publisher_id || "",
        shelf_id: book.shelf_id || "",
        description: book.description || "",
        cover_image: book.cover_image || "",
      });
    } else {
      setFormValues({
        title: "",
        authors: [],
        publication_year: "",
        isbn: "",
        language: "",
        edition: "",
        category_id: "",
        publisher_id: "",
        shelf_id: "",
        description: "",
        cover_image: "",
      });
      setSelectedImage(null);
    }
  }, [isEdit, book, isOpen]);

  const filteredAuthors = authorOptions.filter((author) =>
    author.author_name.toLowerCase().includes(authorSearch.toLowerCase()),
  );

  const addAuthor = (author: { author_id: string; author_name: string }) => {
    const newAuthor = { id: author.author_id, name: author.author_name };
    if (!formValues.authors.some((a) => a.id === author.author_id)) {
      setFormValues({
        ...formValues,
        authors: [...formValues.authors, newAuthor],
      });
    }
    setAuthorSearch("");
    setShowAuthorDropdown(false);
  };

  const removeAuthor = (authorId: string) => {
    setFormValues({
      ...formValues,
      authors: formValues.authors.filter((a) => a.id !== authorId),
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      if (
        !formValues.title ||
        !formValues.isbn ||
        !formValues.publication_year ||
        !formValues.language ||
        !formValues.category_id ||
        !formValues.publisher_id ||
        !formValues.shelf_id
      ) {
        toast({
          title: "Vui lòng điền đầy đủ thông tin",
          description: "Vui lòng kiểm tra lại các trường bắt buộc.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const formData = new FormData();

      if (selectedImage) {
        formData.append("coverImageFile", selectedImage);
      }

      const bookData = {
        ...formValues,
        book_title_id: isEdit ? book.book_title_id : undefined,
        publication_year: parseInt(formValues.publication_year),
      };

      formData.append("bookData", JSON.stringify(bookData));

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/book/save`,
        {
          method: "POST",
          body: formData,
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Không thể lưu sách");
      }

      toast({
        title: isEdit ? "Cập nhật sách thành công" : "Thêm sách mới thành công",
        description: "Sách đã được lưu thành công.",
        variant: "success",
      });

      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 300);
      }

      onClose();
    } catch (error) {
      console.error("Error saving book:", error);
      toast({
        title: "Có lỗi xảy ra",
        description:
          error instanceof Error ? error.message : "Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-50">
      <div className="max-h-[90vh] w-5/6 max-w-2xl space-y-4 overflow-y-auto rounded-lg bg-background p-8">
        <h2 className="mb-4 text-2xl font-semibold text-primary">
          {isEdit ? "Chỉnh sửa sách" : "Thêm sách mới"}
        </h2>
        <div className="grid grid-cols-1 gap-4">
          <input
            type="text"
            placeholder="Tên sách"
            value={formValues.title}
            onChange={(e) =>
              setFormValues({ ...formValues, title: e.target.value })
            }
            className="rounded-md border border-gray-300 bg-input px-4 py-2"
          />

          <div className="space-y-2">
            <label className="block font-medium text-foreground">Tác giả</label>

            <div className="mb-2 flex flex-wrap gap-2">
              {formValues.authors.map((author) => (
                <div
                  key={author.id}
                  className="flex items-center rounded-md bg-muted px-2 py-1"
                >
                  <span>{author.name}</span>
                  <button
                    onClick={() => removeAuthor(author.id)}
                    className="ml-1 text-red-500 hover:opacity-80"
                    type="button"
                  >
                    <XCircleIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Tìm tác giả..."
                value={authorSearch}
                onChange={(e) => {
                  setAuthorSearch(e.target.value);
                  setShowAuthorDropdown(true);
                }}
                onFocus={() => setShowAuthorDropdown(true)}
                onBlur={() => {
                  setTimeout(() => setShowAuthorDropdown(false), 200);
                }}
                className="w-full rounded-md border border-gray-300 bg-input px-4 py-2"
              />

              {showAuthorDropdown && authorSearch && (
                <div className="absolute z-10 mt-1 max-h-40 w-full overflow-auto rounded-md border border-border bg-popover shadow-lg">
                  {filteredAuthors.length > 0 ? (
                    filteredAuthors.map((author) => (
                      <div
                        key={author.author_id}
                        className="cursor-pointer px-4 py-2 hover:bg-muted"
                        onClick={() => addAuthor(author)}
                      >
                        {author.author_name}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-muted-foreground">
                      Không tìm thấy tác giả
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="block font-medium text-gray-700">
              Nhà xuất bản
            </label>
            <select
              value={formValues.publisher_id}
              onChange={(e) =>
                setFormValues({ ...formValues, publisher_id: e.target.value })
              }
              className="w-full rounded-md border border-gray-300 bg-input px-4 py-2"
            >
              <option value="">Chọn nhà xuất bản</option>
              {publishers.map((publisher) => (
                <option
                  key={publisher.publisher_id}
                  value={publisher.publisher_id}
                >
                  {publisher.publisher_name}
                </option>
              ))}
            </select>
          </div>

          <input
            type="number"
            placeholder="Năm xuất bản"
            value={formValues.publication_year}
            onChange={(e) =>
              setFormValues({ ...formValues, publication_year: e.target.value })
            }
            className="rounded-md border border-gray-300 bg-input px-4 py-2"
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="ISBN"
              value={formValues.isbn}
              onChange={(e) =>
                setFormValues({ ...formValues, isbn: e.target.value })
              }
              className="rounded-md border border-gray-300 bg-input px-4 py-2"
              disabled={isEdit}
            />

            <div className="space-y-1">
              <select
                value={formValues.shelf_id}
                onChange={(e) =>
                  setFormValues({ ...formValues, shelf_id: e.target.value })
                }
                className="w-full rounded-md border border-gray-300 bg-input px-4 py-2"
              >
                <option value="">Chọn kệ sách</option>
                {shelves.map((shelf) => (
                  <option key={shelf.shelf_id} value={shelf.shelf_id}>
                    {shelf.location}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Ngôn ngữ"
              value={formValues.language}
              onChange={(e) =>
                setFormValues({ ...formValues, language: e.target.value })
              }
              className="rounded-md border border-gray-300 bg-input px-4 py-2"
            />
            <input
              type="text"
              placeholder="Lần sửa đổi"
              value={formValues.edition}
              onChange={(e) =>
                setFormValues({ ...formValues, edition: e.target.value })
              }
              className="rounded-md border border-gray-300 bg-input px-4 py-2"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-medium text-gray-700">Thể loại</label>
            <select
              value={formValues.category_id}
              onChange={(e) =>
                setFormValues({ ...formValues, category_id: e.target.value })
              }
              className="w-full rounded-md border border-gray-300 bg-input px-4 py-2"
            >
              <option value="">Chọn thể loại</option>
              {categoryOptions.map((category) => (
                <option key={category.category_id} value={category.category_id}>
                  {category.category_name}
                </option>
              ))}
            </select>
          </div>

          <textarea
            placeholder="Mô tả sách"
            value={formValues.description}
            onChange={(e) =>
              setFormValues({ ...formValues, description: e.target.value })
            }
            rows={4}
            className="rounded-md border border-gray-300 bg-input px-4 py-2"
          />

          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Ảnh bìa sách
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setSelectedImage(file);
              }}
              className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-[#0071BC] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#005f9e]"
            />
            {selectedImage && (
              <div className="mt-2">
                <img
                  src={URL.createObjectURL(selectedImage)}
                  alt="Xem trước ảnh"
                  className="max-h-48 rounded-md border"
                />
              </div>
            )}
            {!selectedImage && formValues.cover_image && (
              <div className="mt-2">
                <img
                  src={formValues.cover_image}
                  alt="Ảnh hiện tại"
                  className="max-h-48 rounded-md border"
                />
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="rounded-md bg-accent-foreground px-4 py-2 text-muted-foreground"
            disabled={loading}
            type="button"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-[#005f9e] disabled:opacity-70"
            disabled={loading}
            type="button"
          >
            {loading ? "Đang lưu..." : "Lưu sách"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookFormModal;
