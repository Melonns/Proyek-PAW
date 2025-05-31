const transaksiModel = require("../models/transaksiModels");

// GET: Semua transaksi lengkap dengan total pendapatan, pengeluaran, dan untung
exports.getAllTransaksi = async (req, res) => {
  transaksiModel.getAllTransaksi((err, transaksi) => {
    if (err) {
      console.error("❌ Error saat mengambil semua transaksi:", err);
      return res.status(500).json({ error: "Gagal Mengambil Transaksi" });
    }
    res.json(transaksi);
  });
};

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

  transaksiModel.getTransaksiById(id, async (err, rows) => {
    if (err) {
      console.error("❌ Error saat mengambil transaksi by ID:", err);
      return res.status(500).json({ error: "Gagal Mengambil Transaksi" });
    }

    // ✅ PERBAIKAN: Gunakan 'rows' bukan 'transaksi'
    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "Transaksi tidak ditemukan" });
    }

    const header = rows[0]; // ✅ PERBAIKAN: Gunakan 'rows'
    const tanggal = header.tanggal;

    try {
      // Ambil detail layanan
      const detail = await new Promise((resolve, reject) => {
        transaksiModel.getDetailByTransaksiId(id, (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        });
      });

      // Ambil pengeluaran berdasarkan transaksi ID
      const pengeluaran = await new Promise((resolve, reject) => {
        transaksiModel.getPengeluaranByTanggal(id, (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        });
      });

      res.json({
        id: header.id,
        kode_transaksi: header.kode_transaksi,
        tanggal: header.tanggal,
        klien: header.klien,
        status: header.status,
        detail,
        pengeluaran,
      });
    } catch (e) {
      console.error("❌ Gagal mengambil detail/pengeluaran:", e);
      res.status(500).json({ error: "Gagal Mengambil Detail/Pengeluaran" });
    }
  });
};

// POST: Tambah transaksi baru + detail
exports.insertTransaksi = async (req, res) => {
  const data = req.body; // { kode_transaksi, tanggal, klien, status, detail: [ { layanan_id, jumlah } ] }

  transaksiModel.insertTransaksi(data, (err, result) => {
    if (err) {
      console.error("❌ Gagal menambahkan transaksi:", err);
      return res.status(500).json({ error: "Gagal Menambahkan Transaksi" });
    }
    res.status(201).json({ message: "Transaksi berhasil ditambahkan", result });
  });
};

// PUT: Update transaksi + detail
exports.updateTransaksi = async (req, res) => {
  const id = req.params.id;
  const data = req.body; // { tanggal, klien, status, detail: [ { layanan_id, jumlah } ] }

  transaksiModel.updateTransaksi(id, data, (err, result) => {
    if (err) {
      console.error("❌ Gagal mengupdate transaksi:", err);
      return res.status(500).json({ error: "Gagal Mengupdate Transaksi" });
    }
    res.json({ message: "Transaksi berhasil diperbarui", result });
  });
};

// DELETE: Hapus transaksi + detail + pengeluaran
exports.deleteTransaksi = async (req, res) => {
  const id = req.params.id;

  transaksiModel.deleteTransaksi(id, (err, result) => {
    if (err) {
      console.error("❌ Gagal menghapus transaksi:", err);
      return res.status(500).json({ error: "Gagal Menghapus Transaksi" });
    }
    res.json({ message: "Transaksi berhasil dihapus", result });
  });
};

// POST: Tambah pengeluaran (khusus satu transaksi)
exports.insertPengeluaran = async (req, res) => {
  const transaksi_id = req.params.id; // ✅ Ambil dari params
  const data = { ...req.body, transaksi_id }; // ✅ Gabungkan dengan body

  transaksiModel.insertPengeluaran(data, (err, result) => {
    if (err) {
      console.error("❌ Gagal menambahkan pengeluaran:", err);
      return res.status(500).json({ error: "Gagal Menambahkan Pengeluaran" });
    }
    res
      .status(201)
      .json({ message: "Pengeluaran berhasil ditambahkan", result });
  });
};

// GET: Ambil semua pengeluaran per transaksi
exports.getPengeluaranByTransaksiId = async (req, res) => {
  const transaksi_id = req.params.id;

  transaksiModel.getPengeluaranByTransaksiId(transaksi_id, (err, result) => {
    if (err) {
      console.error("❌ Gagal mengambil pengeluaran:", err);
      return res.status(500).json({ error: "Gagal Mengambil Pengeluaran" });
    }
    res.json(result);
  });
};