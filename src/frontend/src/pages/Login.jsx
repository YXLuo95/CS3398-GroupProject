import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("token")) navigate("/dashboard");
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);
    try {
      const response = await axios.post(`${API_URL}/api/v1/login/access-token`, formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      localStorage.setItem("token", response.data.access_token);
      navigate("/dashboard");
    } catch {
      setError("Invalid username or password");
    }
  };

  return (
    <main className="ff-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <div className="ff-card" style={{ width: "100%", maxWidth: 460 }}>
        <div className="ff-accent-bar" />
        <div className="ff-card-pad" style={{ padding: "2.2rem 2.4rem" }}>

          <div style={{ textAlign: "center", marginBottom: "1.8rem" }}>
            <span style={{ fontSize: "2.4rem" }}>🦅</span>
            <h1 style={{ margin: "0.6rem 0 0.3rem", fontSize: "1.6rem", fontWeight: 800, color: "#f8fbff" }}>Welcome Back</h1>
            <p style={{ color: "#a7b4c9", fontSize: "0.88rem", margin: 0 }}>Sign in to your Falcon Fitness account</p>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: "1rem" }}>
              <label className="ff-label">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="ff-input"
                placeholder="Your username"
                required
              />
            </div>
            <div style={{ marginBottom: "1.4rem" }}>
              <label className="ff-label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="ff-input"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <p style={{ color: "#f87171", fontSize: "0.86rem", marginBottom: "1rem", textAlign: "center" }}>
                {error}
              </p>
            )}

            <button type="submit" className="ff-btn ff-btn-primary ff-btn-full">
              Sign In
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: "1.4rem", color: "#64748b", fontSize: "0.86rem" }}>
            Don’t have an account?{" "}
            <Link to="/signup" style={{ color: "var(--ff-accent)", textDecoration: "none", fontWeight: 600 }}>Create one free</Link>
          </p>
        </div>
      </div>
    </main>
  );
}