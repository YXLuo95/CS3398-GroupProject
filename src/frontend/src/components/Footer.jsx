import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="ff-footer">
      <div className="ff-footer-inner">

        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontWeight: 700, color: "#f8fbff", fontSize: "0.95rem" }}>Falcon Fitness</span>
          <span style={{ color: "#64748b", fontSize: "0.82rem" }}>
            &copy; {new Date().getFullYear()} Falcon Fitness Inc.
          </span>
        </div>

        {/* Footer links */}
        <nav style={{ display: "flex", gap: "1.4rem", flexWrap: "wrap" }}>
          {[
            { to: "/", label: "Home" },
            { to: "/about", label: "About" },
            { to: "/workouts", label: "Workouts" },
            { to: "/nutrition", label: "Nutrition" },
            { to: "/supplements", label: "Supplements" },
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              style={{ color: "#64748b", textDecoration: "none", fontSize: "0.84rem", transition: "color 0.18s" }}
              onMouseOver={(e) => (e.target.style.color = "#a7b4c9")}
              onMouseOut={(e)  => (e.target.style.color = "#64748b")}
            >
              {label}
            </Link>
          ))}
        </nav>

      </div>
    </footer>
  );
}
