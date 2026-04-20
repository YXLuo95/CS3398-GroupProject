import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import AppPage from "../components/ui/AppPage";
import SectionCard from "../components/ui/SectionCard";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

const MUSCLE_COLORS = {
  chest:     { bg: "rgba(248,113,113,0.15)", color: "#f87171" },
  back:      { bg: "rgba(96,165,250,0.15)",  color: "#60a5fa" },
  shoulders: { bg: "rgba(167,139,250,0.15)", color: "#a78bfa" },
  biceps:    { bg: "rgba(244,114,182,0.15)", color: "#f472b6" },
  triceps:   { bg: "rgba(251,146,60,0.15)",  color: "#fb923c" },
  legs:      { bg: "rgba(74,222,128,0.15)",  color: "#4ade80" },
  core:      { bg: "rgba(250,204,21,0.15)",  color: "#facc15" },
  cardio:    { bg: "rgba(34,211,238,0.15)",  color: "#22d3ee" },
};

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const WEEKDAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function muscleTag(group) {
  const style = MUSCLE_COLORS[group] || { bg: "rgba(100,116,139,0.15)", color: "#94a3b8" };
  return (
    <span key={group} style={{
      fontSize: "0.72rem", fontWeight: 600, padding: "2px 8px", borderRadius: 999,
      background: style.bg, color: style.color, border: `1px solid ${style.color}44`,
    }}>
      {group}
    </span>
  );
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" });
}

// ─── Group history entries by calendar date ───────────────────────────────────
function groupByDate(entries) {
  const groups = {};
  for (const entry of entries) {
    const d = new Date(entry.completed_at);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
    if (!groups[key]) {
      groups[key] = {
        date:        entry.completed_at,
        dateKey:     key,
        exercises:   [],
        sets_logged: 0,
      };
    }
    groups[key].exercises.push(...entry.exercises);
    groups[key].sets_logged += entry.sets_logged;
  }
  // deduplicate exercises by name within a day
  for (const g of Object.values(groups)) {
    const seen = new Set();
    g.exercises = g.exercises.filter(ex => {
      if (seen.has(ex.name)) return false;
      seen.add(ex.name);
      return true;
    });
  }
  return Object.values(groups).sort((a, b) => new Date(b.date) - new Date(a.date));
}

