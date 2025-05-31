const layananModels = require('../models/layananModels');

exports.getAllLayanan = async (req, res) => {
    layananModels.ambilSemuaLayanan((err, layanan) => {
        if (err) {
        console.error('❌ Error saat mengambil semua layanan:', err);
        return res.status(500).json({ error: 'Gagal Mengambil Layanan' });
        }
        res.json(layanan);
    });
}