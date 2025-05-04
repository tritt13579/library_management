"use client";
import React from "react";

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload?: (file: File) => void;
}

const FileUploadModal: React.FC<FileUploadModalProps> = ({ isOpen, onClose, onUpload }) => {
  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("Selected file:", file);
      onUpload?.(file);
    }
  };

  const handleUpload = () => {
    console.log("Uploading file...");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-50">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-background p-8">
        <h2 className="text-2xl font-semibold text-primary">Tải lên tài liệu</h2>
        <div className="space-y-3">
          <label className="block text-sm font-medium text-foreground">
            Chọn file (.xlsx, .xls, .docx, .doc)
          </label>
          <input
            type="file"
            accept=".xlsx,.xls,.docx,.doc"
            className="block w-full rounded-md border border-gray-300 bg-input px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
            onChange={handleFileChange}
          />
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <button
            onClick={onClose}
            className="rounded-md bg-accent-foreground px-4 py-2 text-muted-foreground"
          >
            Hủy
          </button>
          <button
            onClick={handleUpload}
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-[#005f9e]"
          >
            Tải lên
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUploadModal;
