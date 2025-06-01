import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

export default function ModalTambahPengeluaran({ transaksiId, onClose }) {
  const [pengeluaran, setPengeluaran] = useState([
    { keterangan: "", jumlah: "", kategori: "" },
  ]);
  const BASE_URL = import.meta.env.VITE_API_URL;
  const handleChange = (i, key, val) => {
    const updated = [...pengeluaran];
    updated[i][key] = val;
    setPengeluaran(updated);
  };

  const [layananList, setLayananList] = useState([]);

  useEffect(() => {
    fetch(`${BASE_URL}/api/layanan`)
      .then((res) => res.json())
      .then((data) => setLayananList(data))
      .catch((err) => console.error("Gagal fetch layanan:", err));
  }, []);

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
      const res = await fetch(`${BASE_URL}/api/transaksi/${transaksiId}`);
      const transaksi = await res.json();
      const tanggalTransaksi = transaksi.tanggal.slice(0, 10); // Ambil tanggal dalam format YYYY-MM-DD

      const layananTransaksi = transaksi.detail.map((d) =>
        d.layanan_nama.trim()
      );

      const kategoriTidakValid = pengeluaran.some(
        (p) => !layananTransaksi.includes(p.kategori)
      );

      if (kategoriTidakValid) {
        Swal.fire({
          icon: "error",
          title: "Kategori tidak sesuai",
          text: "Kategori pengeluaran harus sesuai dengan layanan dalam transaksi ini.",
        });
        return;
      }

      // Kirim data pengeluaran
      for (const p of pengeluaran) {
        await fetch(`${BASE_URL}/api/transaksi/${transaksiId}/pengeluaran`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...p,
            tanggal: tanggalTransaksi,
          }),
        });
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
            <select
              value={p.kategori}
              onChange={(e) => handleChange(i, "kategori", e.target.value)}
              className="w-full border rounded px-2 py-2"
            >
              <option value="">Pilih Layanan</option>
              {layananList.map((l) => (
                <option key={l.id} value={l.nama}>
                  {l.nama}
                </option>
              ))}
            </select>
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
