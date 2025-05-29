import React from "react";

export default function DashboardKeuangan() {
  const transaksi = [
    { tanggal: "2025-05-27", keterangan: "Wisuda 4 orang", tipe: "masuk", jumlah: 1900000 },
    { tanggal: "2025-05-27", keterangan: "Cetak foto", tipe: "keluar", jumlah: 55000 },
    { tanggal: "2025-05-27", keterangan: "Honor stylist", tipe: "keluar", jumlah: 85000 },
    { tanggal: "2025-05-26", keterangan: "Sewa jas atasan", tipe: "masuk", jumlah: 120000 },
  ];

  const totalMasuk = transaksi.filter(t => t.tipe === "masuk").reduce((acc, curr) => acc + curr.jumlah, 0);
  const totalKeluar = transaksi.filter(t => t.tipe === "keluar").reduce((acc, curr) => acc + curr.jumlah, 0);
  const saldo = totalMasuk - totalKeluar;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-indigo-600 mb-2">Dashboard Keuangan</h1>
      <p className="text-gray-600 mb-6">Rekap pemasukan dan pengeluaran berdasarkan transaksi</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatBox label="Total Masuk" value={`Rp ${totalMasuk.toLocaleString()}`} color="green" />
        <StatBox label="Total Keluar" value={`Rp ${totalKeluar.toLocaleString()}`} color="red" />
        <StatBox label="Saldo" value={`Rp ${saldo.toLocaleString()}`} color="blue" />
      </div>

      <div className="bg-white rounded shadow p-4">
        <h2 className="text-xl font-semibold mb-4">Riwayat Transaksi Terbaru</h2>
        <table className="w-full text-left border">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2">Tanggal</th>
              <th className="p-2">Keterangan</th>
              <th className="p-2">Tipe</th>
              <th className="p-2">Jumlah</th>
            </tr>
          </thead>
          <tbody>
            {transaksi.map((t, i) => (
              <tr key={i} className="border-t">
                <td className="p-2">{t.tanggal}</td>
                <td className="p-2">{t.keterangan}</td>
                <td className={`p-2 ${t.tipe === "masuk" ? "text-green-600" : "text-red-600"}`}>
                  {t.tipe}
                </td>
                <td className="p-2">Rp {t.jumlah.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatBox({ label, value, color }) {
  const colors = {
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    blue: "bg-blue-100 text-blue-700",
  };

  return (
    <div className={`rounded shadow p-4 ${colors[color]} font-semibold`}>
      <p>{label}</p>
      <h2 className="text-2xl">{value}</h2>
    </div>
  );
}
