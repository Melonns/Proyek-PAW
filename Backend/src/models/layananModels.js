const db = require('./db');

async function ambilSemuaLayanan() {
  const [results] = await db.query('SELECT * FROM layanan ORDER BY id ASC');
  return results;
}

module.exports = { ambilSemuaLayanan };
