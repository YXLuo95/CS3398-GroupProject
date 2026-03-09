import { useReducer, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// ==========================================
// STATE MANAGEMENT
// ==========================================
const initialState = {
  step: 1,
  direction: 1,
  goal_type: "",
  age: "",
  gender: "",
  height_in: "",
  weight_lbs: "",
  target_weight: "",
  activity_level: "",
  workout_days: "",
  dietary_preferences: [],
  allergies: [],
  limitations: "",
};

function quizReducer(state, action) {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "TOGGLE_ARRAY":
      const arr = state[action.field];
      const exists = arr.includes(action.value);
      return { ...state, [action.field]: exists ? arr.filter(v => v !== action.value) : [...arr, action.value] };
    case "NEXT_STEP":
      return { ...state, step: state.step + 1, direction: 1 };
    case "PREV_STEP":
      return { ...state, step: state.step - 1, direction: -1 };
    default:
      return state;
  }
}

const TOTAL_STEPS = 5;

function isStepComplete(state) {
  switch (state.step) {
    case 1: return !!state.goal_type;
    case 2: return !!state.age && !!state.gender && !!state.height_in && !!state.weight_lbs;
    case 3: return !!state.activity_level;
    case 4: return !!state.workout_days;
    case 5: return true;
    default: return false;
  }
}

// ==========================================
// STEP PLACEHOLDERS
// ==========================================
const stepMeta = [
  { emoji: "🦅", title: "What's your main goal?",       sub: "Let's build your perfect plan" },
  { emoji: "📏", title: "Tell us about your body",       sub: "We'll calculate your BMI, BMR & TDEE" },
  { emoji: "🏋️", title: "How active are you?",           sub: "Pick your current lifestyle" },
  { emoji: "📅", title: "How many days can you train?",  sub: "Per week — be honest with yourself!" },
  { emoji: "🥗", title: "Diet & Allergies",              sub: "Select all that apply" },
];

function StepPlaceholder({ step }) {
  const meta = stepMeta[step - 1];
  return (
    <div style={{ textAlign: "center", padding: "60px 20px", color: "white" }}>
      <div style={{ fontSize: "4rem", marginBottom: "16px" }}>{meta.emoji}</div>
      <h2 style={{ fontSize: "1.6rem", margin: "0 0 6px" }}>{meta.title}</h2>
      <p style={{ color: "#7ec8e3", fontSize: "0.95rem" }}>{meta.sub}</p>
      <p style={{ color: "rgba(255,255,255,0.3)", marginTop: "40px", fontSize: "0.85rem" }}>Step content loading...</p>
    </div>
  );
}

// ==========================================
// MAIN QUIZ COMPONENT
// ==========================================
export default function Quiz() {
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(quizReducer, initialState);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("token")) navigate("/login");
  }, [navigate]);

  const canProceed = isStepComplete(state);
  const progress = (state.step / TOTAL_STEPS) * 100;
  const stepLabels = ["Goal", "Metrics", "Activity", "Schedule", "Diet"];

  const handleNext = () => {
    if (!canProceed) return;
    setAnimating(true);
    setTimeout(() => { dispatch({ type: "NEXT_STEP" }); setAnimating(false); }, 200);
  };

  const handleBack = () => {
    setAnimating(true);
    setTimeout(() => { dispatch({ type: "PREV_STEP" }); setAnimating(false); }, 200);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #071a2d 0%, #0d2b45 50%, #12395d 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "0 20px 40px",
    }}>
      {/* Thin top progress bar */}
      <div style={{ width: "100%", height: "4px", backgroundColor: "rgba(255,255,255,0.08)", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{
          height: "100%",
          width: `${progress}%`,
          background: "linear-gradient(to right, #2980b9, #7ec8e3)",
          transition: "width 0.5s ease",
          boxShadow: "0 0 8px rgba(126,200,227,0.8)"
        }} />
      </div>

      <div style={{ width: "100%", maxWidth: "560px", marginTop: "40px" }}>

        {/* Step dot indicators */}
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "32px" }}>
          {stepLabels.map((label, i) => (
            <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "5px" }}>
              <div style={{
                width: i + 1 === state.step ? "32px" : "10px",
                height: "10px",
                borderRadius: "99px",
                backgroundColor: i + 1 < state.step ? "#3498db" : i + 1 === state.step ? "#7ec8e3" : "rgba(255,255,255,0.15)",
                transition: "all 0.4s ease",
                boxShadow: i + 1 === state.step ? "0 0 10px rgba(126,200,227,0.8)" : "none"
              }} />
            </div>
          ))}
        </div>

        {/* Step content with fade + slide animation */}
        <div style={{
          opacity: animating ? 0 : 1,
          transform: animating ? `translateX(${state.direction > 0 ? "20px" : "-20px"})` : "translateX(0)",
          transition: "opacity 0.2s ease, transform 0.2s ease",
        }}>
          <StepPlaceholder step={state.step} />
        </div>

        {/* Navigation */}
        <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
          {state.step > 1 ? (
            <button onClick={handleBack} style={{
              flex: 1, padding: "14px", borderRadius: "12px",
              backgroundColor: "rgba(255,255,255,0.06)",
              color: "white", border: "1px solid rgba(255,255,255,0.15)",
              fontSize: "1rem", cursor: "pointer", fontWeight: "bold"
            }}>
              ← Back
            </button>
          ) : <div style={{ flex: 1 }} />}

          <button onClick={handleNext} disabled={!canProceed} style={{
            flex: 2, padding: "14px", borderRadius: "12px",
            background: canProceed ? "linear-gradient(to right, #2980b9, #3498db)" : "rgba(255,255,255,0.08)",
            color: canProceed ? "white" : "rgba(255,255,255,0.3)",
            border: "none", fontSize: "1rem",
            cursor: canProceed ? "pointer" : "not-allowed",
            fontWeight: "bold",
            boxShadow: canProceed ? "0 4px 15px rgba(52,152,219,0.35)" : "none",
            transition: "all 0.3s ease"
          }}>
            {state.step === TOTAL_STEPS ? "Review →" : "Next →"}
          </button>
        </div>

        {state.step === 1 && (
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.85rem", textAlign: "center", marginTop: "16px" }}>
            Tap an option to continue
          </p>
        )}
      </div>
    </div>
  );
}
