import { Link } from "react-router-dom";
import falconBg from "../assets/blue-falcon-logo.png";

const pageStyle = {
  minHeight: "100vh",
  background: "radial-gradient(circle at 15% 12%, #1d3560, #0b1727 45%, #050b16)",
  color: "white",
  padding: "34px 38px",
  fontFamily: "Inter, Arial, sans-serif"
};

const sectionStyle = {
  background: "linear-gradient(135deg, rgba(55, 111, 217, 0.14), rgba(7, 16, 35, 0.92))",
  border: "1px solid rgba(109, 181, 255, 0.2)",
  borderRadius: "16px",
  backdropFilter: "blur(10px)",
  padding: "24px",
  marginBottom: "26px"
};

const cardStyle = {
  background: "linear-gradient(135deg, rgba(30, 80, 160, 0.32), rgba(7, 17, 37, 0.9))",
  border: "1px solid rgba(107, 156, 245, 0.32)",
  borderRadius: "14px",
  padding: "18px",
  boxShadow: "0 12px 28px rgba(0,0,0,0.35)",
  transition: "transform 0.3s ease, box-shadow 0.3s ease"
};

const cardGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "16px"
};

const btnPrimary = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "10px 18px",
  borderRadius: "8px",
  border: "none",
  background: "linear-gradient(90deg, #2f7bff, #1e66d0)",
  color: "white",
  fontWeight: "700",
  textDecoration: "none",
  boxShadow: "0 6px 16px rgba(47, 123, 255, 0.28)"
};

export default function Home() {
  return (
    <div style={pageStyle}>
      <section style={{ ...sectionStyle, backgroundImage: `url(${falconBg})`, backgroundSize: "180px", backgroundPosition: "right top", backgroundRepeat: "no-repeat" }}>
        <h1 style={{ fontSize: "2.6rem", marginBottom: "10px" }}>Falcon Fitness</h1>
        <p style={{ color: "#d3e0f7", maxWidth: "700px", marginBottom: "18px" }}>
          Build strength, lose fat, and keep your nutrition on track with intelligent, goal-driven plans in one place.
        </p>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Link to="/quiz" style={btnPrimary}>Start Quiz</Link>
          <Link to="/about" style={{ ...btnPrimary, background: "linear-gradient(90deg, #0ea5e9, #0284c7)" }}>Learn More</Link>
        </div>
      </section>

      <section style={sectionStyle}>
        <h2 style={{ marginBottom: "12px" }}>How it works</h2>
        <p style={{ color: "#cbd5e5" }}>
          Answer a short fitness quiz, receive tailored workout, nutrition, and supplement recommendations, then track your progress with analytics.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={{ marginBottom: "12px" }}>Featured Modules</h2>
        <div style={cardGrid}>
          {[
            { title: "Workout Plans", subtitle: "Structured routines for every goal from fat loss to strength." },
            { title: "Nutrition Guide", subtitle: "Macro-based meal plans and meal prep templates." },
            { title: "Supplements", subtitle: "Evidence-backed recommendations for recovery and performance." },
            { title: "Progress Reports", subtitle: "AI-generated summaries of your fitness journey." }
          ].map((item) => (
            <article
              key={item.title}
              style={cardStyle}
              onMouseOver={(e) => Object.assign(e.currentTarget.style, { transform: "translateY(-5px)", boxShadow: "0 16px 32px rgba(0,0,0,0.42)" })}
              onMouseOut={(e) => Object.assign(e.currentTarget.style, { transform: "none", boxShadow: "0 12px 28px rgba(0,0,0,0.35)" })}
            >
              <h3 style={{ margin: "0 0 8px", color: "#eef6ff" }}>{item.title}</h3>
              <p style={{ color: "#d7e3f4" }}>{item.subtitle}</p>
            </article>
          ))}
        </div>
      </section>

      <section style={{ ...sectionStyle, borderTop: "2px solid #2f7bff" }}>
        <h2 style={{ marginBottom: "10px" }}>Ready to personalize?</h2>
        <p style={{ color: "#cbd5e5", marginBottom: "14px" }}>Login or sign up to access tailored plans based on your profile.</p>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Link to="/login" style={btnPrimary}>Login</Link>
          <Link to="/signup" style={{ ...btnPrimary, background: "linear-gradient(90deg, #4ade80, #16a34a)", color: "#0b1727" }}>Sign Up</Link>
        </div>
      </section>
    </div>
  );
}
