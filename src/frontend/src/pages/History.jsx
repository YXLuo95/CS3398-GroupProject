import { useState, useEffect } from "react";
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

function HistoryEntry({ entry }) {
  const [expanded, setExpanded] = useState(false);
  const uniqueGroups = [...new Set(entry.exercises.map(e => e.muscle_group))];

  return (
    <div
      onClick={() => setExpanded(e => !e)}
      style={{
        background: "var(--ff-surface-2)", border: "1px solid var(--ff-border-dim)",
        borderRadius: 12, padding: "1rem 1.25rem", cursor: "pointer",
        transition: "border-color 0.2s",
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
        <div>
          <p style={{ margin: 0, fontWeight: 700, color: "var(--ff-text)", fontSize: "0.95rem" }}>
            {formatDate(entry.completed_at)}
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          {/* Muscle group tags */}
          <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
            {uniqueGroups.map(g => muscleTag(g))}
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--ff-text-muted)" }}>
              <span style={{ color: "var(--ff-accent)", fontWeight: 700 }}>{entry.exercises.length}</span> exercises
            </span>
            {entry.sets_logged > 0 && (
              <span style={{ fontSize: "0.8rem", color: "var(--ff-text-muted)" }}>
                <span style={{ color: "var(--ff-green)", fontWeight: 700 }}>{entry.sets_logged}</span> sets logged
              </span>
            )}
          </div>

          <span style={{ color: "var(--ff-text-muted)", fontSize: "0.8rem" }}>{expanded ? "▲" : "▼"}</span>
        </div>
      </div>

      {/* Expanded exercise list */}
      {expanded && (
        <div style={{ marginTop: "0.9rem", paddingTop: "0.9rem", borderTop: "1px solid var(--ff-border-dim)" }}
          onClick={e => e.stopPropagation()}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {entry.exercises.map((ex, i) => (
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

export default function History() {
  const navigate = useNavigate();
  const [history,  setHistory]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [total,    setTotal]    = useState(0);
  const [page,     setPage]     = useState(0);
  const limit = 20;

  const headers = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

  useEffect(() => {
    if (!localStorage.getItem("token")) { navigate("/login"); return; }
    fetchHistory(0);
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

  const totalPages  = Math.ceil(total / limit);
  const totalSets   = history.reduce((s, e) => s + e.sets_logged, 0);

  return (
    <AppPage title="Workout History">

      {/* Summary bar */}
      {!loading && !error && total > 0 && (
        <div style={{
          display: "flex", gap: "1.5rem", flexWrap: "wrap",
          marginBottom: "1.25rem", padding: "1rem 1.25rem",
          background: "var(--ff-surface-2)", border: "1px solid var(--ff-border-dim)",
          borderRadius: 12,
        }}>
          <div>
            <p style={{ margin: 0, color: "var(--ff-text-muted)", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Total Sessions</p>
            <p style={{ margin: 0, color: "var(--ff-accent)", fontSize: "1.6rem", fontWeight: 800 }}>{total}</p>
          </div>
          <div>
            <p style={{ margin: 0, color: "var(--ff-text-muted)", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Sets Logged (this page)</p>
            <p style={{ margin: 0, color: "var(--ff-green)", fontSize: "1.6rem", fontWeight: 800 }}>{totalSets}</p>
          </div>
        </div>
      )}

      <SectionCard title={`History ${total > 0 ? `(${total} sessions)` : ""}`}>
        {loading && (
          <p style={{ color: "var(--ff-text-muted)", textAlign: "center", padding: "2rem 0" }}>Loading...</p>
        )}

        {error && (
          <p style={{ color: "#f87171", textAlign: "center", padding: "2rem 0" }}>{error}</p>
        )}

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
            {history.map(entry => <HistoryEntry key={entry.id} entry={entry} />)}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: "0.75rem", marginTop: "1.5rem" }}>
            <button
              onClick={() => fetchHistory((page - 1) * limit)}
              disabled={page === 0}
              className="ff-btn ff-btn-ghost ff-btn-sm"
              style={{ opacity: page === 0 ? 0.4 : 1 }}
            >
              ← Previous
            </button>
            <span style={{ color: "var(--ff-text-muted)", fontSize: "0.85rem", alignSelf: "center" }}>
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => fetchHistory((page + 1) * limit)}
              disabled={page >= totalPages - 1}
              className="ff-btn ff-btn-ghost ff-btn-sm"
              style={{ opacity: page >= totalPages - 1 ? 0.4 : 1 }}
            >
              Next →
            </button>
          </div>
        )}
      </SectionCard>
    </AppPage>
  );
}
