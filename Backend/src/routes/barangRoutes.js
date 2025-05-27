const express = require('express');
const router = express.Router();
const barangController = require('../controllers/barangController');

router.get('/', barangController.getAllBarang);
router.get('/:nama', barangController.getBarangbyName);
router.post('/tambah', barangController.insertBarang);
router.put('/update', barangController.updateBarang);
router.delete('/delete/:id', barangController.deleteBarang);

module.exports = router;