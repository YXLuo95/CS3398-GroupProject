import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AppPage from "../components/ui/AppPage";
import SectionCard from "../components/ui/SectionCard";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    date_of_birth: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
  });

  const getHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    axios
      .get(`${API_URL}/api/v1/profile`, { headers: getHeaders() })
      .then((res) => {
        setForm({
          first_name: res.data.first_name || "",
          last_name: res.data.last_name || "",
          phone: res.data.phone || "",
          date_of_birth: res.data.date_of_birth || "",
          address: res.data.address || "",
          city: res.data.city || "",
          state: res.data.state || "",
          zip_code: res.data.zip_code || "",
        });
        setLoading(false);
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          navigate("/login");
        } else if (err.response?.status === 404) {
          // No profile yet, show empty form in edit mode
          setEditing(true);
          setLoading(false);
        }
      });
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      await axios.put(`${API_URL}/api/v1/profile`, form, {
        headers: getHeaders(),
      });
      setMessage("Profile saved successfully!");
      setEditing(false);
    } catch (err) {
      setMessage("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  // -- Styles matching Dashboard --
  const glassCardStyle = {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: "16px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    overflow: "hidden",
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "8px",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    color: "white",
    fontSize: "0.95rem",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle = {
    display: "block",
    fontSize: "0.8rem",
    color: "#94a3b8",
    marginBottom: "6px",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    fontWeight: "bold",
  };

  const fieldGroup = {
    marginBottom: "16px",
  };

  const fields = [
    { name: "first_name", label: "First Name", type: "text" },
    { name: "last_name", label: "Last Name", type: "text" },
    { name: "phone", label: "Phone", type: "tel" },
    { name: "date_of_birth", label: "Date of Birth", type: "date" },
    { name: "address", label: "Address", type: "text" },
    { name: "city", label: "City", type: "text" },
    { name: "state", label: "State", type: "text" },
    { name: "zip_code", label: "Zip Code", type: "text" },
  ];

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#0b1727",
          color: "white",
          padding: "60px 40px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <p style={{ color: "#64748b", fontSize: "1.1rem" }}>Loading profile...</p>
      </div>
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
    <div
      style={{
        padding: "60px 40px",
        minHeight: "100vh",
        backgroundColor: "#0b1727",
      }}
    >
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <h1 style={{ color: "white", marginBottom: "30px" }}>
          Your Profile
        </h1>

        <div style={glassCardStyle}>
          <div
            style={{
              height: "6px",
              background: "linear-gradient(to right, #2f7bff, #2ecc71)",
            }}
          />
          <div style={{ padding: "28px" }}>
            <form onSubmit={handleSave}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                {fields.map((field) => (
                  <div key={field.name} style={fieldGroup}>
                    <label style={labelStyle}>{field.label}</label>
                    {editing ? (
                      <input
                        type={field.type}
                        name={field.name}
                        value={form[field.name]}
                        onChange={handleChange}
                        style={inputStyle}
                      />
                    ) : (
                      <p
                        style={{
                          color: form[field.name] ? "#e2e8f0" : "#475569",
                          margin: 0,
                          padding: "12px 0",
                          fontSize: "0.95rem",
                        }}
                      >
                        {form[field.name] || "Not set"}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {message && (
                <p
                  style={{
                    color: message.includes("success") ? "#2ecc71" : "#e74c3c",
                    marginTop: "16px",
                    fontSize: "0.9rem",
                  }}
                >
                  {message}
                </p>
              )}

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  marginTop: "24px",
                }}
              >
                {editing ? (
                  <>
                    <button
                      type="submit"
                      disabled={saving}
                      style={{
                        padding: "12px 28px",
                        border: "none",
                        borderRadius: "8px",
                        backgroundColor: saving ? "#475569" : "#2f7bff",
                        color: "white",
                        cursor: saving ? "not-allowed" : "pointer",
                        fontSize: "0.95rem",
                        fontWeight: "bold",
                      }}
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      style={{
                        padding: "12px 28px",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "8px",
                        backgroundColor: "transparent",
                        color: "#94a3b8",
                        cursor: "pointer",
                        fontSize: "0.95rem",
                      }}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    style={{
                      padding: "12px 28px",
                      border: "none",
                      borderRadius: "8px",
                      backgroundColor: "#2f7bff",
                      color: "white",
                      cursor: "pointer",
                      fontSize: "0.95rem",
                      fontWeight: "bold",
                    }}
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

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
      </div>
    </div>
  );
}
