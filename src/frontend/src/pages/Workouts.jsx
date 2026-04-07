import { Link } from "react-router-dom";
import AppPage from "../components/ui/AppPage";
import SectionCard from "../components/ui/SectionCard";

const workoutPlans = [
  {
    emoji: "🏃",
    title: "Beginner Training",
    tag: "4 WEEKS",
    tagClass: "ff-tag-green",
    desc: "Structured 4-week progression to learn form, build consistency, and develop the training habit.",
    slug: "beginner-training",
  },
  {
    emoji: "🏋️",
    title: "Strength Training",
    tag: "ADVANCED",
    tagClass: "ff-tag-blue",
    desc: "Periodized volume cycles for consistent strength gains using compound lifts and progressive overload.",
    slug: "strength-training",
  },
  {
    emoji: "🔥",
    title: "Fat Loss Training",
    tag: "HIIT + WEIGHTS",
    tagClass: "ff-tag-amber",
    desc: "High-intensity intervals combined with recovery sets to maximize calorie burn and preserve muscle.",
    slug: "fat-loss-training",
  },
  {
    emoji: "🏠",
    title: "Home Workouts",
    tag: "NO EQUIPMENT",
    tagClass: "ff-tag-purple",
    desc: "Equipment-free workouts optimized for small spaces — as effective as the gym, on your schedule.",
    slug: "home-workouts",
  },
];

export default function Workouts() {
  const isLoggedIn = Boolean(localStorage.getItem("token"));

  return (
    <AppPage
      eyebrow="TRAINING"
      title="Workout"
      accent="Plans"
      subtitle="Expert-crafted programs that adapt to your goals, experience level, and available time."
    >
      {/* Plans grid */}
      <SectionCard title="Choose Your Program">
        <div className="ff-grid ff-grid-2">
          {workoutPlans.map((plan) => (
            <article
              key={plan.slug}
              className="ff-card ff-card-hover"
              style={{ borderRadius: 14, overflow: "hidden" }}
            >
              <div style={{ padding: "1.3rem", display: "flex", flexDirection: "column", gap: "0.65rem", height: "100%" }}>
                <div className="ff-flex-between">
                  <span style={{ fontSize: "1.8rem" }}>{plan.emoji}</span>
                  <span className={`ff-tag ${plan.tagClass}`}>{plan.tag}</span>
                </div>
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#f8fbff" }}>{plan.title}</h3>
                <p style={{ margin: 0, color: "#a7b4c9", fontSize: "0.88rem", lineHeight: 1.6, flex: 1 }}>{plan.desc}</p>
                <Link
                  to={`/workouts/${plan.slug}`}
                  className="ff-btn ff-btn-primary ff-btn-sm"
                  style={{ alignSelf: "flex-start", marginTop: "0.4rem" }}
                >
                  View Plan →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </SectionCard>

      {/* Personalized CTA */}
      <SectionCard title={isLoggedIn ? "Your Custom Plan" : "Unlock Your Personal Plan"}>
        {isLoggedIn ? (
          <>
            <p className="ff-muted" style={{ lineHeight: 1.7 }}>
              Your AI-adapted plan is ready. Head to the dashboard to track workouts, log sets, and review progress.
            </p>
            <div className="ff-actions">
              <Link to="/dashboard" className="ff-btn ff-btn-primary">Open Dashboard →</Link>
            </div>
          </>
        ) : (
          <>
            <p className="ff-muted" style={{ lineHeight: 1.7, marginBottom: "0.6rem" }}>
              Take the 5-minute fitness quiz to get a program built around your body, goals, and schedule.
            </p>
            <div className="ff-flex" style={{ gap: "0.75rem", flexWrap: "wrap", marginTop: "1rem" }}>
              <Link to="/signup" className="ff-btn ff-btn-green">Get My Free Plan</Link>
              <Link to="/login"  className="ff-btn ff-btn-ghost">Login</Link>
            </div>
          </>
        )}
      </SectionCard>
    </AppPage>
  );
}

