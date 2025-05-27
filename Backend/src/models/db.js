const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',          // default XAMPP password biasanya kosong
  database: 'mua_attire' // ganti sesuai nama database kamu
});

connection.connect((err) => {
  if (err) throw err;
  console.log('🟢 Connected to MySQL!');
});

module.exports = connection;
