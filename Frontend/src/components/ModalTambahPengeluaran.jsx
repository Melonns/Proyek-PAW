import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

export default function ModalTambahPengeluaran({ transaksiId, onClose }) {
  const [pengeluaran, setPengeluaran] = useState([
    { keterangan: "", jumlah: "", kategori: "" },
  ]);

  const handleChange = (i, key, val) => {
    const updated = [...pengeluaran];
    updated[i][key] = val;
    setPengeluaran(updated);
  };

  const handleSubmit = async () => {
    const valid = pengeluaran.every((p) => p.keterangan && p.jumlah);
    if (!valid) {
      Swal.fire({
        icon: "warning",
        title: "Data tidak lengkap",
        text: "Lengkapi semua field sebelum menyimpan.",
      });
      return;
    }

    try {
      // Ambil tanggal transaksi
      const res = await fetch(
        `http://localhost:3000/api/transaksi/${transaksiId}`
      );
      const transaksi = await res.json();
      const tanggalTransaksi = transaksi.tanggal;

      // Kirim data pengeluaran
      for (const p of pengeluaran) {
        await fetch(
          `http://localhost:3000/api/transaksi/${transaksiId}/pengeluaran`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...p,
              tanggal: tanggalTransaksi,
            }),
          }
        );
      }

      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Pengeluaran berhasil ditambahkan.",
        showConfirmButton: true,
      });

      onClose();
      window.location.reload(); // Refresh halaman untuk update data
    } catch (error) {
      console.error("❌ Gagal submit pengeluaran:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Terjadi kesalahan saat menambahkan pengeluaran.",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40">
      <div className="bg-white p-6 rounded shadow-lg w-[400px]">
        <h2 className="text-lg font-bold mb-4">Tambah Pengeluaran</h2>
        {pengeluaran.map((p, i) => (
          <div key={i} className="mb-2 space-y-5">
            <input
              value={p.keterangan}
              onChange={(e) => handleChange(i, "keterangan", e.target.value)}
              placeholder="Keterangan"
              className="w-full border rounded px-2 py-2"
            />
            <input
              value={p.jumlah}
              type="number"
              onChange={(e) => handleChange(i, "jumlah", e.target.value)}
              placeholder="Jumlah"
              className="w-full border rounded px-2 py-2"
            />
            <input
              value={p.kategori}
              onChange={(e) => handleChange(i, "kategori", e.target.value)}
              placeholder="Kategori"
              className="w-full border rounded px-2 py-2"
            />
          </div>
        ))}
        <div className="flex justify-between mt-4">
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Simpan
          </button>
          <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}
