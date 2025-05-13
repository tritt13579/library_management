import { createClient } from "@/auth/server";
import { supabaseAdmin } from "@/lib/admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const {
    readerId,
    first_name,
    last_name,
    date_of_birth,
    gender,
    address,
    phone,
    email,
    deposit_package_id,
    card_type,
    photo_url,
  } = body;

  console.log("Dữ liệu nhận được từ client:", body);

  if (
    !email ||
    !first_name ||
    !last_name ||
    !date_of_birth ||
    !gender ||
    !deposit_package_id ||
    !card_type
  ) {
    return NextResponse.json(
      { error: "Thiếu thông tin bắt buộc" },
      { status: 400 },
    );
  }

  if (readerId) {
    const { error: updateReaderError } = await supabaseAdmin
      .from("reader")
      .update({
        first_name,
        last_name,
        date_of_birth,
        gender,
        address,
        phone,
        email,
        photo_url, 
      })
      .eq("reader_id", readerId);

    if (updateReaderError) {
      console.error("Lỗi cập nhật thông tin độc giả:", updateReaderError);
      return NextResponse.json(
        { error: "Cập nhật thông tin độc giả thất bại" },
        { status: 500 },
      );
    }

    // Cập nhật thông tin thẻ thư viện
    const { error: updateCardError } = await supabaseAdmin
      .from("librarycard")
      .update({
        deposit_package_id,
        card_type,
      })
      .eq("reader_id", readerId);

    if (updateCardError) {
      console.error("Lỗi cập nhật thông tin thẻ thư viện:", updateCardError);
      return NextResponse.json(
        { error: "Cập nhật thông tin thẻ thư viện thất bại" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  }

  const { auth } = await createClient();

  const { data: createdUser, error: authError } = await auth.signUp({
    email,
    password: "123456",
    options: {
      data: {
        role: "reader",
        full_name: `${first_name} ${last_name}`,
      },
    },
  });

  if (authError || !createdUser?.user?.id) {
    console.error("Lỗi tạo tài khoản người dùng:", authError);
    return NextResponse.json(
      { error: "Tạo tài khoản người dùng thất bại" },
      { status: 500 },
    );
  }

  const { data: readerData, error: insertReaderError } = await supabaseAdmin
    .from("reader")
    .insert([
      {
        first_name,
        last_name,
        date_of_birth,
        gender,
        address,
        phone,
        email,
        photo_url: photo_url,
        auth_user_id: createdUser.user.id,
      },
    ])
    .select("reader_id");

  if (insertReaderError || !readerData || readerData.length === 0) {
    console.error("Lỗi thêm thông tin độc giả:", insertReaderError);
    return NextResponse.json(
      { error: "Thêm thông tin độc giả thất bại" },
      { status: 500 },
    );
  }

  const reader_id = readerData[0].reader_id;

  const { data: settingData, error: settingError } = await supabaseAdmin
    .from("systemsetting")
    .select("setting_value")
    .eq("setting_name", "Thời hạn thẻ")
    .single();

  if (settingError || !settingData) {
    console.error("Lỗi lấy thời hạn thẻ:", settingError);
    return NextResponse.json(
      { error: "Không lấy được thời hạn thẻ" },
      { status: 500 },
    );
  }

  const expiryMonths = parseInt(settingData.setting_value);
  const issueDate = new Date();
  const expiryDate = new Date(issueDate);
  expiryDate.setMonth(issueDate.getMonth() + expiryMonths);

  let currentDepositBalance = 0;

  if (card_type === "Thẻ mượn") {
    const { data: packageData, error: packageError } = await supabaseAdmin
      .from("depositpackage")
      .select("package_amount")
      .eq("deposit_package_id", deposit_package_id)
      .single();

    if (packageError || !packageData) {
      console.error("Lỗi lấy thông tin gói đặt cọc:", packageError);
      return NextResponse.json(
        { error: "Không lấy được thông tin gói đặt cọc" },
        { status: 500 },
      );
    }

    currentDepositBalance = parseFloat(packageData.package_amount);
  }

  const card_number = `LIB${reader_id.toString().padStart(3, "0")}`;

  const { error: cardError } = await supabaseAdmin.from("librarycard").insert([
    {
      reader_id,
      deposit_package_id,
      payment_id: null,
      card_number,
      issue_date: issueDate.toISOString().split("T")[0],
      expiry_date: expiryDate.toISOString().split("T")[0],
      current_deposit_balance: currentDepositBalance,
      card_status: "Hoạt động",
      card_type,
    },
  ]);

  if (cardError) {
    console.error("Lỗi tạo thẻ thư viện:", cardError);
    return NextResponse.json(
      { error: "Tạo thẻ thư viện thất bại" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}