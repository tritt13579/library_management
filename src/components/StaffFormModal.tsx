"use client";

import React, { useState, useEffect } from "react";
import { supabaseClient } from "@/lib/client";

interface StaffFormModalProps {
  isAddOpen: boolean;
  isEditOpen: boolean;
  closeAdd: () => void;
}

interface Role {
  id: number;
  name: string;
}

const StaffFormModal: React.FC<StaffFormModalProps> = ({
  isAddOpen,
  isEditOpen,
  closeAdd,
}) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [hireDate, setHireDate] = useState("");

  const [roles, setRoles] = useState<Role[]>([]);

  useEffect(() => {
    const supabase = supabaseClient();

    const fetchRoles = async () => {
      const { data, error } = await supabase
        .from("role")
        .select("role_id, role_name");
      if (error) {
        console.error("Lỗi lấy danh sách chức vụ:", error.message);
      } else {
        const mappedRoles = data.map((item: any) => ({
          id: item.role_id,
          name: item.role_name,
        }));
        setRoles(mappedRoles);
      }
    };

    fetchRoles();
  }, []);

  const handleSubmit = async () => {
    const role_id = parseInt(role);
    if (isNaN(role_id)) {
      alert("Chức vụ không hợp lệ");
      return;
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/staff/save`,
      {
        method: "POST",
        body: JSON.stringify({
          staffId: null,
          role_id,
          first_name: firstName,
          last_name: lastName,
          date_of_birth: dob,
          gender: gender === "Nam" ? "M" : "F",
          address,
          phone,
          email,
          hire_date: hireDate,
        }),
      },
    );

    if (res.ok) {
      alert("Thêm nhân viên thành công");
      closeAdd();
    } else {
      const data = await res.json();
      alert("Lỗi: " + data.error);
    }
  };

  if (!isAddOpen && !isEditOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-50">
      <div className="max-h-[90vh] w-5/6 max-w-2xl space-y-4 overflow-y-auto rounded-lg bg-background p-8">
        <h2 className="mb-4 text-2xl font-semibold text-primary">
          {isAddOpen ? "Thêm nhân viên" : "Chỉnh sửa"}
        </h2>

        <div className="grid grid-cols-1 gap-4">
          <input
            type="text"
            placeholder="Họ nhân viên"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="rounded-md border border-gray-300 bg-input px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
          />
          <input
            type="text"
            placeholder="Tên nhân viên"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="rounded-md border border-gray-300 bg-input px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
          />
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">
              Ngày sinh
            </label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="rounded-md border border-gray-300 bg-input px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="rounded-md border border-gray-300 bg-input px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
            >
              <option value="" disabled>
                Chọn giới tính
              </option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
            <input
              type="text"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-md border border-gray-300 bg-input px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="rounded-md border border-gray-300 bg-input px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
            >
              <option value="">Chọn chức vụ</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id.toString()}>
                  {r.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Số điện thoại"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="rounded-md border border-gray-300 bg-input px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
            />
          </div>
          <input
            type="text"
            placeholder="Địa chỉ"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="rounded-md border border-gray-300 bg-input px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
          />
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">
              Ngày làm việc
            </label>
            <input
              type="date"
              value={hireDate}
              onChange={(e) => setHireDate(e.target.value)}
              className="rounded-md border border-gray-300 bg-input px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end space-x-3">
          <button
            onClick={closeAdd}
            className="rounded-md bg-accent-foreground px-4 py-2 text-muted-foreground"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className="rounded-md bg-[#0071BC] px-4 py-2 text-white hover:bg-[#005f9e]"
          >
            Lưu nhân viên
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffFormModal;
