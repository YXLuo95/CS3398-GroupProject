import { Link } from "react-router-dom";
import AppPage from "../components/ui/AppPage";
import SectionCard from "../components/ui/SectionCard";

const nutritionPlans = [
  {
    emoji: "🔥",
    title: "Weight Loss Nutrition",
    tag: "DEFICIT",
    tagClass: "ff-tag-amber",
    macros: { cal: "1800", protein: "160g", carbs: "160g", fat: "55g" },
    desc: "High-fiber, high-protein approach with controlled calories for sustainable, consistent fat loss.",
    slug: "weight-loss-nutrition",
  },
  {
    emoji: "💪",
    title: "Muscle Gain Nutrition",
    tag: "SURPLUS",
    tagClass: "ff-tag-blue",
    macros: { cal: "2800", protein: "200g", carbs: "320g", fat: "80g" },
    desc: "Moderate calorie surplus, strategic protein timing, and recovery-focused macronutrient splits.",
    slug: "muscle-gain-nutrition",
  },
  {
    emoji: "⚖️",
    title: "Balanced Diet",
    tag: "MAINTENANCE",
    tagClass: "ff-tag-green",
    macros: { cal: "2200", protein: "150g", carbs: "250g", fat: "70g" },
    desc: "Balanced macros for sustainable daily energy, long-term wellness, and consistent performance.",
    slug: "balanced-diet",
  },
  {
    emoji: "🥡",
    title: "Meal Prep Guide",
    tag: "PRACTICAL",
    tagClass: "ff-tag-purple",
    macros: null,
    desc: "Structured weekly meal prep system to reduce friction and ensure consistent nutritional adequacy.",
    slug: "meal-prep-guide",
  },
];

export default function Nutrition() {
  const isLoggedIn = Boolean(localStorage.getItem("token"));

  return (
    <AppPage
      eyebrow="NUTRITION"
      title="Nutrition"
      accent="Plans"
      subtitle="Effective nutrition is the foundation of every result. Select a plan and get data-backed meal guidance tailored to your goals."
    >
      {/* Plans grid */}
      <SectionCard title="Choose Your Nutrition Strategy">
        <div className="ff-grid ff-grid-2">
          {nutritionPlans.map((plan) => (
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

                {plan.macros && (
                  <div className="ff-grid ff-grid-4" style={{ gap: "0.5rem", marginTop: "0.3rem" }}>
                    {Object.entries(plan.macros).map(([k, v]) => (
                      <div key={k} className="ff-inset" style={{ padding: "0.5rem 0.4rem", textAlign: "center" }}>
                        <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#f8fbff" }}>{v}</div>
                        <div style={{ fontSize: "0.68rem", color: "#a7b4c9", textTransform: "uppercase" }}>{k}</div>
                      </div>
                    ))}
                  </div>
                )}

                <Link
                  to={`/nutrition/${plan.slug}`}
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

      {/* CTA */}
      <SectionCard title={isLoggedIn ? "Your AI Nutrition Plan" : "Get a Personalized Plan"}>
        {isLoggedIn ? (
          <>
            <p className="ff-muted" style={{ lineHeight: 1.7 }}>
              Profile-based macronutrients and meal timing suggestions are ready on your dashboard.
            </p>
            <div className="ff-actions">
              <Link to="/dashboard" className="ff-btn ff-btn-primary">Open Dashboard →</Link>
            </div>
          </>
        ) : (
          <>
            <p className="ff-muted" style={{ lineHeight: 1.7, marginBottom: "0.6rem" }}>
              Sign up to unlock AI-driven meal plans calibrated to your body stats, goal, and dietary preferences.
            </p>
            <div className="ff-flex" style={{ gap: "0.75rem", flexWrap: "wrap", marginTop: "1rem" }}>
              <Link to="/signup" className="ff-btn ff-btn-green">Start Free</Link>
              <Link to="/login"  className="ff-btn ff-btn-ghost">Login</Link>
            </div>
          </>
        )}
      </SectionCard>
    </AppPage>
  );
}

