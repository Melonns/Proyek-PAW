const db = require("./db");

// async function getAllTransaksi() {
async function getAllTransaksi() {
  const [transaksi] = await db.query(`
    SELECT 
      t.id, t.kode_transaksi, t.klien, t.tanggal, t.status,
      d.keterangan,
      l.nama AS layanan,
      d.jumlah,
      d.harga,
      d.jumlah * d.harga AS subtotal
    FROM transaksi t
    LEFT JOIN detail_transaksi d ON t.id = d.transaksi_id
    LEFT JOIN layanan l ON d.layanan_id = l.id
    ORDER BY t.tanggal DESC
  `);

  const [pengeluaran] = await db.query(`
    SELECT transaksi_id, kategori AS layanan, SUM(jumlah) AS total_pengeluaran
    FROM pengeluaran
    GROUP BY transaksi_id, kategori
  `);

  // Map pengeluaran berdasarkan transaksi + layanan
  const pengeluaranMap = {};
  pengeluaran.forEach((p) => {
    pengeluaranMap[`${p.transaksi_id}-${p.layanan}`] = p.total_pengeluaran;
  });

  const result = transaksi.map((row) => {
    const key = `${row.id}-${row.layanan}`;
    const pengeluaran = pengeluaranMap[key] || 0;
    const untung = (row.subtotal || 0) - pengeluaran;

    return {
      ...row,
      total_pengeluaran: pengeluaran,
      total_untung: untung,
    };
  });

  return result;
}

async function getTransaksiSummary() {
  const [transaksi] = await db.query(`
    SELECT 
      t.id AS transaksi_id,
      t.kode_transaksi,
      t.klien,
      t.tanggal,
      t.status,
      d.keterangan,
      l.nama AS layanan,
      d.jumlah,
      d.harga,
      (d.jumlah * d.harga) AS subtotal,
      IFNULL((
        SELECT SUM(jumlah) FROM pengeluaran WHERE transaksi_id = t.id
      ), 0) AS total_pengeluaran,
      0 AS total_untung -- dihitung nanti
    FROM transaksi t
    LEFT JOIN detail_transaksi d ON t.id = d.transaksi_id
    LEFT JOIN layanan l ON d.layanan_id = l.id
    ORDER BY t.tanggal DESC
  `);

  // Grouping manual
  const grouped = {};

  for (const row of transaksi) {
    const id = row.transaksi_id;

    if (!grouped[id]) {
      grouped[id] = {
        transaksi_id: id,
        kode_transaksi: row.kode_transaksi,
        klien: row.klien,
        tanggal: row.tanggal,
        status: row.status,
        layanan: [],
        keterangan: [],
        total_pendapatan: 0,
        total_pengeluaran: Number(row.total_pengeluaran || 0),
        total_untung: 0, // dihitung nanti
      };
    }

    if (row.layanan) grouped[id].layanan.push(row.layanan);
    if (row.keterangan) grouped[id].keterangan.push(row.keterangan);
    grouped[id].total_pendapatan += Number(row.subtotal || 0);
  }

  // Hitung total untung
  const summary = Object.values(grouped).map((t) => ({
    ...t,
    layanan: t.layanan.join(" + "),
    keterangan: t.keterangan.join(" + "),
    total_untung: t.total_pendapatan - t.total_pengeluaran,
  }));

  return summary;
}

// models/transaksiModel.js
// async function getAllTransaksi() {
//   const [results] = await db.query(`
//     SELECT
//       t.id, t.kode_transaksi, t.klien, t.tanggal, t.status,
//       d.keterangan,
//       l.nama AS layanan,
//       d.jumlah * d.harga AS total
//     FROM transaksi t
//     LEFT JOIN detail_transaksi d ON t.id = d.transaksi_id
//     LEFT JOIN layanan l ON d.layanan_id = l.id
//     ORDER BY t.tanggal DESC
//     LIMIT 10
//   `);
//   return results;
// }

async function getAllKategoriTotals() {
  const [results] = await db.query(`
    SELECT 
      (SELECT IFNULL(SUM(p.jumlah), 0) FROM pengeluaran p) AS total_pengeluaran,
      SUM(d.jumlah * d.harga) AS total_pendapatan_kotor,
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
      COUNT(DISTINCT CASE WHEN l.nama = 'MUA' THEN t.id END) AS jumlah_mua,
      COUNT(DISTINCT CASE WHEN l.nama = 'Foto' THEN t.id END) AS jumlah_foto,
      COUNT(DISTINCT CASE WHEN l.nama = 'Sewa Baju' THEN t.id END) AS jumlah_sewa_baju,
      IFNULL(SUM(d.jumlah * d.harga) - (SELECT IFNULL(SUM(p.jumlah), 0) FROM pengeluaran p), 0) AS total_semua,
      COUNT(DISTINCT t.id) AS jumlah_transaksi
    FROM detail_transaksi d
    JOIN layanan l ON d.layanan_id = l.id
    JOIN transaksi t ON d.transaksi_id = t.id
  `);
  return results[0];
}

