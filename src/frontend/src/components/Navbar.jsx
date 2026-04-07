import React from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import falconLogo from "../assets/blue-falcon-logo.png";

export default function Navbar() {
  const navigate  = useNavigate();
  const token     = localStorage.getItem("token");

  const navClass = ({ isActive }) =>
    `ff-nav-link${isActive ? " active" : ""}`;

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <header className="ff-navbar">
      <nav className="ff-navbar-inner">

        {/* Left: Logo & Brand */}
        <Link to="/" className="ff-brand">
          <img src={falconLogo} alt="Falcon Fitness Logo" style={{ width: 34, height: 34, objectFit: "contain" }} />
          Falcon Fitness
        </Link>

        {/* Center: Navigation Links */}
        <div className="ff-nav-links">
          <NavLink to="/"           className={navClass} end>Home</NavLink>
          <NavLink to="/about"      className={navClass}>About</NavLink>
          <NavLink to="/workouts"   className={navClass}>Workouts</NavLink>
          <NavLink to="/nutrition"  className={navClass}>Nutrition</NavLink>
          <NavLink to="/supplements" className={navClass}>Supplements</NavLink>
          {!token && <NavLink to="/quiz" className={navClass}>Quiz</NavLink>}
        </div>

        {/* Right: Auth Actions */}
        <div className="ff-nav-auth">
          {token ? (
            <>
              <NavLink to="/dashboard" className={navClass}>Dashboard</NavLink>
              <NavLink to="/chat"      className={navClass}>Chat</NavLink>
              <NavLink to="/profile"   className={navClass}>Profile</NavLink>
              <button
                onClick={handleLogout}
                className="ff-btn ff-btn-ghost ff-btn-sm"
                style={{ color: "#fca5a5" }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login"  className="ff-btn ff-btn-ghost ff-btn-sm">Login</Link>
              <Link to="/signup" className="ff-btn ff-btn-primary ff-btn-sm">Sign Up</Link>
            </>
          )}
        </div>

      </nav>
    </header>
  );
}
