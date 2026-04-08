import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AppPage from "../components/ui/AppPage";
import SectionCard from "../components/ui/SectionCard";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ==========================================
// Muscle group badge colors
// ==========================================
const muscleColors = {
  chest:     { bg: "rgba(239, 68, 68, 0.15)",  border: "rgba(239, 68, 68, 0.4)",  text: "#f87171" },
  back:      { bg: "rgba(59, 130, 246, 0.15)", border: "rgba(59, 130, 246, 0.4)", text: "#60a5fa" },
  shoulders: { bg: "rgba(168, 85, 247, 0.15)", border: "rgba(168, 85, 247, 0.4)", text: "#a78bfa" },
  biceps:    { bg: "rgba(236, 72, 153, 0.15)", border: "rgba(236, 72, 153, 0.4)", text: "#f472b6" },
  triceps:   { bg: "rgba(249, 115, 22, 0.15)", border: "rgba(249, 115, 22, 0.4)", text: "#fb923c" },
  legs:      { bg: "rgba(34, 197, 94, 0.15)",  border: "rgba(34, 197, 94, 0.4)",  text: "#4ade80" },
  core:      { bg: "rgba(250, 204, 21, 0.15)", border: "rgba(250, 204, 21, 0.4)", text: "#facc15" },
  cardio:    { bg: "rgba(6, 182, 212, 0.15)",  border: "rgba(6, 182, 212, 0.4)",  text: "#22d3ee" },
};

const defaultColor = { bg: "rgba(148,163,184,0.15)", border: "rgba(148,163,184,0.4)", text: "#94a3b8" };

function getMuscleBadge(group) {
  return muscleColors[group] || defaultColor;
}

// ==========================================
// Day label helper
// ==========================================
const dayLabels = {
  1: "Day 1", 2: "Day 2", 3: "Day 3", 4: "Day 4",
  5: "Day 5", 6: "Day 6", 7: "Day 7",
};

