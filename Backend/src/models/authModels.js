const db = require('./db');

const findUserByUsername = (username, callback) => {
  db.query('SELECT * FROM authentication WHERE username = ?', [username], (err, result) => {
    if (err) return callback(err);
    callback(null, result[0]); // ambil satu user
  });
};

module.exports = { findUserByUsername };
