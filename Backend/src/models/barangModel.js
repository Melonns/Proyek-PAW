const { queryAsync } = require('./db');

async function getAllBarang() {
  const result = await queryAsync("SELECT * FROM Barang");
  return result;
}

async function getBarangByName(nama) {
  const query = `SELECT * FROM Barang WHERE nama = '${nama}'`;
  const result = await queryAsync(query);
  return result;
}

async function insertBarang(id, nama, stok, hargaBeli, hargaJual, terjual) {
  const query = `
    INSERT INTO Barang (nama, stok, hargaBeli, hargaJual, terjual)
    VALUES ('${nama}', ${stok}, ${hargaBeli}, ${hargaJual}, ${terjual})
  `;
  return await queryAsync(query);
}

async function updateBarang(id, nama, stok, hargaBeli, hargaJual, terjual) {
  const query = `
    UPDATE Barang
    SET nama='${nama}', stok=${stok}, hargaBeli=${hargaBeli},
        hargaJual=${hargaJual}, terjual=${terjual}
    WHERE id=${id}
  `;
  return await queryAsync(query);
}

async function deleteBarang(id) {
  const query = `DELETE FROM Barang WHERE id = ${id}`;
  return await queryAsync(query);
}

module.exports = {
  getAllBarang,
  getBarangByName,
  insertBarang,
  updateBarang,
  deleteBarang
};
