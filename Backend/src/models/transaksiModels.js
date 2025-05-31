const db = require("./db");

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
const getAllKategoriTotals = (callback) => {
  const query = `
    SELECT 
      -- Total uang per layanan
      SUM(CASE WHEN l.nama = 'MUA' THEN d.jumlah ELSE 0 END) AS total_mua,
      SUM(CASE WHEN l.nama = 'Foto' THEN d.jumlah ELSE 0 END) AS total_foto,
      SUM(CASE WHEN l.nama = 'Sewa Baju' THEN d.jumlah ELSE 0 END) AS total_sewa_baju,
      
      -- Jumlah transaksi unik per layanan
      COUNT(DISTINCT CASE WHEN l.nama = 'MUA' THEN t.id END) AS jumlah_mua,
      COUNT(DISTINCT CASE WHEN l.nama = 'Foto' THEN t.id END) AS jumlah_foto,
      COUNT(DISTINCT CASE WHEN l.nama = 'Sewa Baju' THEN t.id END) AS jumlah_sewa_baju,

      -- Total semua
      SUM(d.jumlah) AS total_semua,
      COUNT(DISTINCT t.id) AS jumlah_transaksi
    FROM detail_transaksi d
    JOIN layanan l ON d.layanan_id = l.id
    JOIN transaksi t ON d.transaksi_id = t.id
  `;
  db.query(query, (err, results) => {
    if (err) return callback(err);
    callback(null, results[0]);
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
      const values = detail.map((item) => [
        transaksiId,
        item.layanan_id,
        item.jumlah,
      ]);
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
      db.query(
        `DELETE FROM detail_transaksi WHERE transaksi_id = ?`,
        [id],
        (err2) => {
          if (err2) return callback(err2);

          // Insert detail baru
          const values = detail.map((item) => [
            id,
            item.layanan_id,
            item.jumlah,
          ]);
          db.query(
            `INSERT INTO detail_transaksi (transaksi_id, layanan_id, jumlah) VALUES ?`,
            [values],
            (err3) => {
              if (err3) return callback(err3);
              callback(null, { id });
            }
          );
        }
      );
    }
  );
};

// Hapus transaksi (akan auto hapus detail via FK CASCADE)
const deleteTransaksi = (id, callback) => {
  db.query(
    `DELETE FROM detail_transaksi WHERE transaksi_id = ?`,
    [id],
    (err1, result1) => {
      if (err1) return callback(err1);

      db.query(`DELETE FROM transaksi WHERE id = ?`, [id], (err2, result2) => {
        if (err2) return callback(err2);

        callback(null, { detail: result1, transaksi: result2 });
      });
    }
  );
};

module.exports = {
  getAllTransaksi,
  getAllKategoriTotals,
  getTransaksiById,
  insertTransaksi,
  updateTransaksi,
  deleteTransaksi,
};