export default function Workouts() {
  const navigate = useNavigate();
  const getToken = () => localStorage.getItem("token");
  const getHeaders = () => ({ Authorization: `Bearer ${getToken()}` });

  // ==========================================
  // States
  // ==========================================
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState(null);           // WorkoutPlanRead | null
  const [completedDays, setCompletedDays] = useState([]); // CompletedWorkoutRead[]
  const [hasQuiz, setHasQuiz] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [expandedDay, setExpandedDay] = useState(null);  // which day is expanded
  const [completingDay, setCompletingDay] = useState(null); // day currently being marked

  // ==========================================
  // Initial Data Fetch
  // ==========================================
  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();
      if (!token) { navigate("/login"); return; }

      const headers = getHeaders();

      try {
        const [planRes, completedRes, quizRes] = await Promise.allSettled([
          axios.get(`${API_URL}/api/v1/workout/plan`, { headers }),
          axios.get(`${API_URL}/api/v1/workout/complete`, { headers }),
          axios.get(`${API_URL}/api/v1/onboarding/quiz`, { headers }),
        ]);

        if (quizRes.status === "fulfilled") {
          setHasQuiz(true);
        }

        if (planRes.status === "fulfilled") {
          setPlan(planRes.value.data);
          // Auto-expand first incomplete day
          if (completedRes.status === "fulfilled") {
            const done = completedRes.value.data || [];
            setCompletedDays(done);
            const doneDayNums = done.map(c => c.day);
            const days = [...new Set(planRes.value.data.exercises.map(e => e.day))].sort((a, b) => a - b);
            const firstIncomplete = days.find(d => !doneDayNums.includes(d));
            setExpandedDay(firstIncomplete || days[0]);
          }
        }

        if (completedRes.status === "fulfilled" && planRes.status !== "fulfilled") {
          setCompletedDays(completedRes.value.data || []);
        }
      } catch (err) {
        console.error("Workout page fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  // ==========================================
  // Generate Plan
  // ==========================================
  const handleGenerate = async () => {
    setError("");
    setGenerating(true);
    try {
      const res = await axios.post(`${API_URL}/api/v1/workout/plan`, {}, {
        headers: getHeaders(),
      });
      setPlan(res.data);
      const days = [...new Set(res.data.exercises.map(e => e.day))].sort((a, b) => a - b);
      setExpandedDay(days[0] || 1);
    } catch (err) {
      const detail = err.response?.data?.detail || "Failed to generate plan.";
      setError(detail);
    } finally {
      setGenerating(false);
    }
  };

  // ==========================================
  // Delete Plan (to regenerate)
  // ==========================================
  const handleDeletePlan = async () => {
    if (!window.confirm("Delete your current plan? You can generate a new one after.")) return;
    try {
      await axios.delete(`${API_URL}/api/v1/workout/plan`, { headers: getHeaders() });
      setPlan(null);
      setCompletedDays([]);
      setExpandedDay(null);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to delete plan.");
    }
  };

  // ==========================================
  // Mark Day Complete
  // ==========================================
  const handleComplete = async (day) => {
    setCompletingDay(day);
    try {
      const res = await axios.post(`${API_URL}/api/v1/workout/complete`, { day }, {
        headers: getHeaders(),
      });
      setCompletedDays(prev => [...prev, res.data]);
    } catch (err) {
      const detail = err.response?.data?.detail || "Failed to mark day complete.";
      setError(detail);
    } finally {
      setCompletingDay(null);
    }
  };

  // ==========================================
  // Render helpers
  // ==========================================
  const isDayCompleted = (day) => completedDays.some(c => c.day === day);

  const groupExercisesByDay = () => {
    if (!plan) return {};
    const grouped = {};
    plan.exercises.forEach(ex => {
      if (!grouped[ex.day]) grouped[ex.day] = [];
      grouped[ex.day].push(ex);
    });
    return grouped;
  };

  // ==========================================
  // Loading
  // ==========================================
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#0b1727", color: "white", padding: "60px", textAlign: "center" }}>
        <h2>Loading your workout plan... 🦅</h2>
      </div>
    );
  }

  const grouped = groupExercisesByDay();
  const days = Object.keys(grouped).map(Number).sort((a, b) => a - b);
  const totalDays = days.length;
  const doneCount = days.filter(d => isDayCompleted(d)).length;

  // ==========================================
  // No Quiz State
  // ==========================================
  if (!hasQuiz && !plan) {
    return (
      <AppPage
        eyebrow="TRAINING"
        title="Workout"
        accent="Plan"
        subtitle="Your personalized training program awaits."
      >
        <SectionCard title="Getting Started">
          <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
            <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>📋</div>
            <h3 style={{ color: "#f8fbff", margin: "0 0 0.8rem", fontSize: "1.2rem" }}>
              Complete the Fitness Quiz First
            </h3>
            <p style={{ color: "#a7b4c9", fontSize: "0.92rem", lineHeight: 1.6, maxWidth: 480, margin: "0 auto 1.5rem" }}>
              We need to know your goals, body metrics, and activity level to build your personalized workout plan. The quiz takes about 2 minutes.
            </p>
            <button
              className="ff-btn ff-btn-primary"
              onClick={() => navigate("/quiz")}
              style={{ padding: "0.85rem 2rem" }}
            >
              Take the Quiz →
            </button>
          </div>
        </SectionCard>
      </AppPage>
    );
  }

  // ==========================================
  // Has Quiz but No Plan
  // ==========================================
  if (!plan) {
    return (
      <AppPage
        eyebrow="TRAINING"
        title="Workout"
        accent="Plan"
        subtitle="Your personalized training program awaits."
      >
        <SectionCard title="Generate Your Plan">
          <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
            <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>🏋️</div>
            <h3 style={{ color: "#f8fbff", margin: "0 0 0.8rem", fontSize: "1.2rem" }}>
              Ready to Build Your Program
            </h3>
            <p style={{ color: "#a7b4c9", fontSize: "0.92rem", lineHeight: 1.6, maxWidth: 480, margin: "0 auto 1.5rem" }}>
              Based on your quiz results, we'll generate a personalized workout plan with exercises matched to your goal, fitness level, and available training days.
            </p>

            {error && (
              <div style={{ color: '#e74c3c', fontSize: '0.88rem', padding: "10px", backgroundColor: "rgba(231, 76, 60, 0.1)", borderRadius: "6px", marginBottom: "1rem" }}>
                ⚠️ {error}
              </div>
            )}

            <button
              className="ff-btn ff-btn-primary"
              onClick={handleGenerate}
              disabled={generating}
              style={{
                padding: "0.85rem 2rem",
                opacity: generating ? 0.6 : 1,
                cursor: generating ? "not-allowed" : "pointer",
              }}
            >
              {generating ? "Generating..." : "🚀 Generate My Plan"}
            </button>
          </div>
        </SectionCard>
      </AppPage>
    );
  }

  // ==========================================
  // Plan Loaded — Main View
  // ==========================================
  return (
    <AppPage
      eyebrow="TRAINING"
      title="Your Workout"
      accent="Plan"
      subtitle={`${totalDays}-day program · ${doneCount}/${totalDays} days completed`}
      actions={
        <button
          className="ff-btn ff-btn-ghost"
          onClick={handleDeletePlan}
          style={{ fontSize: "0.8rem", padding: "0.5rem 1rem" }}
        >
          🔄 Regenerate Plan
        </button>
      }
    >
      {error && (
        <div style={{ color: '#e74c3c', fontSize: '0.88rem', padding: "12px 16px", backgroundColor: "rgba(231, 76, 60, 0.1)", borderRadius: "8px", marginBottom: "1rem" }}>
          ⚠️ {error}
        </div>
      )}

      {/* Progress Bar */}
      <SectionCard title="Weekly Progress">
        <div style={{ marginBottom: "0.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <span style={{ color: "#a7b4c9", fontSize: "0.85rem" }}>Completion</span>
            <span style={{ color: "#f8fbff", fontWeight: 700, fontSize: "0.85rem" }}>
              {doneCount}/{totalDays} days
            </span>
          </div>
          <div style={{ height: 8, borderRadius: 99, backgroundColor: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: `${totalDays > 0 ? (doneCount / totalDays) * 100 : 0}%`,
              background: "linear-gradient(90deg, var(--ff-accent, #3b82f6), var(--ff-cyan, #06b6d4))",
              borderRadius: 99,
              transition: "width 0.5s ease",
            }} />
          </div>
        </div>

        {/* Day pills */}
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "1rem" }}>
          {days.map(day => {
            const done = isDayCompleted(day);
            const active = expandedDay === day;
            return (
              <button
                key={day}
                onClick={() => setExpandedDay(active ? null : day)}
                style={{
                  padding: "0.55rem 1rem",
                  borderRadius: 10,
                  border: active ? "2px solid var(--ff-accent, #3b82f6)" : "2px solid rgba(255,255,255,0.08)",
                  backgroundColor: done
                    ? "rgba(34, 197, 94, 0.15)"
                    : active ? "rgba(59, 130, 246, 0.15)" : "rgba(255,255,255,0.03)",
                  color: done ? "#4ade80" : active ? "#93c5fd" : "#a7b4c9",
                  cursor: "pointer",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                }}
              >
                {done && "✓ "}{dayLabels[day] || `Day ${day}`}
              </button>
            );
          })}
        </div>
      </SectionCard>

      {/* Expanded Day Exercises */}
      {expandedDay && grouped[expandedDay] && (
        <SectionCard
          title={
            <span style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              {dayLabels[expandedDay] || `Day ${expandedDay}`}
              {isDayCompleted(expandedDay) && (
                <span className="ff-tag ff-tag-green" style={{ fontSize: "0.72rem" }}>COMPLETED</span>
              )}
            </span>
          }
        >
          {/* Exercise cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {grouped[expandedDay].map((ex) => {
              const badge = getMuscleBadge(ex.muscle_group);
              return (
                <div
                  key={ex.id}
                  style={{
                    padding: "1rem 1.2rem",
                    borderRadius: 12,
                    backgroundColor: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  {/* Top row: name + muscle badge */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.8rem", marginBottom: "0.6rem" }}>
                    <div style={{ fontWeight: 700, color: "#f8fbff", fontSize: "0.95rem" }}>
                      {ex.name}
                    </div>
                    <span style={{
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      padding: "0.2rem 0.55rem",
                      borderRadius: 6,
                      backgroundColor: badge.bg,
                      border: `1px solid ${badge.border}`,
                      color: badge.text,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}>
                      {ex.muscle_group}
                    </span>
                  </div>

                  {/* Stats row */}
                  <div style={{ display: "flex", gap: "1.2rem", fontSize: "0.82rem", color: "#a7b4c9" }}>
                    <span><strong style={{ color: "#c8d5e6" }}>Sets:</strong> {ex.sets}</span>
                    <span><strong style={{ color: "#c8d5e6" }}>Reps:</strong> {ex.reps}</span>
                    <span><strong style={{ color: "#c8d5e6" }}>Level:</strong> {ex.difficulty}</span>
                  </div>

                  {/* Instructions (if LLM generated them) */}
                  {ex.instructions && (
                    <div style={{
                      marginTop: "0.7rem",
                      padding: "0.7rem 0.9rem",
                      borderRadius: 8,
                      backgroundColor: "rgba(59, 130, 246, 0.06)",
                      border: "1px solid rgba(59, 130, 246, 0.15)",
                      fontSize: "0.82rem",
                      color: "#93a7c4",
                      lineHeight: 1.55,
                      whiteSpace: "pre-wrap",
                    }}>
                      💡 {ex.instructions}
                    </div>
                  )}

                  {/* YouTube link if available */}
                  {ex.youtube_url && (
                    <a
                      href={ex.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-block",
                        marginTop: "0.6rem",
                        fontSize: "0.8rem",
                        color: "#60a5fa",
                        textDecoration: "none",
                      }}
                    >
                      ▶ Watch tutorial
                    </a>
                  )}
                </div>
              );
            })}
          </div>

          {/* Mark Complete button */}
          {!isDayCompleted(expandedDay) && (
            <button
              className="ff-btn ff-btn-primary"
              onClick={() => handleComplete(expandedDay)}
              disabled={completingDay === expandedDay}
              style={{
                marginTop: "1.2rem",
                padding: "0.8rem 1.8rem",
                opacity: completingDay === expandedDay ? 0.6 : 1,
                cursor: completingDay === expandedDay ? "not-allowed" : "pointer",
                width: "100%",
              }}
            >
              {completingDay === expandedDay ? "Saving..." : `✓ Mark ${dayLabels[expandedDay] || `Day ${expandedDay}`} Complete`}
            </button>
          )}

          {isDayCompleted(expandedDay) && (
            <div style={{
              marginTop: "1.2rem",
              padding: "0.8rem",
              textAlign: "center",
              borderRadius: 10,
              backgroundColor: "rgba(34, 197, 94, 0.1)",
              border: "1px solid rgba(34, 197, 94, 0.25)",
              color: "#4ade80",
              fontSize: "0.88rem",
              fontWeight: 600,
            }}>
              ✅ Great work! This day is done.
            </div>
          )}
        </SectionCard>
      )}

      {/* All days completed celebration */}
      {totalDays > 0 && doneCount === totalDays && (
        <SectionCard title="🎉 Week Complete!">
          <div style={{ textAlign: "center", padding: "1.5rem 1rem" }}>
            <div style={{ fontSize: "3rem", marginBottom: "0.8rem" }}>🏆</div>
            <p style={{ color: "#f8fbff", fontSize: "1.05rem", fontWeight: 600, marginBottom: "0.6rem" }}>
              You crushed every workout this week!
            </p>
            <p style={{ color: "#a7b4c9", fontSize: "0.88rem", lineHeight: 1.6, maxWidth: 420, margin: "0 auto 1.2rem" }}>
              Ready for a fresh start? Delete this plan and generate a new one, or keep it for next week.
            </p>
            <button
              className="ff-btn ff-btn-primary"
              onClick={handleDeletePlan}
              style={{ padding: "0.75rem 1.5rem" }}
            >
              🔄 Generate New Plan
            </button>
          </div>
        </SectionCard>
      )}

      <button
        onClick={() => navigate("/dashboard")}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          border: "none",
          borderRadius: "8px",
          background: "transparent",
          color: "#64748b",
          cursor: "pointer",
          fontSize: "14px",
        }}
      >
        ← Back to Dashboard
      </button>
    </AppPage>
  );
}
