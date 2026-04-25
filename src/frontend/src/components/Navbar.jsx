import React, { useState, useRef, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import falconLogo from "../assets/blue-falcon-logo.png";
import { useSubscription } from "../context/SubscriptionContext";

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const { isPremium, tier } = useSubscription();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const navClass = ({ isActive }) =>
    `ff-nav-link${isActive ? " active" : ""}`;

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const goTo = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  const menuItemStyle = {
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
    width: "100%",
    padding: "0.6rem 0.9rem",
    background: "transparent",
    border: "none",
    color: "#e2e8f0",
    cursor: "pointer",
    textAlign: "left",
    fontSize: "0.88rem",
    transition: "background 0.15s ease",
  };

  return (
    <header className="ff-navbar">
      <nav className="ff-navbar-inner">

        {/* Left: Logo & Brand */}
        <Link to="/" className="ff-brand">
          <img src={falconLogo} alt="Falcon Fitness Logo" style={{ width: 34, height: 34, objectFit: "contain" }} />
          Falcon Fitness
        </Link>

        {/* Center: Public Marketing Links */}
        <div className="ff-nav-links">
          <NavLink to="/"            className={navClass} end>Home</NavLink>
          <NavLink to="/about"       className={navClass}>About</NavLink>
          <NavLink to="/workouts"    className={navClass}>Workouts</NavLink>
          <NavLink to="/nutrition"   className={navClass}>Nutrition</NavLink>
          <NavLink to="/supplements" className={navClass}>Supplements</NavLink>
          {!token && <NavLink to="/quiz" className={navClass}>Quiz</NavLink>}
        </div>

        {/* Right: Auth Actions */}
        <div className="ff-nav-auth">
          {token ? (
            <>
              {/* Upgrade prompt (free users only) */}
              {!isPremium && (
                <NavLink
                  to="/upgrade"
                  className={navClass}
                  style={{ color: "#f59e0b", fontWeight: 700 }}
                >
                  Upgrade ✨
                </NavLink>
              )}

              {/* My Hub dropdown — all logged-in user features */}
              <div ref={menuRef} style={{ position: "relative" }}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.45rem 0.9rem",
                    background: menuOpen
                      ? "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.15))"
                      : "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(139,92,246,0.08))",
                    border: "1px solid rgba(59,130,246,0.3)",
                    borderRadius: "8px",
                    color: "#f8fbff",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    transition: "all 0.15s ease",
                  }}
                >
                  {isPremium && (
                    <span style={{
                      padding: "2px 7px",
                      background: "linear-gradient(135deg, #f59e0b, #a78bfa)",
                      color: "white",
                      borderRadius: "4px",
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      letterSpacing: "0.03em",
                    }}>
                      ★ {tier?.toUpperCase() || "PREMIUM"}
                    </span>
                  )}
                  My Hub
                  <span style={{
                    fontSize: "0.7rem",
                    transition: "transform 0.2s ease",
                    transform: menuOpen ? "rotate(180deg)" : "rotate(0)",
                  }}>
                    ▼
                  </span>
                </button>

                {/* Dropdown panel */}
                {menuOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 6px)",
                      right: 0,
                      minWidth: "200px",
                      background: "#0f1d33",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "10px",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
                      zIndex: 1000,
                      overflow: "hidden",
                      paddingTop: "0.4rem",
                      paddingBottom: "0.4rem",
                    }}
                  >
                    {/* Section: Tracking */}
                    <div style={{
                      fontSize: "0.65rem",
                      color: "#64748b",
                      padding: "0.4rem 0.9rem 0.2rem",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      fontWeight: 700,
                    }}>
                      Tracking
                    </div>

                    <button
                      onClick={() => goTo("/dashboard")}
                      style={menuItemStyle}
                      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(59,130,246,0.1)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      <span>📊</span> Dashboard
                    </button>

                    <button
                      onClick={() => goTo("/history")}
                      style={menuItemStyle}
                      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(59,130,246,0.1)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      <span>📅</span> History
                    </button>

                    {/* Section: Community */}
                    <div style={{
                      fontSize: "0.65rem",
                      color: "#64748b",
                      padding: "0.5rem 0.9rem 0.2rem",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      fontWeight: 700,
                    }}>
                      Community
                    </div>

                    <button
                      onClick={() => goTo("/chat")}
                      style={menuItemStyle}
                      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(59,130,246,0.1)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      <span>💬</span> Chat
                    </button>

                    <button
                      onClick={() => goTo("/forum")}
                      style={menuItemStyle}
                      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(59,130,246,0.1)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      <span>🗨️</span> Forum
                    </button>

                    {/* Section: Account */}
                    <div style={{
                      fontSize: "0.65rem",
                      color: "#64748b",
                      padding: "0.5rem 0.9rem 0.2rem",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      fontWeight: 700,
                    }}>
                      Account
                    </div>

                    <button
                      onClick={() => goTo("/profile")}
                      style={menuItemStyle}
                      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(59,130,246,0.1)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      <span>👤</span> Profile
                    </button>

                    <div style={{
                      height: "1px",
                      background: "rgba(255,255,255,0.08)",
                      margin: "0.4rem 0",
                    }} />

                    <button
                      onClick={() => { setMenuOpen(false); handleLogout(); }}
                      style={{ ...menuItemStyle, color: "#fca5a5" }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(239,68,68,0.1)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      <span>🚪</span> Logout
                    </button>
                  </div>
                )}
              </div>
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
