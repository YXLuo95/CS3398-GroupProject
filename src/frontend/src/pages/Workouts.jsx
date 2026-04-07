import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import AppPage from "../components/ui/AppPage";
import SectionCard from "../components/ui/SectionCard";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

const GENERATION_STEPS = [
  { label: "Analyzing your fitness goal...",         duration: 8 },
  { label: "Building your weekly split...",           duration: 10 },
  { label: "Selecting exercises for each day...",     duration: 12 },
  { label: "Generating step-by-step instructions...", duration: 60 },
  { label: "Personalizing difficulty & reps...",      duration: 20 },
  { label: "Finalizing your plan...",                 duration: 10 },
];

const MUSCLE_EMOJI = {
  chest: "💪", back: "🏋️", legs: "🦵", shoulders: "🔝",
  arms: "💪", biceps: "💪", triceps: "💪", core: "🔥",
  cardio: "🏃", glutes: "🍑", full_body: "⚡",
};

const DAY_LABELS = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const DIFFICULTY_COLORS = {
  beginner:     { bg: "rgba(34,197,94,0.15)",  border: "rgba(34,197,94,0.4)",  color: "#86efac" },
  intermediate: { bg: "rgba(251,191,36,0.15)", border: "rgba(251,191,36,0.4)", color: "#fde68a" },
  advanced:     { bg: "rgba(239,68,68,0.15)",  border: "rgba(239,68,68,0.4)",  color: "#fca5a5" },
};

// JS getDay(): 0=Sun,1=Mon,...,6=Sat  →  plan day: 1=Mon,...,7=Sun
function todayPlanDay() {
  const d = new Date().getDay();
  return d === 0 ? 7 : d;
}

function muscleEmoji(group) {
  const key = (group || "").toLowerCase().replace(/\s/g, "_");
  return MUSCLE_EMOJI[key] || "🏋️";
}

// ─── Progress ring ────────────────────────────────────────────────────────────
function ProgressRing({ value, max, color, label, sublabel }) {
  const pct    = max > 0 ? value / max : 0;
  const r      = 28;
  const circ   = 2 * Math.PI * r;
  const dash   = pct * circ;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.3rem" }}>
      <svg width={72} height={72}>
        <circle cx={36} cy={36} r={r} fill="none" stroke="var(--ff-surface-3)" strokeWidth={5} />
        <circle
          cx={36} cy={36} r={r} fill="none"
          stroke={color} strokeWidth={5}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 36 36)"
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
          fill={color} fontSize={13} fontWeight={700}>
          {value}/{max}
        </text>
      </svg>
      <span style={{ color: "var(--ff-text-muted)", fontSize: "0.72rem", textAlign: "center" }}>{sublabel}</span>
    </div>
  );
}

