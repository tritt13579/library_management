"use client";

import React, { useState, useEffect } from "react";
import { supabaseClient } from "@/lib/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface StaffFormModalProps {
  isAddOpen: boolean;
  isEditOpen: boolean;
  closeAdd: () => void;
  staffData?: any;
}

interface Role {
  id: number;
  name: string;
}

const StaffFormModal: React.FC<StaffFormModalProps> = ({
  isAddOpen,
  isEditOpen,
  closeAdd,
  staffData,
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
  const [loading, setLoading] = useState(false);

  const isOpen = isAddOpen || isEditOpen;

  useEffect(() => {
    if (staffData && isEditOpen) {
      setFirstName(staffData.first_name || "");
      setLastName(staffData.last_name || "");
      setDob(staffData.date_of_birth || "");
      setGender(staffData.gender === "M" ? "Nam" : "Nữ");
      setEmail(staffData.email || "");
      setRole(staffData.role_id?.toString() || "");
      setPhone(staffData.phone || "");
      setAddress(staffData.address || "");
      setHireDate(staffData.hire_date || "");
    }
  }, [staffData, isEditOpen]);

  useEffect(() => {
    const supabase = supabaseClient();
    const fetchRoles = async () => {
      const { data, error } = await supabase.from("role").select("role_id, role_name");
      if (!error && data) {
        setRoles(data.map((r: any) => ({ id: r.role_id, name: r.role_name })));
      }
    };
    fetchRoles();
  }, []);

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setDob("");
    setGender("");
    setEmail("");
    setRole("");
    setPhone("");
    setAddress("");
    setHireDate("");
  };

  const handleSubmit = async () => {
    const role_id = parseInt(role);
    if (isNaN(role_id)) {
      alert("Chức vụ không hợp lệ");
      return;
    }

    setLoading(true);
    const staffId = isEditOpen && staffData?.staff_id ? staffData.staff_id : null;

    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/staff/save`, {
      method: "POST",
      body: JSON.stringify({
        staffId,
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
    });

    const result = await res.json();
    setLoading(false);

    if (res.ok) {
      alert(isEditOpen ? "Cập nhật thành công" : "Thêm nhân viên thành công");
      closeAdd();
    } else {
      alert("Lỗi: " + result.error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeAdd}>
      <DialogContent className="max-h-[90vh] w-5/6 max-w-2xl overflow-y-auto bg-background p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-primary">
            {isAddOpen ? "Thêm nhân viên" : "Chỉnh sửa nhân viên"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4">
          <input
            type="text"
            placeholder="Họ nhân viên"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="rounded-md border border-gray-300 bg-input px-4 py-2"
          />
          <input
            type="text"
            placeholder="Tên nhân viên"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="rounded-md border border-gray-300 bg-input px-4 py-2"
          />
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">Ngày sinh</label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="rounded-md border border-gray-300 bg-input px-4 py-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="rounded-md border border-gray-300 bg-input px-4 py-2"
            >
              <option value="">Chọn giới tính</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-md border border-gray-300 bg-input px-4 py-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Số điện thoại"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="rounded-md border border-gray-300 bg-input px-4 py-2"
            />
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium text-gray-700">Ngày vào làm</label>
              <input
                type="date"
                value={hireDate}
                onChange={(e) => setHireDate(e.target.value)}
                className="rounded-md border border-gray-300 bg-input px-4 py-2"
              />
            </div>
          </div>

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="rounded-md border border-gray-300 bg-input px-4 py-2"
          >
            <option value="">Chọn chức vụ</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>

          <textarea
            placeholder="Địa chỉ"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={3}
            className="rounded-md border border-gray-300 bg-input px-4 py-2"
          />
        </div>

        <DialogFooter className="mt-4 flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              resetForm();
              closeAdd();
            }}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Đang lưu..." : "Lưu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StaffFormModal;
