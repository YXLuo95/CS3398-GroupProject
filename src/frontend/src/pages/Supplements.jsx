import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import AppPage from "../components/ui/AppPage";
import SectionCard from "../components/ui/SectionCard";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

const supplements = [
  {
    id: "protein",
    emoji: "🥤",
    title: "Protein Powder",
    tag: "RECOVERY",
    tagClass: "ff-tag-blue",
    desc: "Helps fill protein gaps so you can recover, build muscle, and stay full throughout the day.",
    dose: "20–40g when needed to hit your daily protein goal.",
    bestFor: ["gain_muscle", "lose_weight", "maintain"],
  },
  {
    id: "creatine",
    emoji: "⚡",
    title: "Creatine Monohydrate",
    tag: "STRENGTH",
    tagClass: "ff-tag-green",
    desc: "Supports strength, power output, training volume, and muscle performance over time.",
    dose: "3–5g daily. No loading phase is required.",
    bestFor: ["gain_muscle", "maintain"],
  },
  {
    id: "multivitamin",
    emoji: "💊",
    title: "Multivitamin",
    tag: "DAILY HEALTH",
    tagClass: "ff-tag-amber",
    desc: "Covers basic micronutrient gaps that may come from inconsistent meals or restricted diets.",
    dose: "Take once daily with a meal, following the label serving size.",
    bestFor: ["lose_weight", "gain_muscle", "maintain", "improve_endurance"],
  },
  {
    id: "preworkout",
    emoji: "🔥",
    title: "Pre-Workout",
    tag: "PERFORMANCE",
    tagClass: "ff-tag-purple",
    desc: "Can improve focus, energy, and workout intensity, especially when training feels low energy.",
    dose: "Use 20–30 minutes before training. Watch total caffeine intake.",
    bestFor: ["gain_muscle", "improve_endurance", "lose_weight"],
  },
  {
    id: "omega3",
    emoji: "🐟",
    title: "Omega-3 Fish Oil",
    tag: "HEART HEALTH",
    tagClass: "ff-tag-blue",
    desc: "Useful if you rarely eat fatty fish and want extra support for general heart and joint health.",
    dose: "Follow label dosing. Look for EPA and DHA on the nutrition label.",
    bestFor: ["maintain", "lose_weight", "gain_muscle"],
  },
  {
    id: "electrolytes",
    emoji: "💧",
    title: "Electrolytes",
    tag: "HYDRATION",
    tagClass: "ff-tag-green",
    desc: "Helps replace sodium, potassium, and magnesium lost during long or sweaty workouts.",
    dose: "Use around long cardio sessions, hot weather training, or heavy sweating.",
    bestFor: ["improve_endurance"],
  },
];

const goalLabels = {
  lose_weight: "fat loss",
  gain_muscle: "muscle gain",
  maintain: "maintenance",
  improve_endurance: "endurance",
};

const activityLabels = {
  sedentary: "sedentary",
  lightly_active: "lightly active",
  moderately_active: "moderately active",
  very_active: "very active",
  extra_active: "extra active",
};

const disclaimer =
  "These recommendations are informational only and are not medical advice. Check with a healthcare provider before adding supplements, especially if you take medication, have a medical condition, or are sensitive to caffeine.";

function getPersonalizedStack(quizData) {
  if (!quizData) return [];

  const goal = quizData.goal_type || "maintain";
  const activity = quizData.activity_level || "";
  const weight = Number(quizData.weight_lbs) || 0;
  const dietaryPrefs = quizData.dietary_preferences || [];
  const allergies = quizData.allergies || [];
  const workoutDays = Number(quizData.workout_days) || 0;

  const picks = [];

  const addPick = (id, priority, reason) => {
    const supplement = supplements.find((s) => s.id === id);
    if (!supplement || picks.some((p) => p.id === id)) return;
    picks.push({ ...supplement, priority, reason });
  };

  if (goal === "gain_muscle") {
    addPick("creatine", "High priority", "Your goal is muscle gain, so creatine is a strong fit for strength and training volume.");
    addPick("protein", "High priority", `At ${weight || "your current"} lbs, protein powder can help you hit your daily protein target more easily.`);
  }

  if (goal === "lose_weight") {
    addPick("protein", "High priority", "For fat loss, protein can help you stay full and keep muscle while eating fewer calories.");
    addPick("multivitamin", "Medium priority", "A calorie deficit can make it harder to cover every micronutrient, so this helps fill small gaps.");
  }

  if (goal === "improve_endurance") {
    addPick("electrolytes", "High priority", "Endurance training increases sweat loss, so hydration support becomes more important.");
    addPick("preworkout", "Medium priority", "A light pre-workout can help with focus and energy before cardio or longer sessions.");
  }

  if (goal === "maintain") {
    addPick("protein", "Medium priority", "Protein helps keep your nutrition consistent while maintaining your current weight.");
    addPick("omega3", "Medium priority", "Omega-3s are a simple general-health option if your diet does not include fatty fish often.");
  }

  if (["very_active", "extra_active"].includes(activity) || workoutDays >= 5) {
    addPick("electrolytes", "Medium priority", "Because you train often, electrolytes can help on sweaty or longer workout days.");
  }

  if (dietaryPrefs.includes("vegetarian") || dietaryPrefs.includes("vegan")) {
    addPick("multivitamin", "Medium priority", "Plant-based diets can require closer attention to nutrients like B12, vitamin D, iron, and zinc.");
  }

  if (!allergies.includes("fish")) {
    addPick("omega3", "Low priority", "This is optional, but useful if you do not eat fish regularly.");
  }

  return picks.slice(0, 4);
}

