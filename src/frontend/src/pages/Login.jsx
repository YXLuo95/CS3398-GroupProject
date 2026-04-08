import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function Login() {
  const navigate = useNavigate();

  // View state: 'login' | 'forgot' | 'reset'
  const [view, setView] = useState("login");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetToken, setResetToken] = useState("");

  useEffect(() => {
    if (localStorage.getItem("token")) navigate("/dashboard");
  }, [navigate]);

  const switchView = (newView) => {
    setView(newView);
    setError("");
    setMessage("");
  };

  // Handle standard login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    
    const params = new URLSearchParams();
    params.append("username", username);
    params.append("password", password);
    
    try {
      const response = await axios.post(`${API_URL}/api/v1/login/access-token`, params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      localStorage.setItem("token", response.data.access_token);
      navigate("/dashboard");
    } catch {
      setError("Invalid username or password");
    }
  };

  // Handle forgot password token request
  const handleForgot = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const response = await axios.post(`${API_URL}/api/v1/forgot-password`, {
        username: username,
        email: email
      });
      setResetToken(response.data.reset_token);
      switchView("reset");
      setMessage("Identity verified. Please enter your new password.");
    } catch (err) {
      setError(err.response?.data?.detail || "No matching account found.");
    }
  };

  // Handle actual password reset
  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      await axios.post(`${API_URL}/api/v1/reset-password`, {
        token: resetToken,
        new_password: newPassword
      });
      setPassword(""); 
      setNewPassword("");
      switchView("login");
      setMessage("Password reset successfully! Please sign in with your new password.");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to reset password.");
    }
  };

  return (
    <main className="ff-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <div className="ff-card" style={{ width: "100%", maxWidth: 460 }}>
        <div className="ff-accent-bar" />
        <div className="ff-card-pad" style={{ padding: "2.2rem 2.4rem" }}>

          <div style={{ textAlign: "center", marginBottom: "1.8rem" }}>
            <span style={{ fontSize: "2.4rem" }}>🦅</span>
            <h1 style={{ margin: "0.6rem 0 0.3rem", fontSize: "1.6rem", fontWeight: 800, color: "#f8fbff" }}>
              {view === "login" && "Welcome Back"}
              {view === "forgot" && "Recover Account"}
              {view === "reset" && "Set New Password"}
            </h1>
            <p style={{ color: "#a7b4c9", fontSize: "0.88rem", margin: 0 }}>
              {view === "login" && "Sign in to your Falcon Fitness account"}
              {view === "forgot" && "Enter your details to verify your identity"}
              {view === "reset" && "Make sure it's a strong one"}
            </p>
          </div>

          {message && (
            <div style={{ padding: "10px", backgroundColor: "rgba(46, 204, 113, 0.1)", border: "1px solid #2ecc71", borderRadius: "6px", color: "#2ecc71", fontSize: "0.86rem", marginBottom: "1rem", textAlign: "center" }}>
              {message}
            </div>
          )}

          {error && (
            <p style={{ color: "#f87171", fontSize: "0.86rem", marginBottom: "1rem", textAlign: "center" }}>
              {error}
            </p>
          )}

          {/* View: Login */}
          {view === "login" && (
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
              <div style={{ marginBottom: "0.5rem" }}>
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
              
              <div style={{ textAlign: "right", marginBottom: "1.4rem" }}>
                <button 
                  type="button" 
                  onClick={() => switchView("forgot")}
                  style={{ background: "none", border: "none", color: "var(--ff-accent)", fontSize: "0.8rem", cursor: "pointer", padding: 0 }}
                >
                  Forgot password?
                </button>
              </div>

              <button type="submit" className="ff-btn ff-btn-primary ff-btn-full">
                Sign In
              </button>
            </form>
          )}

          {/* View: Forgot Password */}
          {view === "forgot" && (
            <form onSubmit={handleForgot}>
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
                <label className="ff-label">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="ff-input"
                  placeholder="account@example.com"
                  required
                />
              </div>

              <button type="submit" className="ff-btn ff-btn-primary ff-btn-full" style={{ marginBottom: "1rem" }}>
                Verify Identity
              </button>
              
              <button 
                type="button" 
                className="ff-btn ff-btn-ghost ff-btn-full" 
                onClick={() => switchView("login")}
              >
                Back to Sign In
              </button>
            </form>
          )}

          {/* View: Reset Password */}
          {view === "reset" && (
            <form onSubmit={handleReset}>
              <div style={{ marginBottom: "1.4rem" }}>
                <label className="ff-label">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="ff-input"
                  placeholder="Enter new password"
                  required
                  minLength={6}
                />
              </div>

              <button type="submit" className="ff-btn ff-btn-primary ff-btn-full" style={{ marginBottom: "1rem" }}>
                Reset Password
              </button>
              
              <button 
                type="button" 
                className="ff-btn ff-btn-ghost ff-btn-full" 
                onClick={() => switchView("login")}
              >
                Cancel
              </button>
            </form>
          )}

          {view === "login" && (
            <p style={{ textAlign: "center", marginTop: "1.4rem", color: "#64748b", fontSize: "0.86rem" }}>
              Don’t have an account?{" "}
              <Link to="/signup" style={{ color: "var(--ff-accent)", textDecoration: "none", fontWeight: 600 }}>Create one free</Link>
            </p>
          )}
        </div>
      </div>
    </main>
  );
}