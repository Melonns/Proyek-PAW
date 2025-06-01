const db = require("./db"); // mysql2/promise pool

exports.getAllLaporan = async ({ tanggal_awal, tanggal_akhir }) => {
  const query = `
    SELECT 
      t.id AS transaksi_id,
      t.kode_transaksi,
      t.klien,
      t.tanggal,
      t.status,
      d.keterangan AS detail_keterangan,
      d.jumlah AS detail_jumlah,
      d.harga AS detail_harga,
      p.keterangan AS pengeluaran_keterangan,
      p.jumlah AS pengeluaran_jumlah
    FROM transaksi t
    LEFT JOIN detail_transaksi d ON d.transaksi_id = t.id
    LEFT JOIN pengeluaran p ON p.transaksi_id = t.id
    WHERE t.tanggal BETWEEN ? AND ?
    ORDER BY t.tanggal DESC, t.id;
  `;
  const [rows] = await db.query(query, [tanggal_awal, tanggal_akhir]);
  return rows;
};
