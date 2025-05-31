const db = require('./db');

async function findUserByUsername(username) {
  const [result] = await db.query('SELECT * FROM authentication WHERE username = ?', [username]);
  return result[0]; // hanya ambil satu
}

module.exports = { findUserByUsername };
