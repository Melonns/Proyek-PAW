import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./Login";
import Dashboard from "./Dashboard";
import DashboardKeuangan from "./DashboardKeuangan";
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
      <Route path="/dashboardkeuangan" element={<DashboardKeuangan />} />
    </Routes>
  );
}

export default App;
