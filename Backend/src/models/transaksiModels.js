const db = require("./db");

// ===== Ambil semua transaksi lengkap dengan total pendapatan, pengeluaran, dan untung =====
const getAllTransaksi = (callback) => {
  const query = `
    SELECT 
      t.id, t.kode_transaksi, t.klien, t.tanggal, t.status,
      GROUP_CONCAT(d.keterangan SEPARATOR ' + ') AS keterangan,
      GROUP_CONCAT(l.nama SEPARATOR ' + ') AS layanan,
      IFNULL(SUM(d.jumlah * d.harga), 0) AS total_pendapatan,
      (
        SELECT IFNULL(SUM(p.jumlah), 0)
        FROM pengeluaran p
        WHERE p.transaksi_id = t.id
      ) AS total_pengeluaran,
      (
        IFNULL(SUM(d.jumlah * d.harga), 0) -
        (
          SELECT IFNULL(SUM(p.jumlah), 0)
          FROM pengeluaran p
          WHERE p.transaksi_id = t.id
        )
      ) AS total_untung
    FROM transaksi t
    LEFT JOIN detail_transaksi d ON t.id = d.transaksi_id
    LEFT JOIN layanan l ON d.layanan_id = l.id
    GROUP BY t.id
    ORDER BY t.tanggal DESC;
  `;

  db.query(query, (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
};

// ===== Rekap total per kategori layanan =====
const getAllKategoriTotals = (callback) => {
  const query = `
    SELECT 
      -- Total pengeluaran
      (SELECT IFNULL(SUM(p.jumlah), 0) FROM pengeluaran p) AS total_pengeluaran,

      -- Total pendapatan kotor
      SUM(d.jumlah * d.harga) AS total_pendapatan_kotor,

      -- Pendapatan bersih per kategori
      IFNULL((
        SUM(CASE WHEN l.nama = 'MUA' THEN d.jumlah * d.harga ELSE 0 END) -
        (
          SUM(CASE WHEN l.nama = 'MUA' THEN d.jumlah * d.harga ELSE 0 END) /
          NULLIF(SUM(d.jumlah * d.harga), 0) *
          (SELECT IFNULL(SUM(p.jumlah), 0) FROM pengeluaran p)
        )
      ), 0) AS total_mua,

      IFNULL((
        SUM(CASE WHEN l.nama = 'Foto' THEN d.jumlah * d.harga ELSE 0 END) -
        (
          SUM(CASE WHEN l.nama = 'Foto' THEN d.jumlah * d.harga ELSE 0 END) /
          NULLIF(SUM(d.jumlah * d.harga), 0) *
          (SELECT IFNULL(SUM(p.jumlah), 0) FROM pengeluaran p)
        )
      ), 0) AS total_foto,

      IFNULL((
        SUM(CASE WHEN l.nama = 'Sewa Baju' THEN d.jumlah * d.harga ELSE 0 END) -
        (
          SUM(CASE WHEN l.nama = 'Sewa Baju' THEN d.jumlah * d.harga ELSE 0 END) /
          NULLIF(SUM(d.jumlah * d.harga), 0) *
          (SELECT IFNULL(SUM(p.jumlah), 0) FROM pengeluaran p)
        )
      ), 0) AS total_sewa_baju,

      -- Jumlah transaksi per kategori
      COUNT(DISTINCT CASE WHEN l.nama = 'MUA' THEN t.id END) AS jumlah_mua,
      COUNT(DISTINCT CASE WHEN l.nama = 'Foto' THEN t.id END) AS jumlah_foto,
      COUNT(DISTINCT CASE WHEN l.nama = 'Sewa Baju' THEN t.id END) AS jumlah_sewa_baju,

      -- Total pendapatan bersih
      IFNULL(SUM(d.jumlah * d.harga) - (SELECT IFNULL(SUM(p.jumlah), 0) FROM pengeluaran p), 0) AS total_semua,

      -- Total jumlah transaksi
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

// ===== Ambil 1 transaksi + semua detail layanan & pengeluarannya =====
const getTransaksiById = (id, callback) => {
  const query = `
    SELECT 
      t.id, t.kode_transaksi, t.klien, t.tanggal, t.status
    FROM transaksi t
    WHERE t.id = ?
  `;

  db.query(query, [id], (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
};

// ===== Ambil detail transaksi berdasarkan transaksi ID =====
const getDetailByTransaksiId = (transaksi_id, callback) => {
  const query = `
    SELECT 
      d.layanan_id, 
      d.jumlah, 
      d.harga, 
      d.keterangan,
      l.nama AS layanan_nama
    FROM detail_transaksi d
    JOIN layanan l ON d.layanan_id = l.id
    WHERE d.transaksi_id = ?
  `;

  db.query(query, [transaksi_id], (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
};

// ===== Ambil pengeluaran berdasarkan transaksi ID (untuk compatibility) =====
const getPengeluaranByTanggal = (transaksi_id, callback) => {
  // Fungsi ini sebenarnya sama dengan getPengeluaranByTransaksiId
  getPengeluaranByTransaksiId(transaksi_id, callback);
};

// ===== Tambah transaksi + detail_transaksi =====
const insertTransaksi = (data, callback) => {
  const { kode_transaksi, tanggal, klien, status, detail } = data;

  // Cek duplikat kode_transaksi
  db.query(
    `SELECT COUNT(*) AS count FROM transaksi WHERE kode_transaksi = ?`,
    [kode_transaksi],
    (err, result) => {
      if (err) return callback(err);
      if (result[0].count > 0) {
        return callback(null, { message: "Kode transaksi sudah digunakan." });
      }

      // Insert transaksi
      db.query(
        `INSERT INTO transaksi (kode_transaksi, tanggal, klien, status)
         VALUES (?, ?, ?, ?)`,
        [kode_transaksi, tanggal, klien, status],
        (err, result) => {
          if (err) return callback(err);
          const transaksiId = result.insertId;

          const values = detail.map((item) => [
            transaksiId,
            item.layanan_id,
            item.jumlah,
            item.harga,
            item.keterangan || null,
          ]);

          db.query(
            `INSERT INTO detail_transaksi (transaksi_id, layanan_id, jumlah, harga, keterangan) VALUES ?`,
            [values],
            (err2) => {
              if (err2) return callback(err2);

              // Ambil nama layanan berdasarkan ID
              const layananIds = detail.map((item) => item.layanan_id);
              db.query(
                `SELECT id, nama FROM layanan WHERE id IN (?)`,
                [layananIds],
                (err3, layananResults) => {
                  if (err3) return callback(err3);

                  const layananMap = {};
                  layananResults.forEach((l) => {
                    layananMap[l.id] = l.nama;
                  });

                  const total = detail.reduce(
                    (acc, d) => acc + d.jumlah * d.harga,
                    0
                  );
                  const layananText = detail
                    .map((d) => layananMap[d.layanan_id])
                    .join(" + ");

                  callback(null, {
                    transaksiBaru: {
                      id: transaksiId,
                      kode_transaksi,
                      tanggal,
                      klien,
                      status,
                      layanan: layananText,
                      total,
                      inisial: klien[0]?.toUpperCase() || "?",
                    },
                  });
                }
              );
            }
          );
        }
      );
    }
  );
};

// ===== Update transaksi + overwrite detail =====
const updateTransaksi = (id, data, callback) => {
  const { tanggal, klien, status, detail } = data;

  db.query(
    `UPDATE transaksi SET tanggal = ?, klien = ?, status = ? WHERE id = ?`,
    [tanggal, klien, status, id],
    (err) => {
      if (err) return callback(err);

      db.query(
        `DELETE FROM detail_transaksi WHERE transaksi_id = ?`,
        [id],
        (err2) => {
          if (err2) return callback(err2);

          const values = detail.map((item) => [
            id,
            item.layanan_id,
            item.jumlah,
            item.harga,
            item.keterangan || null,
          ]);

          db.query(
            `INSERT INTO detail_transaksi (transaksi_id, layanan_id, jumlah, harga, keterangan) VALUES ?`,
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

// ===== Hapus transaksi + detail + pengeluaran =====
const deleteTransaksi = (id, callback) => {
  db.query(`DELETE FROM pengeluaran WHERE transaksi_id = ?`, [id], (err1) => {
    if (err1) return callback(err1);

    db.query(
      `DELETE FROM detail_transaksi WHERE transaksi_id = ?`,
      [id],
      (err2) => {
        if (err2) return callback(err2);

        db.query(`DELETE FROM transaksi WHERE id = ?`, [id], (err3) => {
          if (err3) return callback(err3);
          callback(null, { id });
        });
      }
    );
  });
};

// ===== Tambah pengeluaran untuk transaksi =====
const insertPengeluaran = (data, callback) => {
  const { transaksi_id, tanggal, keterangan, jumlah, kategori } = data;

  db.query(
    `INSERT INTO pengeluaran (transaksi_id, tanggal, keterangan, jumlah, kategori)
     VALUES (?, ?, ?, ?, ?)`,
    [transaksi_id, tanggal, keterangan, jumlah, kategori],
    (err, result) => {
      if (err) return callback(err);
      callback(null, { id: result.insertId });
    }
  );
};

// ===== Ambil pengeluaran berdasarkan transaksi ID =====
const getPengeluaranByTransaksiId = (transaksi_id, callback) => {
  db.query(
    `SELECT * FROM pengeluaran WHERE transaksi_id = ? ORDER BY tanggal ASC`,
    [transaksi_id],
    (err, results) => {
      if (err) return callback(err);
      callback(null, results);
    }
  );
};

// Export semua fungsi
module.exports = {
  getAllTransaksi,
  getAllKategoriTotals,
  getTransaksiById,
  getDetailByTransaksiId, // ✅ Ditambahkan
  getPengeluaranByTanggal, // ✅ Ditambahkan
  insertTransaksi,
  updateTransaksi,
  deleteTransaksi,
  insertPengeluaran,
  getPengeluaranByTransaksiId,
};
