import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AppPage from "../components/ui/AppPage";
import SectionCard from "../components/ui/SectionCard";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ==========================================
// Typewriter Effect (same as Reports)
// ==========================================
const Typewriter = ({ text, speed = 12 }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let i = 0;
    setDisplayedText("");
    const timer = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(i));
      i++;
      if (i >= text.length) clearInterval(timer);
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return (
    <div style={{ whiteSpace: "pre-wrap", lineHeight: "1.6", fontSize: "0.95rem", color: "#e2e8f0" }}>
      {displayedText}
    </div>
  );
};

export default function DietPlan() {
  const navigate = useNavigate();
  const getToken = () => localStorage.getItem("token");

  // ==========================================
  // States
  // ==========================================
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasQuiz, setHasQuiz] = useState(false);

  // Generation states
  const [isGenerating, setIsGenerating] = useState(false);
  const [pollingActive, setPollingActive] = useState(false);
  const [error, setError] = useState("");
  const [queueMessage, setQueueMessage] = useState("");

  // ==========================================
  // Fetch existing plans + check quiz
  // ==========================================
  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();
      if (!token) {
        navigate("/login");
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };

      try {
        const [plansRes, quizRes] = await Promise.allSettled([
          axios.get(`${API_URL}/api/v1/nutrition-plans`, { headers }),
          axios.get(`${API_URL}/api/v1/onboarding/quiz`, { headers }),
        ]);

        if (plansRes.status === "fulfilled") {
          setPlans(plansRes.value.data || []);
        }
        if (quizRes.status === "fulfilled") {
          setHasQuiz(true);
        }
      } catch (err) {
        console.error("Failed to fetch nutrition data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  // Track plan count before generation to detect new plans
  const [planCountBeforeGenerate, setPlanCountBeforeGenerate] = useState(0);

  // ==========================================
  // Polling for new plan
  // ==========================================
  useEffect(() => {
    let pollInterval;
    if (pollingActive) {
      pollInterval = setInterval(async () => {
        const token = getToken();
        try {
          const res = await axios.get(`${API_URL}/api/v1/nutrition-plans`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const latest = res.data || [];

          // Stop polling when a new plan appears (count increased)
          if (latest.length > planCountBeforeGenerate) {
            setPlans(latest);
            setPollingActive(false);
            setIsGenerating(false);
            setQueueMessage("");
          }
        } catch (e) {
          console.error("Polling error:", e);
        }
      }, 5000);
    }
    return () => clearInterval(pollInterval);
  }, [pollingActive, planCountBeforeGenerate]);

  // ==========================================
  // Generate plan
  // ==========================================
  const handleGenerate = async () => {
    setError("");
    setQueueMessage("");
    setIsGenerating(true);
    setPlanCountBeforeGenerate(plans.length); // snapshot current count

    try {
      const res = await axios.post(
        `${API_URL}/api/v1/nutrition-plans/generate`,
        {},
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      if (res.status === 202) {
        setQueueMessage(
          "🥗 Task Queued! Your AI Nutritionist is crafting your plan. Results will appear automatically..."
        );
        setPollingActive(true);
      }
    } catch (err) {
      const detail = err.response?.data?.detail || "Error generating plan.";
      setError(detail);
      setIsGenerating(false);
    }
  };

  // ==========================================
  // Loading
  // ==========================================
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#0b1727", color: "white", padding: "60px", textAlign: "center" }}>
        <h2>Loading your nutrition plans... 🦅</h2>
      </div>
    );
  }

  // Parse created_at as UTC (backend stores UTC without Z suffix)
  const parseUTC = (dateStr) => {
    if (!dateStr) return new Date(0);
    return dateStr.endsWith("Z") ? new Date(dateStr) : new Date(dateStr + "Z");
  };

  const hasGeneratedToday =
    plans.length > 0 &&
    parseUTC(plans[0].created_at).toLocaleDateString() === new Date().toLocaleDateString();

  const generateDisabled = !hasQuiz || (hasGeneratedToday && !pollingActive) || isGenerating;

  let generateLabel = "🥗 Generate Nutrition Plan";
  if (!hasQuiz) {
    generateLabel = "⚠️ Complete Quiz First";
  } else if (isGenerating) {
    generateLabel = "🤖 Generating...";
  } else if (hasGeneratedToday) {
    generateLabel = "✅ Plan Generated Today";
  }

  return (
    <AppPage
      eyebrow="NUTRITION"
      title="AI Nutrition"
      accent="Planner"
      subtitle="Personalized daily nutrition plans powered by AI, based on your goals and preferences."
    >
      {/* Generate section */}
      <SectionCard title="Generate New Plan">
        <div style={{ marginBottom: "20px" }}>
          <p style={{ color: "#a7b4c9", fontSize: "0.9rem", marginBottom: "15px" }}>
            The AI Nutritionist will analyze your quiz data, macro targets, dietary preferences, and allergies to create a personalized daily nutrition plan.
          </p>

          {!hasQuiz && (
            <div style={{
              padding: "12px 16px", backgroundColor: "rgba(245, 158, 11, 0.1)",
              color: "#f59e0b", borderRadius: "8px", marginBottom: "15px",
              borderLeft: "4px solid #f59e0b", fontSize: "0.88rem",
            }}>
              📋 You need to complete the fitness quiz first so we know your goals and dietary preferences.{" "}
              <strong style={{ cursor: "pointer", textDecoration: "underline" }} onClick={() => navigate("/quiz")}>
                Take the Quiz →
              </strong>
            </div>
          )}

          {hasGeneratedToday && !isGenerating && (
            <div style={{
              padding: "12px 16px", backgroundColor: "rgba(34, 197, 94, 0.1)",
              color: "#22c55e", borderRadius: "8px", marginBottom: "15px",
              borderLeft: "4px solid #22c55e", fontSize: "0.88rem",
            }}>
              ✅ You've already generated a plan today. Come back tomorrow for a fresh one!
            </div>
          )}

          <button
            className="ff-btn"
            onClick={handleGenerate}
            disabled={generateDisabled}
            style={{
              backgroundColor: generateDisabled ? "rgba(255,255,255,0.1)" : "#22c55e",
              color: generateDisabled ? "#64748b" : "white",
              border: "none", padding: "12px 24px", fontWeight: "bold",
              cursor: generateDisabled ? "not-allowed" : "pointer",
              transition: "all 0.3s ease",
            }}
          >
            {generateLabel}
          </button>
        </div>

        {error && (
          <div style={{
            color: "#e74c3c", fontSize: "0.88rem", marginTop: "10px",
            padding: "10px", backgroundColor: "rgba(231, 76, 60, 0.1)", borderRadius: "6px",
          }}>
            ⚠️ {error}
          </div>
        )}

        {queueMessage && (
          <div style={{
            padding: "15px", backgroundColor: "rgba(34, 197, 94, 0.1)",
            color: "#22c55e", borderRadius: "6px", marginTop: "10px",
            borderLeft: "4px solid #22c55e", fontSize: "0.9rem",
          }}>
            {queueMessage}
          </div>
        )}
      </SectionCard>

      {/* Latest plan with typewriter */}
      {plans.length > 0 ? (
        <SectionCard
          title={`Today's Plan — ${new Date(plans[0].created_at).toLocaleDateString()}`}
        >
          {/* Macro summary bar */}
          {(plans[0].calories || plans[0].protein_g || plans[0].fat_g) && (
            <div className="ff-grid ff-grid-4" style={{ marginBottom: "1rem" }}>
              {[
                { val: plans[0].calories, lbl: "cal", color: "var(--ff-green, #22c55e)" },
                { val: `${plans[0].protein_g || 0}g`, lbl: "protein", color: "var(--ff-amber, #f59e0b)" },
                { val: `${plans[0].fat_g || 0}g`, lbl: "fats", color: "var(--ff-purple, #a78bfa)" },
                { val: `${plans[0].carbs_g || 0}g`, lbl: "carbs", color: "var(--ff-cyan, #06b6d4)" },
              ].map(({ val, lbl, color }) => (
                <div key={lbl} className="ff-inset" style={{ textAlign: "center" }}>
                  <div style={{ fontWeight: 700, color, fontSize: "1rem" }}>{val}</div>
                  <div style={{ color: "#a7b4c9", fontSize: "0.72rem", marginTop: "0.2rem" }}>{lbl}</div>
                </div>
              ))}
            </div>
          )}

          <div style={{
            backgroundColor: "rgba(0,0,0,0.3)", padding: "24px", borderRadius: "12px",
            border: "1px solid rgba(34, 197, 94, 0.3)",
            boxShadow: "0 4px 20px rgba(34, 197, 94, 0.05)",
          }}>
            <Typewriter text={plans[0].plan_content} />
          </div>
        </SectionCard>
      ) : (
        <SectionCard title="Plan History">
          <div style={{ textAlign: "center", padding: "30px", color: "#64748b", fontSize: "0.95rem" }}>
            No nutrition plans generated yet.{" "}
            {hasQuiz
              ? "Click the generate button above to get your first plan!"
              : "Complete the fitness quiz first, then come back to generate your plan."}
          </div>
        </SectionCard>
      )}

      {/* Past plans */}
      {plans.length > 1 && (
        <SectionCard title="Past Plans">
          <div className="ff-stack">
            {plans.slice(1).map((plan) => (
              <div
                key={plan.id}
                style={{
                  padding: "16px", backgroundColor: "rgba(255,255,255,0.03)",
                  borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <div style={{ color: "#22c55e", fontWeight: "bold", fontSize: "0.85rem" }}>
                    {new Date(plan.created_at).toLocaleDateString()}
                  </div>
                  {plan.calories && (
                    <div style={{ color: "#64748b", fontSize: "0.75rem" }}>
                      {plan.calories} cal · {plan.protein_g}g P · {plan.fat_g}g F · {plan.carbs_g}g C
                    </div>
                  )}
                </div>
                <div style={{ color: "#a7b4c9", fontSize: "0.9rem", lineHeight: "1.5", whiteSpace: "pre-wrap" }}>
                  {plan.plan_content}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      <button
        onClick={() => navigate("/dashboard")}
        style={{
          marginTop: "20px", padding: "10px 20px", border: "none",
          borderRadius: "8px", background: "transparent", color: "#64748b",
          cursor: "pointer", fontSize: "14px",
        }}
      >
        ← Back to Dashboard
      </button>
    </AppPage>
  );
}