async function getTransaksiById(id) {
  const [results] = await db.query(
    `SELECT id, kode_transaksi, klien, tanggal, status FROM transaksi WHERE id = ?`,
    [id]
  );
  return results;
}

async function getDetailByTransaksiId(transaksi_id) {
  const [results] = await db.query(
    `SELECT d.layanan_id, d.jumlah, d.harga, d.keterangan, l.nama AS layanan_nama
     FROM detail_transaksi d
     JOIN layanan l ON d.layanan_id = l.id
     WHERE d.transaksi_id = ?`,
    [transaksi_id]
  );
  return results;
}

async function getPengeluaranByTransaksiId(transaksi_id) {
  const [results] = await db.query(
    `SELECT * FROM pengeluaran WHERE transaksi_id = ? ORDER BY tanggal ASC`,
    [transaksi_id]
  );
  return results;
}

// Alias
const getPengeluaranByTanggal = getPengeluaranByTransaksiId;

async function insertTransaksi(data) {
  const { kode_transaksi, tanggal, klien, status, detail } = data;

  const [[{ count }]] = await db.query(
    `SELECT COUNT(*) AS count FROM transaksi WHERE kode_transaksi = ?`,
    [kode_transaksi]
  );
  if (count > 0) {
    return { message: "Kode transaksi sudah digunakan." };
  }

  const [result] = await db.query(
    `INSERT INTO transaksi (kode_transaksi, tanggal, klien, status)
     VALUES (?, ?, ?, ?)`,
    [kode_transaksi, tanggal, klien, status]
  );

  const transaksiId = result.insertId;
  const values = detail.map((item) => [
    transaksiId,
    item.layanan_id,
    item.jumlah,
    item.harga,
    item.keterangan || null,
  ]);

  await db.query(
    `INSERT INTO detail_transaksi (transaksi_id, layanan_id, jumlah, harga, keterangan) VALUES ?`,
    [values]
  );

  const [layananResults] = await db.query(
    `SELECT id, nama FROM layanan WHERE id IN (?)`,
    [detail.map((item) => item.layanan_id)]
  );

  const layananMap = {};
  layananResults.forEach((l) => {
    layananMap[l.id] = l.nama;
  });

  const total = detail.reduce((acc, d) => acc + d.jumlah * d.harga, 0);
  const layananText = detail.map((d) => layananMap[d.layanan_id]).join(" + ");

  return {
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
  };
}

async function updateTransaksi(id, data) {
  const { tanggal, klien, status, detail } = data;

  await db.query(
    `UPDATE transaksi SET tanggal = ?, klien = ?, status = ? WHERE id = ?`,
    [tanggal, klien, status, id]
  );

  await db.query(`DELETE FROM detail_transaksi WHERE transaksi_id = ?`, [id]);

  const values = detail.map((item) => [
    id,
    item.layanan_id,
    item.jumlah,
    item.harga,
    item.keterangan || null,
  ]);

  await db.query(
    `INSERT INTO detail_transaksi (transaksi_id, layanan_id, jumlah, harga, keterangan) VALUES ?`,
    [values]
  );

  return { id };
}

async function deleteTransaksi(id) {
  await db.query(`DELETE FROM pengeluaran WHERE transaksi_id = ?`, [id]);
  await db.query(`DELETE FROM detail_transaksi WHERE transaksi_id = ?`, [id]);
  await db.query(`DELETE FROM transaksi WHERE id = ?`, [id]);
  return { id };
}

async function insertPengeluaran(data) {
  const { transaksi_id, tanggal, keterangan, jumlah, kategori } = data;

  const [result] = await db.query(
    `INSERT INTO pengeluaran (transaksi_id, tanggal, keterangan, jumlah, kategori)
     VALUES (?, ?, ?, ?, ?)`,
    [transaksi_id, tanggal, keterangan, jumlah, kategori]
  );

  return { id: result.insertId };
}

module.exports = {
  getAllTransaksi,
  getAllKategoriTotals,
  getTransaksiById,
  getDetailByTransaksiId,
  getPengeluaranByTanggal,
  insertTransaksi,
  updateTransaksi,
  deleteTransaksi,
  insertPengeluaran,
  getPengeluaranByTransaksiId,
  getTransaksiSummary,
};
