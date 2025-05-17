"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { supabaseClient } from "@/lib/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ReaderFormModalProps {
  isCreateOpen: boolean;
  isEditOpen: boolean;
  closeCreate: () => void;
  reader?: any;
  onSuccess?: () => void;
}

const ReaderFormModal = ({
  isCreateOpen,
  isEditOpen,
  closeCreate,
  reader,
  onSuccess
}: ReaderFormModalProps) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [ageLimit, setAgeLimit] = useState<number>(16);

  useEffect(() => {
    const fetchAgeLimit = async () => {
      const supabase = supabaseClient();
      const { data, error } = await supabase
        .from("systemsetting")
        .select("setting_value")
        .eq("setting_id", 3)
        .single();

      if (!error && data) {
        setAgeLimit(parseInt(data.setting_value, 10));
      } else {
        console.error("Không lấy được giá trị tuổi giới hạn:", error?.message);
      }
    };

    fetchAgeLimit();
  }, []);

  const calculateAge = (dob: string): number => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "",
    address: "",
    phone: "",
    email: "",
    photo_url: "",
    card_type: "",
    deposit_package_id: "",
  });

  const [depositPackages, setDepositPackages] = useState<
    { id: number; amount: number }[]
  >([]);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    const supabase = supabaseClient();
    const fetchDepositPackages = async () => {
      const { data, error } = await supabase
        .from("depositpackage")
        .select("deposit_package_id, package_amount");

      if (!error && data) {
        setDepositPackages(
          data.map((item: any) => ({
            id: item.deposit_package_id,
            amount: item.package_amount,
          }))
        );
      } else {
        console.error("Lỗi lấy gói đặt cọc:", error?.message);
      }
    };
    fetchDepositPackages();
  }, []);

  useEffect(() => {
    if (isEditOpen && reader) {
      setFormData({
        first_name: reader.first_name || "",
        last_name: reader.last_name || "",
        date_of_birth: reader.date_of_birth || "",
        gender: reader.gender || "",
        address: reader.address || "",
        phone: reader.phone || "",
        email: reader.email || "",
        photo_url: reader.photo_url || "",
        card_type: reader.librarycard?.[0]?.card_type === "Thẻ đọc" ? "Đọc" : "Mượn",
        deposit_package_id:
          reader.librarycard?.[0]?.deposit_package_id?.toString() || "",
      });
    }
  }, [isEditOpen, reader]);

  useEffect(() => {
    if (!isCreateOpen && !isEditOpen) {
      setFormData({
        first_name: "",
        last_name: "",
        date_of_birth: "",
        gender: "",
        address: "",
        phone: "",
        email: "",
        photo_url: "",
        card_type: "",
        deposit_package_id: "",
      });
      setImageFile(null);
    }
  }, [isCreateOpen, isEditOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    const supabase = supabaseClient();
    let uploadedImageUrl = formData.photo_url;

    const age = calculateAge(formData.date_of_birth);

    if (age < ageLimit) {
      toast({title: `Độc giả phải từ ${ageLimit} tuổi trở lên.`, variant: "destructive",});
      setIsSaving(false);
      return;
    }

    if (imageFile) {
      const fileName = `avatars/readers/${Date.now()}_${imageFile.name}`;
      const { data, error } = await supabase.storage
        .from("images")
        .upload(fileName, imageFile);

      if (error) {
        alert("Không thể tải ảnh lên.");
        setIsSaving(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("images")
        .getPublicUrl(fileName);

      uploadedImageUrl = publicUrlData.publicUrl;
    }

    const body = {
      ...formData,
      readerId: reader?.reader_id || undefined,
      deposit_package_id: parseInt(formData.deposit_package_id),
      card_type: formData.card_type === "Mượn" ? "Thẻ mượn" : "Thẻ đọc",
      photo_url: uploadedImageUrl,
    };

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/reader/save`,
        body,
      );
      if (response.data.success) {
        toast({ title: isEditOpen ? "Cập nhật thành công" : "Thêm độc giả thành công", variant: "success" });
        onSuccess?.();
        setIsSaving(false);
        closeCreate();
      } else {
        console.log("Có lỗi xảy ra.");
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || "Có lỗi xảy ra khi gửi dữ liệu.";
      toast({
        title: "Lỗi từ hệ thống",
        description: errorMessage,
        variant: "destructive",
      });
      console.error("Lỗi khi gửi dữ liệu:", errorMessage);
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isCreateOpen || isEditOpen} onOpenChange={closeCreate}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-primary">
            {isCreateOpen ? "Thêm độc giả" : "Chỉnh sửa độc giả"}
          </DialogTitle>
        </DialogHeader>

        {/* Form */}
        <div className="grid grid-cols-2 gap-4">
          <Input name="last_name" value={formData.last_name} onChange={handleChange} placeholder="Họ" />
          <Input name="first_name" value={formData.first_name} onChange={handleChange} placeholder="Tên" />

          <div className="col-span-2 flex gap-4">
            <div className="flex flex-col flex-1">
              <Label className="mb-2">Ngày sinh</Label>
              <Input name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} type="date" />
            </div>
            <div className="flex flex-col flex-1">
              <Label className="mb-2">Giới tính</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, gender: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn giới tính" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Nam</SelectItem>
                  <SelectItem value="F">Nữ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Input name="email" value={formData.email} onChange={handleChange} placeholder="Email" type="email" />
          <Input name="phone" value={formData.phone} onChange={handleChange} placeholder="Số điện thoại" />
          <Input name="address" value={formData.address} onChange={handleChange} placeholder="Địa chỉ" />

          <div className="flex flex-col">
            <Label className="mb-2">Loại thẻ</Label>
            <Select
              value={formData.card_type}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, card_type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại thẻ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Mượn">Thẻ mượn</SelectItem>
                <SelectItem value="Đọc">Thẻ đọc</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col">
            <Label className="mb-2">Gói đặt cọc</Label>
            <Select
              value={formData.deposit_package_id}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, deposit_package_id: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn gói đặt cọc" />
              </SelectTrigger>
              <SelectContent>
                {depositPackages.map((pkg) => (
                  <SelectItem key={pkg.id} value={pkg.id.toString()}>
                    {pkg.amount.toLocaleString("vi-VN")}₫
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-2">
            <Label className="mb-2">Ảnh thẻ</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            />
            {formData.photo_url && !imageFile && (
              <img
                src={formData.photo_url}
                alt="Ảnh cũ"
                className="mt-2 h-24 w-24 rounded object-cover"
              />
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={closeCreate}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? "Đang lưu..." : isEditOpen ? "Cập nhật" : "Lưu độc giả"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReaderFormModal;
