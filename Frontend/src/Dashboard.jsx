import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ModalTambahTransaksi from "./components/ModalTambahTransaksi";

export default function Dashboard() {
  const navigate = useNavigate();
  const [transaksi, setTransaksi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [kategoriStats, setKategoriStats] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetch("http://localhost:3000/api/transaksi")
      .then((res) => res.json())
      .then((data) => {
        console.log("DATA:", data);
        setTransaksi(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Gagal fetch transaksi:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetch("http://localhost:3000/api/transaksi/statistik")
      .then((res) => res.json())
      .then((data) => setKategoriStats(data))
      .catch((err) => console.error("Gagal fetch statistik:", err));
  }, []);

  const handleDeleteTransaksi = (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) {
      fetch(`http://localhost:3000/api/transaksi/${id}`, {
        method: "DELETE",
      })
        .then((res) => {
          if (res.ok) {
            setTransaksi(transaksi.filter((t) => t.id !== id));
          } else {
            console.error("Gagal menghapus transaksi.");
          }
        })
        .catch((err) => {
          console.error("Terjadi kesalahan:", err);
        });
    }
  };

  const stats = kategoriStats
    ? [
        {
          label: "Total Transaksi Sewa Baju",
          total: `Rp ${Number(kategoriStats.total_sewa_baju).toLocaleString(
            "id-ID"
          )}`,
          jumlah: `${kategoriStats.jumlah_sewa_baju} transaksi`,
          icon: "👗",
          bg: "bg-pink-100",
        },
        {
          label: "Total Transaksi MUA",
          total: `Rp ${Number(kategoriStats.total_mua).toLocaleString(
            "id-ID"
          )}`,
          jumlah: `${kategoriStats.jumlah_mua} transaksi`,
          icon: "🎨",
          bg: "bg-purple-100",
        },
        {
          label: "Total Transaksi Photo",
          total: `Rp ${Number(kategoriStats.total_foto).toLocaleString(
            "id-ID"
          )}`,
          jumlah: `${kategoriStats.jumlah_foto} transaksi`,
          icon: "📷",
          bg: "bg-blue-100",
        },
        {
          label: "Total Semua Transaksi",
          total: `Rp ${Number(kategoriStats.total_semua).toLocaleString(
            "id-ID"
          )}`,
          jumlah: `${kategoriStats.jumlah_transaksi} transaksi`,
          icon: "💵",
          bg: "bg-green-100",
        },
      ]
    : [];

  return (
    <div className="p-6 bg-pink-50 min-h-screen">
      <h1 className="text-3xl font-bold text-pink-600 mb-2">
        Dashboard MUA Studio
      </h1>
      <p className="text-gray-600 mb-6">
        Overview transaksi dan aktivitas terkini
      </p>

      {/* Stat boxes */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {stats.length > 0 ? (
          stats.map((s, i) => (
            <div key={i} className={`rounded-lg p-4 shadow ${s.bg}`}>
              <div className="text-3xl mb-2">{s.icon}</div>
              <h2 className="text-xl font-semibold">{s.total}</h2>
              <p className="text-sm text-gray-700">{s.jumlah}</p>
              <p className="text-sm text-gray-600 mb-2">{s.label}</p>
              <button
                onClick={() =>
                  navigate(
                    `/transaksi-detail/${s.label
                      .replaceAll(" ", "-")
                      .toLowerCase()}`
                  )
                }
                className="text-sm bg-indigo-500 text-white px-3 py-1 rounded hover:bg-indigo-600"
              >
                Lihat Detail
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-500">Memuat statistik...</p>
        )}
      </div>

      {/* Riwayat transaksi */}
      {loading ? (
        <p className="text-gray-500">Memuat data transaksi...</p>
      ) : (
        <div className="overflow-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Riwayat Transaksi Terkini
              </h2>
              <button
                onClick={() => setShowModal(true)}
                className="text-xs bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                ➕ Tambah Transaksi
              </button>
            </div>
            <div className="overflow-auto">
              {showModal && (
                <ModalTambahTransaksi
                  onClose={() => setShowModal(false)}
                  onSubmit={(form) => {
                    fetch("http://localhost:3000/api/transaksi", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(form),
                    })
                      .then((res) => res.json())
                      .then(() => {
                        setShowModal(false);
                        window.location.reload();
                      })
                      .catch((err) => {
                        console.error("Gagal simpan:", err);
                      });
                  }}
                />
              )}
              <table className="w-full text-sm text-center">
                <thead className="bg-gray-100 text-gray-600">
                  <tr>
                    <th className="p-3 align-middle">ID Transaksi</th>
                    <th className="p-3 align-middle">Klien</th>
                    <th className="p-3 align-middle">Layanan</th>
                    <th className="p-3 align-middle">Jumlah</th>
                    <th className="p-3 align-middle">Tanggal & Waktu</th>
                    <th className="p-3 align-middle">Status</th>
                    <th className="p-3 align-middle">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {transaksi.map((t, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-3 align-middle">{t.id}</td>

                      <td className="p-3 align-middle">
                        <div className="flex justify-center items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center text-sm font-bold">
                            {t.inisial}
                          </div>
                          <span>{t.klien}</span>
                        </div>
                      </td>

                      <td className="p-3 align-middle">{t.layanan}</td>

                      <td className="p-3 align-middle text-green-600 font-semibold">
                        Rp {Number(t.total || 0).toLocaleString("id-ID")}
                      </td>

                      <td className="p-3 align-middle text-sm text-gray-700">
                        {new Date(t.tanggal).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </td>

                      <td className="p-3 align-middle">
                        <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">
                          {t.status}
                        </span>
                      </td>

                      <td className="p-3 align-middle">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => alert(`Edit ${t.id}`)}
                            className="text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteTransaksi(t.id)
                            }
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
