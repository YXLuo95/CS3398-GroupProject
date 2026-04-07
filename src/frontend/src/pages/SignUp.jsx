import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function SignUp() {
  const [username, setUsername] = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("token")) navigate("/dashboard");
  }, [navigate]);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await axios.post(`${API_URL}/api/v1/register`, { username, email, password });
      navigate("/login");
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail))          setError(detail.map((item) => item.msg).join(", "));
      else if (typeof detail === "string") setError(detail);
      else                                 setError("Registration failed");
    }
  };

  return (
    <main className="ff-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <div className="ff-card" style={{ width: "100%", maxWidth: 460 }}>
        <div className="ff-accent-bar" style={{ background: "linear-gradient(90deg, var(--ff-green), var(--ff-cyan))" }} />
        <div className="ff-card-pad" style={{ padding: "2.2rem 2.4rem" }}>

          <div style={{ textAlign: "center", marginBottom: "1.8rem" }}>
            <span style={{ fontSize: "2.4rem" }}>🚀</span>
            <h1 style={{ margin: "0.6rem 0 0.3rem", fontSize: "1.6rem", fontWeight: 800, color: "#f8fbff" }}>Create Account</h1>
            <p style={{ color: "#a7b4c9", fontSize: "0.88rem", margin: 0 }}>Start your Falcon Fitness journey today</p>
          </div>

          <form onSubmit={handleSignUp}>
            <div style={{ marginBottom: "1rem" }}>
              <label className="ff-label">Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="ff-input" placeholder="Choose a username" required />
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label className="ff-label">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="ff-input" placeholder="your@email.com" required />
            </div>
            <div style={{ marginBottom: "1.4rem" }}>
              <label className="ff-label">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="ff-input" placeholder="••••••••" required />
            </div>

            {error && (
              <p style={{ color: "#f87171", fontSize: "0.86rem", marginBottom: "1rem", textAlign: "center" }}>
                {error}
              </p>
            )}

            <button type="submit" className="ff-btn ff-btn-green ff-btn-full">
              Create My Account
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: "1.4rem", color: "#64748b", fontSize: "0.86rem" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "var(--ff-accent)", textDecoration: "none", fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </main>
  );
}