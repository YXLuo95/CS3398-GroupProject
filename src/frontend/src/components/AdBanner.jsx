import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * AdBanner — Mock advertisement banner.
 * Shows only for non-premium users. Has a close button.
 *
 * Props:
 *   position: "left" | "right" | "center"
 *   isPremium: boolean — pass from context/props. Banner renders nothing if true.
 */
export default function AdBanner({ position = "center", isPremium = false }) {
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();

  if (isPremium || dismissed) return null;

  const isSide = position === "left" || position === "right";

  // ==========================================
  // Side banners (left/right vertical)
  // ==========================================
  if (isSide) {
    return (
      <div
        style={{
          position: "fixed",
          top: "50%",
          [position]: "1rem",
          transform: "translateY(-50%)",
          width: "160px",
          height: "500px",
          backgroundColor: "rgba(59, 130, 246, 0.85)",
          backdropFilter: "blur(4px)",
          borderRadius: "12px",
          padding: "1rem",
          color: "white",
          zIndex: 100,
          boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
          border: "1px solid rgba(255,255,255,0.2)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          textAlign: "center",
        }}
      >
        {/* Close button */}
        <button
          onClick={() => setDismissed(true)}
          style={{
            position: "absolute",
            top: "6px",
            right: "6px",
            width: "22px",
            height: "22px",
            background: "rgba(0,0,0,0.3)",
            border: "none",
            borderRadius: "50%",
            color: "white",
            cursor: "pointer",
            fontSize: "0.7rem",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title="Close ad"
        >
          ✕
        </button>

        <div style={{ marginTop: "1.5rem" }}>
          <div style={{ fontSize: "2.2rem", marginBottom: "0.5rem" }}>💪</div>
          <div style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "0.3rem" }}>
            GET RIPPED FAST
          </div>
          <div style={{ fontSize: "0.72rem", opacity: 0.9, lineHeight: 1.4 }}>
            Premium protein powder — trusted by 10M+ athletes
          </div>
        </div>

        <div>
          <div style={{ fontSize: "0.75rem", marginBottom: "0.5rem", opacity: 0.8 }}>
            Tired of ads?
          </div>
          <button
            onClick={() => navigate("/upgrade")}
            style={{
              background: "white",
              color: "#3b82f6",
              border: "none",
              padding: "0.5rem 0.8rem",
              borderRadius: "6px",
              fontSize: "0.8rem",
              fontWeight: 700,
              cursor: "pointer",
              width: "100%",
            }}
          >
            Upgrade →
          </button>
        </div>

        <div style={{ fontSize: "0.6rem", opacity: 0.5, marginTop: "0.5rem" }}>
          Ad · Sponsored
        </div>
      </div>
    );
  }

  // ==========================================
  // Center banner (horizontal, full width)
  // ==========================================
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        backgroundColor: "rgba(245, 158, 11, 0.12)",
        border: "1px dashed rgba(245, 158, 11, 0.4)",
        borderRadius: "10px",
        padding: "1rem 1.2rem",
        margin: "1rem 0",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
      }}
    >
      <button
        onClick={() => setDismissed(true)}
        style={{
          position: "absolute",
          top: "6px",
          right: "8px",
          width: "22px",
          height: "22px",
          background: "rgba(0,0,0,0.2)",
          border: "none",
          borderRadius: "50%",
          color: "#f59e0b",
          cursor: "pointer",
          fontSize: "0.7rem",
          fontWeight: "bold",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        title="Close ad"
      >
        ✕
      </button>

      <div style={{ fontSize: "2rem" }}>🎯</div>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#f59e0b", marginBottom: "0.2rem" }}>
          Train with the Pros — 30% Off Personal Coaching
        </div>
        <div style={{ fontSize: "0.78rem", color: "#a7b4c9" }}>
          Get matched with a certified trainer in your area. Limited time offer.
        </div>
      </div>

      <button
        onClick={() => navigate("/upgrade")}
        style={{
          background: "#f59e0b",
          color: "white",
          border: "none",
          padding: "0.55rem 1rem",
          borderRadius: "6px",
          fontSize: "0.85rem",
          fontWeight: 700,
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        Remove Ads
      </button>

      <div style={{ fontSize: "0.65rem", color: "#64748b", whiteSpace: "nowrap" }}>
        Ad
      </div>
    </div>
  );
}
