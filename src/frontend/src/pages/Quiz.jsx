import { useReducer, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

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
// SHARED STYLES
// ==========================================
const optionCard = (selected) => ({
  width: "100%",
  padding: "18px 24px",
  marginBottom: "12px",
  borderRadius: "14px",
  border: selected ? "2px solid #3498db" : "2px solid rgba(255,255,255,0.1)",
  backgroundColor: selected ? "rgba(52,152,219,0.2)" : "rgba(255,255,255,0.04)",
  color: "white",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "16px",
  fontSize: "1rem",
  fontWeight: selected ? "bold" : "normal",
  boxShadow: selected ? "0 0 20px rgba(52,152,219,0.35)" : "none",
  transition: "all 0.2s ease",
  textAlign: "left",
});

const inputStyle = {
  width: "100%",
  padding: "14px 18px",
  borderRadius: "12px",
  border: "2px solid rgba(255,255,255,0.1)",
  backgroundColor: "rgba(255,255,255,0.06)",
  color: "white",
  fontSize: "1rem",
  outline: "none",
  boxSizing: "border-box",
  marginTop: "8px",
};

const labelStyle = {
  color: "#d6e6f2",
  fontSize: "0.9rem",
  fontWeight: "bold",
  display: "block",
  marginTop: "16px",
};

// ==========================================
// STEP 1 — GOAL
// ==========================================
function Step1({ state, dispatch }) {
  const goals = [
    { value: "lose_weight",       emoji: "🔥", label: "Lose Weight",       sub: "Burn fat, feel lighter" },
    { value: "gain_muscle",       emoji: "💪", label: "Gain Muscle",        sub: "Build strength & size" },
    { value: "maintain",          emoji: "⚖️", label: "Maintain",           sub: "Stay where I am" },
    { value: "improve_endurance", emoji: "🏃", label: "Improve Endurance",  sub: "Run farther, go longer" },
  ];

  const select = (value) => {
    dispatch({ type: "SET_FIELD", field: "goal_type", value });
    setTimeout(() => dispatch({ type: "NEXT_STEP" }), 300);
  };

  return (
    <>
      <div style={{ fontSize: "4rem", textAlign: "center", marginBottom: "8px" }}>🦅</div>
      <h2 style={{ color: "white", fontSize: "1.6rem", textAlign: "center", margin: "0 0 6px" }}>What's your main goal?</h2>
      <p style={{ color: "#7ec8e3", textAlign: "center", marginBottom: "28px", fontSize: "0.95rem" }}>Let's build your perfect plan</p>
      {goals.map(g => (
        <button key={g.value} onClick={() => select(g.value)} style={optionCard(state.goal_type === g.value)}>
          <span style={{ fontSize: "1.8rem" }}>{g.emoji}</span>
          <div>
            <div style={{ fontWeight: "bold" }}>{g.label}</div>
            <div style={{ fontSize: "0.8rem", color: "#aac4d8", marginTop: "2px" }}>{g.sub}</div>
          </div>
          {state.goal_type === g.value && <span style={{ marginLeft: "auto", color: "#3498db", fontSize: "1.2rem" }}>✓</span>}
        </button>
      ))}
    </>
  );
}

// ==========================================
// STEP 2 — BODY METRICS
// ==========================================
function Step2({ state, dispatch }) {
  const set = (field) => (e) => dispatch({ type: "SET_FIELD", field, value: e.target.value });

  const genders = [
    { value: "male",   emoji: "👨", label: "Male" },
    { value: "female", emoji: "👩", label: "Female" },
    { value: "other",  emoji: "🧑", label: "Other" },
  ];

  return (
    <>
      <div style={{ fontSize: "4rem", textAlign: "center", marginBottom: "8px" }}>📏</div>
      <h2 style={{ color: "white", fontSize: "1.6rem", textAlign: "center", margin: "0 0 6px" }}>Tell us about your body</h2>
      <p style={{ color: "#7ec8e3", textAlign: "center", marginBottom: "24px", fontSize: "0.95rem" }}>We'll calculate your BMI, BMR & TDEE</p>

      <label style={labelStyle}>Gender</label>
      <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
        {genders.map(g => (
          <button key={g.value} onClick={() => dispatch({ type: "SET_FIELD", field: "gender", value: g.value })}
            style={{ ...optionCard(state.gender === g.value), flex: 1, justifyContent: "center", flexDirection: "column", alignItems: "center", padding: "14px 10px", marginBottom: 0, gap: "4px" }}>
            <span style={{ fontSize: "1.6rem" }}>{g.emoji}</span>
            <span style={{ fontSize: "0.85rem" }}>{g.label}</span>
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "4px" }}>
        <div>
          <label style={labelStyle}>Age</label>
          <input type="number" placeholder="e.g. 25" value={state.age} onChange={set("age")} min="1" max="120" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Height (inches)</label>
          <input type="number" placeholder="e.g. 68" value={state.height_in} onChange={set("height_in")} step="0.1" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Weight (lbs)</label>
          <input type="number" placeholder="e.g. 160" value={state.weight_lbs} onChange={set("weight_lbs")} step="0.1" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Target Weight (optional)</label>
          <input type="number" placeholder="e.g. 145" value={state.target_weight} onChange={set("target_weight")} step="0.1" style={inputStyle} />
        </div>
      </div>
    </>
  );
}

// ==========================================
// STEP 3 — ACTIVITY LEVEL
// ==========================================
function Step3({ state, dispatch }) {
  const [openTooltip, setOpenTooltip] = useState(null);

  const levels = [
    { value: "sedentary",         emoji: "🛋️", label: "Sedentary",         sub: "Little or no exercise",            tooltip: "Desk job, mostly sitting all day. Fewer than 5,000 steps/day. e.g. office worker, gamer, driver." },
    { value: "lightly_active",    emoji: "🚶", label: "Lightly Active",     sub: "Light exercise 1–3 days/week",     tooltip: "On your feet part of the day. e.g. teacher, retail worker, or someone who walks ~30 mins/day." },
    { value: "moderately_active", emoji: "🏋️", label: "Moderately Active",  sub: "Moderate exercise 3–5 days/week",  tooltip: "Regular gym sessions or an active job. e.g. nursing, construction, or working out 3–5x/week." },
    { value: "very_active",       emoji: "🏃", label: "Very Active",         sub: "Hard exercise 6–7 days/week",      tooltip: "Intense training nearly every day, or a very physical job. e.g. personal trainer, athlete in season." },
    { value: "extra_active",      emoji: "⚡", label: "Extra Active",         sub: "Athlete-level training",           tooltip: "Twice-a-day training or elite competition prep. e.g. military, Olympic athlete, or heavy manual labor." },
  ];

  const select = (value) => {
    dispatch({ type: "SET_FIELD", field: "activity_level", value });
    setTimeout(() => dispatch({ type: "NEXT_STEP" }), 300);
  };

  return (
    <>
      <div style={{ fontSize: "4rem", textAlign: "center", marginBottom: "8px" }}>🏋️</div>
      <h2 style={{ color: "white", fontSize: "1.6rem", textAlign: "center", margin: "0 0 6px" }}>How active are you?</h2>
      <p style={{ color: "#7ec8e3", textAlign: "center", marginBottom: "24px", fontSize: "0.95rem" }}>Pick your current lifestyle — be honest!</p>
      {levels.map(l => (
        <div key={l.value} style={{ marginBottom: "10px" }}>
          <div style={{ display: "flex", gap: "8px", alignItems: "stretch" }}>
            <button onClick={() => select(l.value)} style={{ ...optionCard(state.activity_level === l.value), flex: 1, marginBottom: 0 }}>
              <span style={{ fontSize: "1.6rem" }}>{l.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: "bold" }}>{l.label}</div>
                <div style={{ fontSize: "0.8rem", color: "#aac4d8", marginTop: "2px" }}>{l.sub}</div>
              </div>
              {state.activity_level === l.value && <span style={{ color: "#3498db", fontSize: "1.2rem" }}>✓</span>}
            </button>
            <button
              onClick={() => setOpenTooltip(openTooltip === l.value ? null : l.value)}
              title="See examples"
              style={{
                width: "36px", flexShrink: 0, borderRadius: "12px",
                border: openTooltip === l.value ? "2px solid rgba(52,152,219,0.5)" : "2px solid rgba(255,255,255,0.1)",
                backgroundColor: openTooltip === l.value ? "rgba(52,152,219,0.15)" : "rgba(255,255,255,0.04)",
                color: openTooltip === l.value ? "#7ec8e3" : "rgba(255,255,255,0.4)",
                cursor: "pointer", fontSize: "0.8rem", fontWeight: "bold",
              }}
            >
              ?
            </button>
          </div>
          {openTooltip === l.value && (
            <div style={{
              backgroundColor: "rgba(52,152,219,0.08)", border: "1px solid rgba(52,152,219,0.2)",
              borderRadius: "8px", padding: "10px 14px", marginTop: "4px",
              color: "#aac4d8", fontSize: "0.82rem", lineHeight: "1.5",
            }}>
              💡 {l.tooltip}
            </div>
          )}
        </div>
      ))}
    </>
  );
}

// ==========================================
// STEP 4 — WORKOUT DAYS
// ==========================================
function Step4({ state, dispatch }) {
  const days = [1, 2, 3, 4, 5, 6, 7];
  const labels = ["", "Once", "Twice", "3x", "4x", "5x", "6x", "Daily"];

  const select = (value) => {
    dispatch({ type: "SET_FIELD", field: "workout_days", value: String(value) });
    setTimeout(() => dispatch({ type: "NEXT_STEP" }), 300);
  };

  return (
    <>
      <div style={{ fontSize: "4rem", textAlign: "center", marginBottom: "8px" }}>📅</div>
      <h2 style={{ color: "white", fontSize: "1.6rem", textAlign: "center", margin: "0 0 6px" }}>How many days can you train?</h2>
      <p style={{ color: "#7ec8e3", textAlign: "center", marginBottom: "32px", fontSize: "0.95rem" }}>Per week — be honest with yourself!</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px" }}>
        {days.map(d => (
          <button key={d} onClick={() => select(d)} style={{
            padding: "20px 0",
            borderRadius: "14px",
            border: String(state.workout_days) === String(d) ? "2px solid #3498db" : "2px solid rgba(255,255,255,0.1)",
            backgroundColor: String(state.workout_days) === String(d) ? "rgba(52,152,219,0.25)" : "rgba(255,255,255,0.04)",
            color: "white",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
            boxShadow: String(state.workout_days) === String(d) ? "0 0 16px rgba(52,152,219,0.4)" : "none",
            transition: "all 0.2s ease",
          }}>
            <span style={{ fontSize: "1.3rem", fontWeight: "bold" }}>{d}</span>
            <span style={{ fontSize: "0.6rem", color: "#aac4d8" }}>{labels[d]}</span>
          </button>
        ))}
      </div>
      {state.workout_days && (
        <p style={{ color: "#7ec8e3", textAlign: "center", marginTop: "20px", fontSize: "0.95rem" }}>
          🦅 {state.workout_days} day{state.workout_days > 1 ? "s" : ""} a week — let's go!
        </p>
      )}
    </>
  );
}

// ==========================================
// STEP 5 — DIET & ALLERGIES
// ==========================================
function Step5({ state, dispatch }) {
  const diets = [
    { value: "vegan",                emoji: "🌱", label: "Vegan" },
    { value: "vegetarian",           emoji: "🥦", label: "Vegetarian" },
    { value: "keto",                 emoji: "🥑", label: "Keto" },
    { value: "paleo",                emoji: "🍖", label: "Paleo" },
    { value: "gluten_free",          emoji: "🌾", label: "Gluten Free" },
    { value: "dairy_free",           emoji: "🥛", label: "Dairy Free" },
    { value: "mediterranean",        emoji: "🫒", label: "Mediterranean" },
    { value: "intermittent_fasting", emoji: "⏱️", label: "Intermittent Fasting" },
  ];

  const allergyList = [
    { value: "peanuts",   emoji: "🥜", label: "Peanuts" },
    { value: "dairy",     emoji: "🧀", label: "Dairy" },
    { value: "gluten",    emoji: "🍞", label: "Gluten" },
    { value: "shellfish", emoji: "🦐", label: "Shellfish" },
    { value: "eggs",      emoji: "🥚", label: "Eggs" },
    { value: "soy",       emoji: "🫘", label: "Soy" },
  ];

  const [customAllergy, setCustomAllergy] = useState("");

  const toggle = (field, value) => dispatch({ type: "TOGGLE_ARRAY", field, value });
  const set = (field) => (e) => dispatch({ type: "SET_FIELD", field, value: e.target.value });

  const addCustomAllergy = () => {
    const val = customAllergy.trim().toLowerCase();
    if (!val || state.allergies.includes(val)) return;
    dispatch({ type: "SET_FIELD", field: "allergies", value: [...state.allergies, val] });
    setCustomAllergy("");
  };

  const chipStyle = (selected) => ({
    padding: "10px 16px",
    borderRadius: "99px",
    border: selected ? "2px solid #3498db" : "2px solid rgba(255,255,255,0.15)",
    backgroundColor: selected ? "rgba(52,152,219,0.2)" : "rgba(255,255,255,0.04)",
    color: "white",
    cursor: "pointer",
    fontSize: "0.85rem",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    transition: "all 0.2s ease",
    boxShadow: selected ? "0 0 12px rgba(52,152,219,0.3)" : "none",
  });

  return (
    <>
      <div style={{ fontSize: "4rem", textAlign: "center", marginBottom: "8px" }}>🥗</div>
      <h2 style={{ color: "white", fontSize: "1.6rem", textAlign: "center", margin: "0 0 6px" }}>Diet & Allergies</h2>
      <p style={{ color: "#7ec8e3", textAlign: "center", marginBottom: "20px", fontSize: "0.95rem" }}>Select all that apply</p>

      <label style={labelStyle}>Dietary Preferences</label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "10px" }}>
        {diets.map(d => (
          <button key={d.value} onClick={() => toggle("dietary_preferences", d.value)} style={chipStyle(state.dietary_preferences.includes(d.value))}>
            <span>{d.emoji}</span> {d.label}
          </button>
        ))}
      </div>

      <label style={{ ...labelStyle, marginTop: "20px" }}>Allergies</label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "10px" }}>
        {allergyList.map(a => (
          <button key={a.value} onClick={() => toggle("allergies", a.value)} style={chipStyle(state.allergies.includes(a.value))}>
            <span>{a.emoji}</span> {a.label}
          </button>
        ))}
        {state.allergies.filter(v => !allergyList.find(a => a.value === v)).map(v => (
          <button key={v} onClick={() => toggle("allergies", v)} style={chipStyle(true)}>
            ⚠️ {v} ×
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
        <input
          type="text"
          placeholder="Other allergy (press Enter to add)"
          value={customAllergy}
          onChange={e => setCustomAllergy(e.target.value)}
          onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addCustomAllergy())}
          style={{ ...inputStyle, flex: 1, padding: "10px 14px", fontSize: "0.9rem" }}
        />
        <button
          onClick={addCustomAllergy}
          style={{ padding: "10px 16px", borderRadius: "12px", border: "2px solid rgba(255,255,255,0.15)", backgroundColor: "rgba(255,255,255,0.08)", color: "white", cursor: "pointer", fontSize: "1.1rem" }}
        >
          +
        </button>
      </div>

      <label style={labelStyle}>Physical Limitations (optional)</label>
      <input type="text" placeholder="e.g. Bad knees, lower back pain..." value={state.limitations} onChange={set("limitations")} style={inputStyle} />
    </>
  );
}

