import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AppPage from "../components/ui/AppPage";
import SectionCard from "../components/ui/SectionCard";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const WS_URL = API_URL.replace("http", "ws");

// ==========================================
// Reconnect config
// ==========================================
const RECONNECT_BASE_DELAY = 1000;   // 1s
const RECONNECT_MAX_DELAY = 15000;   // 15s cap
const RECONNECT_MAX_ATTEMPTS = 10;

export default function Chat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [displayName, setDisplayName] = useState("");  // profile first_name or username
  const [onlineCount, setOnlineCount] = useState(0);

  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);
  const currentUser = useRef("");       // username from JWT (used for message matching)
  const reconnectAttempts = useRef(0);
  const reconnectTimer = useRef(null);
  const intentionalClose = useRef(false);

  // ==========================================
  // Decode username from JWT
  // ==========================================
  const getUsername = (token) => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.sub || "";
    } catch {
      return "";
    }
  };

  // ==========================================
  // Auto scroll to bottom
  // ==========================================
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ==========================================
  // WebSocket connect with auto-reconnect
  // ==========================================
  const connectWebSocket = useCallback((token) => {
    // Clean up any existing connection
    if (wsRef.current) {
      intentionalClose.current = true;
      wsRef.current.close();
    }

    const ws = new WebSocket(`${WS_URL}/api/v1/chat?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      setReconnecting(false);
      reconnectAttempts.current = 0;
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        setMessages((prev) => [...prev, msg]);

        // Track online count from system messages
        if (msg.type === "system") {
          if (msg.content?.includes("joined")) {
            setOnlineCount((c) => c + 1);
          } else if (msg.content?.includes("left")) {
            setOnlineCount((c) => Math.max(0, c - 1));
          }
        }
      } catch {
        // ignore malformed messages
      }
    };

    ws.onclose = (event) => {
      setConnected(false);
      wsRef.current = null;

      // Don't reconnect if we closed on purpose or auth failed
      if (intentionalClose.current) {
        intentionalClose.current = false;
        return;
      }
      if (event.code === 4001 || event.code === 4003) {
        // Auth failure — redirect to login
        navigate("/login");
        return;
      }

      // Auto-reconnect with exponential backoff
      if (reconnectAttempts.current < RECONNECT_MAX_ATTEMPTS) {
        setReconnecting(true);
        const delay = Math.min(
          RECONNECT_BASE_DELAY * Math.pow(2, reconnectAttempts.current),
          RECONNECT_MAX_DELAY
        );
        reconnectAttempts.current += 1;

        reconnectTimer.current = setTimeout(() => {
          const freshToken = localStorage.getItem("token");
          if (freshToken) connectWebSocket(freshToken);
        }, delay);
      } else {
        setMessages((prev) => [
          ...prev,
          { type: "system", content: "Connection lost. Please refresh the page." },
        ]);
      }
    };

    ws.onerror = () => {
      // onclose will handle reconnection
    };
  }, [navigate]);

  // ==========================================
  // Initial load: profile + history + WS
  // Handles React Strict Mode double-mount
  // ==========================================
  useEffect(() => {
    let mounted = true;

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const username = getUsername(token);
    currentUser.current = username;
    setDisplayName(username); // fallback

    const headers = { Authorization: `Bearer ${token}` };

    // Fetch profile name and chat history in parallel
    Promise.allSettled([
      axios.get(`${API_URL}/api/v1/profile`, { headers }),
      fetch(`${API_URL}/api/v1/chat/history?limit=50`, { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to load history");
          return res.json();
        }),
    ]).then(([profileRes, historyRes]) => {
      if (!mounted) return;

      // Use profile first_name if available
      if (profileRes.status === "fulfilled") {
        const profile = profileRes.value.data;
        if (profile.first_name) {
          setDisplayName(profile.first_name);
        }
      }

      // Load history
      if (historyRes.status === "fulfilled") {
        setMessages(historyRes.value);
      }
    });

    // Small delay lets Strict Mode's first unmount happen before we connect,
    // so we only open one WebSocket on the surviving mount.
    const connectDelay = setTimeout(() => {
      if (mounted) connectWebSocket(token);
    }, 50);

    // Cleanup on unmount
    return () => {
      mounted = false;
      clearTimeout(connectDelay);
      intentionalClose.current = true;
      clearTimeout(reconnectTimer.current);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [navigate, connectWebSocket]);

  // ==========================================
  // Send message
  // ==========================================
  const sendMessage = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && input.trim()) {
      wsRef.current.send(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ==========================================
  // Connection status badge
  // ==========================================
  const statusBadge = (() => {
    if (connected) {
      return { label: "Connected", color: "#22c55e", cls: "ff-tag-green" };
    }
    if (reconnecting) {
      return { label: "Reconnecting...", color: "#f59e0b", cls: "ff-tag-amber" };
    }
    return { label: "Disconnected", color: "#ef4444", cls: "ff-tag" };
  })();

  return (
    <AppPage
      eyebrow="CHAT"
      title="Blue Falcon Community Chat"
      accent="Live"
      subtitle="Talk with fellow Blue Falcons, share experiences, and more!"
      actions={
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          {displayName && (
            <span style={{ color: "#93c5fd", fontSize: "0.82rem", fontWeight: 600 }}>
              {displayName}
            </span>
          )}
          <span className={`ff-tag ${statusBadge.cls}`}>
            <span
              style={{
                display: "inline-block",
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: statusBadge.color,
                marginRight: 6,
                animation: reconnecting ? "pulse 1.5s ease-in-out infinite" : "none",
              }}
            />
            {statusBadge.label}
          </span>
        </div>
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
                  <span className="ff-tag" style={{ fontStyle: "italic", fontSize: "0.78rem" }}>
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
            placeholder={
              connected
                ? "Type a message…"
                : reconnecting
                ? "Reconnecting…"
                : "Disconnected"
            }
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

      {/* Reconnecting pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </AppPage>
  );
}
