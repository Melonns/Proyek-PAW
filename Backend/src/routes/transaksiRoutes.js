const express = require('express');
const router = express.Router();
const transaksiController = require('../controllers/transaksiController');

// Ambil semua transaksi
router.get('/', transaksiController.getAllTransaksi);

router.get('/statistik', transaksiController.getStatistikKategori);

// Ambil transaksi berdasarkan ID
router.get('/:id', transaksiController.getTransaksiById);

// Tambah transaksi baru (termasuk detail)
router.post('/', transaksiController.insertTransaksi);

// Update transaksi berdasarkan ID
router.put('/:id', transaksiController.updateTransaksi);

// Hapus transaksi
router.delete('/:id', transaksiController.deleteTransaksi);

module.exports = router;
