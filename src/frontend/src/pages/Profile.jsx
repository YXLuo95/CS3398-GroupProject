// Profile page component
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AppPage from "../components/ui/AppPage";
import SectionCard from "../components/ui/SectionCard";

const API_URL = "http://localhost:8000";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    axios
      .get(`${API_URL}/api/v1/onboarding/quiz`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data))
      .catch(() => navigate("/login"));
  }, [navigate]);

  if (!user) {
    return (
      <main className="ff-page">
        <div className="ff-container">
          <div className="ff-card ff-card-pad" style={{ textAlign: "center", padding: "3rem" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem", opacity: 0.6 }}>⏳</div>
            <p style={{ color: "#a7b4c9", margin: 0 }}>Loading your profile…</p>
          </div>
        </div>
      </main>
    );
  }

  const bmi  = parseFloat(user.bmi)?.toFixed(1);
  const bmr  = Math.round(user.bmr);
  const tdee = Math.round(user.tdee);

  const bmiCategory = (b) => {
    if (b < 18.5) return { label: "Underweight", color: "var(--ff-cyan)" };
    if (b < 25)   return { label: "Normal",      color: "var(--ff-green)" };
    if (b < 30)   return { label: "Overweight",  color: "var(--ff-amber)" };
    return              { label: "Obese",         color: "#ef4444" };
  };
  const bmiInfo = bmiCategory(parseFloat(bmi));

  return (
    <AppPage
      eyebrow="PROFILE"
      title="Your Fitness"
      accent="Profile"
      subtitle="Your personal stats and body metrics calculated from your quiz results."
      actions={
        <button
          className="ff-btn ff-btn-ghost ff-btn-sm"
          onClick={() => navigate("/quiz?retake=true")}
        >
          ✏️ Edit Profile
        </button>
      }
    >

      {/* Basic Info */}
      <SectionCard title="Basic Information">
        <div className="ff-grid ff-grid-3">
          {[
            { label: "Age",    value: `${user.age} yrs`,   icon: "📅" },
            { label: "Height", value: `${user.height_in}"`, icon: "📏" },
            { label: "Weight", value: `${user.weight_lbs} lbs`, icon: "⚖️" },
          ].map(({ label, value, icon }) => (
            <div key={label} className="ff-inset" style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.5rem", marginBottom: "0.4rem" }}>{icon}</div>
              <div style={{ fontWeight: 700, color: "#f8fbff", fontSize: "1.1rem" }}>{value}</div>
              <div style={{ color: "#a7b4c9", fontSize: "0.78rem", marginTop: "0.2rem" }}>{label}</div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Fitness Metrics */}
      <SectionCard
        title="Calculated Metrics"
        subtitle="Computed from your body stats and activity level."
      >
        <div className="ff-grid ff-grid-3">
          <div className="ff-inset" style={{ textAlign: "center" }}>
            <div className="ff-kpi-value" style={{ color: bmiInfo.color, fontSize: "1.8rem" }}>{bmi}</div>
            <div style={{ color: bmiInfo.color, fontSize: "0.8rem", fontWeight: 600, margin: "0.15rem 0" }}>{bmiInfo.label}</div>
            <div className="ff-kpi-label">BMI</div>
          </div>
          <div className="ff-inset" style={{ textAlign: "center" }}>
            <div className="ff-kpi-value" style={{ color: "var(--ff-cyan)" }}>{bmr}</div>
            <div className="ff-kpi-label" style={{ marginTop: "0.2rem" }}>BMR (kcal/day)</div>
          </div>
          <div className="ff-inset" style={{ textAlign: "center" }}>
            <div className="ff-kpi-value" style={{ color: "var(--ff-green)" }}>{tdee}</div>
            <div className="ff-kpi-label" style={{ marginTop: "0.2rem" }}>TDEE (kcal/day)</div>
          </div>
        </div>
      </SectionCard>

      {/* Goal & Preferences */}
      <SectionCard title="Goal & Training">
        <div className="ff-grid ff-grid-2">
          {[
            { label: "Fitness Goal",    value: user.goal_type?.replace(/_/g, " "),  icon: "🎯" },
            { label: "Activity Level",  value: user.activity_level?.replace(/_/g, " "), icon: "🏃" },
          ].map(({ label, value, icon }) => (
            <div key={label} className="ff-inset ff-flex" style={{ gap: "0.8rem" }}>
              <span style={{ fontSize: "1.5rem", flexShrink: 0 }}>{icon}</span>
              <div>
                <div style={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</div>
                <div style={{ color: "#f8fbff", fontWeight: 600, marginTop: "0.2rem", textTransform: "capitalize" }}>{value || "—"}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="ff-actions">
          <button
            className="ff-btn ff-btn-primary"
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard →
          </button>
          <button
            className="ff-btn ff-btn-ghost"
            onClick={() => navigate("/quiz?retake=true")}
          >
            Update Quiz
          </button>
        </div>
      </SectionCard>

    </AppPage>
  );
}