import React, { useState } from "react";
const BASE_URL = import.meta.env.VITE_API_URL;

const ModalLaporan = ({ show, onClose }) => {
  const [jenis, setJenis] = useState("mingguan");

  const hitungTanggal = () => {
    const today = new Date();
    let tanggal_awal, tanggal_akhir;

    if (jenis === "mingguan") {
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(today.setDate(diff));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      tanggal_awal = monday.toISOString().split("T")[0];
      tanggal_akhir = sunday.toISOString().split("T")[0];
    } else if (jenis === "bulanan") {
      const year = today.getFullYear();
      const month = today.getMonth();
      tanggal_awal = new Date(year, month, 1).toISOString().split("T")[0];
      tanggal_akhir = new Date(year, month + 1, 0).toISOString().split("T")[0];
    } else {
      const year = today.getFullYear();
      tanggal_awal = `${year}-01-01`;
      tanggal_akhir = `${year}-12-31`;
    }

    return { tanggal_awal, tanggal_akhir };
  };

  const handleExportPDF = () => {
    const { tanggal_awal, tanggal_akhir } = hitungTanggal();
    window.open(
      `${BASE_URL}/api/laporan/export-pdf?tanggal_awal=${tanggal_awal}&tanggal_akhir=${tanggal_akhir}`,
      "_blank"
    );
    onClose(); // tutup modal
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-80">
        <h2 className="text-lg font-semibold mb-4">Pilih Jenis Laporan</h2>
        <select
          className="w-full border rounded p-2 mb-4"
          value={jenis}
          onChange={(e) => setJenis(e.target.value)}
        >
          <option value="mingguan">Mingguan</option>
          <option value="bulanan">Bulanan</option>
          <option value="tahunan">Tahunan</option>
        </select>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
            Tutup
          </button>
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            📤 Export PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalLaporan;
