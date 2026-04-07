import { Link } from "react-router-dom";
import AppPage from "../components/ui/AppPage";
import SectionCard from "../components/ui/SectionCard";

const supplements = [
  {
    emoji: "🥤",
    title: "Protein Powder",
    tag: "RECOVERY",
    tagClass: "ff-tag-blue",
    desc: "Whey, casein or plant-based blends to support muscle repair, recovery, and daily protein targets.",
    detail: "Aim for 20–40g post-workout. Whey absorbs fast; casein is ideal before bed.",
  },
  {
    emoji: "⚡",
    title: "Creatine Monohydrate",
    tag: "STRENGTH",
    tagClass: "ff-tag-green",
    desc: "Clinically proven to boost strength, power output, and training volume with safe daily dosing.",
    detail: "3–5g/day. No loading phase needed. Consistent daily intake is key.",
  },
  {
    emoji: "💊",
    title: "Multivitamins",
    tag: "DAILY HEALTH",
    tagClass: "ff-tag-amber",
    desc: "Micronutrient coverage for immunity, recovery, energy metabolism, and overall health maintenance.",
    detail: "Take with a meal for better absorption. Choose a formula with D3, K2, and zinc.",
  },
  {
    emoji: "🔥",
    title: "Pre-Workout",
    tag: "PERFORMANCE",
    tagClass: "ff-tag-purple",
    desc: "Caffeine, beta-alanine, and citrulline formula to improve focus, endurance, and training intensity.",
    detail: "Use 30 min before training. Cycle off every 6–8 weeks to avoid tolerance.",
  },
];

const disclaimer = "These recommendations are informational only. Consult a healthcare provider before adding supplements to your routine.";

export default function Supplements() {
  const isLoggedIn = Boolean(localStorage.getItem("token"));

  return (
    <AppPage
      eyebrow="SUPPLEMENTS"
      title="Evidence-Based"
      accent="Supplement Guide"
      subtitle="Science-backed supplements help close nutritional gaps and amplify training results when used responsibly alongside a solid diet."
    >
      {/* Supplement cards */}
      <SectionCard title="Core Supplements">
        <div className="ff-grid ff-grid-2">
          {supplements.map((s) => (
            <article
              key={s.title}
              className="ff-card ff-card-hover"
              style={{ borderRadius: 14, overflow: "hidden" }}
            >
              <div style={{ padding: "1.3rem", display: "flex", flexDirection: "column", gap: "0.65rem", height: "100%" }}>
                <div className="ff-flex-between">
                  <span style={{ fontSize: "1.8rem" }}>{s.emoji}</span>
                  <span className={`ff-tag ${s.tagClass}`}>{s.tag}</span>
                </div>
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#f8fbff" }}>{s.title}</h3>
                <p style={{ margin: 0, color: "#a7b4c9", fontSize: "0.88rem", lineHeight: 1.6, flex: 1 }}>{s.desc}</p>
                <div className="ff-inset" style={{ marginTop: "0.3rem" }}>
                  <span style={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Dosing tip</span>
                  <p style={{ margin: "0.3rem 0 0", color: "#a7b4c9", fontSize: "0.82rem", lineHeight: 1.55 }}>{s.detail}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
        <p style={{ marginTop: "1.2rem", color: "#64748b", fontSize: "0.78rem", lineHeight: 1.6 }}>
          ⚠️ {disclaimer}
        </p>
      </SectionCard>

      {/* Personalized CTA */}
      <SectionCard title={isLoggedIn ? "Your Personalized Stack" : "Get a Custom Recommendation"}>
        {isLoggedIn ? (
          <>
            <p className="ff-muted" style={{ lineHeight: 1.7 }}>
              Based on your fitness goal and quiz results, your dashboard includes a personalized supplement priority list.
            </p>
            <div className="ff-actions">
              <Link to="/dashboard" className="ff-btn ff-btn-primary">Go to Dashboard →</Link>
            </div>
          </>
        ) : (
          <>
            <p className="ff-muted" style={{ lineHeight: 1.7, marginBottom: "0.6rem" }}>
              Complete the fitness quiz to receive supplement recommendations matched to your goal and training load.
            </p>
            <div className="ff-flex" style={{ gap: "0.75rem", flexWrap: "wrap", marginTop: "1rem" }}>
              <Link to="/signup" className="ff-btn ff-btn-green">Take the Quiz Free</Link>
              <Link to="/login"  className="ff-btn ff-btn-ghost">Login</Link>
            </div>
          </>
        )}
      </SectionCard>
    </AppPage>
  );
}
