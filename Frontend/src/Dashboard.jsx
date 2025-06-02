import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ModalTambahTransaksi from "./components/ModalTambahTransaksi";
import ModalTambahPengeluaran from "./components/ModalTambahPengeluaran";
import ModalLaporan from "./components/ModalLaporan";

import Swal from "sweetalert2";

export default function Dashboard() {
  const BASE_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const [transaksi, setTransaksi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [kategoriStats, setKategoriStats] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [showPengeluaranModal, setShowPengeluaranModal] = useState(false);
  const [selectedTransaksiId, setSelectedTransaksiId] = useState(null);
  const [selectedTanggal, setSelectedTanggal] = useState(null);
  const [total, setTotal] = useState(null);
  const [transaksiSummary, setTransaksiSummary] = useState([]);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [showModalLaporan, setShowModalLaporan] = useState(false);
  const [showModalTransaksi, setShowModalTransaksi] = useState(false);

  useEffect(() => {
    fetch(`${BASE_URL}/api/transaksi`)
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
    fetch(`${BASE_URL}/api/transaksi`)
      .then((res) => res.json())
      .then((data) => {
        setTransaksi(data);

        // Hitung total pendapatan, pengeluaran, dan untung
        const totalPendapatan = data.reduce(
          (sum, t) => sum + t.total_pendapatan,
          0
        );
        const totalPengeluaran = data.reduce(
          (sum, t) => sum + t.total_pengeluaran,
          0
        );
        const totalUntung = data.reduce((sum, t) => sum + t.total_untung, 0);

        setTotal({
          pendapatan: totalPendapatan,
          pengeluaran: totalPengeluaran,
          untung: totalUntung,
        });
      });
  }, []);

  useEffect(() => {
    fetch(`${BASE_URL}/api/transaksi`)
      .then((res) => res.json())
      .then((data) => {
        setTransaksi(data);

        const transaksiSelesai = data.filter((t) => t.status === "Selesai");

        const totalPerKategori = {
          MUA: 0,
          Foto: 0,
          "Sewa Baju": 0,
        };
        const countPerKategori = {
          MUA: 0,
          Foto: 0,
          "Sewa Baju": 0,
        };

        transaksiSelesai.forEach((t) => {
          const layananArr = (t.layanan || "").split(" + ");
          const untungPerLayanan =
            Number(t.total_untung || 0) / layananArr.length;

          layananArr.forEach((layanan) => {
            if (totalPerKategori[layanan] !== undefined) {
              totalPerKategori[layanan] += untungPerLayanan;
              countPerKategori[layanan]++;
            }
          });
        });

        setKategoriStats({
          total_mua: totalPerKategori["MUA"],
          total_foto: totalPerKategori["Foto"],
          total_sewa_baju: totalPerKategori["Sewa Baju"],
          total_semua: transaksiSelesai.reduce(
            (sum, t) => sum + Number(t.total_untung || 0),
            0
          ),
          jumlah_mua: countPerKategori["MUA"],
          jumlah_foto: countPerKategori["Foto"],
          jumlah_sewa_baju: countPerKategori["Sewa Baju"],
          jumlah_transaksi: transaksiSelesai.length,
        });

        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (editData) {
      setShowModal(true); // ⬅️ baru buka modal setelah editData tidak null
    }
  }, [editData]);

  useEffect(() => {
    fetch(`${BASE_URL}/api/transaksi/summary`)
      .then((res) => res.json())
      .then((data) => {
        setTransaksiSummary(data);
        setLoadingSummary(false);
      })
      .catch((err) => {
        console.error("Gagal mengambil data summary transaksi:", err);
        setLoadingSummary(false);
      });
  }, []);

  const handleDeleteTransaksi = (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) {
      fetch(`${BASE_URL}/api/transaksi/${id}`, {
        method: "DELETE",
      })
        .then((res) => {
          if (res.ok) {
            Swal.fire({
              icon: "success",
              title: "Transaksi Dihapus",
              text: "Transaksi berhasil dihapus.",
            }).then(() => {
              window.location.reload(); // ✅ Baru reload setelah swal muncul
            });
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
          label: "Total Semua Transaksi Bersih",
          total: `Rp ${Number(kategoriStats.total_semua).toLocaleString(
            "id-ID"
          )}`,
          jumlah: `${kategoriStats.jumlah_transaksi} transaksi`,
          icon: "💵",
          bg: "bg-green-100",
        },
      ]
    : [];

  const routeMap = {
    "Total Transaksi Sewa Baju": "sewa-baju",
    "Total Transaksi MUA": "mua",
    "Total Transaksi Photo": "foto",
    "Total Semua Transaksi Bersih": "semua",
  };

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
                  navigate(`/transaksi-detail/${routeMap[s.label]}`)
                }
                className="text-sm bg-indigo-500 text-white px-3 py-2 rounded hover:bg-indigo-600"
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
              <div className="flex gap-2">
                <button
                  onClick={() => setShowModalLaporan(true)}
                  className="text-xs bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  📄 Filter Laporan
                </button>
                <button
                  onClick={() => setShowModal(true)}
                  className="text-xs bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  ➕ Tambah Transaksi
                </button>
              </div>
            </div>

            <div className="overflow-auto">
              {(showModal||showModalTransaksi) && (
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
                        if (
                          data.message === "Kode transaksi sudah digunakan."
                        ) {
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

              {showPengeluaranModal && (
                <ModalTambahPengeluaran
                  transaksiId={selectedTransaksiId}
                  tanggalTransaksi={selectedTanggal}
                  onClose={() => {
                    setShowPengeluaranModal(false);
                    setSelectedTransaksiId(null);
                  }}
                />
              )}

              <ModalLaporan
                show={showModalLaporan}
                onClose={() => setShowModalLaporan(false)}
              />

              <table className="w-full text-sm text-center">
                <thead className="bg-gray-100 text-gray-600">
                  <tr>
                    <th className="p-3 align-middle">ID Transaksi</th>
                    <th className="p-3 align-middle">Klien</th>
                    <th className="p-3 align-middle">Layanan</th>
                    <th className="p-3 align-middle">Pendapatan Bersih</th>
                    <th className="p-3 align-middle">Tanggal</th>
                    <th className="p-3 align-middle">Status</th>
                    <th className="p-3 align-middle">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {transaksiSummary.map((t, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-3 align-middle">{t.kode_transaksi}</td>

                      <td className="p-3 align-middle">
                        <div className="flex justify-center items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center text-sm font-bold">
                            {t.klien?.charAt(0).toUpperCase()}
                          </div>
                          <span>{t.klien}</span>
                        </div>
                      </td>

                      <td className="p-3 align-middle">{t.layanan}</td>

                      <td className="p-3 align-middle text-green-600 font-semibold">
                        Rp {Number(t.total_untung || 0).toLocaleString("id-ID")}
                      </td>

                      <td className="p-3 align-middle text-sm text-gray-700">
                        {new Date(t.tanggal).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </td>

                      <td className="p-3 align-middle">
                        <span
                          className={`text-xs px-3 py-2 rounded-full
                            ${
                              t.status === "Selesai"
                                ? "bg-green-300 text-green-700"
                                : ""
                            }
                            ${
                              t.status === "Pending"
                                ? "bg-yellow-300 text-yellow-700"
                                : ""
                            }
                            ${t.status === "Batal" ? "bg-red-300" : ""}
                          `}
                        >
                          {t.status}
                        </span>
                      </td>

                      <td className="p-3 align-middle">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedTransaksiId(t.transaksi_id); // ID transaksi yang dipilih
                              setShowPengeluaranModal(true);
                            }}
                            className="text-sm bg-yellow-500 text-white px-3 py-2 rounded hover:bg-yellow-600"
                          >
                            💸 Tambah Pengeluaran
                          </button>
                          <button
                            onClick={async () => {
                              const res = await fetch(
                                `${BASE_URL}/api/transaksi/${t.transaksi_id}`
                              );
                              const data = await res.json();
                              setEditData(data); // <-- inilah yang akan dikirim ke FormTambahTransaksi
                              setShowModal(true);
                            }}
                            className="text-sm bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteTransaksi(t.transaksi_id)
                            }
                            className="text-sm bg-red-500 text-white px-3 py-2 rounded hover:bg-red-700"
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
