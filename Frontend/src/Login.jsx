import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_API_URL;

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.success) {
        console.log("Login berhasil!");
        localStorage.setItem("isLoggedIn", "true");
        navigate("/dashboard"); // ✅ arahkan user ke dashboard
      } else {
        alert(data.message || "Login gagal");
      }
    } catch (error) {
      console.error("Terjadi error saat login:", error);
      alert("Terjadi kesalahan pada server");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded shadow">
        <div className="text-center mb-6">
          <div className="text-blue-500 text-4xl mb-2">💙</div>
          <h1 className="text-2xl font-bold text-blue-600">MUA Attire</h1>
          <p className="text-gray-600">Wardrobe & Outfit Booking Management</p>
        </div>
        <form onSubmit={handleLogin}>
          <h2 className="text-xl font-semibold text-center mb-4">Sign In</h2>
          <p className="text-center text-sm text-gray-500 mb-6">
            Enter your credentials to access your account
          </p>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
