// Footer component
// This shows at the bottom of every page (through Layout.jsx).
export default function Footer() {
  return (
    // Footer container with a top border
    <footer style={{ borderTop: "1px solid #ddd", padding: "12px 16px" }}>

      {/* Center the footer content and limit width like the navbar */}
      <div style={{ maxWidth: "1100px", margin: "0 auto", fontSize: "14px" }}>
        {/* Automatically shows the current year */}
        © {new Date().getFullYear()} Blue Falcons Inc.
      </div>

    </footer>
  );
}