// Import NavLink from react-router-dom.
// NavLink is used instead of a normal <a> tag because it allows
// React Router to change pages without reloading the whole website.
import { NavLink } from "react-router-dom";


// This function determines the style of each link.
// The "isActive" parameter becomes true when the user is currently on that page.
const linkStyle = ({ isActive }) => ({
  textDecoration: "none",   // Removes underline from links
  padding: "8px 12px",      // Adds space inside the link
  borderRadius: "8px",      // Rounds the edges of the link button
  fontWeight: isActive ? "700" : "500",  // Bold if active page
  background: isActive ? "#eaeaea" : "transparent", // Highlight active page
  color: "black"
});


// Navbar component
// This appears at the top of every page through the Layout component.
export default function Navbar() {
  return (

    // Header container
    <header style={{ borderBottom: "1px solid #ddd" }}>

      {/* Navigation bar */}
      <nav
        style={{
          display: "flex",
          gap: "8px",          // Space between links
          alignItems: "center",
          padding: "12px 16px",
          maxWidth: "1100px",
          margin: "0 auto",    // Centers the navbar
        }}
      >

        {/* Website title / logo area */}
        <div style={{ fontWeight: 800, marginRight: "12px" }}>
          Blue Falcons
        </div>


        {/* Navigation Links */}

        {/* Home Page */}
        <NavLink to="/" style={linkStyle}>
          Home
        </NavLink>

        {/* About Page */}
        <NavLink to="/about" style={linkStyle}>
          About
        </NavLink>

        {/* Fitness Goal Quiz */}
        <NavLink to="/quiz" style={linkStyle}>
          Quiz
        </NavLink>

        {/* AI Diet Plan Page */}
        <NavLink to="/diet" style={linkStyle}>
          Diet Plan
        </NavLink>

        {/* Supplement Recommendations */}
        <NavLink to="/supplements" style={linkStyle}>
          Supplements
        </NavLink>

        {/* User Profile Page */}
        <NavLink to="/profile" style={linkStyle}>
          Profile
        </NavLink>

      </nav>
    </header>
  );
}