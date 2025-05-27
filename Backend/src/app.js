const express = require('express');
const cors = require('cors');
require('dotenv').config();
const apiPrefix = process.env.API_PREFIX || '/api';

const barangRoutes = require('./routes/barangRoutes');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use(`${apiPrefix}/barang`, barangRoutes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})