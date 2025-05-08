import { createClient } from "@/auth/server";
import { supabaseAdmin } from "@/lib/admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    book_title_id,
    category_id,
    publisher_id,
    shelf_id, 
    title,
    publication_year,
    isbn,
    language,
    description,
    edition,
    cover_image, 
  } = body;

  if (
    !title || !category_id || !publisher_id || !shelf_id || !publication_year ||
    !isbn || !language || !edition || !description
  ) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  let finalBooktitleId = book_title_id;

  if (book_title_id) {
    const { error: updateError } = await supabaseAdmin
      .from("booktitle")
      .update({
        title,
        category_id,
        publisher_id,
        shelf_id,
        publication_year,
        isbn,
        language,
        edition,
        description,
        cover_image
      })
      .eq("book_title_id", book_title_id);

    if (updateError) {
      console.error(updateError);
      return NextResponse.json({ error: "Cập nhật booktitle thất bại" }, { status: 500 });
    }
  } else {
    const { data: existingBook, error: findError } = await supabaseAdmin
      .from("booktitle")
      .select("book_title_id")
      .eq("title", title)
      .eq("publisher_id", publisher_id)
      .single();

    if (findError && findError.code !== "PGRST116") {
      console.error(findError);
      return NextResponse.json({ error: "Lỗi khi tìm booktitle" }, { status: 500 });
    }

    if (existingBook?.book_title_id) {
      finalBooktitleId = existingBook.book_title_id;
    } else {
      const { data: newBooktitle, error: insertError } = await supabaseAdmin
        .from("booktitle")
        .insert([{
          title,
          category_id,
          publisher_id,
          shelf_id,
          publication_year,
          isbn,
          language,
          edition,
          description,
          cover_image
        }])
        .select()
        .single();

      if (insertError || !newBooktitle) {
        console.error(insertError);
        return NextResponse.json({ error: "Không thể tạo booktitle mới" }, { status: 500 });
      }

      finalBooktitleId = newBooktitle.book_title_id;
    }
  }

  return NextResponse.json({ success: true, book_title_id: finalBooktitleId });
}
