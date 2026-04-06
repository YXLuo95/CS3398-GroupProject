import { Link } from "react-router-dom";

const pageStyle = {
  minHeight: "100vh",
  background: "radial-gradient(circle at 30% 20%, #29426d, #0b1727 58%, #050b17)",
  color: "white",
  padding: "36px 40px",
  fontFamily: "Inter, Arial, sans-serif"
};

const sectionStyle = {
  background: "linear-gradient(135deg, rgba(70, 149, 248, 0.08), rgba(7, 17, 37, 0.86))",
  border: "1px solid rgba(93, 173, 255, 0.23)",
  borderRadius: "16px",
  backdropFilter: "blur(10px)",
  padding: "24px",
  marginBottom: "26px"
};

const cardGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "16px"
};

const cardStyle = {
  border: "1px solid rgba(112, 165, 255, 0.3)",
  borderRadius: "14px",
  background: "linear-gradient(145deg, rgba(47, 109, 206, 0.2), rgba(9, 22, 43, 0.75))",
  padding: "18px",
  boxShadow: "0 10px 26px rgba(0,0,0,0.33)",
  transition: "transform 0.27s ease, box-shadow 0.27s ease"
};

const btnPrimary = {
  padding: "10px 16px",
  borderRadius: "8px",
  border: "none",
  background: "linear-gradient(90deg, #2f7bff, #1765db)",
  color: "white",
  cursor: "pointer",
  fontWeight: "700",
  boxShadow: "0 6px 16px rgba(47, 123, 255, 0.32)"
};

export default function Supplements() {
  const isLoggedIn = Boolean(localStorage.getItem("token"));
  const supplements = [
    { title: "Protein Powder", desc: "Whey, casein or plant blends to support recovery and muscle repair." },
    { title: "Creatine", desc: "Boosts strength, power output, and training volume with safe dosing." },
    { title: "Multivitamins", desc: "Daily micronutrient support for recovery, immunity, and overall health." },
    { title: "Pre-Workout", desc: "Energy formula to improve workout focus and endurance." }
  ];

  return (
    <div style={pageStyle}>
      <h1 style={{ fontSize: "2.4rem", marginBottom: "8px" }}>Supplements Guide</h1>
      <p style={{ color: "#cfdff3", marginBottom: "22px", maxWidth: "880px" }}>
        Evidence-based supplements help close dietary gaps and boost training results when used responsibly.
      </p>

      <section style={sectionStyle}>
        <div style={cardGrid}>
          {supplements.map((item) => (
            <article
              key={item.title}
              style={cardStyle}
              onMouseOver={(e) => Object.assign(e.currentTarget.style, { transform: "translateY(-5px)", boxShadow: "0 14px 32px rgba(0,0,0,0.43)" })}
              onMouseOut={(e) => Object.assign(e.currentTarget.style, { transform: "none", boxShadow: "0 10px 26px rgba(0,0,0,0.33)" })}
            >
              <h2 style={{ margin: "0 0 9px", fontSize: "1.2rem" }}>{item.title}</h2>
              <p style={{ color: "#dde8ff", lineHeight: "1.5" }}>{item.desc}</p>
              <button style={{ ...btnPrimary, marginTop: "14px" }}>Learn More</button>
            </article>
          ))}
        </div>
      </section>

      <section style={sectionStyle}>
        <h2 style={{ marginBottom: "10px" }}>Recommended for You</h2>
        {isLoggedIn ? (
          <p style={{ color: "#dde8ff" }}>
            Profile-based supplement picks are ready. Check your dashboard for personalized stacks.
          </p>
        ) : (
          <>
            <p style={{ color: "#dde8ff", marginBottom: "16px" }}>
              Create a profile to get supplement suggestions based on your fitness goals.
            </p>
            <div style={{ display: "flex", gap: "12px" }}>
              <Link to="/login" style={{ ...btnPrimary, textDecoration: "none", textAlign: "center" }}>Login</Link>
              <Link to="/signup" style={{ ...btnPrimary, background: "linear-gradient(90deg, #4ade80, #22c55e)", color: "#0b1727", textDecoration: "none", textAlign: "center" }}>Sign Up</Link>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
