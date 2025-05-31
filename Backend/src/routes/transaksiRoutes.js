const express = require('express');
const router = express.Router();
const transaksiController = require('../controllers/transaksiController');

router.get('/', transaksiController.getAllTransaksi);
router.get('/statistik', transaksiController.getStatistikKategori);
router.get('/:id', transaksiController.getTransaksiById);
router.post('/', transaksiController.insertTransaksi);
router.put('/:id', transaksiController.updateTransaksi);
router.delete('/:id', transaksiController.deleteTransaksi);

// Pengeluaran
router.post('/:id/pengeluaran', transaksiController.insertPengeluaran);
router.get('/:id/pengeluaran', transaksiController.getPengeluaranByTransaksiId);

module.exports = router;
