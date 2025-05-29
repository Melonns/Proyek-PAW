const db = require('./db');

// Ambil semua transaksi + total dari detail_transaksi
const getAllTransaksi = (callback) => {
  const query = `
    SELECT t.id, t.kode_transaksi, t.klien, t.tanggal, t.status,
           GROUP_CONCAT(l.nama SEPARATOR ' + ') AS layanan,
           SUM(d.jumlah) AS total
    FROM transaksi t
    JOIN detail_transaksi d ON t.id = d.transaksi_id
    JOIN layanan l ON d.layanan_id = l.id
    GROUP BY t.id
    ORDER BY t.tanggal DESC;
  `;
  db.query(query, (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
};

// Jumlah total untuk layanan tertentu (MUA, Sewa Baju, Foto)
const getJumlahByLayanan = (namaLayanan, callback) => {
  const query = `
    SELECT SUM(d.jumlah) AS total
    FROM detail_transaksi d
    JOIN layanan l ON d.layanan_id = l.id
    WHERE l.nama = ?
  `;
  db.query(query, [namaLayanan], (err, results) => {
    if (err) return callback(err);
    callback(null, results[0].total || 0);
  });
};

// Jumlah semua transaksi (tanpa filter)
const getJumlahSemua = (callback) => {
  const query = `SELECT SUM(jumlah) AS total_semua FROM detail_transaksi`;
  db.query(query, (err, results) => {
    if (err) return callback(err);
    callback(null, results[0].total_semua || 0);
  });
};

// Ambil transaksi + detail layanan by ID
const getTransaksiById = (id, callback) => {
  const query = `
    SELECT t.*, l.nama AS layanan, d.jumlah
    FROM transaksi t
    JOIN detail_transaksi d ON t.id = d.transaksi_id
    JOIN layanan l ON d.layanan_id = l.id
    WHERE t.id = ?
  `;
  db.query(query, [id], (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
};

// Tambah transaksi (ke transaksi + detail_transaksi)
const insertTransaksi = (data, callback) => {
  const { kode_transaksi, tanggal, klien, sumber, status, detail } = data;

  // Insert header ke transaksi
  db.query(
    `INSERT INTO transaksi (kode_transaksi, tanggal, klien, sumber, status)
     VALUES (?, ?, ?, ?, ?)`,
    [kode_transaksi, tanggal, klien, sumber, status],
    (err, result) => {
      if (err) return callback(err);
      const transaksiId = result.insertId;

      // Insert ke detail_transaksi
      const values = detail.map(item => [transaksiId, item.layanan_id, item.jumlah]);
      db.query(
        `INSERT INTO detail_transaksi (transaksi_id, layanan_id, jumlah) VALUES ?`,
        [values],
        (err2) => {
          if (err2) return callback(err2);
          callback(null, { id: transaksiId });
        }
      );
    }
  );
};

// Update transaksi (overwrite detail)
const updateTransaksi = (id, data, callback) => {
  const { tanggal, klien, sumber, status, detail } = data;

  db.query(
    `UPDATE transaksi SET tanggal = ?, klien = ?, sumber = ?, status = ? WHERE id = ?`,
    [tanggal, klien, sumber, status, id],
    (err) => {
      if (err) return callback(err);

      // Hapus detail lama
      db.query(`DELETE FROM detail_transaksi WHERE transaksi_id = ?`, [id], (err2) => {
        if (err2) return callback(err2);

        // Insert detail baru
        const values = detail.map(item => [id, item.layanan_id, item.jumlah]);
        db.query(
          `INSERT INTO detail_transaksi (transaksi_id, layanan_id, jumlah) VALUES ?`,
          [values],
          (err3) => {
            if (err3) return callback(err3);
            callback(null, { id });
          }
        );
      });
    }
  );
};

// Hapus transaksi (akan auto hapus detail via FK CASCADE)
const deleteTransaksi = (id, callback) => {
  db.query(`DELETE FROM transaksi WHERE id = ?`, [id], (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
};

module.exports = {
  getAllTransaksi,
  getJumlahByLayanan,
  getJumlahSemua,
  getTransaksiById,
  insertTransaksi,
  updateTransaksi,
  deleteTransaksi
};