// ==========================================
// REVIEW SCREEN
// ==========================================
function ReviewScreen({ state, onSubmit, loading, error }) {
  const goalLabels     = { lose_weight: "Lose Weight 🔥", gain_muscle: "Gain Muscle 💪", maintain: "Maintain ⚖️", improve_endurance: "Improve Endurance 🏃" };
  const activityLabels = { sedentary: "Sedentary 🛋️", lightly_active: "Lightly Active 🚶", moderately_active: "Moderately Active 🏋️", very_active: "Very Active 🏃", extra_active: "Extra Active ⚡" };

  const row = (label, value) => (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
      <span style={{ color: "#aac4d8", fontSize: "0.9rem" }}>{label}</span>
      <span style={{ color: "white", fontWeight: "bold", fontSize: "0.9rem" }}>{value || "—"}</span>
    </div>
  );

  return (
    <>
      <div style={{ fontSize: "3rem", textAlign: "center", marginBottom: "8px" }}>🦅</div>
      <h2 style={{ color: "white", fontSize: "1.5rem", textAlign: "center", margin: "0 0 4px" }}>Review Your Profile</h2>
      <p style={{ color: "#7ec8e3", textAlign: "center", marginBottom: "20px", fontSize: "0.9rem" }}>Everything look good?</p>

      <div style={{ backgroundColor: "rgba(255,255,255,0.04)", borderRadius: "12px", padding: "16px 20px", marginBottom: "20px" }}>
        {row("Goal", goalLabels[state.goal_type])}
        {row("Gender", state.gender)}
        {row("Age", `${state.age} years`)}
        {row("Height", `${state.height_in} in`)}
        {row("Current Weight", `${state.weight_lbs} lbs`)}
        {state.target_weight && row("Target Weight", `${state.target_weight} lbs`)}
        {row("Activity Level", activityLabels[state.activity_level])}
        {row("Workout Days", `${state.workout_days} days/week`)}
        {state.dietary_preferences.length > 0 && row("Diet", state.dietary_preferences.join(", "))}
        {state.allergies.length > 0 && row("Allergies", state.allergies.join(", "))}
        {state.limitations && row("Limitations", state.limitations)}
      </div>

      {error && <p style={{ color: "#e74c3c", textAlign: "center", marginBottom: "12px" }}>{error}</p>}

      <button onClick={onSubmit} disabled={loading} style={{
        width: "100%", padding: "16px", borderRadius: "12px",
        background: loading ? "rgba(255,255,255,0.1)" : "linear-gradient(to right, #2980b9, #3498db)",
        color: loading ? "rgba(255,255,255,0.4)" : "white",
        border: "none", fontSize: "1rem", fontWeight: "bold",
        cursor: loading ? "not-allowed" : "pointer",
        boxShadow: loading ? "none" : "0 4px 20px rgba(52,152,219,0.4)",
      }}>
        {loading ? "Calculating your metrics..." : "🚀 Submit & Calculate My Metrics"}
      </button>
    </>
  );
}

