const db = require('./db');

const ambilSemuaLayanan = (callback) => {
    const query = 'SELECT * FROM layanan ORDER BY id ASC';
    db.query(query, (err, results) => {
        if (err) return callback(err);
        callback(null, results);
    });
}

module.exports = {
    ambilSemuaLayanan
};