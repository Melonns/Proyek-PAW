import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./Login";
import Dashboard from "./Dashboard";
import DashboardKeuangan from "./DashboardKeuangan";
import PrivateRoute from "./components/PrivateRoute";
import TransaksiDetail from "./TransaksiDetail";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/transaksi-detail/sewa-baju"
        element={<TransaksiDetail kategori="Sewa Baju" />}
      />
      <Route
        path="/transaksi-detail/mua"
        element={<TransaksiDetail kategori="MUA" />}
      />
      <Route
        path="/transaksi-detail/foto"
        element={<TransaksiDetail kategori="Foto" />}
      />
      <Route
        path="/transaksi-detail/semua"
        element={<TransaksiDetail kategori="Semua" />}
      />
    </Routes>
  );
}

export default App;
