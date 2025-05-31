const transaksiModel = require("../models/transaksiModels");

// GET: Semua transaksi lengkap dengan total pendapatan, pengeluaran, dan untung
exports.getAllTransaksi = async (req, res) => {
  try {
    const data = await transaksiModel.getAllTransaksi();
    res.json(data);
  } catch (err) {
    console.error("❌ Error saat mengambil semua transaksi:", err);
    res.status(500).json({ error: "Gagal Mengambil Transaksi" });
  }
};

exports.getTransaksiSummary = async (req, res) => {
  try {
    const data = await transaksiModel.getTransaksiSummary();
    res.json(data);
  } catch (err) {
    console.error("❌ Gagal mengambil summary transaksi:", err);
    res.status(500).json({ error: "Gagal Mengambil Summary Transaksi" });
  }
};

// exports.getAllTransaksi = async (req, res) => {
//   const data = await transaksiModel.getAllTransaksi();
//   res.json(data);
// };

// GET: Statistik total per kategori layanan
exports.getStatistikKategori = async (req, res) => {
  transaksiModel.getAllKategoriTotals((err, result) => {
    if (err) {
      console.error("❌ Gagal mengambil statistik kategori:", err);
      return res.status(500).json({ error: "Gagal Mengambil Statistik" });
    }
    res.json(result);
  });
};

// GET: Detail transaksi berdasarkan ID
exports.getTransaksiById = async (req, res) => {
  const id = req.params.id;

  try {
    const rows = await transaksiModel.getTransaksiById(id); // ✅ langsung pakai await

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "Transaksi tidak ditemukan" });
    }

    const header = rows[0];

    const detail = await transaksiModel.getDetailByTransaksiId(id); // ✅ await langsung
    const pengeluaran = await transaksiModel.getPengeluaranByTanggal(id); // ✅ await langsung

    res.json({
      id: header.id,
      kode_transaksi: header.kode_transaksi,
      tanggal: header.tanggal,
      klien: header.klien,
      status: header.status,
      detail,
      pengeluaran,
    });
  } catch (err) {
    console.error("❌ Gagal mengambil transaksi:", err);
    res.status(500).json({ error: "Gagal Mengambil Transaksi" });
  }
};

// POST: Tambah transaksi baru + detail
exports.insertTransaksi = async (req, res) => {
  try {
    const data = req.body; // { kode_transaksi, tanggal, klien, status, detail: [...] }
    const result = await transaksiModel.insertTransaksi(data); // ✅ pakai await

    res.status(201).json({
      message: "Transaksi berhasil ditambahkan",
      result,
    });
  } catch (err) {
    console.error("❌ Gagal menambahkan transaksi:", err);
    res.status(500).json({ error: "Gagal Menambahkan Transaksi" });
  }
};

// PUT: Update transaksi + detail
exports.updateTransaksi = async (req, res) => {
  const id = req.params.id;
  const data = req.body; // { tanggal, klien, status, detail: [...] }

  try {
    const result = await transaksiModel.updateTransaksi(id, data); // ✅ pakai await
    res.json({ message: "Transaksi berhasil diperbarui", result }); // ✅ kirim respons
  } catch (err) {
    console.error("❌ Gagal mengupdate transaksi:", err);
    res.status(500).json({ error: "Gagal Mengupdate Transaksi" });
  }
};

// DELETE: Hapus transaksi + detail + pengeluaran
exports.deleteTransaksi = async (req, res) => {
  const id = req.params.id;

  try {
    const result = await transaksiModel.deleteTransaksi(id); // ✅ pakai await
    res.json({ message: "Transaksi berhasil dihapus", result }); // ✅ wajib res.json
  } catch (err) {
    console.error("❌ Gagal menghapus transaksi:", err);
    res.status(500).json({ error: "Gagal Menghapus Transaksi" });
  }
};

// POST: Tambah pengeluaran (khusus satu transaksi)
exports.insertPengeluaran = async (req, res) => {
  const transaksi_id = req.params.id;
  const data = { ...req.body, transaksi_id };

  try {
    const result = await transaksiModel.insertPengeluaran(data); // ✅ pakai await
    res.status(201).json({
      message: "Pengeluaran berhasil ditambahkan",
      result,
    });
  } catch (err) {
    console.error("❌ Gagal menambahkan pengeluaran:", err);
    res.status(500).json({ error: "Gagal Menambahkan Pengeluaran" });
  }
};

// GET: Ambil semua pengeluaran per transaksi
exports.getPengeluaranByTransaksiId = async (req, res) => {
  const transaksi_id = req.params.id;

  try {
    const result = await transaksiModel.getPengeluaranByTransaksiId(
      transaksi_id
    );
    res.json(result);
  } catch (err) {
    console.error("❌ Gagal mengambil pengeluaran:", err);
    res.status(500).json({ error: "Gagal Mengambil Pengeluaran" });
  }
};
