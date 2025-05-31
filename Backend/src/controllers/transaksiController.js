const transaksiModel = require('../models/transaksiModels');

// Ambil semua transaksi (dengan layanan + total)
exports.getAllTransaksi = async (req, res) => {
  transaksiModel.getAllTransaksi((err, transaksi) => {
    if (err) {
      console.error('❌ Error saat mengambil semua transaksi:', err);
      return res.status(500).json({ error: 'Gagal Mengambil Transaksi' });
    }
    res.json(transaksi);
  });
};

// Ambil total kategori: MUA, Foto, Sewa Baju, Semua
exports.getStatistikKategori = async (req, res) => {
  transaksiModel.getAllKategoriTotals((err, result) => {
    if (err) {
      console.error('❌ Gagal mengambil statistik kategori:', err);
      return res.status(500).json({ error: 'Gagal Mengambil Statistik' });
    }
    res.json(result); // return: { total_mua, total_foto, total_sewa_baju, total_semua }
  });
};


// Ambil transaksi berdasarkan ID
exports.getTransaksiById = async (req, res) => {
  const id = req.params.id;
  transaksiModel.getTransaksiById(id, (err, transaksi) => {
    if (err) {
      console.error('❌ Error saat mengambil transaksi by ID:', err);
      return res.status(500).json({ error: 'Gagal Mengambil Transaksi' });
    }
    if (transaksi.length === 0) {
      return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
    }
    res.json(transaksi);
  });
};

// Tambah transaksi baru
exports.insertTransaksi = async (req, res) => {
  const data = req.body; // Harus berisi: kode_transaksi, tanggal, klien, sumber, status, detail[ { layanan_id, jumlah } ]
  
  transaksiModel.insertTransaksi(data, (err, result) => {
    if (err) {
      console.error('❌ Gagal menambahkan transaksi:', err);
      return res.status(500).json({ error: 'Gagal Menambahkan Transaksi' });
    }
    res.status(201).json({ message: 'Transaksi berhasil ditambahkan', result });
  });
};

// Update transaksi
exports.updateTransaksi = async (req, res) => {
  const id = req.params.id;
  const data = req.body; // Sama seperti insert, harus berisi header dan detail

  transaksiModel.updateTransaksi(id, data, (err, result) => {
    if (err) {
      console.error('❌ Gagal mengupdate transaksi:', err);
      return res.status(500).json({ error: 'Gagal Mengupdate Transaksi' });
    }
    res.json({ message: 'Transaksi berhasil diperbarui', result });
  });
};

// Hapus transaksi
exports.deleteTransaksi = async (req, res) => {
  const id = req.params.id;
  transaksiModel.deleteTransaksi(id, (err, result) => {
    if (err) {
      console.error('❌ Gagal menghapus transaksi:', err);
      return res.status(500).json({ error: 'Gagal Menghapus Transaksi' });
    }
    res.json({ message: 'Transaksi berhasil dihapus', result });
  });
};
