import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AppPage from "../components/ui/AppPage";
import SectionCard from "../components/ui/SectionCard";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const TIERS = [
  {
    id: "hatchling",
    name: "Hatchling",
    price: "$2.99",
    period: "/month",
    color: "#22c55e",
    perks: [
      "✅ Ad-free experience",
      "Basic progress tracking",
      "Community forum access",
      "Standard support",
    ],
    recommended: false,
  },
  {
    id: "wingman",
    name: "Wingman",
    price: "$6.99",
    period: "/month",
    color: "#3b82f6",
    perks: [
      "✅ Ad-free experience",
      "All Hatchling features",
      "Priority chat support",
      "Weekly progress reports",
      "Advanced macro tracking",
    ],
    recommended: false,
  },
  {
    id: "elite",
    name: "Elite",
    price: "$12.99",
    period: "/month",
    color: "#f59e0b",
    perks: [
      "✅ Ad-free experience",
      "All Wingman features",
      "Advanced AI coaching",
      "Custom meal plans",
      "Unlimited workout generation",
    ],
    recommended: true,
  },
  {
    id: "swole_patrol",
    name: "Swole Patrol",
    price: "$24.99",
    period: "/month",
    color: "#a78bfa",
    perks: [
      "✅ Ad-free experience",
      "All Elite features",
      "1-on-1 trainer matching",
      "Priority LLM inference",
      "Early access to new features",
      "Dedicated support",
    ],
    recommended: false,
  },
];

const PAYMENT_METHODS = [
  { id: "visa", name: "Credit Card", icon: "💳" },
  { id: "paypal", name: "PayPal", icon: "🅿️" },
  { id: "apple", name: "Apple Pay", icon: "🍎" },
  { id: "google", name: "Google Pay", icon: "G" },
];

