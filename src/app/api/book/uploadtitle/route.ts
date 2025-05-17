import { supabaseAdmin } from "@/lib/admin";
import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const excelFile = formData.get("file") as File | null;

    if (!excelFile) {
      return NextResponse.json({ error: "Chưa có file Excel" }, { status: 400 });
    }

    const arrayBuffer = await excelFile.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(worksheet);

    let successCount = 0;
    const failedRows: { rowIndex: number; reason: string }[] = [];

    for (const [i, row] of rows.entries()) {
      try {
        const {
          title,
          category_id,
          publisher_id,
          shelf_id,
          publication_year,
          isbn,
          language,
          edition,
          description,
          authors,
          cover_image,
        } = row as any;

        // Kiểm tra các trường bắt buộc
        if (!title || !category_id || !publisher_id || !shelf_id || !publication_year || !isbn || !language) {
          failedRows.push({ rowIndex: i + 2, reason: "Thiếu trường bắt buộc" });
          continue;
        }

        // Kiểm tra ISBN trùng
        const { data: existing, error: findError } = await supabaseAdmin
          .from("booktitle")
          .select("book_title_id")
          .eq("isbn", isbn)
          .single();

        if (existing?.book_title_id) {
          failedRows.push({ rowIndex: i + 2, reason: "Sách với ISBN này đã tồn tại" });
          continue;
        }

        // Thêm booktitle
        const { data: insertedBook, error: insertError } = await supabaseAdmin
          .from("booktitle")
          .insert([
            {
              title,
              category_id,
              publisher_id,
              shelf_id,
              publication_year,
              isbn,
              language,
              edition,
              description,
              cover_image: cover_image || null,
            },
          ])
          .select()
          .single();

        if (insertError || !insertedBook) {
          failedRows.push({ rowIndex: i + 2, reason: "Không thể thêm booktitle" });
          continue;
        }

        const book_title_id = insertedBook.book_title_id;

        if (authors) {
          const authorIds = typeof authors === "string"
            ? authors.split(",").map((id: string) => id.trim()).filter(Boolean)
            : [];

          if (authorIds.length > 0) {
            const relations = authorIds.map((author_id: string) => ({
              book_title_id,
              author_id,
            }));


            const { error: authorsError } = await supabaseAdmin
              .from("iswrittenby")
              .insert(relations);

            if (authorsError) {
                console.log(`Không thể thêm tác giả `);
            }
          }
        }

        successCount++;
      } catch (err) {
        console.error(`Lỗi ở dòng ${i + 2}:`, err);
        failedRows.push({ rowIndex: i + 2, reason: "Lỗi không xác định" });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Đã thêm ${successCount} sách`,
      errors: failedRows,
    });
  } catch (error) {
    console.error("Lỗi khi xử lý file Excel:", error);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
