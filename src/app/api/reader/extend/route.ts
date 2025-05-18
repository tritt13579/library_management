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
    .in("card_status", ["Hoạt động", "Chưa gia hạn"])
    .single();

  if (cardFetchError || !cardData) {
    console.error(cardFetchError);
    return NextResponse.json({ error: "Không thể gia hạn" }, { status: 404 });
  }

  const currentExpiryDate = new Date(cardData.expiry_date);

  // Lấy thời hạn thẻ
  const { data: durationSetting, error: durationError } = await supabaseAdmin
    .from("systemsetting")
    .select("setting_value")
    .eq("setting_name", "Thời hạn thẻ")
    .single();

  if (durationError || !durationSetting) {
    console.error(durationError);
    return NextResponse.json({ error: "Không lấy được thời hạn thẻ" }, { status: 500 });
  }

  const extendMonths = parseInt(durationSetting.setting_value);
  const newExpiryDate = new Date(currentExpiryDate);
  newExpiryDate.setMonth(newExpiryDate.getMonth() + extendMonths);

  // Lấy số tháng để xác định "Đã hủy"
  const { data: cancelSetting, error: cancelError } = await supabaseAdmin
    .from("systemsetting")
    .select("setting_value")
    .eq("setting_name", "Hủy thẻ thư viện")
    .single();

  if (cancelError || !cancelSetting) {
    console.error(cancelError);
    return NextResponse.json({ error: "Không lấy được thời gian hủy thẻ" }, { status: 500 });
  }

  const cancelMonths = parseInt(cancelSetting.setting_value);

  // Xác định trạng thái mới dựa vào newExpiryDate và thời gian hiện tại
  const now = new Date();
  let newStatus = "Chưa gia hạn";

  if (newExpiryDate > now) {
    newStatus = "Hoạt động";
  } else {
    const cancelThreshold = new Date(newExpiryDate);
    cancelThreshold.setMonth(cancelThreshold.getMonth() + cancelMonths);
    if (now > cancelThreshold) {
      newStatus = "Đã hủy";
    }
  }

  // Cập nhật thẻ thư viện
  const { error: updateError } = await supabaseAdmin
    .from("librarycard")
    .update({
      expiry_date: newExpiryDate.toISOString().split("T")[0],
      card_status: newStatus,
    })
    .eq("reader_id", readerId)
    .in("card_status", ["Hoạt động", "Chưa gia hạn"]);

  if (updateError) {
    console.error(updateError);
    return NextResponse.json({ error: "Gia hạn thẻ thất bại" }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    new_expiry_date: newExpiryDate.toISOString().split("T")[0],
    new_status: newStatus,
  });
}
