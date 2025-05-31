const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool(process.env.DATABASE_URL);

pool.query("SELECT 1")  // tes koneksi
  .then(() => console.log("✅ DB Connected"))
  .catch((err) => console.error("❌ DB Error:", err.message));

module.exports = pool;
