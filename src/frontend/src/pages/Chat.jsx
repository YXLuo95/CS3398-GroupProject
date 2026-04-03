import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

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

  // -- Shared Styles (matching Dashboard) --
  const glassCardStyle = {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: "16px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    overflow: "hidden",
  };

  return (
    <div
      style={{
        padding: "60px 40px",
        minHeight: "100vh",
        backgroundColor: "#0b1727",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <h1 style={{ color: "white", margin: 0 }}>💬 Falcon Chat</h1>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: connected ? "#2ecc71" : "#e74c3c",
            fontSize: "0.85rem",
            fontWeight: "bold",
          }}
        >
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: connected ? "#2ecc71" : "#e74c3c",
              display: "inline-block",
              boxShadow: connected
                ? "0 0 8px rgba(46, 204, 113, 0.6)"
                : "0 0 8px rgba(231, 76, 60, 0.6)",
            }}
          />
          {connected ? "Connected" : "Disconnected"}
        </span>
      </div>

      {/* Chat Card */}
      <div style={glassCardStyle}>
        <div
          style={{
            height: "6px",
            background: "linear-gradient(to right, #2f7bff, #9b59b6)",
          }}
        />

        {/* Messages Area */}
        <div
          style={{
            height: "500px",
            overflowY: "auto",
            padding: "20px 28px",
          }}
        >
          {messages.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "40px",
                color: "#64748b",
              }}
            >
              No messages yet. Start the conversation!
            </div>
          )}

          {messages.map((msg, i) => {
            const isMe = msg.username === currentUser.current;
            const isSystem = msg.type === "system";

            if (isSystem) {
              return (
                <div key={i} style={{ textAlign: "center", margin: "12px 0" }}>
                  <span
                    style={{
                      color: "#64748b",
                      fontSize: "0.75rem",
                      fontStyle: "italic",
                      backgroundColor: "rgba(0,0,0,0.2)",
                      padding: "4px 14px",
                      borderRadius: "20px",
                    }}
                  >
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
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    maxWidth: "70%",
                    backgroundColor: isMe
                      ? "rgba(47, 123, 255, 0.15)"
                      : "rgba(255, 255, 255, 0.05)",
                    border: isMe
                      ? "1px solid rgba(47, 123, 255, 0.3)"
                      : "1px solid rgba(255, 255, 255, 0.08)",
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
                        fontWeight: "bold",
                        color: "#3498db",
                        marginBottom: "4px",
                      }}
                    >
                      {msg.username}
                    </div>
                  )}
                  <div
                    style={{
                      color: "#e2e8f0",
                      fontSize: "0.95rem",
                      lineHeight: "1.5",
                      wordBreak: "break-word",
                    }}
                  >
                    {msg.content}
                  </div>
                  <div
                    style={{
                      fontSize: "0.65rem",
                      color: "#475569",
                      marginTop: "6px",
                      textAlign: isMe ? "right" : "left",
                    }}
                  >
                    {msg.timestamp
                      ? new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div
          style={{
            padding: "16px 28px 20px",
            borderTop: "1px solid rgba(255, 255, 255, 0.05)",
            display: "flex",
            gap: "12px",
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={connected ? "Type a message..." : "Reconnecting..."}
            disabled={!connected}
            style={{
              flex: 1,
              padding: "14px 18px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "12px",
              backgroundColor: "rgba(0, 0, 0, 0.3)",
              color: "white",
              fontSize: "0.95rem",
              outline: "none",
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!connected || !input.trim()}
            style={{
              padding: "14px 28px",
              border: "none",
              borderRadius: "12px",
              backgroundColor:
                connected && input.trim()
                  ? "#2f7bff"
                  : "rgba(255, 255, 255, 0.1)",
              color: connected && input.trim() ? "white" : "#64748b",
              cursor: connected && input.trim() ? "pointer" : "not-allowed",
              fontSize: "0.95rem",
              fontWeight: "bold",
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
