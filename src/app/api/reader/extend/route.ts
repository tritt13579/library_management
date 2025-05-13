import { supabaseAdmin } from "@/lib/admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { readerId } = body;

  if (!readerId) {
    return NextResponse.json({ error: "Thiếu readerId" }, { status: 400 });
  }

  // Lấy thông tin thẻ thư viện hiện tại
  const { data: cardData, error: cardFetchError } = await supabaseAdmin
    .from("librarycard")
    .select("expiry_date")
    .eq("reader_id", readerId)
    .eq("card_status", "Hoạt động")
    .single();

  if (cardFetchError || !cardData) {
    console.error(cardFetchError);
    return NextResponse.json(
      { error: "Không tìm thấy thẻ thư viện hợp lệ" },
      { status: 404 },
    );
  }

  const currentExpiryDate = new Date(cardData.expiry_date);

  // Lấy thời hạn gia hạn từ systemsetting
  const { data: settingData, error: settingError } = await supabaseAdmin
    .from("systemsetting")
    .select("setting_value")
    .eq("setting_name", "Thời hạn thẻ")
    .single();

  if (settingError || !settingData) {
    console.error(settingError);
    return NextResponse.json(
      { error: "Không lấy được thời hạn thẻ" },
      { status: 500 },
    );
  }

  const extendMonths = parseInt(settingData.setting_value);
  const newExpiryDate = new Date(currentExpiryDate);
  newExpiryDate.setMonth(newExpiryDate.getMonth() + extendMonths);

  // Cập nhật ngày hết hạn mới
  const { error: updateError } = await supabaseAdmin
    .from("librarycard")
    .update({ expiry_date: newExpiryDate.toISOString().split("T")[0] })
    .eq("reader_id", readerId)
    .eq("card_status", "Hoạt động");

  if (updateError) {
    console.error(updateError);
    return NextResponse.json(
      { error: "Gia hạn thẻ thất bại" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, new_expiry_date: newExpiryDate.toISOString().split("T")[0] });
}
