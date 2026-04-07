import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AppPage from "../components/ui/AppPage";
import SectionCard from "../components/ui/SectionCard";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const WS_URL = API_URL.replace("http", "ws");

export default function Chat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);
  const currentUser = useRef("");

  // decode username from token
  const getUsername = (token) => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.sub || "";
    } catch {
      return "";
    }
  };

  // auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    currentUser.current = getUsername(token);

    // 1. Load chat history
    fetch(`${API_URL}/api/v1/chat/history?limit=50`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load history");
        return res.json();
      })
      .then((data) => setMessages(data))
      .catch((err) => console.error("History load failed:", err));

    // 2. Connect WebSocket
    const ws = new WebSocket(`${WS_URL}/api/v1/chat?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      setMessages((prev) => [...prev, msg]);
    };

    ws.onclose = () => {
      setConnected(false);
      setMessages((prev) => [
        ...prev,
        { type: "system", content: "Disconnected from chat." },
      ]);
    };

    return () => ws.close();
  }, [navigate]);

  const sendMessage = () => {
    if (wsRef.current && input.trim()) {
      wsRef.current.send(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <AppPage
      eyebrow="CHAT"
      title="AI Fitness"
      accent="Assistant"
      subtitle="Ask anything about workouts, nutrition, or your fitness goals."
      actions={
        <span className={`ff-tag ${connected ? "ff-tag-green" : "ff-tag-amber"}`}>
          <span
            style={{
              display: "inline-block",
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: connected ? "#22c55e" : "#f59e0b",
              marginRight: 6,
            }}
          />
          {connected ? "Connected" : "Disconnected"}
        </span>
      }
    >
      <SectionCard title="Conversation" noPad>
        {/* Messages scroll area */}
        <div
          style={{
            height: "480px",
            overflowY: "auto",
            padding: "20px 24px",
          }}
        >
          {messages.length === 0 && (
            <p style={{ textAlign: "center", color: "var(--ff-text-muted)", padding: "40px 0" }}>
              No messages yet. Start the conversation!
            </p>
          )}

          {messages.map((msg, i) => {
            const isMe = msg.username === currentUser.current;
            const isSystem = msg.type === "system";

            if (isSystem) {
              return (
                <div key={i} style={{ textAlign: "center", margin: "12px 0" }}>
                  <span className="ff-tag" style={{ fontStyle: "italic" }}>
                    {msg.content}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: isMe ? "flex-end" : "flex-start",
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    maxWidth: "70%",
                    backgroundColor: isMe
                      ? "var(--ff-accent-soft)"
                      : "var(--ff-surface-3)",
                    border: isMe
                      ? "1px solid rgba(59,130,246,0.3)"
                      : "1px solid rgba(255,255,255,0.06)",
                    borderRadius: isMe
                      ? "16px 16px 4px 16px"
                      : "16px 16px 16px 4px",
                    padding: "12px 16px",
                  }}
                >
                  {!isMe && (
                    <div
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: "#7dd3fc",
                        marginBottom: 4,
                      }}
                    >
                      {msg.username}
                    </div>
                  )}
                  <div style={{ color: "var(--ff-text)", fontSize: "0.95rem", lineHeight: 1.5, wordBreak: "break-word" }}>
                    {msg.content}
                  </div>
                  <div
                    style={{
                      fontSize: "0.65rem",
                      color: "var(--ff-text-muted)",
                      marginTop: 6,
                      textAlign: isMe ? "right" : "left",
                    }}
                  >
                    {msg.timestamp
                      ? new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : ""}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input row */}
        <div
          style={{
            display: "flex",
            gap: 12,
            padding: "16px 24px 20px",
            borderTop: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <input
            className="ff-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={connected ? "Type a message…" : "Reconnecting…"}
            disabled={!connected}
            style={{ flex: 1 }}
          />
          <button
            onClick={sendMessage}
            disabled={!connected || !input.trim()}
            className="ff-btn ff-btn-primary"
            style={{ opacity: connected && input.trim() ? 1 : 0.45 }}
          >
            Send
          </button>
        </div>
      </SectionCard>
    </AppPage>
  );
}
