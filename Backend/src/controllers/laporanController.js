const laporanModel = require("../models/laporanModels");
const PDFDocument = require("pdfkit");
const ExcelJS = require("exceljs");

exports.getLaporan = async (req, res) => {
  const { tanggal_awal, tanggal_akhir } = req.query;
  const filter = { tanggal_awal, tanggal_akhir };
  const data = await laporanModel.getAllLaporan(filter);
  res.json(data);
};

exports.exportPDF = async (req, res) => {
  const { tanggal_awal, tanggal_akhir } = req.query;
  const filter = { tanggal_awal, tanggal_akhir };
  const data = await laporanModel.getAllLaporan(filter);

  // Kelompokkan data berdasarkan transaksi_id
  const grouped = {};
  data.forEach((row) => {
    if (!grouped[row.transaksi_id]) {
      grouped[row.transaksi_id] = {
        kode_transaksi: row.kode_transaksi,
        klien: row.klien,
        tanggal: row.tanggal,
        status: row.status,
        details: [],
        pengeluaran: [],
      };
    }

    if (row.detail_harga !== null && row.detail_jumlah !== null) {
      grouped[row.transaksi_id].details.push({
        keterangan: row.detail_keterangan,
        jumlah: row.detail_jumlah,
        harga: row.detail_harga,
      });
    }

    if (row.pengeluaran_keterangan) {
      grouped[row.transaksi_id].pengeluaran.push({
        keterangan: row.pengeluaran_keterangan,
        jumlah: row.pengeluaran_jumlah,
      });
    }
  });

  // Buat dokumen PDF
  const doc = new PDFDocument({ margin: 50 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=laporan_${Date.now()}.pdf`
  );

  doc.fontSize(16).text("Laporan Transaksi", { align: "center" });
  doc.moveDown();

  const transaksiList = Object.values(grouped);
  let grandPendapatan = 0;
  let grandPengeluaran = 0;
  if (transaksiList.length === 0) {
    doc.text("Tidak ada data untuk periode ini.");
  } else {
    transaksiList.forEach((trx, i) => {
      const tanggalFormatted = new Date(trx.tanggal).toLocaleDateString(
        "id-ID",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        }
      );

      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text(
          `${i + 1}. ${trx.kode_transaksi} - ${
            trx.klien
          } - ${tanggalFormatted} - ${trx.status}`
        )
        .font("Helvetica");

      // Detail layanan
      let totalPendapatan = 0;
      trx.details.forEach((d) => {
        const subtotal = (d.harga || 0) * (d.jumlah || 0);
        totalPendapatan += subtotal;

        doc.text(
          `    - ${d.keterangan ?? "Tidak Ada Keterangan"} (${
            d.jumlah ?? 0
          }x) - Rp${(d.harga ?? 0).toLocaleString("id-ID")}`
        );
      });

      // Pengeluaran
      let totalPengeluaran = 0;
      trx.pengeluaran.forEach((p) => {
        const jumlah = p?.jumlah ?? 0;
        totalPengeluaran += jumlah;

        doc.text(
          `    - Pengeluaran: ${
            p.keterangan ?? "—"
          } - Rp${jumlah.toLocaleString("id-ID")}`
        );
      });

      // Total bagian akhir
      doc.text(
        `    Total Pendapatan: Rp${totalPendapatan.toLocaleString("id-ID")}`
      );
      doc.text(
        `    Total Pengeluaran: Rp${totalPengeluaran.toLocaleString("id-ID")}`
      );
      doc.text(
        `    Total Untung: Rp${(
          totalPendapatan - totalPengeluaran
        ).toLocaleString("id-ID")}`
      );
      grandPendapatan += totalPendapatan;
      grandPengeluaran += totalPengeluaran;

      doc.moveDown();
    });
    // Ringkasan Akhir
    doc.addPage();
    doc.moveDown(2);
    doc.font("Helvetica-Bold").text("Ringkasan Akhir", { align: "center" });
    doc.moveDown();

    doc.font("Helvetica");
    doc.text(`Total Transaksi       : ${transaksiList.length} transaksi`);
    doc
      .font("Helvetica")
      .text(
        `Total Pendapatan       : Rp${grandPendapatan.toLocaleString("id-ID")}`
      );
    doc.text(
        `Total Pengeluaran      : Rp${grandPengeluaran.toLocaleString("id-ID")}`
    );
    doc.text(
        `Pendapatan Bersih      : Rp${(
        grandPendapatan - grandPengeluaran
      ).toLocaleString("id-ID")}`
    );
  }

  doc.pipe(res);
  doc.end();
};

exports.exportExcel = async (req, res) => {
  const { tanggal_awal, tanggal_akhir } = req.query;
  const filter = { tanggal_awal, tanggal_akhir };
  const data = await laporanModel.getAllLaporan(filter);

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Laporan");

  sheet.columns = [
    { header: "No", key: "no", width: 5 },
    { header: "Kode Transaksi", key: "kode_transaksi", width: 20 },
    { header: "Klien", key: "klien", width: 20 },
    { header: "Tanggal", key: "tanggal", width: 20 },
  ];

  data.forEach((d, index) => {
    sheet.addRow({
      no: index + 1,
      kode_transaksi: d.kode_transaksi,
      klien: d.klien,
      tanggal: d.tanggal,
    });
  });

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=laporan_${Date.now()}.xlsx`
  );
  await workbook.xlsx.write(res);
  res.end();
};
