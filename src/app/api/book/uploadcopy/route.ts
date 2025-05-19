import { supabaseAdmin } from "@/lib/admin";
import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Không có file được tải lên" },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    const errors: { row: number; message: string }[] = [];
    const insertedCopies: any[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      const book_title_id = row["book_title_id"];
      const acquisition_date = row["acquisition_date"];
      const price = row["price"];
      const condition_id = row["condition_id"];

      if (!book_title_id || !acquisition_date || !price || !condition_id) {
        errors.push({ row: i + 2, message: "Thiếu trường bắt buộc" });
        continue;
      }

      const { data, error } = await supabaseAdmin
        .from("bookcopy")
        .insert([
          {
            book_title_id,
            acquisition_date,
            price,
            condition_id,
            availability_status: "Có sẵn",
          },
        ])
        .select()
        .single();

      if (error) {
        errors.push({ row: i + 2, message: error.message });
        continue;
      }

      insertedCopies.push(data);
    }

    return NextResponse.json({
      success: true,
      message: `${insertedCopies.length} bản sao đã được thêm.`,
      errors,
    });
  } catch (error) {
    console.error("Lỗi hệ thống:", error);
    return NextResponse.json(
      { error: "Lỗi khi xử lý file Excel" },
      { status: 500 },
    );
  }
}
