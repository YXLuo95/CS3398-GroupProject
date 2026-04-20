import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AppPage from "../components/ui/AppPage";
import SectionCard from "../components/ui/SectionCard";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ==========================================
// Simple markdown renderer (no external lib needed)
// Supports: **bold**, *italic*, `code`, # headers, - lists, links, newlines
// ==========================================
export function renderMarkdown(text) {
  if (!text) return "";
  let html = text
    // Escape HTML
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    // Headers
    .replace(/^### (.*$)/gm, '<h3 style="font-size:1.05rem;margin:0.8rem 0 0.4rem;color:#f8fbff;font-weight:700">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 style="font-size:1.15rem;margin:0.9rem 0 0.5rem;color:#f8fbff;font-weight:700">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 style="font-size:1.3rem;margin:1rem 0 0.6rem;color:#f8fbff;font-weight:800">$1</h1>')
    // Bold + italic
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#f8fbff">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Inline code
    .replace(/`(.+?)`/g, '<code style="background:rgba(255,255,255,0.08);padding:2px 6px;border-radius:4px;font-family:monospace;font-size:0.9em">$1</code>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:#60a5fa">$1</a>')
    // Bullet lists
    .replace(/^- (.+)$/gm, '<li style="margin-left:1.2rem;color:#a7b4c9">$1</li>')
    // Double newlines → paragraph breaks
    .replace(/\n\n/g, '</p><p style="margin:0.6rem 0">')
    // Single newlines → <br>
    .replace(/\n/g, "<br>");

  return `<p style="margin:0.4rem 0">${html}</p>`;
}

// ==========================================
// Time formatter
// ==========================================
function formatTime(dateStr) {
  if (!dateStr) return "";
  const parsed = dateStr.endsWith("Z") ? new Date(dateStr) : new Date(dateStr + "Z");
  const now = new Date();
  const diffMs = now - parsed;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return parsed.toLocaleDateString();
}

export default function Forum() {
  const navigate = useNavigate();
  const getToken = () => localStorage.getItem("token");
  const getHeaders = () => ({ Authorization: `Bearer ${getToken()}` });

  const [posts, setPosts] = useState([]);
  const [canPost, setCanPost] = useState(false);
  const [loading, setLoading] = useState(true);

  // New post form
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) { navigate("/login"); return; }

    const fetchData = async () => {
      try {
        const [postsRes, statusRes] = await Promise.allSettled([
          axios.get(`${API_URL}/api/v1/forum/posts`, { headers: getHeaders() }),
          axios.get(`${API_URL}/api/v1/forum/status`, { headers: getHeaders() }),
        ]);
        if (postsRes.status === "fulfilled") setPosts(postsRes.value.data || []);
        if (statusRes.status === "fulfilled") setCanPost(statusRes.value.data.can_post);
      } catch (err) {
        console.error("Forum fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await axios.post(
        `${API_URL}/api/v1/forum/posts`,
        { title: newTitle.trim(), content: newContent.trim() },
        { headers: getHeaders() }
      );
      setPosts([res.data, ...posts]);
      setNewTitle("");
      setNewContent("");
      setCreating(false);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create post.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#0b1727", color: "white", padding: "60px", textAlign: "center" }}>
        <h2>Loading forum... 🦅</h2>
      </div>
    );
  }

  return (
    <AppPage
      eyebrow="COMMUNITY"
      title="Forum"
      accent="Discussions"
      subtitle="Tips, progress updates, and discussions from the Blue Falcon community."
      actions={canPost && !creating && (
        <button
          className="ff-btn ff-btn-primary ff-btn-sm"
          onClick={() => setCreating(true)}
        >
          ✍️ New Post
        </button>
      )}
    >
      {/* Create post form */}
      {creating && (
        <SectionCard title="Create New Post">
          <form onSubmit={handleCreate}>
            <div style={{ marginBottom: "1rem" }}>
              <label className="ff-label">Title</label>
              <input
                className="ff-input"
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="What's this post about?"
                maxLength={200}
                required
              />
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label className="ff-label">
                Content <span style={{ color: "#64748b", fontWeight: "normal", fontSize: "0.8rem" }}>(markdown supported)</span>
              </label>
              <textarea
                className="ff-input"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Share your thoughts... use **bold**, *italic*, - lists, etc."
                rows={8}
                style={{ fontFamily: "monospace", resize: "vertical" }}
                required
              />
            </div>

            {error && (
              <div style={{ color: "#f87171", fontSize: "0.88rem", marginBottom: "1rem" }}>
                ⚠️ {error}
              </div>
            )}

            <div style={{ display: "flex", gap: "0.6rem" }}>
              <button
                type="submit"
                className="ff-btn ff-btn-primary"
                disabled={submitting || !newTitle.trim() || !newContent.trim()}
                style={{ opacity: submitting ? 0.6 : 1 }}
              >
                {submitting ? "Publishing..." : "Publish Post"}
              </button>
              <button
                type="button"
                className="ff-btn ff-btn-ghost"
                onClick={() => { setCreating(false); setError(""); }}
              >
                Cancel
              </button>
            </div>
          </form>
        </SectionCard>
      )}

      {/* Post list */}
      <SectionCard title={`All Posts (${posts.length})`}>
        {posts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem 1rem", color: "#64748b" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>💬</div>
            <p style={{ fontSize: "0.9rem" }}>
              No posts yet. {canPost ? "Be the first to post!" : "Check back later."}
            </p>
          </div>
        ) : (
          <div className="ff-stack">
            {posts.map((post) => (
              <div
                key={post.id}
                onClick={() => navigate(`/forum/${post.id}`)}
                style={{
                  padding: "1rem 1.2rem",
                  borderRadius: 10,
                  backgroundColor: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(59,130,246,0.06)";
                  e.currentTarget.style.borderColor = "rgba(59,130,246,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.03)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", marginBottom: "0.4rem" }}>
                  <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#f8fbff", flex: 1 }}>
                    {post.title}
                  </h3>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", whiteSpace: "nowrap", flexShrink: 0 }}>
                    {formatTime(post.created_at)}
                  </span>
                </div>
                <div style={{
                  color: "#a7b4c9",
                  fontSize: "0.85rem",
                  marginBottom: "0.6rem",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  lineHeight: 1.5,
                }}>
                  {post.content.replace(/[*#`\[\]]/g, "")}
                </div>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center", fontSize: "0.78rem", color: "#64748b" }}>
                  <span>👤 {post.username}</span>
                  <span>💬 {post.reply_count} {post.reply_count === 1 ? "reply" : "replies"}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {!canPost && (
        <div style={{
          padding: "1rem", fontSize: "0.85rem", color: "#64748b",
          textAlign: "center", backgroundColor: "rgba(255,255,255,0.02)",
          borderRadius: 8, border: "1px dashed rgba(255,255,255,0.1)",
        }}>
          ℹ️ Only approved authors can create posts. Anyone can reply to existing posts.
        </div>
      )}

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
