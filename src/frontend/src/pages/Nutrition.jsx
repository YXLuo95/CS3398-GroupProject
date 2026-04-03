import { Link } from "react-router-dom";

const pageStyle = {
  minHeight: "100vh",
  background: "radial-gradient(circle at 23% 20%, #1e3b61, #0b1727 55%, #060c1a)",
  color: "white",
  padding: "36px 40px",
  fontFamily: "Inter, Arial, sans-serif"
};

const sectionStyle = {
  background: "linear-gradient(135deg, rgba(56, 110, 204, 0.08), rgba(7, 17, 37, 0.9))",
  border: "1px solid rgba(87, 143, 240, 0.2)",
  borderRadius: "16px",
  backdropFilter: "blur(12px)",
  padding: "24px",
  marginBottom: "26px"
};

const cardGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "16px"
};

const cardBase = {
  background: "linear-gradient(145deg, rgba(58, 119, 215, 0.2), rgba(11, 24, 48, 0.8))",
  border: "1px solid rgba(112, 158, 255, 0.35)",
  borderRadius: "14px",
  padding: "18px",
  boxShadow: "0 10px 26px rgba(0,0,0,0.35)",
  transition: "transform 0.28s ease, box-shadow 0.28s ease"
};

const btnPrimary = {
  padding: "10px 16px",
  borderRadius: "8px",
  border: "none",
  background: "linear-gradient(90deg, #2f7bff, #1765db)",
  color: "white",
  cursor: "pointer",
  fontWeight: "700",
  boxShadow: "0 6px 16px rgba(47, 123, 255, 0.32)",
  textDecoration: "none",
  display: "inline-block",
  textAlign: "center"
};

export default function Nutrition() {
  const isLoggedIn = Boolean(localStorage.getItem("token"));
  const nutritionPlans = [
    {
      title: "Weight Loss Nutrition",
      desc: "Controlled calories, high fiber, and lean protein for consistent fat loss.",
      slug: "weight-loss-nutrition"
    },
    {
      title: "Muscle Gain Nutrition",
      desc: "Moderate surplus with protein timing and recovery-focused macros.",
      slug: "muscle-gain-nutrition"
    },
    {
      title: "Balanced Diet",
      desc: "Balanced proteins, carbs, and fats for sustainable daily energy and wellness.",
      slug: "balanced-diet"
    },
    {
      title: "Meal Prep Guide",
      desc: "Structured weekly meal prep to reduce stress and ensure nutritional adequacy.",
      slug: "meal-prep-guide"
    }
  ];

  return (
    <div style={pageStyle}>
      <h1 style={{ fontSize: "2.4rem", marginBottom: "8px" }}>Nutrition Plans</h1>
      <p style={{ color: "#cfdbed", marginBottom: "22px", maxWidth: "880px" }}>
        Effective nutrition is the foundation of progress. Select a plan and get data-backed meal recommendations.
      </p>

      <section style={sectionStyle}>
        <div style={cardGrid}>
          {nutritionPlans.map((item) => (
            <article
              key={item.title}
              style={cardBase}
              onMouseOver={(e) => Object.assign(e.currentTarget.style, { transform: "translateY(-5px)", boxShadow: "0 14px 32px rgba(0,0,0,0.42)" })}
              onMouseOut={(e) => Object.assign(e.currentTarget.style, { transform: "none", boxShadow: "0 10px 26px rgba(0,0,0,0.35)" })}
            >
              <h2 style={{ margin: "0 0 9px", fontSize: "1.2rem" }}>{item.title}</h2>
              <p style={{ color: "#d9e5ff", lineHeight: "1.5" }}>{item.desc}</p>
              <Link to={`/nutrition/${item.slug}`} style={{ ...btnPrimary, marginTop: "14px" }}>View Plan</Link>
            </article>
          ))}
        </div>
      </section>

      <section style={sectionStyle}>
        <h2 style={{ marginBottom: "10px" }}>Your Personalized Nutrition Plan</h2>
        {isLoggedIn ? (
          <p style={{ color: "#d9e5ff" }}>Profile-based macronutrient and meal timing suggestions are available on your dashboard.</p>
        ) : (
          <>
            <p style={{ color: "#d9e5ff", marginBottom: "16px" }}>Sign in to access meal plans tailored to your profile.</p>
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

