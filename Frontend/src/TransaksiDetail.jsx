import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ModalTambahPengeluaran from "./components/ModalTambahPengeluaran";

export default function TransaksiDetail({ kategori }) {
  const [transaksi, setTransaksi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showModalPengeluaran, setShowModalPengeluaran] = useState(false);
  const [selectedTransaksiId, setSelectedTransaksiId] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3000/api/transaksi")
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
      fetch(`http://localhost:3000/api/transaksi/${id}`, {
        method: "DELETE",
      }).then(() => window.location.reload());
    }
  };

  const handleTambahPengeluaran = (t) => {
    setSelectedTransaksiId(t.id);
    setShowModalPengeluaran(true);
  };

  return (
    <div className="p-6 bg-white rounded mx-auto">
      {showModalPengeluaran && (
        <ModalTambahPengeluaran
          transaksiId={selectedTransaksiId}
          onClose={() => {
            setShowModalPengeluaran(false);
            setSelectedTransaksiId(null);
          }}
        />
      )}

      <h1 className="text-3xl font-bold text-pink-600 mb-6">
        {kategori === "Semua" ? "Semua Transaksi" : `Transaksi ${kategori}`}
      </h1>
      <h2 className="text-2xl font-bold mb-4">Detail Transaksi {kategori}</h2>

      {loading ? (
        <p>Loading...</p>
      ) : transaksi.length === 0 ? (
        <p className="text-gray-500">Tidak ada transaksi ditemukan.</p>
      ) : (
        <table className="w-full text-sm text-left border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Kode</th>
              <th className="p-2 border">Klien</th>
              <th className="p-2 border">Tanggal</th>
              <th className="p-2 border">Keterangan</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Pendapatan</th>
              <th className="p-2 border">Pengeluaran</th>
              <th className="p-2 border">Untung</th>
              <th className="p-2 border">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {transaksi.map((t) => (
              <tr key={t.id} className="border-t">
                <td className="p-2 border">{t.kode_transaksi}</td>
                <td className="p-2 border">{t.klien}</td>
                <td className="p-2 border">
                  {new Date(t.tanggal).toLocaleDateString("id-ID")}
                </td>
                <td className="p-2 border">{t.keterangan || "-"}</td>
                <td className="p-2 border">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
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
                <td className="p-2 border text-green-600 font-medium">
                  Rp {Number(t.total_pendapatan).toLocaleString("id-ID")}
                </td>
                <td className="p-2 border text-red-500 font-medium">
                  Rp {Number(t.total_pengeluaran).toLocaleString("id-ID")}
                </td>
                <td className="p-2 border text-blue-600 font-medium">
                  Rp {Number(t.total_untung).toLocaleString("id-ID")}
                </td>
                <td className="p-3 align-middle">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => handleTambahPengeluaran(t)}
                      className="text-sm bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500"
                    >
                      💸 Tambah Pengeluaran
                    </button>
                    <button
                      onClick={() => handleEdit(t)}
                      className="text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      🗑️ Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
