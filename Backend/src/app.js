const express = require('express');
const cors = require('cors');
require('dotenv').config();

const apiPrefix = process.env.API_PREFIX || '/api';

const authRoutes = require('./routes/authRoutes');
const transaksiRoutes = require('./routes/transaksiRoutes');
// const outfitRoutes = require('./routes/outfitRoutes');
// const bookingRoutes = require('./routes/bookingRoutes');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use(`${apiPrefix}/auth`, authRoutes);         // login/register
app.use(`${apiPrefix}/transaksi`, transaksiRoutes);
// app.use(`${apiPrefix}/outfits`, outfitRoutes);    // daftar outfit
// app.use(`${apiPrefix}/bookings`, bookingRoutes);  // pemesanan

app.listen(port, () => {
  console.log(`MUA server running on http://localhost:${port}`);
});
