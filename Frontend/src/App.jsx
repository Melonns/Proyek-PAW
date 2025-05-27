import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./Login";
import Dashboard from "./Dashboard";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      {/* Tambahkan rute lain di sini jika diperlukan */}
    </Routes>
  );
}

export default App;
