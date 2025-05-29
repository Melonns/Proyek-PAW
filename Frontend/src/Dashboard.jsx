import React from "react";

export default function Dashboard() {
  const stats = [
    {
      label: "Total Transaksi Sewa Baju",
      total: "Rp 15.2M",
      jumlah: "42 transaksi",
      icon: "👗",
      bg: "bg-pink-100",
    },
    {
      label: "Total Transaksi MUA",
      total: "Rp 18.5M",
      jumlah: "35 transaksi",
      icon: "🎨",
      bg: "bg-purple-100",
    },
    {
      label: "Total Transaksi Photo",
      total: "Rp 12.8M",
      jumlah: "28 transaksi",
      icon: "📷",
      bg: "bg-blue-100",
    },
    {
      label: "Total Semua Transaksi",
      total: "Rp 46.5M",
      jumlah: "105 transaksi",
      icon: "💵",
      bg: "bg-green-100",
    },
  ];

  const transaksi = [
    {
      id: "TRX-001",
      klien: "Sarah Johnson",
      inisial: "SJ",
      layanan: "MUA",
      jumlah: 850000,
      tanggal: "22 Des 2024",
      waktu: "14:30",
      status: "Selesai",
    },
    {
      id: "TRX-002",
      klien: "Maria Garcia",
      inisial: "MG",
      layanan: "Sewa Baju",
      jumlah: 450000,
      tanggal: "22 Des 2024",
      waktu: "13:15",
      status: "Selesai",
    },
    {
      id: "TRX-003",
      klien: "Lisa Chen",
      inisial: "LC",
      layanan: "Photo Session",
      jumlah: 750000,
      tanggal: "21 Des 2024",
      waktu: "16:45",
      status: "Selesai",
    },
    {
      id: "TRX-004",
      klien: "Anna Putri",
      inisial: "AP",
      layanan: "MUA + Sewa Baju",
      jumlah: 1200000,
      tanggal: "21 Des 2024",
      waktu: "12:00",
      status: "Selesai",
    },
  ];

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
        {stats.map((s, i) => (
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
        ))}
      </div>

      {/* Riwayat transaksi */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold mb-4">
            Riwayat Transaksi Terkini
          </h2>
          <button className="text-xs bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            ➕ Tambah Transaksi
          </button>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-left min-w-[1000px] text-sm">
            <thead className="bg-gray-100 text-gray-600 text-sm">
              <tr>
                <th className="p-3">ID Transaksi</th>
                <th className="p-3">Klien</th>
                <th className="p-3">Layanan</th>
                <th className="p-3">Jumlah</th>
                <th className="p-3">Tanggal & Waktu</th>
                <th className="p-3">Status</th>
                <th className="px-2 py-2 w-[120px]">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {transaksi.map((t, i) => (
                <tr key={i} className="border-t">
                  <td className="p-3 font-medium">{t.id}</td>
                  <td className="p-3 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center text-sm font-bold">
                      {t.inisial}
                    </div>
                    {t.klien}
                  </td>
                  <td className="p-3">{t.layanan}</td>
                  <td className="p-3 text-green-600 font-semibold">
                    Rp {t.jumlah.toLocaleString()}
                  </td>
                  <td className="p-3 text-sm text-gray-700">
                    {t.tanggal}
                    <br />
                    {t.waktu}
                  </td>
                  <td className="p-3">
                    <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">
                      {t.status}
                    </span>
                  </td>

                  <td className="p-3 flex gap-2">
                    <button
                      onClick={() => alert(`Edit ${t.id}`)}
                      className="text-sm bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() =>
                        confirm(`Hapus transaksi ${t.id}?`) &&
                        alert(`Dihapus: ${t.id}`)
                      }
                      className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      🗑️ Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
