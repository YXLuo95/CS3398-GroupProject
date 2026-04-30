import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import AppPage from "../components/ui/AppPage";
import SectionCard from "../components/ui/SectionCard";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

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
  const navigate = useNavigate();
  const isLoggedIn = Boolean(localStorage.getItem("token"));

  const [aiPlan, setAiPlan] = useState(null);
  const [loading, setLoading] = useState(isLoggedIn);

  useEffect(() => {
    if (!isLoggedIn) return;

    const token = localStorage.getItem("token");
    axios
      .get(`${API_URL}/api/v1/nutrition-plans`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const plans = res.data || [];
        if (plans.length > 0) setAiPlan(plans[0]);
      })
      .catch((err) => console.error("Nutrition plan fetch error:", err))
      .finally(() => setLoading(false));
  }, [isLoggedIn]);

  return (
    <AppPage
      eyebrow="NUTRITION"
      title="Nutrition"
      accent="Plans"
      subtitle="Effective nutrition is the foundation of every result. Select a plan and get data-backed meal guidance tailored to your goals."
    >
      {/* ============================================ */}
      {/* AI Plan summary card (logged in + has plan)   */}
      {/* ============================================ */}
      {isLoggedIn && aiPlan && (
        <SectionCard title="Your AI Nutrition Plan">
          <div
            onClick={() => navigate("/diet-plan")}
            style={{
              cursor: "pointer",
              padding: "1.3rem",
              borderRadius: 12,
              background: "linear-gradient(135deg, rgba(34,197,94,0.08), rgba(59,130,246,0.06))",
              border: "1px solid rgba(34,197,94,0.25)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(34,197,94,0.5)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(34,197,94,0.25)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div className="ff-flex-between" style={{ marginBottom: "0.8rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <span style={{ fontSize: "1.5rem" }}>🥗</span>
                <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "#f8fbff" }}>
                  Your Personalized Plan
                </h3>
              </div>
              <span style={{ color: "#64748b", fontSize: "0.75rem" }}>
                Generated {new Date(aiPlan.created_at).toLocaleDateString()}
              </span>
            </div>

            {/* Macros */}
            {(aiPlan.calories || aiPlan.protein_g) && (
              <div className="ff-grid ff-grid-4" style={{ gap: "0.5rem", marginBottom: "0.9rem" }}>
                {[
                  { val: aiPlan.calories, lbl: "cal", color: "var(--ff-green, #22c55e)" },
                  { val: `${aiPlan.protein_g || 0}g`, lbl: "protein", color: "var(--ff-amber, #f59e0b)" },
                  { val: `${aiPlan.fat_g || 0}g`, lbl: "fats", color: "var(--ff-purple, #a78bfa)" },
                  { val: `${aiPlan.carbs_g || 0}g`, lbl: "carbs", color: "var(--ff-cyan, #06b6d4)" },
                ].map(({ val, lbl, color }) => (
                  <div key={lbl} className="ff-inset" style={{ padding: "0.55rem 0.4rem", textAlign: "center" }}>
                    <div style={{ fontSize: "0.95rem", fontWeight: 700, color }}>{val}</div>
                    <div style={{ fontSize: "0.68rem", color: "#a7b4c9", textTransform: "uppercase", marginTop: "0.15rem" }}>{lbl}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Preview */}
            <p style={{
              margin: 0,
              color: "#a7b4c9",
              fontSize: "0.85rem",
              lineHeight: 1.6,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}>
              {aiPlan.plan_content?.replace(/[#*`]/g, "") || "View your full plan for detailed meal recommendations."}
            </p>

            <div style={{
              marginTop: "0.9rem",
              fontSize: "0.85rem",
              color: "#22c55e",
              fontWeight: 600,
            }}>
              View Full Plan →
            </div>
          </div>
        </SectionCard>
      )}

      {/* ============================================ */}
      {/* Static plan grid                              */}
      {/* ============================================ */}
      <SectionCard title={isLoggedIn && aiPlan ? "Explore Other Plan Types" : "Choose Your Nutrition Strategy"}>
        {isLoggedIn && aiPlan && (
          <p className="ff-muted" style={{ marginBottom: "1rem", fontSize: "0.88rem", lineHeight: 1.6 }}>
            Curious about other approaches? These are general templates for reference — your AI plan above is calibrated to your specific stats and goals.
          </p>
        )}

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

      {/* ============================================ */}
      {/* CTA — different state per situation           */}
      {/* ============================================ */}
      {!isLoggedIn ? (
        <SectionCard title="Get a Personalized Plan">
          <p className="ff-muted" style={{ lineHeight: 1.7, marginBottom: "0.6rem" }}>
            Sign up to unlock AI-driven meal plans calibrated to your body stats, goal, and dietary preferences.
          </p>
          <div className="ff-flex" style={{ gap: "0.75rem", flexWrap: "wrap", marginTop: "1rem" }}>
            <Link to="/signup" className="ff-btn ff-btn-green">Start Free</Link>
            <Link to="/login"  className="ff-btn ff-btn-ghost">Login</Link>
          </div>
        </SectionCard>
      ) : !loading && !aiPlan ? (
        <SectionCard title="Generate Your AI Plan">
          <p className="ff-muted" style={{ lineHeight: 1.7, marginBottom: "0.8rem" }}>
            Get a personalized daily nutrition plan calibrated to your quiz data, macro targets, and dietary preferences.
          </p>
          <div className="ff-actions">
            <Link to="/diet-plan" className="ff-btn ff-btn-primary">Generate Plan →</Link>
          </div>
        </SectionCard>
      ) : null}
    </AppPage>
  );
}