export default function Upgrade() {
  const navigate = useNavigate();
  const getToken = () => localStorage.getItem("token");
  const getHeaders = () => ({ Authorization: `Bearer ${getToken()}` });

  const [selectedTier, setSelectedTier] = useState("elite");
  const [coupon, setCoupon] = useState("");
  const [currentStatus, setCurrentStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  // Redeem states
  const [redeeming, setRedeeming] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) { navigate("/login"); return; }

    axios
      .get(`${API_URL}/api/v1/subscription/status`, { headers: getHeaders() })
      .then((res) => setCurrentStatus(res.data))
      .catch((err) => console.error("Status fetch error:", err))
      .finally(() => setLoading(false));
  }, [navigate]);

  const handlePaymentClick = (methodId) => {
    alert(
      `💳 Mock Payment\n\n${PAYMENT_METHODS.find(m => m.id === methodId)?.name} integration coming soon!\n\nFor now, use a coupon code below to activate your subscription.`
    );
  };

  const handleRedeem = async () => {
    if (!coupon.trim()) {
      setError("Please enter a coupon code.");
      return;
    }
    setError("");
    setSuccess("");
    setRedeeming(true);

    try {
      const res = await axios.post(
        `${API_URL}/api/v1/subscription/redeem`,
        { coupon: coupon.trim(), tier: selectedTier },
        { headers: getHeaders() }
      );
      setSuccess(`🎉 Welcome to ${res.data.tier.toUpperCase()}! Enjoy your ad-free experience.`);
      setCurrentStatus({
        is_premium: true,
        tier: res.data.tier,
        expires_at: res.data.expires_at,
      });
      setCoupon("");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to redeem coupon.");
    } finally {
      setRedeeming(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#0b1727", color: "white", padding: "60px", textAlign: "center" }}>
        <h2>Loading... 🦅</h2>
      </div>
    );
  }

  // Already subscribed
  if (currentStatus?.is_premium) {
    return (
      <AppPage
        eyebrow="MEMBERSHIP"
        title="You're a"
        accent={currentStatus.tier.toUpperCase() + " member"}
        subtitle="Thank you for supporting Blue Falcon Fitness!"
      >
        <SectionCard title="Your Subscription">
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>👑</div>
            <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#f59e0b", marginBottom: "0.5rem" }}>
              {currentStatus.tier.toUpperCase()} Tier
            </div>
            <div style={{ color: "#a7b4c9", fontSize: "0.9rem", marginBottom: "1rem" }}>
              Active until {new Date(currentStatus.expires_at).toLocaleDateString()}
            </div>
            <div style={{
              padding: "1rem", backgroundColor: "rgba(34, 197, 94, 0.1)",
              borderRadius: "8px", border: "1px solid rgba(34, 197, 94, 0.3)",
              color: "#4ade80", fontSize: "0.88rem", maxWidth: "400px", margin: "0 auto",
            }}>
              ✅ Ads are disabled across the platform.
            </div>
          </div>
        </SectionCard>

        <button
          onClick={() => navigate("/dashboard")}
          style={{
            marginTop: "20px", padding: "10px 20px", border: "none",
            borderRadius: "8px", background: "transparent", color: "#64748b",
            cursor: "pointer", fontSize: "14px",
          }}
        >
          ← Back to Dashboard
        </button>
      </AppPage>
    );
  }

  return (
    <AppPage
      eyebrow="UPGRADE"
      title="Go"
      accent="Premium"
      subtitle="Remove ads and unlock exclusive features. Support the Blue Falcon team."
    >
      {/* Tier selection */}
      <SectionCard title="Choose Your Plan">
        <div className="ff-grid ff-grid-4" style={{ gap: "1rem" }}>
          {TIERS.map((tier) => {
            const isSelected = selectedTier === tier.id;
            return (
              <div
                key={tier.id}
                onClick={() => setSelectedTier(tier.id)}
                style={{
                  position: "relative",
                  padding: "1.5rem 1.2rem",
                  borderRadius: "12px",
                  backgroundColor: isSelected
                    ? `${tier.color}15`
                    : "rgba(255,255,255,0.03)",
                  border: `2px solid ${isSelected ? tier.color : "rgba(255,255,255,0.08)"}`,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                {tier.recommended && (
                  <div style={{
                    position: "absolute", top: "-10px", right: "12px",
                    background: tier.color, color: "white",
                    padding: "3px 10px", borderRadius: "12px",
                    fontSize: "0.7rem", fontWeight: 700,
                  }}>
                    POPULAR
                  </div>
                )}

                <div style={{ color: tier.color, fontWeight: 700, fontSize: "1.1rem", marginBottom: "0.3rem" }}>
                  {tier.name}
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <span style={{ fontSize: "1.8rem", fontWeight: 800, color: "#f8fbff" }}>
                    {tier.price}
                  </span>
                  <span style={{ color: "#64748b", fontSize: "0.85rem" }}>{tier.period}</span>
                </div>

                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {tier.perks.map((perk, i) => (
                    <li key={i} style={{
                      color: perk.startsWith("✅") ? "#4ade80" : "#a7b4c9",
                      fontSize: "0.82rem",
                      padding: "0.3rem 0",
                      lineHeight: 1.4,
                    }}>
                      {perk.startsWith("✅") ? perk : `· ${perk}`}
                    </li>
                  ))}
                </ul>

                {isSelected && (
                  <div style={{
                    marginTop: "1rem", textAlign: "center",
                    fontSize: "0.75rem", color: tier.color, fontWeight: 700,
                  }}>
                    ✓ Selected
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Payment methods (dummy) */}
      <SectionCard title="Payment Method">
        <div style={{ marginBottom: "1rem", color: "#a7b4c9", fontSize: "0.88rem" }}>
          Select your preferred payment method to complete checkout.
        </div>
        <div className="ff-grid ff-grid-4" style={{ gap: "0.6rem", marginBottom: "1.5rem" }}>
          {PAYMENT_METHODS.map((m) => (
            <button
              key={m.id}
              onClick={() => handlePaymentClick(m.id)}
              style={{
                padding: "0.9rem 0.8rem",
                backgroundColor: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "10px",
                color: "#f8fbff",
                cursor: "pointer",
                fontSize: "0.85rem",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                justifyContent: "center",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = "rgba(59,130,246,0.4)"}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
            >
              <span style={{ fontSize: "1.2rem" }}>{m.icon}</span>
              {m.name}
            </button>
          ))}
        </div>

        <div style={{
          fontSize: "0.75rem", color: "#64748b", textAlign: "center",
          padding: "0.6rem", backgroundColor: "rgba(255,255,255,0.02)", borderRadius: "6px",
        }}>
          💡 Payment integration is in preview. Use a coupon code below to activate your subscription.
        </div>
      </SectionCard>

      {/* Coupon */}
      <SectionCard title="Have a Coupon?">
        <div style={{ display: "flex", gap: "0.6rem", marginBottom: "1rem", alignItems: "flex-start" }}>
          <input
            className="ff-input"
            type="text"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value.toUpperCase())}
            placeholder="Enter coupon code"
            onKeyDown={(e) => e.key === "Enter" && handleRedeem()}
            style={{ flex: 1, fontFamily: "monospace", letterSpacing: "0.1em" }}
          />
          <button
            onClick={handleRedeem}
            className="ff-btn ff-btn-primary"
            disabled={!coupon.trim() || redeeming}
            style={{
              opacity: !coupon.trim() || redeeming ? 0.5 : 1,
              whiteSpace: "nowrap",
            }}
          >
            {redeeming ? "Redeeming..." : "Redeem"}
          </button>
        </div>

        <div style={{ color: "#64748b", fontSize: "0.78rem", marginBottom: "0.5rem" }}>
          You'll activate the <strong style={{ color: "#f8fbff" }}>{selectedTier.toUpperCase()}</strong> tier.
        </div>

        {error && (
          <div style={{
            padding: "0.7rem 1rem", backgroundColor: "rgba(239, 68, 68, 0.1)",
            color: "#f87171", borderRadius: "8px", fontSize: "0.88rem",
            border: "1px solid rgba(239, 68, 68, 0.3)",
          }}>
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div style={{
            padding: "0.7rem 1rem", backgroundColor: "rgba(34, 197, 94, 0.1)",
            color: "#4ade80", borderRadius: "8px", fontSize: "0.88rem",
            border: "1px solid rgba(34, 197, 94, 0.3)",
          }}>
            {success}
            <button
              onClick={() => navigate("/dashboard")}
              style={{
                marginLeft: "1rem", padding: "0.3rem 0.8rem",
                background: "#4ade80", color: "#0b1727", border: "none",
                borderRadius: "4px", cursor: "pointer", fontSize: "0.78rem", fontWeight: 700,
              }}
            >
              Go to Dashboard →
            </button>
          </div>
        )}
      </SectionCard>

      <button
        onClick={() => navigate("/dashboard")}
        style={{
          marginTop: "20px", padding: "10px 20px", border: "none",
          borderRadius: "8px", background: "transparent", color: "#64748b",
          cursor: "pointer", fontSize: "14px",
        }}
      >
        ← Back to Dashboard
      </button>
    </AppPage>
  );
}
