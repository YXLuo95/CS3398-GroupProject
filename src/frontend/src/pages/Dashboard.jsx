import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppPage from "../components/ui/AppPage";
import SectionCard from "../components/ui/SectionCard";

const mockUser = { name: "Alex Johnson", email: "alex@example.com" };

const mockQuizResults = {
  goal: "lose_weight",
  workoutFrequency: 4,
  dietPreference: "balanced",
  calorieTarget: 2200,
  proteinTarget: 150,
  carbsTarget: 200,
  fatsTarget: 73,
  focusAreas: ["strength", "cardio", "fat_loss"],
};

const mockActivityLog = [
  { id: 1, action: "Completed fitness quiz", timestamp: "2 hours ago", icon: "✅" },
  { id: 2, action: "Viewed Strength Plan", timestamp: "1 day ago", icon: "💪" },
  { id: 3, action: "Logged today's workout", timestamp: "2 days ago", icon: "🏋️" },
  { id: 4, action: "Updated nutrition goal", timestamp: "3 days ago", icon: "🥗" },
];

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

const workoutRecs = {
  lose_weight: { split: "4-Day Split", freq: "4x/week", focus: "HIIT + compound lifts" },
  gain_muscle: { split: "Push/Pull/Legs", freq: "5-6x/week", focus: "Progressive overload" },
  improve_endurance: { split: "Circuit Training", freq: "5x/week", focus: "Cardio + functional" },
  general_fitness: { split: "Full Body", freq: "3-4x/week", focus: "Balanced training" },
};

const dietTips = {
  lose_weight: ["Lean proteins first", "Complex carbs over simple", "Healthy fats in moderation"],
  gain_muscle: ["High protein intake (1.6-2.2g/kg)", "Calorie surplus with whole foods", "Carbs pre/post workout"],
  improve_endurance: ["Carb-focused pre-workout", "Electrolytes during long sessions", "Moderate protein"],
  general_fitness: ["Varied protein sources", "Whole grain carbohydrates", "Consistent meal timing"],
};

const fitnessTips = {
  lose_weight: ["Maintain a 300-500 kcal daily deficit", "Use progressive overload to protect muscle", "Track sleep since poor recovery slows fat loss"],
  gain_muscle: ["Increase weight when you hit the top of your rep range", "Eat within 2 hours post-workout", "Deload every 6-8 weeks"],
  improve_endurance: ["Mix steady-state and interval cardio", "Stay hydrated and monitor electrolytes", "Include mobility work weekly"],
  general_fitness: ["Consistency beats intensity long-term", "Balance strength, cardio, and flexibility", "Listen to your body and adjust"],
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [user] = useState(mockUser);
  const [quiz] = useState(mockQuizResults);
  const [log] = useState(mockActivityLog);

  const goal = quiz.goal;
  const rec = workoutRecs[goal] || workoutRecs.general_fitness;
  const tips = fitnessTips[goal] || fitnessTips.general_fitness;
  const diet = dietTips[goal] || dietTips.general_fitness;

  return (
    <AppPage
      eyebrow="DASHBOARD"
      title={`Welcome back, ${user.name}`}
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
            <div className="ff-kpi-value" style={{ color: "var(--ff-green)" }}>12</div>
            <div className="ff-kpi-label">Workouts Done</div>
          </div>
          <div className="ff-kpi">
            <div className="ff-kpi-value" style={{ color: "var(--ff-amber)" }}>5</div>
            <div className="ff-kpi-label">Day Streak</div>
          </div>
          <div className="ff-kpi">
            <div className="ff-kpi-value" style={{ color: "var(--ff-cyan)" }}>{quiz.calorieTarget}</div>
            <div className="ff-kpi-label">Daily Calories</div>
          </div>
          <div className="ff-kpi">
            <div className="ff-kpi-value" style={{ color: "var(--ff-purple)" }}>{quiz.proteinTarget}g</div>
            <div className="ff-kpi-label">Daily Protein</div>
          </div>
        </div>
      </SectionCard>

      <div className="ff-grid ff-grid-2 ff-section">
        <SectionCard title="Workout Plan">
          <div className="ff-grid ff-grid-2" style={{ marginBottom: "1rem" }}>
            <div className="ff-inset" style={{ textAlign: "center" }}>
              <div style={{ fontWeight: 700, color: "#f8fbff", fontSize: "1rem" }}>{rec.split}</div>
              <div style={{ color: "#a7b4c9", fontSize: "0.78rem", marginTop: "0.2rem" }}>Split</div>
            </div>
            <div className="ff-inset" style={{ textAlign: "center" }}>
              <div style={{ fontWeight: 700, color: "var(--ff-cyan)", fontSize: "1rem" }}>{rec.freq}</div>
              <div style={{ color: "#a7b4c9", fontSize: "0.78rem", marginTop: "0.2rem" }}>Frequency</div>
            </div>
          </div>
          <p style={{ color: "#a7b4c9", fontSize: "0.88rem", lineHeight: 1.55, margin: "0 0 0.8rem" }}>
            <strong style={{ color: "#f8fbff" }}>Focus:</strong> {rec.focus}
          </p>
          <button className="ff-btn ff-btn-primary ff-btn-sm" onClick={() => navigate("/workouts")}>
            View Full Plan →
          </button>
        </SectionCard>

        <SectionCard title="Nutrition Plan">
          <div className="ff-grid ff-grid-3" style={{ marginBottom: "1rem" }}>
            {[
              { val: quiz.calorieTarget, lbl: "cal", color: "var(--ff-green)" },
              { val: `${quiz.proteinTarget}g`, lbl: "protein", color: "var(--ff-amber)" },
              { val: `${quiz.fatsTarget}g`, lbl: "fats", color: "var(--ff-purple)" },
            ].map(({ val, lbl, color }) => (
              <div key={lbl} className="ff-inset" style={{ textAlign: "center" }}>
                <div style={{ fontWeight: 700, color, fontSize: "1rem" }}>{val}</div>
                <div style={{ color: "#a7b4c9", fontSize: "0.75rem", marginTop: "0.2rem" }}>{lbl}</div>
              </div>
            ))}
          </div>
          <ul style={{ color: "#a7b4c9", fontSize: "0.86rem", paddingLeft: "1.1rem", margin: "0 0 0.8rem", lineHeight: 1.75 }}>
            {diet.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
          <button className="ff-btn ff-btn-primary ff-btn-sm" onClick={() => navigate("/nutrition")}>
            View Nutrition →
          </button>
        </SectionCard>
      </div>

      <div className="ff-grid ff-grid-2 ff-section">
        <SectionCard title="Recent Activity">
          <div className="ff-stack">
            {log.map((item) => (
              <div key={item.id} className="ff-activity-item">
                <span style={{ fontSize: "1.3rem", flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <div style={{ color: "#f8fbff", fontWeight: 500, fontSize: "0.9rem" }}>{item.action}</div>
                  <div style={{ color: "#64748b", fontSize: "0.78rem", marginTop: "0.15rem" }}>{item.timestamp}</div>
                </div>
              </div>
            ))}
          </div>
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
            { label: "Start Workout", action: () => navigate("/workouts"), primary: true },
            { label: "View Nutrition", action: () => navigate("/nutrition"), primary: false },
            { label: "Retake Quiz", action: () => navigate("/quiz?retake=true"), primary: false },
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