// ==========================================
// MAIN QUIZ COMPONENT
// ==========================================
export default function Quiz() {
  const navigate = useNavigate();
  const location = useLocation();
  const isRetake = new URLSearchParams(location.search).get("retake") === "true";
  const [state, dispatch] = useReducer(quizReducer, initialState);
  const [animating, setAnimating] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationMsg, setValidationMsg] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    const headers = { Authorization: `Bearer ${token}` };

    if (isRetake) {
      // Pre-fill form with existing quiz data
      axios.get(`${API}/api/v1/onboarding/quiz`, { headers })
        .then(res => {
          const d = res.data;
          const fields = ["goal_type", "age", "gender", "height_in", "weight_lbs", "target_weight", "activity_level", "workout_days", "dietary_preferences", "allergies", "limitations"];
          fields.forEach(field => {
            if (d[field] !== null && d[field] !== undefined) {
              dispatch({ type: "SET_FIELD", field, value: Array.isArray(d[field]) ? d[field] : String(d[field]) });
            }
          });
        }).catch(() => {});
    } else {
      axios.get(`${API}/api/v1/onboarding/status`, { headers })
        .then(res => {
          if (res.data.completed) navigate("/dashboard");
        }).catch(() => {});
    }
  }, [navigate, isRetake]);

  const canProceed = isStepComplete(state);
  const progress = showReview ? 100 : (state.step / TOTAL_STEPS) * 100;
  const stepLabels = ["Goal", "Metrics", "Activity", "Schedule", "Diet"];

  const stepValidationMsgs = {
    2: "Please fill in your age, gender, height, and weight to continue.",
    5: "Almost there — fill in any missing fields to continue.",
  };

  const handleNext = () => {
    if (!canProceed) {
      setValidationMsg(stepValidationMsgs[state.step] || "Please complete this step to continue.");
      return;
    }
    setValidationMsg("");
    if (state.step === TOTAL_STEPS) { setShowReview(true); return; }
    setAnimating(true);
    setTimeout(() => { dispatch({ type: "NEXT_STEP" }); setAnimating(false); }, 200);
  };

  const handleBack = () => {
    if (showReview) { setShowReview(false); return; }
    setAnimating(true);
    setTimeout(() => { dispatch({ type: "PREV_STEP" }); setAnimating(false); }, 200);
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    const token = localStorage.getItem("token");
    const payload = {
      goal_type: state.goal_type,
      age: parseInt(state.age),
      gender: state.gender,
      height_in: parseFloat(state.height_in),
      weight_lbs: parseFloat(state.weight_lbs),
      target_weight: state.target_weight ? parseFloat(state.target_weight) : null,
      activity_level: state.activity_level,
      workout_days: parseInt(state.workout_days),
      dietary_preferences: state.dietary_preferences,
      allergies: state.allergies,
      limitations: state.limitations || null,
    };
    try {
      const method = isRetake ? axios.put : axios.post;
      await method(`${API}/api/v1/onboarding/quiz`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
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
        {!showReview && <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "32px" }}>
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
        </div>}

        {/* Step content with fade + slide animation */}
        <div style={{
          opacity: animating ? 0 : 1,
          transform: animating ? `translateX(${state.direction > 0 ? "20px" : "-20px"})` : "translateX(0)",
          transition: "opacity 0.2s ease, transform 0.2s ease",
        }}>
          {showReview ? (
            <ReviewScreen state={state} onSubmit={handleSubmit} loading={loading} error={error} />
          ) : (
            <>
              {state.step === 1 && <Step1 state={state} dispatch={dispatch} />}
              {state.step === 2 && <Step2 state={state} dispatch={dispatch} />}
              {state.step === 3 && <Step3 state={state} dispatch={dispatch} />}
              {state.step === 4 && <Step4 state={state} dispatch={dispatch} />}
              {state.step === 5 && <Step5 state={state} dispatch={dispatch} />}
            </>
          )}
        </div>

        {/* Inline validation message */}
        {validationMsg && (
          <p style={{ color: "#e07b54", fontSize: "0.88rem", textAlign: "center", marginTop: "12px", marginBottom: "0" }}>
            ⚠️ {validationMsg}
          </p>
        )}

        {/* Manual Next button for steps that need it (2, 5, and review) */}
        {(state.step === 2 || state.step === 5 || showReview) && !loading && (
          <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
            <button onClick={handleBack} style={{
              flex: 1, padding: "14px", borderRadius: "12px",
              backgroundColor: "rgba(255,255,255,0.06)",
              color: "white", border: "1px solid rgba(255,255,255,0.15)",
              fontSize: "1rem", cursor: "pointer", fontWeight: "bold"
            }}>
              ← Back
            </button>
            {!showReview && (
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
            )}
          </div>
        )}

        {/* Subtle back link for auto-advance steps */}
        {!showReview && (state.step === 3 || state.step === 4) && (
          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <button onClick={handleBack} style={{
              background: "none", border: "none",
              color: "rgba(255,255,255,0.4)", cursor: "pointer",
              fontSize: "0.9rem", textDecoration: "underline"
            }}>
              ← Go back
            </button>
          </div>
        )}

        {!showReview && state.step === 1 && (
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.85rem", textAlign: "center", marginTop: "16px" }}>
            Tap an option to continue
          </p>
        )}
      </div>
    </div>
  );
}
