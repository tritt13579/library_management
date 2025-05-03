// import React from "react";

// const ReaderFormModal = ({
//   isCreateOpen,
//   isEditOpen,
//   closeCreate,
// }: {
//   isCreateOpen: boolean;
//   isEditOpen: boolean;
//   closeCreate: () => void;
// }) => {
//   return (
//     (isCreateOpen || isEditOpen) && (
//       <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-50">
//         <div className="max-h-[90vh] w-5/6 max-w-2xl space-y-4 overflow-y-auto rounded-lg bg-background p-8">
//           <h2 className="mb-4 text-2xl font-semibold text-primary">
//             {isCreateOpen ? "Thêm độc giả" : "Chỉnh sửa"}
//           </h2>

//           <div className="grid grid-cols-1 gap-4">
//             <div className="grid grid-cols-2 gap-4">
//               <input
//                 type="text"
//                 placeholder="Họ độc giả"
//                 className="rounded-md border border-gray-300 bg-input px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
//               />
//               <input
//                 type="text"
//                 placeholder="Tên độc giả"
//                 className="rounded-md border border-gray-300 bg-input px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
//               />
//             </div>
//             <div className="grid grid-cols-2 gap-4">
//               <div className="flex flex-col">
//                 <label className="mb-1 text-sm font-medium text-gray-700">
//                   Ngày sinh
//                 </label>
//                 <input
//                   type="date"
//                   className="rounded-md border border-gray-300 bg-input px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
//                 />
//               </div>
//               <select
//                 defaultValue=""
//                 className="self-end rounded-md border border-gray-300 bg-input px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
//               >
//                 <option value="" disabled>
//                   Chọn giới tính
//                 </option>
//                 <option value="Nam">Nam</option>
//                 <option value="Nữ">Nữ</option>
//               </select>
//             </div>
//             <input
//               type="email"
//               placeholder="Email"
//               className="rounded-md border border-gray-300 bg-input px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
//             />
//             <input
//               type="text"
//               placeholder="Số điện thoại"
//               className="rounded-md border border-gray-300 bg-input px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
//             />
//             <input
//               type="text"
//               placeholder="Địa chỉ"
//               className="rounded-md border border-gray-300 bg-input px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
//             />
//             <div className="grid grid-cols-2 gap-4">
//               <select className="rounded-md border border-gray-300 bg-input px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0071BC]">
//                 <option value="">Chọn loại thẻ</option>
//                 <option value="Mượn">Thẻ mượn</option>
//                 <option value="Đọc">Thẻ đọc</option>
//               </select>
//               <input
//                 type="text"
//                 placeholder="Hạn mức (VD: 200000)"
//                 className="rounded-md border border-gray-300 bg-input px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
//               />
//             </div>
//             <div className="flex flex-col">
//               <label className="mb-1 text-sm font-medium text-gray-700">
//                 Ảnh thẻ
//               </label>
//               <input
//                 type="file"
//                 accept="image/*"
//                 className="rounded-md border border-gray-300 bg-input px-4 py-2 file:mr-4 file:rounded-md file:border-0 file:bg-[#0071BC] file:px-4 file:py-2 file:text-white hover:file:bg-[#005f9e]"
//               />
//             </div>
//           </div>
//           <div className="mt-4 flex justify-end space-x-3">
//             <button
//               onClick={closeCreate}
//               className="rounded-md bg-accent-foreground px-4 py-2 text-muted-foreground"
//             >
//               Hủy
//             </button>
//             <button className="rounded-md bg-[#0071BC] px-4 py-2 text-white hover:bg-[#005f9e]">
//               Lưu độc giả
//             </button>
//           </div>
//         </div>
//       </div>
//     )
//   );
// };

// export default ReaderFormModal;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { supabaseClient } from "@/lib/client";

