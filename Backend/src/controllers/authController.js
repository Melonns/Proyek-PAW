const bcrypt = require("bcrypt");
const db = require("../models/db"); // ✅ koneksi ke MySQL
const User = require("../models/authModels"); // ✅ model untuk query user

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findUserByUsername(username); // ✅ langsung pakai await

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User tidak ditemukan" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res
        .status(401)
        .json({ success: false, message: "Password salah" });
    }

    res.json({ success: true, message: "Login berhasil" });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.register = async (req, res) => {
  const { username, password } = req.body;

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    db.query(
      "INSERT INTO authentication (username, password) VALUES (?, ?)",
      [username, hashedPassword],
      (err, result) => {
        if (err)
          return res.status(500).json({ success: false, message: err.message });

        res.json({ success: true, message: "Register berhasil" });
      }
    );
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
