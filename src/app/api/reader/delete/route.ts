import { supabaseAdmin } from "@/lib/admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { reader_id } = body;

  if (!reader_id) {
    return NextResponse.json(
      { error: "Thiếu reader_id" },
      { status: 400 }
    );
  }

  try {
    // 1. Xóa thẻ thư viện của độc giả (nếu có)
    const { error: cardDeleteError } = await supabaseAdmin
      .from("librarycard")
      .delete()
      .eq("reader_id", reader_id);

    if (cardDeleteError) {
      console.error("Lỗi xóa thẻ thư viện:", cardDeleteError);
      return NextResponse.json(
        { error: "Không thể xóa thẻ thư viện" },
        { status: 500 }
      );
    }

    // 2. Xóa độc giả
    const { error: readerDeleteError } = await supabaseAdmin
      .from("reader")
      .delete()
      .eq("reader_id", reader_id);

    if (readerDeleteError) {
      console.error("Lỗi xóa reader:", readerDeleteError);
      return NextResponse.json(
        { error: "Không thể xóa độc giả" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Lỗi server:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi không xác định" },
      { status: 500 }
    );
  }
}