const ReaderFormModal = ({
  isCreateOpen,
  isEditOpen,
  closeCreate,
}: {
  isCreateOpen: boolean;
  isEditOpen: boolean;
  closeCreate: () => void;
}) => {
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

      if (error) {
        console.error("Lỗi lấy danh sách gói đặt cọc:", error.message);
      } else {
        const mapped = data.map((item: any) => ({
          id: item.deposit_package_id,
          amount: item.package_amount,
        }));
        setDepositPackages(mapped);
      }
    };

    fetchDepositPackages();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const supabase = supabaseClient();

    let uploadedImageUrl = "";

    if (imageFile) {
      const fileName = `avatars/readers/${Date.now()}_${imageFile.name}`;
      const { data, error } = await supabase.storage
        .from("images")
        .upload(fileName, imageFile);

      if (error) {
        console.error("Lỗi upload ảnh:", error.message);
        alert("Không thể tải ảnh lên.");
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("images")
        .getPublicUrl(fileName);

      uploadedImageUrl = publicUrlData.publicUrl;
    }

    const body = {
      ...formData,
      deposit_package_id: parseInt(formData.deposit_package_id),
      card_type: formData.card_type === "Mượn" ? "Thẻ mượn" : "Thẻ đọc",
      photo_url: uploadedImageUrl,
    };

    try {
      const response = await axios.post("/api/reader/save", body);
      if (response.data.success) {
        alert("Thêm độc giả thành công!");
        closeCreate();
      } else {
        alert("Có lỗi xảy ra.");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi khi gửi dữ liệu.");
    }
  };

  return (
    (isCreateOpen || isEditOpen) && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-50">
        <div className="max-h-[90vh] w-5/6 max-w-2xl space-y-4 overflow-y-auto rounded-lg bg-background p-8">
          <h2 className="mb-4 text-2xl font-semibold text-primary">
            {isCreateOpen ? "Thêm độc giả" : "Chỉnh sửa"}
          </h2>

          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                type="text"
                placeholder="Họ độc giả"
                className="rounded-md border border-gray-300 bg-input px-4 py-2"
              />
              <input
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                type="text"
                placeholder="Tên độc giả"
                className="rounded-md border border-gray-300 bg-input px-4 py-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="mb-1 text-sm font-medium text-gray-700">
                  Ngày sinh
                </label>
                <input
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  type="date"
                  className="rounded-md border border-gray-300 bg-input px-4 py-2"
                />
              </div>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="self-end rounded-md border border-gray-300 bg-input px-4 py-2"
              >
                <option value="" disabled>
                  Chọn giới tính
                </option>
                <option value="M">Nam</option>
                <option value="F">Nữ</option>
              </select>
            </div>

            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              type="email"
              placeholder="Email"
              className="rounded-md border border-gray-300 bg-input px-4 py-2"
            />
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              type="text"
              placeholder="Số điện thoại"
              className="rounded-md border border-gray-300 bg-input px-4 py-2"
            />
            <input
              name="address"
              value={formData.address}
              onChange={handleChange}
              type="text"
              placeholder="Địa chỉ"
              className="rounded-md border border-gray-300 bg-input px-4 py-2"
            />

            <div className="grid grid-cols-2 gap-4">
              <select
                name="card_type"
                value={formData.card_type}
                onChange={handleChange}
                className="rounded-md border border-gray-300 bg-input px-4 py-2"
              >
                <option value="">Chọn loại thẻ</option>
                <option value="Mượn">Thẻ mượn</option>
                <option value="Đọc">Thẻ đọc</option>
              </select>

              <select
                name="deposit_package_id"
                value={formData.deposit_package_id}
                onChange={handleChange}
                className="rounded-md border border-gray-300 bg-input px-4 py-2"
              >
                <option value="">Chọn gói đặt cọc</option>
                {depositPackages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.amount.toLocaleString("vi-VN")}₫
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium text-gray-700">
                Ảnh thẻ
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="rounded-md border border-gray-300 bg-input px-4 py-2 file:mr-4 file:rounded-md file:border-0 file:bg-[#0071BC] file:px-4 file:py-2 file:text-white hover:file:bg-[#005f9e]"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end space-x-3">
            <button
              onClick={closeCreate}
              className="rounded-md bg-accent-foreground px-4 py-2 text-muted-foreground"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              className="rounded-md bg-[#0071BC] px-4 py-2 text-white hover:bg-[#005f9e]"
            >
              Lưu độc giả
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default ReaderFormModal;
