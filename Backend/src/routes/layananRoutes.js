const express = require('express');
const router = express.Router();
const transaksiController = require('../controllers/layananController');

// Ambil semua layanan
router.get('/', transaksiController.getAllLayanan);

module.exports = router;