export default function Supplements() {
  const isLoggedIn = Boolean(localStorage.getItem("token"));
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(isLoggedIn);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuizData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await axios.get(`${API}/api/v1/onboarding/quiz`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setQuizData(res.data);
      } catch (err) {
        console.error("Unable to load supplement quiz data:", err);
        setError("Complete the quiz to unlock your personalized supplement stack.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, []);

  const personalizedStack = useMemo(() => getPersonalizedStack(quizData), [quizData]);

  return (
    <AppPage
      eyebrow="SUPPLEMENTS"
      title="Personalized"
      accent="Supplement Recommendations"
      subtitle="Get supplement suggestions based on your goal, activity level, workout schedule, and quiz results."
    >
      <SectionCard title="Your Supplement Stack">
        {!isLoggedIn ? (
          <>
            <p className="ff-muted" style={{ lineHeight: 1.7, marginBottom: "0.6rem" }}>
              Sign up or log in and complete the quiz to receive supplement recommendations matched to your fitness goal.
            </p>
            <div className="ff-flex" style={{ gap: "0.75rem", flexWrap: "wrap", marginTop: "1rem" }}>
              <Link to="/signup" className="ff-btn ff-btn-green">Get Started</Link>
              <Link to="/login" className="ff-btn ff-btn-ghost">Login</Link>
            </div>
          </>
        ) : loading ? (
          <p className="ff-muted">Loading your personalized recommendations...</p>
        ) : error || !quizData ? (
          <>
            <p className="ff-muted" style={{ lineHeight: 1.7 }}>{error}</p>
            <Link to="/quiz" className="ff-btn ff-btn-primary">Take the Quiz →</Link>
          </>
        ) : (
          <>
            <div className="ff-inset" style={{ marginBottom: "1rem" }}>
              <p style={{ margin: 0, color: "#a7b4c9", lineHeight: 1.6 }}>
                Based on your goal of <strong style={{ color: "#f8fbff" }}>{goalLabels[quizData.goal_type] || quizData.goal_type}</strong>,
                your <strong style={{ color: "#f8fbff" }}>{activityLabels[quizData.activity_level] || quizData.activity_level}</strong> lifestyle,
                and training <strong style={{ color: "#f8fbff" }}>{quizData.workout_days}x/week</strong>, these are your best starting options.
              </p>
            </div>

            <div className="ff-grid ff-grid-2">
              {personalizedStack.map((s) => (
                <article key={s.id} className="ff-card ff-card-hover" style={{ borderRadius: 14, overflow: "hidden" }}>
                  <div style={{ padding: "1.3rem", display: "flex", flexDirection: "column", gap: "0.65rem", height: "100%" }}>
                    <div className="ff-flex-between">
                      <span style={{ fontSize: "1.8rem" }}>{s.emoji}</span>
                      <span className={`ff-tag ${s.tagClass}`}>{s.priority}</span>
                    </div>
                    <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#f8fbff" }}>{s.title}</h3>
                    <p style={{ margin: 0, color: "#a7b4c9", fontSize: "0.88rem", lineHeight: 1.6 }}>{s.reason}</p>
                    <div className="ff-inset" style={{ marginTop: "0.3rem" }}>
                      <span style={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Suggested use</span>
                      <p style={{ margin: "0.3rem 0 0", color: "#a7b4c9", fontSize: "0.82rem", lineHeight: 1.55 }}>{s.dose}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </SectionCard>

      <SectionCard title="Supplement Library">
        <div className="ff-grid ff-grid-2">
          {supplements.map((s) => (
            <article key={s.id} className="ff-card ff-card-hover" style={{ borderRadius: 14, overflow: "hidden" }}>
              <div style={{ padding: "1.3rem", display: "flex", flexDirection: "column", gap: "0.65rem", height: "100%" }}>
                <div className="ff-flex-between">
                  <span style={{ fontSize: "1.8rem" }}>{s.emoji}</span>
                  <span className={`ff-tag ${s.tagClass}`}>{s.tag}</span>
                </div>
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#f8fbff" }}>{s.title}</h3>
                <p style={{ margin: 0, color: "#a7b4c9", fontSize: "0.88rem", lineHeight: 1.6, flex: 1 }}>{s.desc}</p>
                <div className="ff-inset" style={{ marginTop: "0.3rem" }}>
                  <span style={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Dosing tip</span>
                  <p style={{ margin: "0.3rem 0 0", color: "#a7b4c9", fontSize: "0.82rem", lineHeight: 1.55 }}>{s.dose}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
        <p style={{ marginTop: "1.2rem", color: "#64748b", fontSize: "0.78rem", lineHeight: 1.6 }}>
          ⚠️ {disclaimer}
        </p>
      </SectionCard>
    </AppPage>
  );
}
