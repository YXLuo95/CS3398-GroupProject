import { Link } from "react-router-dom";

const pageStyle = {
  minHeight: "100vh",
  background: "radial-gradient(circle at 20% 15%, #1b2a45, #0b1727 52%, #070f1e)",
  color: "white",
  padding: "36px 40px",
  fontFamily: "Inter, Arial, sans-serif"
};

const sectionStyle = {
  background: "linear-gradient(135deg, rgba(63, 150, 255, 0.08), rgba(7, 17, 37, 0.8))",
  border: "1px solid rgba(109, 171, 255, 0.25)",
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
  background: "linear-gradient(135deg, rgba(49, 95, 202, 0.25), rgba(10, 22, 44, 0.7))",
  border: "1px solid rgba(115, 151, 255, 0.35)",
  borderRadius: "14px",
  boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
  padding: "18px",
  transition: "transform 0.3s ease, box-shadow 0.3s ease"
};

const cardHover = {
  transform: "translateY(-4px)",
  boxShadow: "0 16px 36px rgba(0,0,0,0.45)"
};

const btnPrimary = {
  padding: "10px 16px",
  borderRadius: "8px",
  border: "none",
  background: "linear-gradient(90deg, #2f7bff, #1d5fda)",
  color: "white",
  cursor: "pointer",
  fontWeight: "700",
  boxShadow: "0 6px 16px rgba(47, 123, 255, 0.32)"
};

export default function Workouts() {
  const isLoggedIn = Boolean(localStorage.getItem("token"));

  const workoutPlans = [
    { title: "Beginner Training", desc: "Start with a structured 4-week progression to learn form and build consistency." },
    { title: "Strength Training", desc: "Advanced lift cycles with periodized volume for consistent strength gains." },
    { title: "Fat Loss Training", desc: "High-intensity intervals combined with recovery sets to burn fat efficiently." },
    { title: "Home Workouts", desc: "Equipment-free workouts designed for small spaces and busy schedules." }
  ];

  return (
    <div style={pageStyle}>
      <h1 style={{ fontSize: "2.4rem", marginBottom: "8px" }}>Workout Plans</h1>
      <p style={{ color: "#c9d5e8", marginBottom: "24px", maxWidth: "880px" }}>
        Choose from expert-crafted workouts that adapt to your goals and experience. Track progress and stay motivated with incremental milestones.
      </p>

      <section style={sectionStyle}>
        <div style={cardGrid}>
          {workoutPlans.map((plan) => (
            <article
              key={plan.title}
              style={cardStyle}
              onMouseOver={(e) => Object.assign(e.currentTarget.style, cardHover)}
              onMouseOut={(e) => Object.assign(e.currentTarget.style, { transform: "none", boxShadow: "0 12px 30px rgba(0,0,0,0.35)" })}
            >
              <h2 style={{ margin: "0 0 10px", fontSize: "1.2rem" }}>{plan.title}</h2>
              <p style={{ color: "#d9e5ff", lineHeight: "1.5" }}>{plan.desc}</p>
              <button style={{ ...btnPrimary, marginTop: "16px" }}>View Plan</button>
            </article>
          ))}
        </div>
      </section>

      <section style={sectionStyle}>
        <h2 style={{ marginBottom: "10px" }}>Your Personalized Workout Plan</h2>
        {isLoggedIn ? (
          <p style={{ color: "#d9e5ff" }}>
            Your custom plan is ready! Visit your dashboard to track workouts, progress, and recovery stats.
          </p>
        ) : (
          <>
            <p style={{ color: "#d9e5ff", marginBottom: "16px" }}>
              Log in to view your customized workout plan based on your goals.
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

