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

    const { error: insertError } = await supabaseAdmin.from("staff").insert([
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
    ]);

    if (insertError) {
      console.error(insertError);
      return NextResponse.json({ error: "Insert failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  }

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

  return NextResponse.json({ success: true });
}
