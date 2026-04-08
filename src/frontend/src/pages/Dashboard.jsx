import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AppPage from "../components/ui/AppPage";
import SectionCard from "../components/ui/SectionCard";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ==========================================
// Static recommendation dictionaries 
// ==========================================
const goalDisplay = {
  lose_weight: "Lose Weight",
  gain_muscle: "Gain Muscle",
  improve_endurance: "Improve Endurance",
  general_fitness: "General Fitness",
};

const goalMotivation = {
  lose_weight: "Every step counts towards your transformation!",
  gain_muscle: "Building strength, one rep at a time.",
  improve_endurance: "Push your limits and discover your potential.",
  general_fitness: "Your fitness journey starts here.",
};

const fitnessTips = {
  lose_weight: ["Maintain a 300-500 kcal daily deficit", "Use progressive overload to protect muscle", "Track sleep since poor recovery slows fat loss"],
  gain_muscle: ["Increase weight when you hit the top of your rep range", "Eat within 2 hours post-workout", "Deload every 6-8 weeks"],
  improve_endurance: ["Mix steady-state and interval cardio", "Stay hydrated and monitor electrolytes", "Include mobility work weekly"],
  general_fitness: ["Consistency beats intensity long-term", "Balance strength, cardio, and flexibility", "Listen to your body and adjust"],
};

// ==========================================
// Muscle group badge colors for exercise preview
// ==========================================
const muscleColors = {
  chest:     "#f87171",
  back:      "#60a5fa",
  shoulders: "#a78bfa",
  biceps:    "#f472b6",
  triceps:   "#fb923c",
  legs:      "#4ade80",
  core:      "#facc15",
  cardio:    "#22d3ee",
};

// ==========================================
// Activity level display names
// ==========================================
const activityDisplay = {
  sedentary:         "Sedentary",
  lightly_active:    "Lightly Active",
  moderately_active: "Moderately Active",
  very_active:       "Very Active",
  extra_active:      "Extra Active",
};

