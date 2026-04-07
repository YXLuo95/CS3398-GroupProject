import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import AppPage from "../components/ui/AppPage";
import SectionCard from "../components/ui/SectionCard";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

const GENERATION_STEPS = [
  { label: "Analyzing your fitness goal...",        duration: 8 },
  { label: "Building your weekly split...",          duration: 10 },
  { label: "Selecting exercises for each day...",    duration: 12 },
  { label: "Generating step-by-step instructions...",duration: 60 },
  { label: "Personalizing difficulty & reps...",     duration: 20 },
  { label: "Finalizing your plan...",                duration: 10 },
];

const MUSCLE_EMOJI = {
  chest: "💪", back: "🏋️", legs: "🦵", shoulders: "🔝",
  arms: "💪", biceps: "💪", triceps: "💪", core: "🔥", cardio: "🏃", glutes: "🍑",
  full_body: "⚡",
};

const DAY_LABELS = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function muscleEmoji(group) {
  const key = (group || "").toLowerCase().replace(/\s/g, "_");
  return MUSCLE_EMOJI[key] || "🏋️";
}

// ─── Loading animation shown during plan generation ───────────────────────────
function GeneratingAnimation({ onCancel }) {
  const [stepIndex, setStepIndex]   = useState(0);
  const [progress, setProgress]     = useState(0);
  const totalDuration               = GENERATION_STEPS.reduce((s, x) => s + x.duration, 0);
  const elapsed                     = useRef(0);
  const stepElapsed                 = useRef(0);

  useEffect(() => {
    const tick = 200; // ms
    const timer = setInterval(() => {
      elapsed.current     += tick / 1000;
      stepElapsed.current += tick / 1000;

      const pct = Math.min((elapsed.current / totalDuration) * 100, 95);
      setProgress(pct);

      const stepDur = GENERATION_STEPS[stepIndex]?.duration ?? 10;
      if (stepElapsed.current >= stepDur && stepIndex < GENERATION_STEPS.length - 1) {
        stepElapsed.current = 0;
        setStepIndex((i) => i + 1);
      }
    }, tick);
    return () => clearInterval(timer);
  }, [stepIndex]);

  const currentLabel = GENERATION_STEPS[stepIndex]?.label ?? "Almost done...";

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "3rem 1.5rem", textAlign: "center", gap: "2rem",
    }}>
      {/* Pulsing icon */}
      <div style={{
        width: 80, height: 80, borderRadius: "50%",
        background: "var(--ff-accent-soft)",
        border: "2px solid var(--ff-accent-glow)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "2rem",
        animation: "ff-pulse 1.6s ease-in-out infinite",
      }}>
        🤖
      </div>

      <div style={{ maxWidth: 420 }}>
        <p style={{ color: "var(--ff-text)", fontWeight: 700, fontSize: "1.1rem", margin: "0 0 0.4rem" }}>
          Building your personalized plan
        </p>
        <p style={{ color: "var(--ff-text-dim)", fontSize: "0.9rem", margin: 0, minHeight: "1.4em", transition: "opacity 0.3s" }}>
          {currentLabel}
        </p>
      </div>

      {/* Progress bar */}
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{
          height: 6, borderRadius: 999,
          background: "var(--ff-surface-3)",
          border: "1px solid var(--ff-border-dim)",
          overflow: "hidden",
        }}>
          <div style={{
            height: "100%",
            width: `${progress}%`,
            borderRadius: 999,
            background: "linear-gradient(90deg, var(--ff-accent), var(--ff-cyan))",
            transition: "width 0.4s ease",
            boxShadow: "0 0 8px var(--ff-accent-glow)",
          }} />
        </div>
        <p style={{ color: "var(--ff-text-muted)", fontSize: "0.76rem", marginTop: "0.5rem" }}>
          This takes ~2 minutes — the AI is crafting your instructions
        </p>
      </div>

      {/* Steps checklist */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%", maxWidth: 380, textAlign: "left" }}>
        {GENERATION_STEPS.map((step, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: "0.65rem",
            color: i < stepIndex ? "var(--ff-green)" : i === stepIndex ? "var(--ff-text)" : "var(--ff-text-muted)",
            fontSize: "0.85rem",
            transition: "color 0.3s",
          }}>
            <span style={{ fontSize: "0.95rem", width: 18, textAlign: "center" }}>
              {i < stepIndex ? "✓" : i === stepIndex ? "›" : "·"}
            </span>
            {step.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Single exercise card ─────────────────────────────────────────────────────
function ExerciseCard({ exercise }) {
  const [expanded, setExpanded] = useState(false);
  const steps = exercise.instructions ? exercise.instructions.split(" | ") : [];

  return (
    <div className="ff-card ff-card-hover" style={{ padding: "1rem 1.2rem" }} onClick={() => setExpanded((e) => !e)}>
      <div className="ff-flex-between" style={{ marginBottom: steps.length ? "0.5rem" : 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <span style={{ fontSize: "1.3rem" }}>{muscleEmoji(exercise.muscle_group)}</span>
          <div>
            <p style={{ margin: 0, fontWeight: 700, color: "var(--ff-text)", fontSize: "0.95rem" }}>{exercise.name}</p>
            <p style={{ margin: 0, color: "var(--ff-text-muted)", fontSize: "0.78rem" }}>{exercise.muscle_group}</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.4rem", alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
          <span className="ff-tag ff-tag-blue">{exercise.sets} sets</span>
          <span className="ff-tag ff-tag-amber">{exercise.reps} reps</span>
          {steps.length > 0 && (
            <span style={{ color: "var(--ff-text-muted)", fontSize: "0.8rem", marginLeft: "0.3rem" }}>
              {expanded ? "▲" : "▼"}
            </span>
          )}
        </div>
      </div>

      {expanded && steps.length > 0 && (
        <div style={{
          marginTop: "0.75rem", paddingTop: "0.75rem",
          borderTop: "1px solid var(--ff-border-dim)",
          display: "flex", flexDirection: "column", gap: "0.4rem",
        }}>
          {steps.map((step, i) => (
            <div key={i} style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
              <span style={{
                minWidth: 22, height: 22, borderRadius: "50%",
                background: "var(--ff-accent-soft)", border: "1px solid rgba(59,130,246,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.72rem", fontWeight: 700, color: "#c7dcff", flexShrink: 0,
              }}>{i + 1}</span>
              <p style={{ margin: 0, color: "var(--ff-text-dim)", fontSize: "0.85rem", lineHeight: 1.5 }}>{step.trim()}</p>
            </div>
          ))}
          {exercise.youtube_url && (
            <a
              href={exercise.youtube_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="ff-btn ff-btn-ghost ff-btn-sm"
              style={{ alignSelf: "flex-start", marginTop: "0.4rem" }}
            >
              ▶ Watch Tutorial
            </a>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Day section ──────────────────────────────────────────────────────────────
function DaySection({ day, exercises, completedDays, onMarkComplete, marking }) {
  const isDone = completedDays.includes(day);

  return (
    <div className="ff-card" style={{ overflow: "visible" }}>
      <div className="ff-accent-bar" />
      <div style={{ padding: "1.2rem 1.5rem" }}>
        <div className="ff-flex-between" style={{ marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span className="ff-tag ff-tag-blue" style={{ fontSize: "0.8rem" }}>Day {day}</span>
            <span style={{ color: "var(--ff-text)", fontWeight: 700 }}>{DAY_LABELS[day]}</span>
          </div>
          {isDone ? (
            <span className="ff-tag ff-tag-green">✓ Completed</span>
          ) : (
            <button
              className="ff-btn ff-btn-green ff-btn-sm"
              onClick={() => onMarkComplete(day)}
              disabled={marking === day}
            >
              {marking === day ? "Saving..." : "Mark Complete"}
            </button>
          )}
        </div>
        <div className="ff-stack">
          {exercises.map((ex) => <ExerciseCard key={ex.id} exercise={ex} />)}
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Workouts() {
  const navigate                      = useNavigate();
  const isLoggedIn                    = Boolean(localStorage.getItem("token"));
  const [plan, setPlan]               = useState(null);
  const [loading, setLoading]         = useState(false);
  const [generating, setGenerating]   = useState(false);
  const [error, setError]             = useState(null);
  const [completedDays, setCompleted] = useState([]);
  const [marking, setMarking]         = useState(null);

  const headers = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  // Fetch plan + completions on mount
  useEffect(() => {
    if (!isLoggedIn) return;
    setLoading(true);
    Promise.all([
      axios.get(`${API}/api/v1/workout/plan`, { headers: headers() }).catch((e) => e.response),
      axios.get(`${API}/api/v1/workout/complete`, { headers: headers() }).catch(() => ({ data: [] })),
    ]).then(([planRes, compRes]) => {
      if (planRes?.status === 200) setPlan(planRes.data);
      const days = (compRes?.data || []).map((c) => c.day);
      setCompleted(days);
    }).finally(() => setLoading(false));
  }, [isLoggedIn]);

  async function handleGenerate() {
    setError(null);
    setGenerating(true);
    try {
      const res = await axios.post(`${API}/api/v1/workout/plan`, {}, { headers: headers() });
      setPlan(res.data);
    } catch (e) {
      const msg = e.response?.data?.detail || "Failed to generate plan.";
      setError(msg);
    } finally {
      setGenerating(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Regenerate your plan? This will replace your current plan.")) return;
    await axios.delete(`${API}/api/v1/workout/plan`, { headers: headers() });
    setPlan(null);
    setCompleted([]);
    handleGenerate();
  }

  async function handleMarkComplete(day) {
    setMarking(day);
    try {
      await axios.post(`${API}/api/v1/workout/complete`, { day }, { headers: headers() });
      setCompleted((prev) => [...prev, day]);
    } catch (e) {
      // already marked — ignore
    } finally {
      setMarking(null);
    }
  }

  // Group exercises by day
  const byDay = plan
    ? plan.exercises.reduce((acc, ex) => {
        if (!acc[ex.day]) acc[ex.day] = [];
        acc[ex.day].push(ex);
        return acc;
      }, {})
    : {};
  const days = Object.keys(byDay).map(Number).sort((a, b) => a - b);

  // ── Not logged in ──────────────────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <AppPage eyebrow="TRAINING" title="Workout" accent="Plans"
        subtitle="Get a personalized AI-generated plan built around your goals.">
        <SectionCard title="Unlock Your Personal Plan">
          <p className="ff-muted" style={{ lineHeight: 1.7, marginBottom: "0.6rem" }}>
            Take the 5-minute fitness quiz to get a program built around your body, goals, and schedule.
          </p>
          <div className="ff-actions">
            <Link to="/signup" className="ff-btn ff-btn-green">Get My Free Plan</Link>
            <Link to="/login" className="ff-btn ff-btn-ghost">Login</Link>
          </div>
        </SectionCard>
      </AppPage>
    );
  }

  // ── Loading initial fetch ─────────────────────────────────────────────────
  if (loading) {
    return (
      <AppPage eyebrow="TRAINING" title="Workout" accent="Plans" subtitle="">
        <SectionCard title="Loading your plan...">
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--ff-text-dim)" }}>
            Fetching your workout data...
          </div>
        </SectionCard>
      </AppPage>
    );
  }

  return (
    <AppPage eyebrow="TRAINING" title="Workout" accent="Plans"
      subtitle="Your AI-generated plan tailored to your fitness goal and activity level.">

      {/* ── Generating animation ── */}
      {generating && (
        <SectionCard title="Generating Your Plan">
          <GeneratingAnimation />
        </SectionCard>
      )}

      {/* ── Error ── */}
      {error && !generating && (
        <div style={{
          background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
          borderRadius: 12, padding: "1rem 1.2rem", marginBottom: "1rem",
          color: "#fca5a5", fontSize: "0.9rem",
        }}>
          {error}
        </div>
      )}

      {/* ── No plan yet ── */}
      {!plan && !generating && (
        <SectionCard title="No Plan Yet">
          <p className="ff-muted" style={{ lineHeight: 1.7 }}>
            You don't have a workout plan yet. Complete the quiz first, then generate your personalized plan.
          </p>
          <div className="ff-actions">
            <button className="ff-btn ff-btn-primary" onClick={handleGenerate}>
              Generate My Plan
            </button>
            <Link to="/quiz" className="ff-btn ff-btn-ghost">Go to Quiz</Link>
          </div>
        </SectionCard>
      )}

      {/* ── Plan exists ── */}
      {plan && !generating && (
        <>
          {/* Summary bar */}
          <SectionCard title="Your Plan">
            <div className="ff-grid ff-grid-4" style={{ marginBottom: "1rem" }}>
              <div className="ff-kpi">
                <div className="ff-kpi-value" style={{ color: "var(--ff-accent)" }}>{days.length}</div>
                <div className="ff-kpi-label">Training Days</div>
              </div>
              <div className="ff-kpi">
                <div className="ff-kpi-value" style={{ color: "var(--ff-green)" }}>{plan.exercises.length}</div>
                <div className="ff-kpi-label">Total Exercises</div>
              </div>
              <div className="ff-kpi">
                <div className="ff-kpi-value" style={{ color: "var(--ff-amber)" }}>{completedDays.length}</div>
                <div className="ff-kpi-label">Completed This Week</div>
              </div>
              <div className="ff-kpi">
                <div className="ff-kpi-value" style={{ color: "var(--ff-cyan)" }}>
                  {days.length > 0 ? Math.round((completedDays.length / days.length) * 100) : 0}%
                </div>
                <div className="ff-kpi-label">Week Progress</div>
              </div>
            </div>
            <div className="ff-actions">
              <button className="ff-btn ff-btn-ghost ff-btn-sm" onClick={handleDelete}>
                Regenerate Plan
              </button>
            </div>
          </SectionCard>

          {/* Days */}
          <div className="ff-stack" style={{ gap: "1.2rem" }}>
            {days.map((day) => (
              <DaySection
                key={day}
                day={day}
                exercises={byDay[day]}
                completedDays={completedDays}
                onMarkComplete={handleMarkComplete}
                marking={marking}
              />
            ))}
          </div>
        </>
      )}

      {/* Pulse keyframe injected inline */}
      <style>{`
        @keyframes ff-pulse {
          0%, 100% { transform: scale(1);   box-shadow: 0 0 0   0   var(--ff-accent-glow); }
          50%       { transform: scale(1.08); box-shadow: 0 0 22px 6px var(--ff-accent-glow); }
        }
      `}</style>
    </AppPage>
  );
}
