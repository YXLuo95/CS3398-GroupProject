import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import AppPage from "../components/ui/AppPage";
import SectionCard from "../components/ui/SectionCard";
import { renderMarkdown } from "./Forum";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function formatTime(dateStr) {
  if (!dateStr) return "";
  const parsed = dateStr.endsWith("Z") ? new Date(dateStr) : new Date(dateStr + "Z");
  return parsed.toLocaleString(undefined, {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function ForumPost() {
  const navigate = useNavigate();
  const { postId } = useParams();
  const getToken = () => localStorage.getItem("token");
  const getHeaders = () => ({ Authorization: `Bearer ${getToken()}` });

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Reply form
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Current user (to highlight own messages)
  const [currentUsername, setCurrentUsername] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) { navigate("/login"); return; }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.sub) setCurrentUsername(payload.sub);
    } catch {}

    axios
      .get(`${API_URL}/api/v1/forum/posts/${postId}`, { headers: getHeaders() })
      .then((res) => {
        setPost(res.data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.response?.status === 404) setNotFound(true);
        setLoading(false);
      });
  }, [postId, navigate]);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await axios.post(
        `${API_URL}/api/v1/forum/posts/${postId}/replies`,
        { content: replyContent.trim() },
        { headers: getHeaders() }
      );
      setPost({
        ...post,
        reply_count: post.reply_count + 1,
        replies: [...post.replies, res.data],
      });
      setReplyContent("");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to post reply.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#0b1727", color: "white", padding: "60px", textAlign: "center" }}>
        <h2>Loading post... 🦅</h2>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <AppPage eyebrow="COMMUNITY" title="Post Not Found">
        <SectionCard title="404">
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🤔</div>
            <p style={{ color: "#a7b4c9", marginBottom: "1.5rem" }}>
              This post doesn't exist or has been removed.
            </p>
            <button className="ff-btn ff-btn-primary" onClick={() => navigate("/forum")}>
              ← Back to Forum
            </button>
          </div>
        </SectionCard>
      </AppPage>
    );
  }

  return (
    <AppPage
      eyebrow={`POST #${post.id}`}
      title={post.title}
      subtitle={`by ${post.username} · ${formatTime(post.created_at)} · ${post.reply_count} ${post.reply_count === 1 ? "reply" : "replies"}`}
    >
      {/* Main post */}
      <SectionCard title="Post">
        <div
          style={{
            color: "#c8d5e6",
            lineHeight: 1.7,
            fontSize: "0.95rem",
          }}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
        />
      </SectionCard>

      {/* Replies */}
      <SectionCard title={`Replies (${post.replies.length})`}>
        {post.replies.length === 0 ? (
          <div style={{ textAlign: "center", padding: "1.5rem", color: "#64748b", fontSize: "0.9rem" }}>
            No replies yet. Be the first to share your thoughts!
          </div>
        ) : (
          <div className="ff-stack">
            {post.replies.map((reply) => {
              const isMe = reply.username === currentUsername;
              return (
                <div
                  key={reply.id}
                  style={{
                    padding: "0.9rem 1.1rem",
                    borderRadius: 10,
                    backgroundColor: isMe ? "rgba(59,130,246,0.06)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${isMe ? "rgba(59,130,246,0.25)" : "rgba(255,255,255,0.06)"}`,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <span style={{
                      color: isMe ? "#93c5fd" : "#7dd3fc",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                    }}>
                      👤 {reply.username} {isMe && "(you)"}
                    </span>
                    <span style={{ color: "#64748b", fontSize: "0.72rem" }}>
                      {formatTime(reply.created_at)}
                    </span>
                  </div>
                  <div
                    style={{ color: "#c8d5e6", fontSize: "0.9rem", lineHeight: 1.6 }}
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(reply.content) }}
                  />
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      {/* Reply form */}
      <SectionCard title="Post a Reply">
        <form onSubmit={handleReply}>
          <textarea
            className="ff-input"
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write your reply... markdown is supported."
            rows={5}
            style={{ fontFamily: "monospace", resize: "vertical", marginBottom: "0.8rem" }}
            required
          />

          {error && (
            <div style={{ color: "#f87171", fontSize: "0.88rem", marginBottom: "0.8rem" }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
            <span style={{ color: "#64748b", fontSize: "0.78rem" }}>
              Tip: Use **bold**, *italic*, `code`, - lists
            </span>
            <button
              type="submit"
              className="ff-btn ff-btn-primary"
              disabled={submitting || !replyContent.trim()}
              style={{ opacity: submitting ? 0.6 : 1 }}
            >
              {submitting ? "Posting..." : "Post Reply"}
            </button>
          </div>
        </form>
      </SectionCard>

      <button
        onClick={() => navigate("/forum")}
        style={{
          marginTop: "20px", padding: "10px 20px", border: "none",
          borderRadius: "8px", background: "transparent", color: "#64748b",
          cursor: "pointer", fontSize: "14px",
        }}
      >
        ← Back to Forum
      </button>
    </AppPage>
  );
}
