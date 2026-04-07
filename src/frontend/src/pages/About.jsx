import { Link } from "react-router-dom";
import AppPage from "../components/ui/AppPage";
import SectionCard from "../components/ui/SectionCard";

const pillars = [
  {
    emoji: "🎯",
    title: "Mission",
    text: "Empower users with simple, scalable fitness routines and reliable progress tracking for all levels.",
    tagClass: "ff-tag-blue",
    tag: "PURPOSE",
  },
  {
    emoji: "🔭",
    title: "Vision",
    text: "Build a supportive digital environment that helps people grow healthy habits sustainably and with confidence.",
    tagClass: "ff-tag-green",
    tag: "FUTURE",
  },
  {
    emoji: "💡",
    title: "Values",
    text: "Clarity, accessibility, and continuous improvement through data-informed coaching and community focus.",
    tagClass: "ff-tag-amber",
    tag: "FOUNDATION",
  },
];

const benefits = [
  { icon: "⚡", label: "Adaptive Programs",    desc: "Plans that evolve as your fitness improves." },
  { icon: "📊", label: "Progress Analytics",   desc: "Track every metric that matters to your goal." },
  { icon: "🥗", label: "Nutrition Guidance",   desc: "Macro-optimized meal plans matched to your plan." },
  { icon: "🤝", label: "Coach-Ready Insights", desc: "Export your data or share with a personal trainer." },
];

export default function About() {
  const isLoggedIn = Boolean(localStorage.getItem("token"));

  return (
    <AppPage
      eyebrow="ABOUT"
      title="Built for"
      accent="Serious Athletes"
      subtitle="Falcon Fitness is a fitness-technology platform that unifies workouts, nutrition, and progress tracking into one seamless experience."
    >
      {/* Pillars grid */}
      <SectionCard title="Our Foundation">
        <div className="ff-grid ff-grid-3">
          {pillars.map((p) => (
            <article
              key={p.title}
              className="ff-card ff-card-hover"
              style={{ borderRadius: 14, overflow: "hidden" }}
            >
              <div style={{
                padding: "1.2rem 1.3rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.6rem",
                height: "100%",
              }}>
                <span style={{ fontSize: "2rem" }}>{p.emoji}</span>
                <span className={`ff-tag ${p.tagClass}`} style={{ alignSelf: "flex-start" }}>{p.tag}</span>
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#f8fbff" }}>{p.title}</h3>
                <p style={{ margin: 0, color: "#a7b4c9", fontSize: "0.9rem", lineHeight: 1.6 }}>{p.text}</p>
              </div>
            </article>
          ))}
        </div>
      </SectionCard>

      {/* Benefits */}
      <SectionCard title="What You Get" subtitle="Everything you need to hit your fitness goals, in one app.">
        <div className="ff-grid ff-grid-2" style={{ marginTop: "0.4rem" }}>
          {benefits.map((b) => (
            <div key={b.label} className="ff-inset ff-flex" style={{ gap: "1rem" }}>
              <span style={{ fontSize: "1.6rem", flexShrink: 0 }}>{b.icon}</span>
              <div>
                <div style={{ fontWeight: 700, color: "#f8fbff", fontSize: "0.95rem", marginBottom: "0.2rem" }}>{b.label}</div>
                <div style={{ color: "#a7b4c9", fontSize: "0.85rem" }}>{b.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* CTA */}
      <SectionCard title={isLoggedIn ? "Welcome Back" : "Ready to Start?"}>
        {isLoggedIn ? (
          <p className="ff-muted" style={{ lineHeight: 1.7 }}>
            Great to have you! Head to your dashboard for personalized plan recommendations, progress tracking, and goal coaching.
          </p>
        ) : (
          <>
            <p className="ff-muted" style={{ lineHeight: 1.7, marginBottom: "1.2rem" }}>
              Create a free account to get tailored workout and nutrition recommendations.
            </p>
            <div className="ff-flex" style={{ gap: "0.75rem", flexWrap: "wrap" }}>
              <Link to="/signup" className="ff-btn ff-btn-primary">Get Started Free</Link>
              <Link to="/login"  className="ff-btn ff-btn-ghost">Login</Link>
            </div>
          </>
        )}
      </SectionCard>
    </AppPage>
  );
}
