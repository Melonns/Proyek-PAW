import React, { useState, useEffect } from "react";

export default function FormTambahTransaksi({
  onSubmit,
  onClose,
  initialData,
}) {
  const BASE_URL = import.meta.env.VITE_API_URL;
  const [form, setForm] = useState({
    kode_transaksi: "",
    tanggal: new Date().toISOString().slice(0, 10),
    klien: "",
    status: "Selesai",
    detail: [{ layanan_id: "", jumlah: "", harga: "", keterangan: "" }],
    pengeluaran: [],
  });

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    return date.toISOString().split("T")[0]; // hasil: "2025-05-28"
  };

  const [layananList, setLayananList] = useState([]);

  useEffect(() => {
    fetch(`${BASE_URL}/api/layanan`)
      .then((res) => res.json())
      .then((data) => setLayananList(data))
      .catch((err) => console.error("Gagal fetch layanan:", err));
  }, []);

  useEffect(() => {
    if (initialData) {
      console.log("initialData:", initialData);
      setForm({
        kode_transaksi: initialData.kode_transaksi || "",
        tanggal: initialData.tanggal
          ? formatDate(initialData.tanggal)
          : new Date().toISOString().slice(0, 10),
        klien: initialData.klien || "",
        status: initialData.status || "Selesai",
        detail: initialData.detail?.length
          ? initialData.detail
          : [{ layanan_id: "", jumlah: "", harga: "", keterangan: "" }],
        pengeluaran: initialData.pengeluaran?.length
          ? initialData.pengeluaran
          : [],
      });
    }
  }, [initialData]);

  const handleDetailChange = (index, field, value) => {
    const newDetails = [...form.detail];
    newDetails[index][field] = value;
    setForm({ ...form, detail: newDetails });
  };

  const handlePengeluaranChange = (index, field, value) => {
    const newPengeluaran = [...form.pengeluaran];
    newPengeluaran[index][field] = value;
    setForm({ ...form, pengeluaran: newPengeluaran });
  };

  const addLayanan = () => {
    setForm({
      ...form,
      detail: [
        ...form.detail,
        { layanan_id: "", jumlah: "", harga: "", keterangan: "" },
      ],
    });
  };

  const removeLayanan = (index) => {
    const newDetails = form.detail.filter((_, i) => i !== index);
    setForm({ ...form, detail: newDetails });
  };

  const addPengeluaran = () => {
    setForm({
      ...form,
      pengeluaran: [
        ...form.pengeluaran,
        { keterangan: "", jumlah: "", kategori: "" },
      ],
    });
  };

  const removePengeluaran = (index) => {
    const newList = form.pengeluaran.filter((_, i) => i !== index);
    setForm({ ...form, pengeluaran: newList });
  };

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const isValid = () => {
    if (!form.kode_transaksi || !form.klien) return false;
    if (form.detail.length === 0) return false;

    for (let d of form.detail) {
      if (!d.layanan_id || d.jumlah === "" || d.harga === "") return false;
      if (Number(d.jumlah) <= 0 || Number(d.harga) <= 0) return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid()) return alert("Lengkapi semua data sebelum menyimpan.");

    const cleanForm = {
      ...form,
      detail: form.detail.map((d) => ({
        layanan_id: parseInt(d.layanan_id),
        jumlah: parseInt(d.jumlah),
        harga: parseInt(d.harga),
        keterangan: d.keterangan || "",
      })),
      pengeluaran: form.pengeluaran
        .filter((p) => p.keterangan && p.jumlah)
        .map((p) => ({
          tanggal: form.tanggal,
          keterangan: p.keterangan,
          jumlah: parseInt(p.jumlah),
          kategori: p.kategori || "",
        })),
    };

    onSubmit(cleanForm);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 bg-white rounded shadow max-w-2xl mx-auto"
    >
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
        <div key={index} className="mb-4">
          <div className="flex gap-2 mb-1">
            <select
              className="border p-2 rounded flex-1"
              value={item.layanan_id}
              onChange={(e) =>
                handleDetailChange(index, "layanan_id", e.target.value)
              }
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
              className="border p-2 rounded w-24"
              placeholder="Jumlah"
              value={item.jumlah}
              onChange={(e) =>
                handleDetailChange(index, "jumlah", e.target.value)
              }
            />
            <input
              type="number"
              className="border p-2 rounded w-28"
              placeholder="Harga"
              value={item.harga}
              onChange={(e) =>
                handleDetailChange(index, "harga", e.target.value)
              }
            />
            <button
              type="button"
              onClick={() => removeLayanan(index)}
              className="text-red-500 px-2"
            >
              🗑️
            </button>
          </div>
          <input
            type="text"
            className="border p-2 rounded w-full mt-1"
            placeholder="Keterangan"
            value={item.keterangan}
            onChange={(e) =>
              handleDetailChange(index, "keterangan", e.target.value)
            }
          />
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