// ─── Loading animation ────────────────────────────────────────────────────────
function GeneratingAnimation() {
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress]   = useState(0);
  const totalDuration = GENERATION_STEPS.reduce((s, x) => s + x.duration, 0);
  const elapsed       = useRef(0);
  const stepElapsed   = useRef(0);

  useEffect(() => {
    const tick = 200;
    const timer = setInterval(() => {
      elapsed.current     += tick / 1000;
      stepElapsed.current += tick / 1000;
      setProgress(Math.min((elapsed.current / totalDuration) * 100, 95));
      const stepDur = GENERATION_STEPS[stepIndex]?.duration ?? 10;
      if (stepElapsed.current >= stepDur && stepIndex < GENERATION_STEPS.length - 1) {
        stepElapsed.current = 0;
        setStepIndex((i) => i + 1);
      }
    }, tick);
    return () => clearInterval(timer);
  }, [stepIndex]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "3rem 1.5rem", textAlign: "center", gap: "2rem" }}>
      <div style={{
        width: 80, height: 80, borderRadius: "50%",
        background: "var(--ff-accent-soft)", border: "2px solid var(--ff-accent-glow)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "2rem", animation: "ff-pulse 1.6s ease-in-out infinite",
      }}>🤖</div>

      <div style={{ maxWidth: 420 }}>
        <p style={{ color: "var(--ff-text)", fontWeight: 700, fontSize: "1.1rem", margin: "0 0 0.4rem" }}>
          Building your personalized plan
        </p>
        <p style={{ color: "var(--ff-text-dim)", fontSize: "0.9rem", margin: 0, minHeight: "1.4em" }}>
          {GENERATION_STEPS[stepIndex]?.label ?? "Almost done..."}
        </p>
      </div>

      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ height: 6, borderRadius: 999, background: "var(--ff-surface-3)", border: "1px solid var(--ff-border-dim)", overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${progress}%`, borderRadius: 999,
            background: "linear-gradient(90deg, var(--ff-accent), var(--ff-cyan))",
            transition: "width 0.4s ease", boxShadow: "0 0 8px var(--ff-accent-glow)",
          }} />
        </div>
        <p style={{ color: "var(--ff-text-muted)", fontSize: "0.76rem", marginTop: "0.5rem" }}>
          This takes ~2 minutes — the AI is crafting your instructions
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%", maxWidth: 380, textAlign: "left" }}>
        {GENERATION_STEPS.map((step, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: "0.65rem",
            color: i < stepIndex ? "var(--ff-green)" : i === stepIndex ? "var(--ff-text)" : "var(--ff-text-muted)",
            fontSize: "0.85rem", transition: "color 0.3s",
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
function ExerciseCard({ exercise, allExpanded }) {
  const [expanded, setExpanded] = useState(false);
  const steps      = exercise.instructions ? exercise.instructions.split(" | ") : [];
  const hasDetails = steps.length > 0 || !!exercise.image_url;
  const diffStyle  = DIFFICULTY_COLORS[exercise.difficulty] || {};

  useEffect(() => { setExpanded(allExpanded); }, [allExpanded]);

  return (
    <div className="ff-card ff-card-hover" style={{ padding: "1rem 1.2rem" }} onClick={() => setExpanded((e) => !e)}>
      <div className="ff-flex-between" style={{ marginBottom: hasDetails && expanded ? "0.5rem" : 0 }}>
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
          {/* 5. Difficulty badge */}
          {exercise.difficulty && (
            <span style={{
              fontSize: "0.7rem", fontWeight: 600, padding: "2px 7px", borderRadius: 999,
              background: diffStyle.bg, border: `1px solid ${diffStyle.border}`, color: diffStyle.color,
            }}>
              {exercise.difficulty}
            </span>
          )}
          {hasDetails && (
            <span style={{ color: "var(--ff-text-muted)", fontSize: "0.8rem", marginLeft: "0.3rem" }}>
              {expanded ? "▲" : "▼"}
            </span>
          )}
        </div>
      </div>

      {expanded && hasDetails && (
        <div style={{
          marginTop: "0.75rem", paddingTop: "0.75rem",
          borderTop: "1px solid var(--ff-border-dim)",
          display: "flex", flexDirection: "column", gap: "0.4rem",
        }}>
          {exercise.image_url && (
            <img
              src={exercise.image_url}
              alt={exercise.name}
              style={{ width: "100%", maxWidth: 320, borderRadius: 10, marginBottom: "0.5rem", objectFit: "cover" }}
            />
          )}
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
              href={exercise.youtube_url} target="_blank" rel="noopener noreferrer"
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
function DaySection({ day, exercises, completedDays, onMarkComplete, onUnmark, marking, allExpanded, dayRef }) {
  const isDone  = completedDays.includes(day);
  const isToday = day === todayPlanDay();

  // 3. Muscle group summary
  const muscleGroups = [...new Set(exercises.map((e) => e.muscle_group))];

  return (
    <div
      ref={dayRef}
      className="ff-card"
      style={{
        overflow: "visible",
        // 1. Highlight today
        border: isToday ? "1.5px solid var(--ff-accent)" : undefined,
        boxShadow: isToday ? "0 0 16px var(--ff-accent-glow)" : undefined,
      }}
    >
      <div className="ff-accent-bar" />
      <div style={{ padding: "1.2rem 1.5rem" }}>
        <div className="ff-flex-between" style={{ marginBottom: "0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span className="ff-tag ff-tag-blue" style={{ fontSize: "0.8rem" }}>Day {day}</span>
            <span style={{ color: "var(--ff-text)", fontWeight: 700 }}>{DAY_LABELS[day]}</span>
            {isToday && (
              <span style={{
                fontSize: "0.7rem", fontWeight: 600, padding: "2px 8px", borderRadius: 999,
                background: "var(--ff-accent-soft)", border: "1px solid var(--ff-accent-glow)",
                color: "var(--ff-accent)",
              }}>Today</span>
            )}
          </div>
          {isDone ? (
            <button
              className="ff-btn ff-btn-ghost ff-btn-sm"
              onClick={() => onUnmark(day)}
              style={{ color: "var(--ff-green)", borderColor: "var(--ff-green)" }}
            >
              ✓ Completed — Undo
            </button>
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

        {/* 3. Muscle group chips */}
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "1rem" }}>
          {muscleGroups.map((g) => (
            <span key={g} style={{ fontSize: "0.72rem", color: "var(--ff-text-muted)", display: "flex", alignItems: "center", gap: "0.2rem" }}>
              {muscleEmoji(g)} {g}
            </span>
          ))}
        </div>

        <div className="ff-stack">
          {exercises.map((ex) => <ExerciseCard key={ex.id} exercise={ex} allExpanded={allExpanded} />)}
        </div>
      </div>
    </div>
  );
}

// ─── Rest day card ────────────────────────────────────────────────────────────
function RestDayCard({ day }) {
  const isToday = day === todayPlanDay();
  return (
    <div className="ff-card" style={{
      overflow: "visible", opacity: 0.6,
      border: isToday ? "1.5px solid var(--ff-accent)" : undefined,
    }}>
      <div style={{ padding: "1rem 1.5rem", display: "flex", alignItems: "center", gap: "0.8rem" }}>
        <span className="ff-tag ff-tag-blue" style={{ fontSize: "0.8rem" }}>Day {day}</span>
        <span style={{ color: "var(--ff-text)", fontWeight: 700 }}>{DAY_LABELS[day]}</span>
        {isToday && <span style={{ fontSize: "0.7rem", fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: "var(--ff-accent-soft)", border: "1px solid var(--ff-accent-glow)", color: "var(--ff-accent)" }}>Today</span>}
        <span style={{ marginLeft: "auto", color: "var(--ff-text-muted)", fontSize: "0.85rem" }}>😴 Rest Day</span>
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
  const [allExpanded, setAllExpanded] = useState(false);
  const todayRef                      = useRef(null);

  const headers = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

  useEffect(() => {
    if (!isLoggedIn) return;
    setLoading(true);
    Promise.all([
      axios.get(`${API}/api/v1/workout/plan`, { headers: headers() }).catch((e) => e.response),
      axios.get(`${API}/api/v1/workout/complete`, { headers: headers() }).catch(() => ({ data: [] })),
    ]).then(([planRes, compRes]) => {
      if (planRes?.status === 200) setPlan(planRes.data);
      setCompleted((compRes?.data || []).map((c) => c.day));
    }).finally(() => setLoading(false));
  }, [isLoggedIn]);

  // 7. Smooth scroll to today on load
  useEffect(() => {
    if (todayRef.current) {
      setTimeout(() => todayRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 400);
    }
  }, [plan]);

  async function handleGenerate() {
    setError(null);
    setGenerating(true);
    try {
      const res = await axios.post(`${API}/api/v1/workout/plan`, {}, { headers: headers() });
      setPlan(res.data);
    } catch (e) {
      setError(e.response?.data?.detail || "Failed to generate plan.");
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

  // 2. Unmark complete
  async function handleUnmark(day) {
    try {
      await axios.delete(`${API}/api/v1/workout/complete/${day}`, { headers: headers() });
      setCompleted((prev) => prev.filter((d) => d !== day));
    } catch (e) {
      // ignore
    }
  }

  const byDay = plan
    ? plan.exercises.reduce((acc, ex) => {
        if (!acc[ex.day]) acc[ex.day] = [];
        acc[ex.day].push(ex);
        return acc;
      }, {})
    : {};
  const trainingDays = Object.keys(byDay).map(Number).sort((a, b) => a - b);

  // 6. Build full week with rest days between first and last training day
  const allDays = trainingDays.length > 0
    ? Array.from({ length: trainingDays[trainingDays.length - 1] - trainingDays[0] + 1 },
        (_, i) => trainingDays[0] + i)
    : [];

  const today = todayPlanDay();

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

      {generating && (
        <SectionCard title="Generating Your Plan">
          <GeneratingAnimation />
        </SectionCard>
      )}

      {error && !generating && (
        <div style={{
          background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
          borderRadius: 12, padding: "1rem 1.2rem", marginBottom: "1rem",
          color: "#fca5a5", fontSize: "0.9rem",
        }}>
          {error}
        </div>
      )}

      {!plan && !generating && (
        <SectionCard title="No Plan Yet">
          <p className="ff-muted" style={{ lineHeight: 1.7 }}>
            You don't have a workout plan yet. Complete the quiz first, then generate your personalized plan.
          </p>
          <div className="ff-actions">
            <button className="ff-btn ff-btn-primary" onClick={handleGenerate}>Generate My Plan</button>
            <Link to="/quiz" className="ff-btn ff-btn-ghost">Go to Quiz</Link>
          </div>
        </SectionCard>
      )}

      {plan && !generating && (
        <>
          <SectionCard title="Your Plan">
            {/* 4. Progress ring + KPIs */}
            <div style={{ display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap", marginBottom: "1rem" }}>
              <ProgressRing
                value={completedDays.length}
                max={trainingDays.length}
                color="var(--ff-accent)"
                sublabel="Week Progress"
              />
              <div className="ff-grid ff-grid-3" style={{ flex: 1 }}>
                <div className="ff-kpi">
                  <div className="ff-kpi-value" style={{ color: "var(--ff-accent)" }}>{trainingDays.length}</div>
                  <div className="ff-kpi-label">Training Days</div>
                </div>
                <div className="ff-kpi">
                  <div className="ff-kpi-value" style={{ color: "var(--ff-green)" }}>{plan.exercises.length}</div>
                  <div className="ff-kpi-label">Total Exercises</div>
                </div>
                <div className="ff-kpi">
                  <div className="ff-kpi-value" style={{ color: "var(--ff-amber)" }}>{completedDays.length}</div>
                  <div className="ff-kpi-label">Completed</div>
                </div>
              </div>
            </div>
            <div className="ff-actions">
              <button className="ff-btn ff-btn-ghost ff-btn-sm" onClick={() => setAllExpanded((v) => !v)}>
                {allExpanded ? "Collapse All" : "Expand All"}
              </button>
              <button className="ff-btn ff-btn-ghost ff-btn-sm" onClick={handleDelete}>
                Regenerate Plan
              </button>
            </div>
          </SectionCard>

          {/* 6. Full week with rest days */}
          <div className="ff-stack" style={{ gap: "1.2rem" }}>
            {allDays.map((day) =>
              byDay[day] ? (
                <DaySection
                  key={day}
                  day={day}
                  exercises={byDay[day]}
                  completedDays={completedDays}
                  onMarkComplete={handleMarkComplete}
                  onUnmark={handleUnmark}
                  marking={marking}
                  allExpanded={allExpanded}
                  dayRef={day === today ? todayRef : null}
                />
              ) : (
                <RestDayCard key={day} day={day} />
              )
            )}
          </div>
        </>
      )}

      <style>{`
        @keyframes ff-pulse {
          0%, 100% { transform: scale(1);   box-shadow: 0 0 0   0   var(--ff-accent-glow); }
          50%       { transform: scale(1.08); box-shadow: 0 0 22px 6px var(--ff-accent-glow); }
        }
      `}</style>
    </AppPage>
  );
}
