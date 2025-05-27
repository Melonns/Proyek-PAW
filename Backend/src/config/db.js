// src/config/db.js
const sql = require('msnodesqlv8');

const connectionString = 
  "Driver={ODBC Driver 17 for SQL Server};Server=localhost\\SQLEXPRESS;Database=Proyek;Trusted_Connection=Yes;";

function queryAsync(query) {
  return new Promise((resolve, reject) => {
    sql.query(connectionString, query, (err, result) => {
      if (err) {
        console.error("❌ Query error:", err);
        return reject(err);
      }
      resolve(result);
    });
  });
}

module.exports = {
  queryAsync
};