// ─── List View ────────────────────────────────────────────────────────────────
function HistoryDayCard({ group }) {
  const [expanded, setExpanded] = useState(false);
  const uniqueGroups = [...new Set(group.exercises.map(e => e.muscle_group))];

  return (
    <div
      onClick={() => setExpanded(e => !e)}
      style={{
        background: "var(--ff-surface-2)", border: "1px solid var(--ff-border-dim)",
        borderRadius: 12, padding: "1rem 1.25rem", cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
        <div>
          <p style={{ margin: 0, fontWeight: 700, color: "var(--ff-text)", fontSize: "0.95rem" }}>
            {formatDate(group.date)}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
            {uniqueGroups.map(g => muscleTag(g))}
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--ff-text-muted)" }}>
              <span style={{ color: "var(--ff-accent)", fontWeight: 700 }}>{group.exercises.length}</span> exercises
            </span>
            {group.sets_logged > 0 && (
              <span style={{ fontSize: "0.8rem", color: "var(--ff-text-muted)" }}>
                <span style={{ color: "var(--ff-green)", fontWeight: 700 }}>{group.sets_logged}</span> sets logged
              </span>
            )}
          </div>
          <span style={{ color: "var(--ff-text-muted)", fontSize: "0.8rem" }}>{expanded ? "▲" : "▼"}</span>
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: "0.9rem", paddingTop: "0.9rem", borderTop: "1px solid var(--ff-border-dim)" }}
          onClick={e => e.stopPropagation()}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {group.exercises.map((ex, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "0.5rem 0.75rem", background: "var(--ff-surface-3)",
                borderRadius: 8, fontSize: "0.85rem",
              }}>
                <span style={{ color: "var(--ff-text)", fontWeight: 600 }}>{ex.name}</span>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <span style={{ color: "var(--ff-text-muted)", fontSize: "0.78rem" }}>{ex.sets} sets · {ex.reps} reps</span>
                  {muscleTag(ex.muscle_group)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Smart muscle label ───────────────────────────────────────────────────────
function muscleLabel(groups) {
  if (!groups || groups.length === 0) return "";
  if (groups.length >= 4) return "FULL BODY";
  if (groups.length === 3) return `${groups[0].toUpperCase()} + ${groups[1].toUpperCase()} +1`;
  return groups.map(g => g.toUpperCase()).join(" + ");
}

// ─── Calendar View ────────────────────────────────────────────────────────────
function CalendarView({ calendarData }) {
  const today = new Date();
  const [year,     setYear]     = useState(today.getFullYear());
  const [month,    setMonth]    = useState(today.getMonth());
  const [selected, setSelected] = useState(null);

  const dateMap = useMemo(() => {
    const map = {};
    for (const entry of calendarData) map[entry.date] = entry;
    return map;
  }, [calendarData]);

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
    setSelected(null);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
    setSelected(null);
  }

  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function dateKey(d) {
    return `${year}-${String(month + 1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  }

  const todayKey       = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
  const monthWorkouts  = Object.keys(dateMap).filter(k => k.startsWith(`${year}-${String(month+1).padStart(2,"0")}`)).length;

  return (
    <div>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: "1.5rem",
        padding: "1.25rem 1.5rem",
        background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #3b82f6 100%)",
        borderRadius: 14,
      }}>
        <button onClick={prevMonth} style={navBtn}>‹</button>
        <div style={{ textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "1.6rem" }}>🦅</span>
            <p style={{ margin: 0, fontWeight: 800, color: "#fff", fontSize: "1.3rem", letterSpacing: "0.02em" }}>
              {MONTHS[month]} {year}
            </p>
          </div>
          <p style={{ margin: "0.2rem 0 0", fontSize: "0.78rem", color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>
            {monthWorkouts > 0
              ? `🔥 ${monthWorkouts} workout${monthWorkouts !== 1 ? "s" : ""} completed this month`
              : "No workouts yet this month — let's go!"}
          </p>
        </div>
        <button onClick={nextMonth} style={navBtn}>›</button>
      </div>

      {/* Weekday headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "5px", marginBottom: "5px" }}>
        {WEEKDAYS.map((d, i) => (
          <div key={d} style={{
            textAlign: "center", fontSize: "0.72rem", fontWeight: 700, padding: "5px 0",
            color: i === 0 || i === 6 ? "rgba(147,197,253,0.8)" : "var(--ff-text-muted)",
            borderBottom: "1px solid var(--ff-border-dim)",
          }}>
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "5px" }}>
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} style={{ minHeight: 88 }} />;
          const key     = dateKey(day);
          const entry   = dateMap[key];
          const isToday = key === todayKey;
          const isSel   = selected === key;
          const label   = entry ? muscleLabel(entry.muscle_groups) : null;

          return (
            <div
              key={key}
              onClick={() => entry && setSelected(isSel ? null : key)}
              style={{
                minHeight: 88,
                display: "flex", flexDirection: "column",
                borderRadius: 10,
                overflow: "hidden",
                background: entry
                  ? isSel
                    ? "linear-gradient(145deg, #1d4ed8, #2563eb)"
                    : "linear-gradient(145deg, #1e40af, #2563eb)"
                  : isToday
                  ? "rgba(37,99,235,0.12)"
                  : "rgba(255,255,255,0.03)",
                border: isSel
                  ? "2px solid #93c5fd"
                  : isToday
                  ? "2px solid #2563eb"
                  : entry
                  ? "1px solid rgba(147,197,253,0.25)"
                  : "1px solid rgba(255,255,255,0.04)",
                cursor: entry ? "pointer" : "default",
                transition: "all 0.15s",
                boxShadow: entry
                  ? isSel
                    ? "0 0 16px rgba(37,99,235,0.5)"
                    : "0 4px 12px rgba(37,99,235,0.25)"
                  : "none",
              }}
            >
              {/* Top row: date + falcon */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "6px 8px 4px",
              }}>
                <span style={{
                  fontSize: "0.78rem", fontWeight: isToday || entry ? 700 : 400,
                  color: entry ? "#bfdbfe" : isToday ? "#60a5fa" : "rgba(255,255,255,0.25)",
                }}>
                  {day}
                </span>
                {entry && (
                  <span style={{ fontSize: "0.75rem", lineHeight: 1 }}>🦅</span>
                )}
              </div>

              {/* Muscle label */}
              {entry && (
                <div style={{
                  flex: 1, display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  padding: "0 6px 8px", textAlign: "center",
                }}>
                  <p style={{
                    margin: 0, fontWeight: 800, fontSize: "0.62rem",
                    color: "#fff", textTransform: "uppercase",
                    letterSpacing: "0.04em", lineHeight: 1.35,
                  }}>
                    {label}
                  </p>
                  <p style={{
                    margin: "3px 0 0", fontSize: "0.58rem",
                    color: "rgba(191,219,254,0.75)", fontWeight: 500,
                  }}>
                    {entry.exercise_count} exercises
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: "1.25rem", marginTop: "1rem", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <div style={{ width: 14, height: 14, borderRadius: 4, background: "linear-gradient(135deg,#1e40af,#2563eb)" }} />
          <span style={{ fontSize: "0.75rem", color: "var(--ff-text-muted)" }}>🦅 Workout completed</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <div style={{ width: 14, height: 14, borderRadius: 4, border: "2px solid #2563eb" }} />
          <span style={{ fontSize: "0.75rem", color: "var(--ff-text-muted)" }}>Today</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--ff-text-muted)" }}>Tap a workout day to see details</span>
        </div>
      </div>

      {/* Selected day detail */}
      {selected && dateMap[selected] && (
        <div style={{
          marginTop: "1.25rem", padding: "1.1rem 1.25rem",
          background: "linear-gradient(135deg, rgba(30,58,138,0.3), rgba(37,99,235,0.15))",
          border: "1px solid rgba(147,197,253,0.25)",
          borderRadius: 12,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.6rem" }}>
            <span style={{ fontSize: "1.1rem" }}>🦅</span>
            <p style={{ margin: 0, fontWeight: 700, color: "var(--ff-text)", fontSize: "0.95rem" }}>
              {formatDate(dateMap[selected].completed_at)}
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap", marginBottom: "0.85rem" }}>
            {dateMap[selected].muscle_groups.map(g => muscleTag(g))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {dateMap[selected].exercises.map((ex, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "0.45rem 0.75rem", background: "var(--ff-surface-3)",
                borderRadius: 8, fontSize: "0.83rem",
              }}>
                <span style={{ color: "var(--ff-text)", fontWeight: 600 }}>{ex.name}</span>
                <span style={{ color: "var(--ff-text-muted)", fontSize: "0.78rem" }}>{ex.sets} sets · {ex.reps} reps</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const navBtn = {
  background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)",
  color: "#fff", borderRadius: 8, width: 36, height: 36,
  cursor: "pointer", fontSize: "1.2rem", display: "flex", alignItems: "center", justifyContent: "center",
  transition: "all 0.15s",
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function History() {
  const navigate = useNavigate();
  const [view,         setView]         = useState("list");
  const [history,      setHistory]      = useState([]);
  const [calendarData, setCalendarData] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [total,        setTotal]        = useState(0);
  const [page,         setPage]         = useState(0);
  const limit = 20;

  const headers = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

  useEffect(() => {
    if (!localStorage.getItem("token")) { navigate("/login"); return; }
    fetchHistory(0);
    fetchCalendar();
  }, []);

  async function fetchHistory(skip) {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API}/api/v1/workout/history?skip=${skip}&limit=${limit}`, { headers: headers() });
      setHistory(res.data.items);
      setTotal(res.data.total);
      setPage(skip / limit);
    } catch {
      setError("Failed to load workout history.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchCalendar() {
    try {
      const res = await axios.get(`${API}/api/v1/workout/calendar`, { headers: headers() });
      setCalendarData(res.data);
    } catch {
      // calendar failing silently — list view still works
    }
  }

  const totalPages = Math.ceil(total / limit);
  const totalSets  = history.reduce((s, e) => s + e.sets_logged, 0);

  return (
    <AppPage title="Workout History">

      {/* View toggle tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
        {["list", "calendar"].map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            style={{
              padding: "0.45rem 1.1rem", borderRadius: 8, cursor: "pointer",
              fontWeight: 600, fontSize: "0.85rem", border: "1px solid",
              borderColor: view === v ? "var(--ff-accent)" : "var(--ff-border-dim)",
              background: view === v ? "var(--ff-accent)" : "var(--ff-surface-2)",
              color: view === v ? "#fff" : "var(--ff-text-muted)",
              transition: "all 0.15s",
            }}
          >
            {v === "list" ? "📋 List" : "📅 Calendar"}
          </button>
        ))}
      </div>

      {/* Summary bar — list view only */}
      {view === "list" && !loading && !error && total > 0 && (
        <div style={{
          display: "flex", gap: "1.5rem", flexWrap: "wrap",
          marginBottom: "1.25rem", padding: "1rem 1.25rem",
          background: "var(--ff-surface-2)", border: "1px solid var(--ff-border-dim)",
          borderRadius: 12,
        }}>
          <div>
            <p style={{ margin: 0, color: "var(--ff-text-muted)", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Days Trained</p>
            <p style={{ margin: 0, color: "var(--ff-accent)", fontSize: "1.6rem", fontWeight: 800 }}>{groupByDate(history).length}</p>
          </div>
          <div>
            <p style={{ margin: 0, color: "var(--ff-text-muted)", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Sets Logged (this page)</p>
            <p style={{ margin: 0, color: "var(--ff-green)", fontSize: "1.6rem", fontWeight: 800 }}>{totalSets}</p>
          </div>
        </div>
      )}

      <SectionCard title={view === "list" ? `History ${total > 0 ? `(${total} sessions)` : ""}` : `Calendar — ${calendarData.length} workouts logged`}>

        {/* ── LIST VIEW ── */}
        {view === "list" && (
          <>
            {loading && <p style={{ color: "var(--ff-text-muted)", textAlign: "center", padding: "2rem 0" }}>Loading...</p>}
            {error   && <p style={{ color: "#f87171", textAlign: "center", padding: "2rem 0" }}>{error}</p>}

            {!loading && !error && history.length === 0 && (
              <div style={{ textAlign: "center", padding: "3rem 0" }}>
                <p style={{ color: "var(--ff-text-muted)", marginBottom: "1rem" }}>
                  No workout history yet. Complete your first workout day to see it here.
                </p>
                <Link to="/workouts" className="ff-btn ff-btn-primary ff-btn-sm">Go to Workouts</Link>
              </div>
            )}

            {!loading && !error && history.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {groupByDate(history).map(group => (
                  <HistoryDayCard key={group.dateKey} group={group} />
                ))}
              </div>
            )}

            {!loading && totalPages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", gap: "0.75rem", marginTop: "1.5rem" }}>
                <button onClick={() => fetchHistory((page - 1) * limit)} disabled={page === 0}
                  className="ff-btn ff-btn-ghost ff-btn-sm" style={{ opacity: page === 0 ? 0.4 : 1 }}>
                  ← Previous
                </button>
                <span style={{ color: "var(--ff-text-muted)", fontSize: "0.85rem", alignSelf: "center" }}>
                  {page + 1} / {totalPages}
                </span>
                <button onClick={() => fetchHistory((page + 1) * limit)} disabled={page >= totalPages - 1}
                  className="ff-btn ff-btn-ghost ff-btn-sm" style={{ opacity: page >= totalPages - 1 ? 0.4 : 1 }}>
                  Next →
                </button>
              </div>
            )}
          </>
        )}

        {/* ── CALENDAR VIEW ── */}
        {view === "calendar" && (
          calendarData.length === 0
            ? (
              <div style={{ textAlign: "center", padding: "3rem 0" }}>
                <p style={{ color: "var(--ff-text-muted)", marginBottom: "1rem" }}>
                  No workouts logged yet. Complete a workout day to see it on the calendar.
                </p>
                <Link to="/workouts" className="ff-btn ff-btn-primary ff-btn-sm">Go to Workouts</Link>
              </div>
            )
            : <CalendarView calendarData={calendarData} />
        )}
      </SectionCard>
    </AppPage>
  );
}
