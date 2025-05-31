const barangModel = require('../models/barangModel');

exports.getAllBarang = async (req, res) => {
    try {
        const barang = await barangModel.getAllBarang();
        res.json(barang);
    } catch (error) {
        console.error('Error fetching all barang:', error);
        res.status(500).json({ error: 'Gagal Mengambil Barang' });
    }
}

exports.getBarangbyName = async (req, res) => {
    try {
        const barang = await barangModel.getBarangByName(req.params.nama);
        if (barang.length === 0) {
            return res.status(404).json({ message: 'Barang tidak ditemukan' });
        }
        res.json(barang);
    } catch (error) {
        console.error('Error fetching all barang:', error);
        res.status(500).json({ error: 'Gagal Mengambil Barang' });
    }
}

exports.insertBarang = async (req, res) => {
    const { id, nama, stok, hargaBeli, hargaJual, terjual } = req.body;
    try {
        const result = await barangModel.insertBarang(id, nama, stok, hargaBeli, hargaJual, terjual);
        res.status(201).json({ message: 'Barang berhasil ditambahkan', result });
    } catch (error) {
        console.error('Error inserting barang:', error);
        res.status(500).json({ error: 'Gagal Menambahkan Barang' });
    }
}

exports.updateBarang = async (req, res) => {
    const { id, nama, stok, hargaBeli, hargaJual, terjual } = req.body;
    try {
        const result = await barangModel.updateBarang(id, nama, stok, hargaBeli, hargaJual, terjual);
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Barang tidak ditemukan' });
        }
        res.json({ message: 'Barang berhasil diperbarui', result });
    } catch (error) {
        console.error('Error updating barang:', error);
        res.status(500).json({ error: 'Gagal Memperbarui Barang' });
    }
}

exports.deleteBarang = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await barangModel.deleteBarang(id);
        res.json({ message: 'Barang berhasil dihapus' });

    } catch (error) {
        console.error('Error deleting barang:', error);
        res.status(500).json({ error: 'Gagal Menghapus Barang' });
    }
};
