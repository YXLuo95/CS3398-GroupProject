import React from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import falconLogo from "../assets/blue-falcon-logo.png";

// Dynamic styling for active navigation links
const linkStyle = ({ isActive }) => ({
  textDecoration: "none",
  padding: "8px 16px",
  borderRadius: "8px",
  fontWeight: isActive ? "bold" : "500",
  background: isActive ? "white" : "transparent",
  color: isActive ? "#0b1f3a" : "white",
  transition: "all 0.3s ease"
});

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation(); // Triggers re-render on route change
  
  // Check authentication status
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <header style={{ backgroundColor: "#061626", position: "sticky", top: 0, zIndex: 1000, boxShadow: "0 2px 10px rgba(0,0,0,0.3)" }}>
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between", 
          alignItems: "center",
          padding: "12px 40px",
          width: "100%",     
          boxSizing: "border-box" 
        }}
      >
        {/* Left: Logo & Brand */}
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", color: "white", fontWeight: "bold", fontSize: "1.4rem" }}>
          <img src={falconLogo} alt="Falcon Fitness Logo" style={{ width: "38px", height: "38px", objectFit: "contain" }} />
          Blue Falcons
        </Link>

        {/* Center: Main Navigation */}
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <NavLink to="/" style={linkStyle}>Home</NavLink>
          <NavLink to="/about" style={linkStyle}>About</NavLink>
          {!token && <NavLink to="/quiz" style={linkStyle}>Quiz</NavLink>}
          <NavLink to="/workouts" style={linkStyle}>Workouts</NavLink>
          <NavLink to="/nutrition" style={linkStyle}>Nutrition</NavLink>
        </div>

        {/* Right: Auth Actions */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {token ? (
            <>
              <NavLink to="/dashboard" style={linkStyle}>Dashboard</NavLink>
              <button onClick={handleLogout} style={{ color: "white", backgroundColor: "#e74c3c", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: "white", textDecoration: "none", padding: "8px 16px", border: "1px solid white", borderRadius: "6px" }}>Login</Link>
              <Link to="/signup" style={{ color: "#0b1f3a", backgroundColor: "white", textDecoration: "none", padding: "8px 16px", borderRadius: "6px", fontWeight: "bold" }}>Sign Up</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}