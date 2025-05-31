const layananModels = require('../models/layananModels');

exports.getAllLayanan = async (req, res) => {
  try {
    const layanan = await layananModels.ambilSemuaLayanan();
    res.json(layanan); // ✅ kirim response
  } catch (err) {
    console.error('❌ Error saat mengambil semua layanan:', err);
    res.status(500).json({ error: 'Gagal Mengambil Layanan' });
  }
};
