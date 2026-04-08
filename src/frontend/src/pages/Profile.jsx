import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AppPage from "../components/ui/AppPage";
import SectionCard from "../components/ui/SectionCard";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const fields = [
  { name: "first_name", label: "First Name", type: "text", icon: "👤" },
  { name: "last_name", label: "Last Name", type: "text", icon: "👤" },
  { name: "phone", label: "Phone", type: "tel", icon: "📱" },
  { name: "date_of_birth", label: "Date of Birth", type: "date", icon: "🎂" },
  { name: "address", label: "Address", type: "text", icon: "🏠" },
  { name: "city", label: "City", type: "text", icon: "🌆" },
  { name: "state", label: "State", type: "text", icon: "📍" },
  { name: "zip_code", label: "Zip Code", type: "text", icon: "📮" },
];

const emptyForm = {
  first_name: "",
  last_name: "",
  phone: "",
  date_of_birth: "",
  address: "",
  city: "",
  state: "",
  zip_code: "",
};

export default function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [savedForm, setSavedForm] = useState({ ...emptyForm }); // track last saved state
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const getHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  // ==========================================
  // Load profile data
  // ==========================================
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // Decode username from token for display
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.sub) setUsername(payload.sub);
    } catch {}

    axios
      .get(`${API_URL}/api/v1/profile`, { headers: getHeaders() })
      .then((res) => {
        const data = res.data;
        if (data.username) setUsername(data.username);
        if (data.email) setEmail(data.email);

        const profileData = {
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          phone: data.phone || "",
          date_of_birth: data.date_of_birth || "",
          address: data.address || "",
          city: data.city || "",
          state: data.state || "",
          zip_code: data.zip_code || "",
        };
        setForm(profileData);
        setSavedForm(profileData);
        setLoading(false);
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        } else if (err.response?.status === 404) {
          // New user, no profile yet
          setIsNew(true);
          setEditing(true);
          setLoading(false);
        }
      });
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCancel = () => {
    setForm({ ...savedForm }); // revert to last saved state
    setEditing(false);
    setMessage("");
  };

  // ==========================================
  // Save profile
  // ==========================================
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const res = await axios.put(`${API_URL}/api/v1/profile`, form, {
        headers: getHeaders(),
      });

      // Update saved state with response data
      const data = res.data;
      const updatedForm = {
        first_name: data.first_name || form.first_name,
        last_name: data.last_name || form.last_name,
        phone: data.phone || form.phone,
        date_of_birth: data.date_of_birth || form.date_of_birth,
        address: data.address || form.address,
        city: data.city || form.city,
        state: data.state || form.state,
        zip_code: data.zip_code || form.zip_code,
      };
      setForm(updatedForm);
      setSavedForm(updatedForm);
      if (data.username) setUsername(data.username);
      if (data.email) setEmail(data.email);

      setMessage("Profile saved successfully!");
      setEditing(false);
      setIsNew(false);
    } catch (err) {
      setMessage("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // Loading state
  // ==========================================
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#0b1727", color: "white", padding: "60px", textAlign: "center" }}>
        <h2>Loading your profile... 🦅</h2>
      </div>
    );
  }

  const displayName = form.first_name
    ? `${form.first_name}${form.last_name ? " " + form.last_name : ""}`
    : username;

  const filledCount = fields.filter(f => form[f.name]).length;

  return (
    <AppPage
      eyebrow="PROFILE"
      title={editing ? "Edit Profile" : displayName}
      subtitle={editing ? "Update your personal information" : (email || "Manage your account details")}
      actions={
        !editing && (
          <button
            className="ff-btn ff-btn-primary ff-btn-sm"
            onClick={() => setEditing(true)}
          >
            Edit Profile
          </button>
        )
      }
    >
      {/* Success/Error message */}
      {message && (
        <div style={{
          padding: "12px 16px",
          borderRadius: 8,
          marginBottom: "1rem",
          backgroundColor: message.includes("success")
            ? "rgba(34, 197, 94, 0.1)"
            : "rgba(239, 68, 68, 0.1)",
          border: `1px solid ${message.includes("success") ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
          color: message.includes("success") ? "#4ade80" : "#f87171",
          fontSize: "0.88rem",
        }}>
          {message.includes("success") ? "✅" : "⚠️"} {message}
        </div>
      )}

      {/* Account info card */}
      <SectionCard title="Account">
        <div className="ff-grid ff-grid-3">
          <div className="ff-inset" style={{ textAlign: "center", padding: "0.7rem 0.5rem" }}>
            <div style={{ fontSize: "1.1rem", marginBottom: "0.15rem" }}>🦅</div>
            <div style={{ color: "#f8fbff", fontSize: "0.88rem", fontWeight: 600 }}>{username || "—"}</div>
            <div style={{ color: "#64748b", fontSize: "0.7rem", marginTop: "0.1rem" }}>Username</div>
          </div>
          <div className="ff-inset" style={{ textAlign: "center", padding: "0.7rem 0.5rem" }}>
            <div style={{ fontSize: "1.1rem", marginBottom: "0.15rem" }}>✉️</div>
            <div style={{ color: "#f8fbff", fontSize: "0.88rem", fontWeight: 600, wordBreak: "break-all" }}>{email || "—"}</div>
            <div style={{ color: "#64748b", fontSize: "0.7rem", marginTop: "0.1rem" }}>Email</div>
          </div>
          <div className="ff-inset" style={{ textAlign: "center", padding: "0.7rem 0.5rem" }}>
            <div style={{ fontSize: "1.1rem", marginBottom: "0.15rem" }}>📊</div>
            <div style={{ color: "var(--ff-cyan, #06b6d4)", fontSize: "0.88rem", fontWeight: 600 }}>{filledCount}/{fields.length}</div>
            <div style={{ color: "#64748b", fontSize: "0.7rem", marginTop: "0.1rem" }}>Completed</div>
          </div>
        </div>
      </SectionCard>

      {/* Profile fields */}
      <SectionCard title={isNew ? "Set Up Your Profile" : "Personal Information"}>
        <form onSubmit={handleSave}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.75rem",
          }}>
            {fields.map((field) => (
              <div key={field.name}>
                <label className="ff-label" style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <span style={{ fontSize: "0.85rem" }}>{field.icon}</span>
                  {field.label}
                </label>
                {editing ? (
                  <input
                    type={field.type}
                    name={field.name}
                    value={form[field.name]}
                    onChange={handleChange}
                    className="ff-input"
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                  />
                ) : (
                  <div style={{
                    padding: "0.65rem 0.75rem",
                    borderRadius: 8,
                    backgroundColor: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    color: form[field.name] ? "#f8fbff" : "#475569",
                    fontSize: "0.9rem",
                    minHeight: "2.4rem",
                    display: "flex",
                    alignItems: "center",
                  }}>
                    {form[field.name] || "Not set"}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Action buttons */}
          {editing && (
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.2rem" }}>
              <button
                type="submit"
                disabled={saving}
                className="ff-btn ff-btn-primary"
                style={{
                  flex: 1,
                  opacity: saving ? 0.6 : 1,
                  cursor: saving ? "not-allowed" : "pointer",
                }}
              >
                {saving ? "Saving..." : isNew ? "Create Profile" : "Save Changes"}
              </button>
              {!isNew && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="ff-btn ff-btn-ghost"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
              )}
            </div>
          )}
        </form>
      </SectionCard>

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
