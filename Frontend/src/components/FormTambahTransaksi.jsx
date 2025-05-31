import React, { useState, useEffect } from "react";

export default function FormTambahTransaksi({ onSubmit }) {
  const [form, setForm] = useState({
    kode_transaksi: "",
    tanggal: new Date().toISOString().slice(0, 10),
    klien: "",
    sumber: "",
    status: "Selesai",
    detail: [{ layanan_id: "", jumlah: "" }],
  });

  const [layananList, setLayananList] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/layanan")
      .then((res) => res.json())
      .then((data) => setLayananList(data))
      .catch((err) => console.error("Gagal fetch layanan:", err));
  }, []);

  const handleDetailChange = (index, field, value) => {
    const newDetails = [...form.detail];
    newDetails[index][field] = value;
    setForm({ ...form, detail: newDetails });
  };

  const addLayanan = () => {
    setForm({ ...form, detail: [...form.detail, { layanan_id: "", jumlah: "" }] });
  };

  const removeLayanan = (index) => {
    const newDetails = form.detail.filter((_, i) => i !== index);
    setForm({ ...form, detail: newDetails });
  };

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.kode_transaksi || !form.klien) return alert("Lengkapi data transaksi.");
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded shadow max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Tambah Transaksi</h2>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <input
          type="text"
          placeholder="Kode Transaksi"
          className="border p-2 rounded"
          value={form.kode_transaksi}
          onChange={(e) => handleChange("kode_transaksi", e.target.value)}
        />
        <input
          type="date"
          className="border p-2 rounded"
          value={form.tanggal}
          onChange={(e) => handleChange("tanggal", e.target.value)}
        />
        <input
          type="text"
          placeholder="Nama Klien"
          className="border p-2 rounded"
          value={form.klien}
          onChange={(e) => handleChange("klien", e.target.value)}
        />
        {/* <input
          type="text"
          placeholder="Sumber (Instagram, Walk-in...)"
          className="border p-2 rounded"
          value={form.sumber}
          onChange={(e) => handleChange("sumber", e.target.value)}
        /> */}
        <select
          className="border p-2 rounded"
          value={form.status}
          onChange={(e) => handleChange("status", e.target.value)}
        >
          <option value="Selesai">Selesai</option>
          <option value="Pending">Pending</option>
          <option value="Batal">Batal</option>
        </select>
      </div>

      <h3 className="font-semibold mb-2">Detail Layanan</h3>
      {form.detail.map((item, index) => (
        <div key={index} className="flex gap-2 mb-2">
          <select
            className="border p-2 rounded flex-1"
            value={item.layanan_id}
            onChange={(e) => handleDetailChange(index, "layanan_id", e.target.value)}
          >
            <option value="">Pilih Layanan</option>
            {layananList.map((layanan) => (
              <option key={layanan.id} value={layanan.id}>
                {layanan.nama}
              </option>
            ))}
          </select>
          <input
            type="number"
            className="border p-2 rounded w-32"
            placeholder="Jumlah"
            value={item.jumlah}
            onChange={(e) => handleDetailChange(index, "jumlah", e.target.value)}
          />
          <button
            type="button"
            onClick={() => removeLayanan(index)}
            className="text-red-500 px-2"
          >
            🗑️
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addLayanan}
        className="text-sm text-blue-600 mb-4"
      >
        ➕ Tambah Layanan
      </button>

      <div className="text-right">
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Simpan Transaksi
        </button>
      </div>
    </form>
  );
}
