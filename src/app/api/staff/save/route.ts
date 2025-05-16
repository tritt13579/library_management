import { createClient } from "@/auth/server";
import { supabaseAdmin } from "@/lib/admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    staffId,
    role_id,
    first_name,
    last_name,
    date_of_birth,
    gender,
    address,
    phone,
    email,
    hire_date,
  } = body;

  if (
    !email ||
    !role_id ||
    !first_name ||
    !last_name ||
    !date_of_birth ||
    !gender ||
    !hire_date
  ) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  if (!staffId) {
    // Tạo người dùng mới
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("role")
      .select("role_name")
      .eq("role_id", role_id)
      .single();

    if (roleError || !roleData) {
      console.error(roleError);
      return NextResponse.json(
        { error: "Không tìm thấy role_name tương ứng với role_id" },
        { status: 400 },
      );
    }

    const roleName = roleData.role_name;
    const { auth } = await createClient();

    const { data: createdUser, error: createError } = await auth.signUp({
      email,
      password: "123456",
      options: {
        data: {
          role: roleName,
          full_name: `${first_name} ${last_name}`,
        },
      },
    });

    if (createError || !createdUser?.user?.id) {
      console.error(createError);
      return NextResponse.json(
        { error: "User creation failed" },
        { status: 500 },
      );
    }

    // Thêm người dùng vào bảng staff và lấy staff_id
    const { data: staffData, error: insertError } = await supabaseAdmin
      .from("staff")
      .insert([
        {
          role_id,
          first_name,
          last_name,
          date_of_birth,
          gender,
          address,
          phone,
          email,
          hire_date,
          auth_user_id: createdUser.user.id,
        },
      ])
      .select("staff_id")
      .single();

    if (insertError) {
      console.error(insertError);
      return NextResponse.json({ error: "Insert failed" }, { status: 500 });
    }

    // Cập nhật user_metadata với staff_id
    const { error: updateMetadataError } =
      await supabaseAdmin.auth.admin.updateUserById(createdUser.user.id, {
        user_metadata: {
          role: roleName,
          full_name: `${first_name} ${last_name}`,
          staff_id: staffData.staff_id,
        },
      });

    if (updateMetadataError) {
      console.error(updateMetadataError);
      return NextResponse.json(
        { error: "Failed to update user metadata" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, staff_id: staffData.staff_id });
  }

  // Cập nhật thông tin staff
  const { error: updateError } = await supabaseAdmin
    .from("staff")
    .update({
      role_id,
      first_name,
      last_name,
      date_of_birth,
      gender,
      address,
      phone,
      email,
      hire_date,
    })
    .eq("staff_id", staffId);

  if (updateError) {
    console.error(updateError);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  // Lấy auth_user_id từ staff_id để cập nhật metadata
  const { data: staffData, error: fetchStaffError } = await supabaseAdmin
    .from("staff")
    .select("auth_user_id, role_id")
    .eq("staff_id", staffId)
    .single();

  if (fetchStaffError || !staffData) {
    console.error(fetchStaffError);
    return NextResponse.json(
      { error: "Failed to fetch staff data" },
      { status: 500 },
    );
  }

  // Lấy role_name từ role_id
  const { data: roleData, error: roleError } = await supabaseAdmin
    .from("role")
    .select("role_name")
    .eq("role_id", role_id)
    .single();

  if (roleError || !roleData) {
    console.error(roleError);
    return NextResponse.json(
      { error: "Không tìm thấy role_name tương ứng với role_id" },
      { status: 400 },
    );
  }

  // Cập nhật user_metadata khi cập nhật thông tin staff
  const { error: updateMetadataError } =
    await supabaseAdmin.auth.admin.updateUserById(staffData.auth_user_id, {
      user_metadata: {
        role: roleData.role_name,
        full_name: `${first_name} ${last_name}`,
        staff_id: staffId,
      },
    });

  if (updateMetadataError) {
    console.error(updateMetadataError);
    return NextResponse.json(
      { error: "Failed to update user metadata" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
