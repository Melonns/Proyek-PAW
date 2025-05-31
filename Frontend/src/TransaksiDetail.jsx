import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ModalTambahPengeluaran from "./components/ModalTambahPengeluaran";
import ModalTambahTransaksi from "./components/ModalTambahTransaksi";

export default function TransaksiDetail({ kategori }) {
  const BASE_URL = import.meta.env.VITE_API_URL;
  const [transaksi, setTransaksi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showModalPengeluaran, setShowModalPengeluaran] = useState(false);
  const [selectedTransaksiId, setSelectedTransaksiId] = useState(null);

  useEffect(() => {
    fetch(`${BASE_URL}/api/transaksi`)
      .then((res) => res.json())
      .then((data) => {
        const filtered =
          kategori === "Semua"
            ? data
            : data.filter((t) => t.layanan.includes(kategori));

        setTransaksi(filtered);
        setLoading(false);
      });
  }, [kategori]);

  const handleEdit = (t) => {
    setEditData(t);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Yakin ingin menghapus transaksi ini?")) {
      fetch(`${BASE_URL}/api/transaksi/${id}`, {
        method: "DELETE",
      }).then(() => window.location.reload());
    }
  };

  const handleTambahPengeluaran = (t) => {
    setSelectedTransaksiId(t.id);
    setShowModalPengeluaran(true);
  };

  return (
    <div className="p-4">
      {showModalPengeluaran && (
        <ModalTambahPengeluaran
          transaksiId={selectedTransaksiId}
          onClose={() => {
            setShowModalPengeluaran(false);
            setSelectedTransaksiId(null);
          }}
        />
      )}

      {showModal && (
        <ModalTambahTransaksi
          onClose={() => {
            setShowModal(false);
            setEditData(null);
          }}
          initialData={editData}
          onSubmit={(form) => {
            const method = editData ? "PUT" : "POST";
            const url = editData
              ? `${BASE_URL}/api/transaksi/${editData.id}`
              : `${BASE_URL}/api/transaksi`;

            fetch(url, {
              method,
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(form),
            })
              .then((res) => res.json())
              .then((data) => {
                if (data.message === "Kode transaksi sudah digunakan.") {
                  Swal.fire({
                    icon: "warning",
                    title: "Kode Duplikat",
                    text: "Kode transaksi sudah digunakan. Silakan gunakan kode lain.",
                  });
                } else if (
                  data.message === "Transaksi berhasil ditambahkan" ||
                  data.message === "Transaksi berhasil diperbarui"
                ) {
                  Swal.fire({
                    icon: "success",
                    title: "Berhasil",
                    text: editData
                      ? "Transaksi berhasil diperbarui."
                      : "Transaksi baru telah ditambahkan.",
                  }).then(() => {
                    setShowModal(false);
                    setEditData(null);
                    window.location.reload(); // bisa diganti ke refetch data kalau kamu pakai state
                  });
                }
              })
              .catch((err) => {
                console.error("Gagal simpan:", err);
                Swal.fire({
                  icon: "error",
                  title: "Gagal Menyimpan",
                  text: "Terjadi kesalahan saat menyimpan transaksi. Silakan coba lagi.",
                });
              });
          }}
        />
      )}

      <div className="bg-gradient-to-r from-blue-500 to-pink-500 text-white rounded-t-xl p-6 mb-6">
        <h1 className="text-2xl font-bold">Transaksi {kategori}</h1>
        <p className="text-sm opacity-90">
          Kelola transaksi {kategori.toLowerCase()} Anda dengan mudah
        </p>
      </div>

      <div className="overflow-x-auto shadow-md rounded-lg bg-white">
        <table className="w-full text-sm text-center border-collapse">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-3">Kode</th>
              <th className="p-3">Klien</th>
              <th className="p-3">Tanggal</th>
              <th className="p-3">Keterangan</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-green-600">Pendapatan</th>
              <th className="p-3 text-red-600">Pengeluaran</th>
              <th className="p-3 text-blue-600">Untung</th>
              <th className="p-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {transaksi.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center text-gray-500 py-6">
                  Tidak ada transaksi.
                </td>
              </tr>
            ) : (
              transaksi.map((t, i) => (
                <tr key={i} className="border-t hover:bg-gray-50 transition">
                  <td className="p-3 font-semibold">{t.kode_transaksi}</td>
                  <td className="p-3">{t.klien}</td>
                  <td className="p-3">
                    {new Date(t.tanggal).toLocaleDateString("id-ID")}
                  </td>
                  <td className="p-3">{t.keterangan || "-"}</td>
                  <td className="p-3">
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-semibold inline-block ${
                        t.status === "Selesai"
                          ? "bg-green-100 text-green-700"
                          : t.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="p-3 text-green-600 font-semibold">
                    Rp {Number(t.total_pendapatan || 0).toLocaleString("id-ID")}
                  </td>
                  <td className="p-3 text-red-600 font-semibold">
                    Rp{" "}
                    {Number(t.total_pengeluaran || 0).toLocaleString("id-ID")}
                  </td>
                  <td className="p-3 text-blue-700 font-semibold">
                    Rp {Number(t.total_untung || 0).toLocaleString("id-ID")}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2 justify-center flex-wrap">
                      <button
                        onClick={() => handleTambahPengeluaran(t)}
                        className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded text-sm"
                      >
                        💰 Tambah Pengeluaran
                      </button>
                      <button
                        onClick={async () => {
                          const res = await fetch(
                            `${BASE_URL}/api/transaksi/${t.id}`
                          );
                          const data = await res.json();
                          setEditData(data);
                          setShowModal(true);
                        }}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                      >
                        🗑️ Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
