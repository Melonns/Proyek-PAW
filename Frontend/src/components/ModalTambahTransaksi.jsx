import React from "react";
import FormTambahTransaksi from "./FormTambahTransaksi";

export default function ModalTambahTransaksi({ onClose, onSubmit, initialData}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-xl"
        >
          ✖
        </button>
        <FormTambahTransaksi
          onSubmit={onSubmit}
          onClose={onClose}
          initialData={initialData}
        />
      </div>
    </div>
  );
}
