const sql = require('msnodesqlv8');

const connectionString = 
  "Driver={ODBC Driver 17 for SQL Server};Server=localhost\\SQLEXPRESS;Database=Proyek;Trusted_Connection=Yes;";

function queryAsync(query) {
  return new Promise((resolve, reject) => {
    sql.query(connectionString, query, (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  });
}

async function testKoneksi() {
  try {
    const result = await queryAsync("SELECT GETDATE() AS waktu");
    console.log("✅ Connected! Waktu:", result[0].waktu);
  } catch (err) {
    console.error("❌ Gagal koneksi:", err);
  }
}

testKoneksi();