// ==========================================
// Health metric helpers
// ==========================================
function getBmiCategory(bmi) {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

function getWeightProgress(current, target) {
  // Returns a percentage for the progress bar (0–100)
  // For weight loss: how close to target from starting point
  // Since we don't have original starting weight, show relative closeness
  const diff = Math.abs(current - target);
  if (diff === 0) return 100;
  // Use a reasonable scale: 50 lbs diff = 0%, 0 lbs diff = 100%
  const maxDiff = 50;
  return Math.max(0, Math.min(100, ((maxDiff - diff) / maxDiff) * 100));
}

export default function Dashboard() {
  const navigate = useNavigate();
  
  // ==========================================
  // Backend States
  // ==========================================
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Athlete");
  const [quizData, setQuizData] = useState(null);
  const [hasPlan, setHasPlan] = useState(false); 
  const [planData, setPlanData] = useState(null);       // full plan from API
  const [completedDays, setCompletedDays] = useState([]); // completed workout days
  const [nutritionPlan, setNutritionPlan] = useState(null); // latest nutrition plan from API

  // Derived Dynamic Data
  const [stats, setStats] = useState({ workoutsDone: 0, dayStreak: 0 });
  const [activityLog, setActivityLog] = useState([]);
  const [macros, setMacros] = useState({ calories: 0, protein: 0, fats: 0 });

  const getToken = () => localStorage.getItem("token");

  // ==========================================
  // Data Fetching
  // ==========================================
  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = getToken();
      if (!token) {
        navigate("/login");
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.sub) setUserName(payload.sub);

        const [quizRes, completeRes, recordsRes, profileRes, planRes, nutritionRes] = await Promise.allSettled([
          axios.get(`${API_URL}/api/v1/onboarding/quiz`, { headers }),
          axios.get(`${API_URL}/api/v1/workout/complete`, { headers }),
          axios.get(`${API_URL}/api/v1/records?limit=5`, { headers }),
          axios.get(`${API_URL}/api/v1/profile`, { headers }),
          axios.get(`${API_URL}/api/v1/workout/plan`, { headers }),
          axios.get(`${API_URL}/api/v1/nutrition-plans`, { headers }),
        ]);

        if (profileRes.status === "fulfilled" && profileRes.value.data.first_name) {
          setUserName(profileRes.value.data.first_name);
        }

        if (planRes.status === "fulfilled") {
          setHasPlan(true);
          setPlanData(planRes.value.data);
        }

        // Nutrition plan
        if (nutritionRes.status === "fulfilled") {
          const npData = nutritionRes.value.data;
          if (Array.isArray(npData) && npData.length > 0) {
            setNutritionPlan(npData[0]); // latest plan
          }
        }

        let completedData = [];
        if (completeRes.status === "fulfilled") {
          completedData = completeRes.value.data;
          setCompletedDays(completedData);
          setStats(prev => ({ ...prev, workoutsDone: completedData.length }));
        }

        let currentGoal = "general_fitness";
        if (quizRes.status === "fulfilled") {
          const quiz = quizRes.value.data;
          setQuizData(quiz);
          currentGoal = quiz.goal_type;

          let calTarget = Math.round(quiz.tdee);
          if (quiz.goal_type === "lose_weight") calTarget -= 500;
          if (quiz.goal_type === "gain_muscle") calTarget += 300;
          
          const proTarget = Math.round(quiz.weight_lbs * 1.0); 
          const fatTarget = Math.round((calTarget * 0.25) / 9); 
          setMacros({ calories: calTarget, protein: proTarget, fats: fatTarget });
        }

        let logs = [];
        if (recordsRes.status === "fulfilled") {
          recordsRes.value.data.forEach(r => {
            logs.push({
              id: `rec-${r.id}`,
              action: `Logged weight: ${r.weight_lbs} lbs`,
              date: new Date(r.created_at),
              icon: "⚖️"
            });
          });
        }
        completedData.forEach(c => {
          logs.push({
            id: `comp-${c.id}`,
            action: `Completed Workout Day ${c.day}`,
            date: new Date(c.completed_at),
            icon: "💪"
          });
        });
        
        logs.sort((a, b) => b.date - a.date);
        setActivityLog(
          logs.slice(0, 4).map(l => ({
            ...l,
            timestamp: l.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
          }))
        );

      } catch (err) {
        console.error("Dashboard data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  // ==========================================
  // Compute next workout day from plan
  // ==========================================
  const getNextWorkoutDay = () => {
    if (!planData || !planData.exercises) return null;
    const allDays = [...new Set(planData.exercises.map(e => e.day))].sort((a, b) => a - b);
    const doneDayNums = completedDays.map(c => c.day);
    const nextDay = allDays.find(d => !doneDayNums.includes(d));
    return nextDay || allDays[0]; // fallback to day 1 if all done
  };

  const getExercisesForDay = (day) => {
    if (!planData || !planData.exercises) return [];
    return planData.exercises.filter(e => e.day === day);
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#0b1727", color: "white", padding: "60px", textAlign: "center" }}>
        <h2>Loading your dashboard... 🦅</h2>
      </div>
    );
  }

  const goal = quizData?.goal_type || "general_fitness";
  const tips = fitnessTips[goal] || fitnessTips.general_fitness;

  // Next workout day info
  const nextDay = getNextWorkoutDay();
  const nextDayExercises = nextDay ? getExercisesForDay(nextDay) : [];
  const previewExercises = nextDayExercises.slice(0, 4);
  const remainingCount = nextDayExercises.length - previewExercises.length;
  const allDays = planData ? [...new Set(planData.exercises.map(e => e.day))].sort((a, b) => a - b) : [];
  const doneCount = allDays.filter(d => completedDays.some(c => c.day === d)).length;

  return (
    <AppPage
      eyebrow="DASHBOARD"
      title={`Welcome back, ${userName}`}
      subtitle={goalMotivation[goal] || goalMotivation.general_fitness}
      actions={
        <span className="ff-tag ff-tag-blue" style={{ fontSize: "0.82rem" }}>
          Goal: {goalDisplay[goal] || "General Fitness"}
        </span>
      }
    >
      <SectionCard title="Your Stats This Month">
        <div className="ff-grid ff-grid-4">
          <div className="ff-kpi">
            <div className="ff-kpi-value" style={{ color: "var(--ff-green)" }}>{stats.workoutsDone}</div>
            <div className="ff-kpi-label">Workouts Done</div>
          </div>
          <div className="ff-kpi">
            <div className="ff-kpi-value" style={{ color: "var(--ff-amber)" }}>{quizData?.workout_days || 0}</div>
            <div className="ff-kpi-label">Target Days/Week</div>
          </div>
          <div className="ff-kpi">
            <div className="ff-kpi-value" style={{ color: "var(--ff-cyan)" }}>{macros.calories || "---"}</div>
            <div className="ff-kpi-label">Daily Calories</div>
          </div>
          <div className="ff-kpi">
            <div className="ff-kpi-value" style={{ color: "var(--ff-purple)" }}>{macros.protein || "---"}g</div>
            <div className="ff-kpi-label">Daily Protein</div>
          </div>
        </div>
      </SectionCard>

      {/* ==========================================
          Health Profile Card — quiz metrics
          ========================================== */}
      {quizData ? (
        <SectionCard title="Health Profile">
          {/* Top row: BMI / BMR / TDEE */}
          <div className="ff-grid ff-grid-3" style={{ marginBottom: "1rem" }}>
            {[
              { val: quizData.bmi, lbl: "BMI", color: "var(--ff-cyan, #06b6d4)", sub: getBmiCategory(quizData.bmi) },
              { val: Math.round(quizData.bmr), lbl: "BMR", color: "var(--ff-amber, #f59e0b)", sub: "kcal/day" },
              { val: Math.round(quizData.tdee), lbl: "TDEE", color: "var(--ff-green, #22c55e)", sub: "kcal/day" },
            ].map(({ val, lbl, color, sub }) => (
              <div key={lbl} className="ff-inset" style={{ textAlign: "center", padding: "0.8rem 0.5rem" }}>
                <div style={{ fontWeight: 700, color, fontSize: "1.3rem" }}>{val}</div>
                <div style={{ color: "#f8fbff", fontSize: "0.82rem", fontWeight: 600, marginTop: "0.15rem" }}>{lbl}</div>
                <div style={{ color: "#64748b", fontSize: "0.7rem", marginTop: "0.1rem" }}>{sub}</div>
              </div>
            ))}
          </div>

          {/* Body stats grid */}
          <div className="ff-grid ff-grid-4" style={{ gap: "0.5rem" }}>
            {[
              { icon: "🎂", label: "Age", value: `${quizData.age} yrs` },
              { icon: "📏", label: "Height", value: `${Math.floor(quizData.height_in / 12)}'${quizData.height_in % 12}"` },
              { icon: "⚖️", label: "Weight", value: `${quizData.weight_lbs} lbs` },
              { icon: "🎯", label: "Target", value: quizData.target_weight ? `${quizData.target_weight} lbs` : "—" },
            ].map(({ icon, label, value }) => (
              <div key={label} className="ff-inset" style={{ textAlign: "center", padding: "0.6rem 0.3rem" }}>
                <div style={{ fontSize: "1.1rem", marginBottom: "0.15rem" }}>{icon}</div>
                <div style={{ color: "#f8fbff", fontSize: "0.88rem", fontWeight: 600 }}>{value}</div>
                <div style={{ color: "#64748b", fontSize: "0.7rem", marginTop: "0.1rem" }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Activity level + gender + workout days + preferences */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "1rem" }}>
            {[
              { label: activityDisplay[quizData.activity_level] || quizData.activity_level, cls: "ff-tag-blue" },
              { label: quizData.gender, cls: "ff-tag-purple" },
              { label: `${quizData.workout_days}x/week`, cls: "ff-tag-green" },
              ...(quizData.dietary_preferences || []).map(p => ({ label: p.replace(/_/g, " "), cls: "ff-tag-amber" })),
              ...(quizData.allergies || []).map(a => ({ label: `⚠️ ${a}`, cls: "ff-tag" })),
            ].map(({ label, cls }, i) => (
              <span key={i} className={`ff-tag ${cls}`} style={{ fontSize: "0.72rem", textTransform: "capitalize" }}>
                {label}
              </span>
            ))}
          </div>

          {quizData.limitations && (
            <div style={{ marginTop: "0.7rem", color: "#64748b", fontSize: "0.8rem" }}>
              <strong style={{ color: "#a7b4c9" }}>Limitations:</strong> {quizData.limitations}
            </div>
          )}

          {/* Target weight progress */}
          {quizData.target_weight && quizData.target_weight !== quizData.weight_lbs && (
            <div style={{ marginTop: "0.8rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                <span style={{ color: "#a7b4c9", fontSize: "0.78rem" }}>
                  {quizData.weight_lbs > quizData.target_weight ? "Weight to lose" : "Weight to gain"}
                </span>
                <span style={{ color: "#f8fbff", fontWeight: 700, fontSize: "0.78rem" }}>
                  {Math.abs(quizData.weight_lbs - quizData.target_weight).toFixed(1)} lbs to go
                </span>
              </div>
              <div style={{ height: 6, borderRadius: 99, backgroundColor: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${Math.max(5, Math.min(95, getWeightProgress(quizData.weight_lbs, quizData.target_weight)))}%`,
                  background: quizData.weight_lbs > quizData.target_weight
                    ? "linear-gradient(90deg, #f59e0b, #ef4444)"
                    : "linear-gradient(90deg, #22c55e, #06b6d4)",
                  borderRadius: 99,
                  transition: "width 0.5s ease",
                }} />
              </div>
            </div>
          )}

          <button
            className="ff-btn ff-btn-ghost ff-btn-sm"
            onClick={() => navigate("/quiz?retake=true")}
            style={{ marginTop: "0.8rem", fontSize: "0.8rem" }}
          >
            Update My Info →
          </button>
        </SectionCard>
      ) : (
        <SectionCard title="Health Profile">
          <div style={{ textAlign: "center", padding: "1.5rem 1rem" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.6rem" }}>📋</div>
            <p style={{ color: "#a7b4c9", fontSize: "0.9rem", marginBottom: "1rem" }}>
              Complete the fitness quiz to see your BMI, BMR, TDEE, and personalized health metrics.
            </p>
            <button className="ff-btn ff-btn-primary ff-btn-sm" onClick={() => navigate("/quiz")}>
              Take the Quiz →
            </button>
          </div>
        </SectionCard>
      )}

      <div className="ff-grid ff-grid-2 ff-section">
        {/* ==========================================
            Workout Plan Card — now with live API data
            ========================================== */}
        <SectionCard title="Workout Plan">
          {!quizData ? (
            <div style={{ color: "#a7b4c9", marginBottom: "1rem" }}>Please take the fitness quiz to unlock your plan.</div>
          ) : !hasPlan ? (
            <div style={{ color: "#a7b4c9", marginBottom: "1rem" }}>
              Quiz complete! Generate your personalized plan to get started.
            </div>
          ) : (
            <>
              {/* Progress bar */}
              <div style={{ marginBottom: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                  <span style={{ color: "#a7b4c9", fontSize: "0.78rem" }}>Weekly progress</span>
                  <span style={{ color: "#f8fbff", fontWeight: 700, fontSize: "0.78rem" }}>
                    {doneCount}/{allDays.length} days
                  </span>
                </div>
                <div style={{ height: 6, borderRadius: 99, backgroundColor: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    width: `${allDays.length > 0 ? (doneCount / allDays.length) * 100 : 0}%`,
                    background: "linear-gradient(90deg, var(--ff-accent, #3b82f6), var(--ff-cyan, #06b6d4))",
                    borderRadius: 99,
                    transition: "width 0.5s ease",
                  }} />
                </div>
              </div>

              {/* Next day label */}
              {nextDay && (
                <div style={{ marginBottom: "0.7rem" }}>
                  <span style={{ 
                    fontSize: "0.75rem", fontWeight: 700, color: "#93c5fd", 
                    textTransform: "uppercase", letterSpacing: "0.06em" 
                  }}>
                    {completedDays.some(c => c.day === nextDay) ? "Day " + nextDay + " (Done)" : "Up Next — Day " + nextDay}
                  </span>
                </div>
              )}

              {/* Exercise preview list */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                {previewExercises.map((ex) => (
                  <div
                    key={ex.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.55rem 0.75rem",
                      borderRadius: 8,
                      backgroundColor: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", minWidth: 0 }}>
                      <span style={{
                        width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                        backgroundColor: muscleColors[ex.muscle_group] || "#94a3b8",
                      }} />
                      <span style={{ 
                        color: "#f8fbff", fontSize: "0.85rem", fontWeight: 500,
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>
                        {ex.name}
                      </span>
                    </div>
                    <span style={{ 
                      color: "#64748b", fontSize: "0.72rem", flexShrink: 0, marginLeft: "0.5rem" 
                    }}>
                      {ex.sets}×{ex.reps}
                    </span>
                  </div>
                ))}
              </div>

              {remainingCount > 0 && (
                <div style={{ color: "#64748b", fontSize: "0.78rem", marginTop: "0.4rem", paddingLeft: "0.75rem" }}>
                  + {remainingCount} more exercise{remainingCount > 1 ? "s" : ""}
                </div>
              )}
            </>
          )}
          
          <button 
            className="ff-btn ff-btn-primary ff-btn-sm" 
            onClick={() => navigate(quizData ? "/workouts" : "/quiz")}
            style={{ marginTop: "0.8rem" }}
          >
            {hasPlan ? "View Full Plan →" : (quizData ? "Generate Plan →" : "Take Quiz →")}
          </button>
        </SectionCard>

        <SectionCard title="Nutrition Plan">
          {!quizData ? (
            <div style={{ color: "#a7b4c9", marginBottom: "1rem" }}>Quiz required to calculate macros.</div>
          ) : nutritionPlan ? (
            <>
              {/* Macros from the generated plan */}
              <div className="ff-grid ff-grid-4" style={{ marginBottom: "0.8rem", gap: "0.5rem" }}>
                {[
                  { val: nutritionPlan.calories, lbl: "cal", color: "var(--ff-green)" },
                  { val: `${nutritionPlan.protein_g || 0}g`, lbl: "protein", color: "var(--ff-amber)" },
                  { val: `${nutritionPlan.fat_g || 0}g`, lbl: "fats", color: "var(--ff-purple)" },
                  { val: `${nutritionPlan.carbs_g || 0}g`, lbl: "carbs", color: "var(--ff-cyan, #06b6d4)" },
                ].map(({ val, lbl, color }) => (
                  <div key={lbl} className="ff-inset" style={{ textAlign: "center", padding: "0.5rem 0.3rem" }}>
                    <div style={{ fontWeight: 700, color, fontSize: "0.95rem" }}>{val}</div>
                    <div style={{ color: "#a7b4c9", fontSize: "0.68rem", marginTop: "0.15rem" }}>{lbl}</div>
                  </div>
                ))}
              </div>

              {/* Plan content preview (first 150 chars) */}
              <div style={{
                padding: "0.6rem 0.75rem",
                borderRadius: 8,
                backgroundColor: "rgba(34, 197, 94, 0.06)",
                border: "1px solid rgba(34, 197, 94, 0.15)",
                fontSize: "0.82rem",
                color: "#93a7c4",
                lineHeight: 1.5,
                marginBottom: "0.5rem",
              }}>
                {nutritionPlan.plan_content.length > 150
                  ? nutritionPlan.plan_content.substring(0, 150).replace(/\n/g, " ") + "..."
                  : nutritionPlan.plan_content.replace(/\n/g, " ")}
              </div>

              <div style={{ color: "#64748b", fontSize: "0.72rem" }}>
                Generated: {new Date(nutritionPlan.created_at).toLocaleDateString()}
              </div>
            </>
          ) : (
            <>
              {/* No plan yet — show quiz-based macros as fallback */}
              <div className="ff-grid ff-grid-3" style={{ marginBottom: "0.8rem" }}>
                {[
                  { val: macros.calories, lbl: "cal", color: "var(--ff-green)" },
                  { val: `${macros.protein}g`, lbl: "protein", color: "var(--ff-amber)" },
                  { val: `${macros.fats}g`, lbl: "fats", color: "var(--ff-purple)" },
                ].map(({ val, lbl, color }) => (
                  <div key={lbl} className="ff-inset" style={{ textAlign: "center" }}>
                    <div style={{ fontWeight: 700, color, fontSize: "1rem" }}>{val}</div>
                    <div style={{ color: "#a7b4c9", fontSize: "0.75rem", marginTop: "0.2rem" }}>{lbl}</div>
                  </div>
                ))}
              </div>
              <p style={{ color: "#a7b4c9", fontSize: "0.82rem", margin: "0 0 0.5rem" }}>
                Generate your AI-powered nutrition plan for personalized food recommendations.
              </p>
            </>
          )}

          <button
            className="ff-btn ff-btn-primary ff-btn-sm"
            onClick={() => navigate("/diet-plan")}
            style={{ marginTop: "0.4rem" }}
          >
            {nutritionPlan ? "View Full Plan →" : "Generate Plan →"}
          </button>
        </SectionCard>
      </div>

      <div className="ff-grid ff-grid-2 ff-section">
        <SectionCard title="Recent Activity">
          {activityLog.length === 0 ? (
            <div style={{ color: "#a7b4c9", padding: "1rem 0" }}>No activity yet. Start logging!</div>
          ) : (
            <div className="ff-stack">
              {activityLog.map((item) => (
                <div key={item.id} className="ff-activity-item">
                  <span style={{ fontSize: "1.3rem", flexShrink: 0 }}>{item.icon}</span>
                  <div>
                    <div style={{ color: "#f8fbff", fontWeight: 500, fontSize: "0.9rem" }}>{item.action}</div>
                    <div style={{ color: "#64748b", fontSize: "0.78rem", marginTop: "0.15rem" }}>{item.timestamp}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Fitness Tips">
          <div className="ff-stack">
            {tips.map((tip) => (
              <div key={tip} className="ff-tip-item">{tip}</div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Quick Actions">
        <div className="ff-grid ff-grid-4">
          {[
            { label: hasPlan ? "Resume Workout" : "Start Workout", action: () => navigate("/workouts"), primary: true },
            { label: "AI Report", action: () => navigate("/reports"), primary: false },
            { label: quizData ? "Update Goals" : "Take Quiz", action: () => navigate(quizData ? "/quiz?retake=true" : "/quiz"), primary: false },
            { label: "Edit Profile", action: () => navigate("/profile"), primary: false },
          ].map(({ label, action, primary }) => (
            <button
              key={label}
              onClick={action}
              className={`ff-btn ${primary ? "ff-btn-primary" : "ff-btn-ghost"}`}
              style={{ padding: "1rem 0.75rem" }}
            >
              {label}
            </button>
          ))}
        </div>
      </SectionCard>
    </AppPage>
  );
}
