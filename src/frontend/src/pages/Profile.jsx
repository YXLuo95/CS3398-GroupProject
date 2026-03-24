// Profile page component
// This will show the user's profile and progress tracking info.import { useEffect, useState } from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:8000";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    axios
      .get(`${API_URL}/api/v1/onboarding/quiz`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUser(res.data);
      })
      .catch(() => {
        navigate("/login");
      });
  }, [navigate]);

  if (!user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0f172a",
          color: "white",
          padding: "40px",
          fontFamily: "Arial",
        }}
      >
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "white",
        padding: "40px",
        fontFamily: "Arial",
      }}
    >
      <h1>Falcon Fitness Profile</h1>

      <div
        style={{
          marginTop: "20px",
          background: "#1e293b",
          padding: "20px",
          borderRadius: "10px",
        }}
      >
        <h2>Basic Info</h2>
        <p><b>Age:</b> {user.age}</p>
        <p><b>Height:</b> {user.height_in} in</p>
        <p><b>Weight:</b> {user.weight_lbs} lbs</p>
      </div>

      <div
        style={{
          marginTop: "20px",
          background: "#1e293b",
          padding: "20px",
          borderRadius: "10px",
        }}
      >
        <h2>Fitness Data</h2>
        <p><b>BMI:</b> {user.bmi}</p>
        <p><b>BMR:</b> {user.bmr}</p>
        <p><b>TDEE:</b> {user.tdee}</p>
        <p><b>Goal:</b> {user.goal_type}</p>
        <p><b>Activity Level:</b> {user.activity_level}</p>
      </div>

      <button
        onClick={() => navigate("/dashboard")}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          border: "none",
          borderRadius: "8px",
          background: "#3b82f6",
          color: "white",
          cursor: "pointer",
        }}
      >
        Back to Dashboard
      </button>
    </div>
  );
}