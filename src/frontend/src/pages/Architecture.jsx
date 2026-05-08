import { Link } from "react-router-dom";

export default function Architecture() {

  const glassCardStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '16px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    padding: '20px',
    textAlign: 'center',
    width: '210px',
    flexShrink: 0,
    position: 'relative',
    zIndex: 10,
  };

  const PortBadge = ({ port, color }) => (
    <div style={{
      position: 'absolute', top: '-12px', right: '15px',
      backgroundColor: color, color: '#000', fontWeight: 'bold', fontSize: '0.75rem',
      padding: '4px 10px', borderRadius: '12px', boxShadow: `0 0 10px ${color}88`,
      zIndex: 20,
    }}>
      Port: {port}
    </div>
  );

  const ArrowWithText = ({ text }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#2f7bff', margin: '0 15px', flexShrink: 0 }}>
      <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 'bold', letterSpacing: '0.5px', marginBottom: '4px' }}>{text}</span>
      <div style={{ width: '40px', height: '3px', backgroundColor: '#2f7bff', position: 'relative' }}>
        <div style={{ position: 'absolute', right: '-2px', top: '-4px', borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderLeft: '8px solid #2f7bff' }}></div>
      </div>
    </div>
  );

  const SVGForkConnector = () => (
    <div style={{ margin: '0 15px', flexShrink: 0, display: 'flex', alignItems: 'center', position: 'relative', zIndex: -1 }}>
      <svg width="60" height="200" viewBox="0 0 60 200">
        <path d="M 0 100 L 25 100 L 25 45 L 55 45" stroke="#2f7bff" strokeWidth="3" fill="none" />
        <polygon points="53,40 60,45 53,50" fill="#2f7bff" />
        <path d="M 0 100 L 25 100 L 25 155 L 55 155" stroke="#2f7bff" strokeWidth="3" fill="none" />
        <polygon points="53,150 60,155 53,160" fill="#2f7bff" />
      </svg>
    </div>
  );

  const JWTStep = ({ number, title, desc, color }) => (
    <div style={{
      flex: 1, minWidth: '180px', padding: '20px',
      backgroundColor: 'rgba(255,255,255,0.03)',
      border: `1px solid ${color}40`,
      borderRadius: '12px', borderLeft: `4px solid ${color}`,
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute', top: '-14px', left: '15px',
        backgroundColor: color, color: '#000', fontWeight: 700, fontSize: '0.75rem',
        padding: '3px 10px', borderRadius: '10px',
      }}>STEP {number}</div>
      <h4 style={{ margin: '8px 0 8px', color: color, fontSize: '0.95rem' }}>{title}</h4>
      <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.82rem', lineHeight: 1.55 }}>{desc}</p>
    </div>
  );

  return (
    <div style={{ padding: "80px 20px", minHeight: "100vh", backgroundColor: "#0b1727", color: "white" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>

        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <h1 style={{ fontSize: "2.5rem", marginBottom: "15px", letterSpacing: "1px" }}>Architecture Overview</h1>
          <p style={{ color: "#cbd5e1", fontSize: "1.1rem", maxWidth: "850px", margin: "0 auto", lineHeight: 1.6 }}>
            A privacy-first SaaS pipeline. Cloudflare Tunnel routes traffic to a stateless FastAPI backend, which decouples LLM inference into a Redis-backed worker queue running a locally-hosted Ollama model.
          </p>
        </div>

        {/* System flow diagram */}
        <div style={{ width: "100%", overflowX: "auto", paddingBottom: "30px", marginBottom: "60px" }}>
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-start", flexWrap: "nowrap", width: "max-content", margin: "0 auto" }}>

            <div style={{ ...glassCardStyle, borderTop: "4px solid #f39c12" }}>
              <PortBadge port="443" color="#f39c12" />
              <div style={{ fontSize: "2rem", marginBottom: "5px" }}>☁️</div>
              <h3 style={{ margin: "0 0 10px 0", color: "#f39c12", fontSize: "1.1rem" }}>Cloudflare Tunnel</h3>
              <p style={{ fontSize: "0.8rem", color: "#94a3b8", margin: 0 }}>Public HTTPS gateway with no exposed ports.</p>
            </div>

            <ArrowWithText text="HTTPS" />

            <div style={{ ...glassCardStyle, borderTop: "4px solid #3498db" }}>
              <PortBadge port="5173" color="#3498db" />
              <div style={{ fontSize: "2rem", marginBottom: "5px" }}>💻</div>
              <h3 style={{ margin: "0 0 10px 0", color: "#3498db", fontSize: "1.1rem" }}>React + Vite SPA</h3>
              <p style={{ fontSize: "0.8rem", color: "#94a3b8", margin: 0 }}>UI, JWT storage, axios interceptors.</p>
            </div>

            <ArrowWithText text="REST + WS" />

            <div style={{ ...glassCardStyle, borderTop: "4px solid #2ecc71" }}>
              <PortBadge port="8000" color="#2ecc71" />
              <div style={{ fontSize: "2rem", marginBottom: "5px" }}>⚙️</div>
              <h3 style={{ margin: "0 0 10px 0", color: "#2ecc71", fontSize: "1.1rem" }}>FastAPI Backend</h3>
              <p style={{ fontSize: "0.8rem", color: "#94a3b8", margin: 0 }}>JWT validation, business logic, WebSocket chat.</p>
            </div>

            <SVGForkConnector />

            <div style={{ display: "flex", flexDirection: "column", gap: "40px", position: "relative", zIndex: 5, marginTop: "20px" }}>

              <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                <div style={{ ...glassCardStyle, borderTop: "4px solid #e74c3c", width: "240px" }}>
                  <PortBadge port="6379" color="#e74c3c" />
                  <div style={{ fontSize: "2rem", marginBottom: "5px" }}>⚡</div>
                  <h3 style={{ margin: "0 0 5px 0", color: "#e74c3c", fontSize: "1.1rem" }}>Redis</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '10px' }}>
                    <span style={{ fontSize: "0.72rem", backgroundColor: "rgba(231, 76, 60, 0.1)", color: "#e74c3c", padding: "3px 7px", borderRadius: "4px", border: "1px solid rgba(231, 76, 60, 0.3)" }}>DB 0 — Auth Cache</span>
                    <span style={{ fontSize: "0.72rem", backgroundColor: "rgba(243, 156, 18, 0.1)", color: "#f39c12", padding: "3px 7px", borderRadius: "4px", border: "1px solid rgba(243, 156, 18, 0.3)" }}>DB 1 — LLM Cache</span>
                    <span style={{ fontSize: "0.72rem", backgroundColor: "rgba(155, 89, 182, 0.1)", color: "#9b59b6", padding: "3px 7px", borderRadius: "4px", border: "1px solid rgba(155, 89, 182, 0.3)" }}>DB 2 — Task Queue</span>
                  </div>
                </div>

                <ArrowWithText text="Persist" />

                <div style={{ ...glassCardStyle, borderTop: "4px solid #34495e", width: "180px" }}>
                  <PortBadge port="File" color="#95a5a6" />
                  <div style={{ fontSize: "2rem", marginBottom: "5px" }}>🗄️</div>
                  <h3 style={{ margin: "0 0 8px 0", color: "#ecf0f1", fontSize: "1.05rem" }}>SQLite</h3>
                  <p style={{ fontSize: "0.78rem", color: "#94a3b8", margin: 0, lineHeight: 1.4 }}>15+ tables: users, plans, subscriptions, forum.</p>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "15px" }}>
                <div style={{ ...glassCardStyle, width: "220px", borderTop: "4px solid #9b59b6", borderLeft: "4px solid #9b59b6" }}>
                  <div style={{ fontSize: "1.8rem", marginBottom: "5px" }}>🔄</div>
                  <h3 style={{ margin: "0 0 5px 0", color: "#9b59b6", fontSize: "1rem" }}>LLM Worker</h3>
                  <p style={{ fontSize: "0.75rem", color: "#94a3b8", margin: 0, lineHeight: 1.5 }}>BLPOP consumer. Generates reports, plans, instructions.</p>
                </div>

                <ArrowWithText text="Inference" />

                <div style={{ ...glassCardStyle, width: "200px", borderTop: "4px solid #d2b4de" }}>
                  <PortBadge port="11434" color="#d2b4de" />
                  <div style={{ fontSize: "1.8rem", marginBottom: "5px" }}>🧠</div>
                  <h3 style={{ margin: "0 0 5px 0", color: "#d2b4de", fontSize: "1rem" }}>Ollama</h3>
                  <p style={{ fontSize: "0.75rem", color: "#94a3b8", margin: 0, lineHeight: 1.5 }}>Local inference. <strong style={{ color: "white" }}>mistral-nemo</strong> on RTX 4070 Ti.</p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* JWT Authentication Flow */}
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', padding: '40px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)', marginBottom: '40px' }}>
          <h2 style={{ color: "white", marginTop: 0, borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "15px" }}>🔐 JWT Authentication Flow</h2>
          <p style={{ color: "#cbd5e1", fontSize: "0.95rem", lineHeight: 1.7, marginBottom: "30px" }}>
            Every protected endpoint uses the same authentication pattern. Once issued at login, the JWT travels in the <code style={{ background: "rgba(255,255,255,0.08)", padding: "2px 6px", borderRadius: "4px", fontSize: "0.85em" }}>Authorization</code> header on every subsequent request. The backend validates it, decodes the user identity, and scopes all data access to that user automatically.
          </p>

          <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", marginBottom: "30px" }}>
            <JWTStep number="1" title="User Logs In" color="#3498db"
              desc="Frontend POSTs username + password to /api/v1/auth/login. Backend verifies against bcrypt-hashed password in users table." />
            <JWTStep number="2" title="Server Issues JWT" color="#2ecc71"
              desc="On success, the backend signs a JWT with HS256 + SECRET_KEY. Payload contains user_id and 30-min expiry. Token returned to frontend." />
            <JWTStep number="3" title="Token Stored Client-Side" color="#f39c12"
              desc="Frontend saves token to localStorage. An axios interceptor automatically attaches it to every outgoing request as Authorization: Bearer <token>." />
            <JWTStep number="4" title="Every Request Re-validates" color="#e74c3c"
              desc="FastAPI's get_current_user dependency decodes the JWT, verifies signature + expiry, and loads the User object from the database — injected into every protected endpoint." />
            <JWTStep number="5" title="Auto-scoped Data Access" color="#9b59b6"
              desc="All CRUD operations filter by current_user.id. A user can only ever see their own quiz, workouts, plans, subscription. Authorization is impossible to forget." />
          </div>

          <div style={{ backgroundColor: '#0a0e1a', padding: '20px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)', fontFamily: 'monospace', fontSize: '0.82rem', lineHeight: 1.7, color: '#cbd5e1', overflow: 'auto' }}>
            <div style={{ color: '#64748b', marginBottom: '8px' }}># Every protected endpoint follows this single pattern</div>
            <div><span style={{ color: '#9b59b6' }}>@router.post</span>(<span style={{ color: '#2ecc71' }}>"/quiz"</span>)</div>
            <div><span style={{ color: '#3498db' }}>async def</span> <span style={{ color: '#f39c12' }}>submit_quiz</span>(</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;data: QuizSubmit,</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;current_user: User = <span style={{ color: '#9b59b6' }}>Depends</span>(get_current_user),  <span style={{ color: '#64748b' }}># ← JWT validated here</span></div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;session: AsyncSession = <span style={{ color: '#9b59b6' }}>Depends</span>(get_session),</div>
            <div>):</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#64748b' }}># current_user.id is automatically available</span></div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#64748b' }}># All queries scoped to this user, no exceptions</span></div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#3498db' }}>return await</span> create_goal(session, current_user.id, data)</div>
          </div>

          <p style={{ color: "#64748b", fontSize: "0.8rem", marginTop: "15px", lineHeight: 1.6 }}>
            💡 If a user's token is missing, expired, or tampered with, the dependency raises a 401 before the endpoint logic ever runs. The frontend's axios interceptor catches 401s and redirects to the login page automatically.
          </p>
        </div>

        {/* System design decisions */}
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', padding: '40px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <h2 style={{ color: "white", marginTop: 0, borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "15px" }}>System Design Decisions</h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "25px", marginTop: "20px" }}>

            <div>
              <h4 style={{ color: "#f39c12", fontSize: "1.05rem", margin: "0 0 10px 0" }}>1. No Exposed Ports</h4>
              <p style={{ color: "#cbd5e1", lineHeight: "1.5", fontSize: "0.85rem", margin: 0 }}>
                Cloudflare Tunnel creates an outbound-only connection from our origin server. We never open ports on the host. The public domain has no DNS record pointing at our actual IP.
              </p>
            </div>

            <div>
              <h4 style={{ color: "#2ecc71", fontSize: "1.05rem", margin: "0 0 10px 0" }}>2. Stateless API Tier</h4>
              <p style={{ color: "#cbd5e1", lineHeight: "1.5", fontSize: "0.85rem", margin: 0 }}>
                FastAPI servers hold no in-memory session state. Every request carries its own JWT. We could spin up a 4-replica fleet behind a load balancer with zero code changes.
              </p>
            </div>

            <div>
              <h4 style={{ color: "#e74c3c", fontSize: "1.05rem", margin: "0 0 10px 0" }}>3. Redis DB Isolation</h4>
              <p style={{ color: "#cbd5e1", lineHeight: "1.5", fontSize: "0.85rem", margin: 0 }}>
                Three logical databases on one Redis instance: <strong>DB 0</strong> for auth caching, <strong>DB 1</strong> for LLM response caching, <strong>DB 2</strong> for the task queue. Flushing one never affects the others.
              </p>
            </div>

            <div>
              <h4 style={{ color: "#9b59b6", fontSize: "1.05rem", margin: "0 0 10px 0" }}>4. Decoupled LLM Inference</h4>
              <p style={{ color: "#cbd5e1", lineHeight: "1.5", fontSize: "0.85rem", margin: 0 }}>
                Heavy LLM tasks never block the API. Frontend POSTs a generation request → backend returns 202 Accepted → worker consumes from Redis → user polls for completion. The API stays responsive even during inference.
              </p>
            </div>

            <div>
              <h4 style={{ color: "#3498db", fontSize: "1.05rem", margin: "0 0 10px 0" }}>5. Local-First AI</h4>
              <p style={{ color: "#cbd5e1", lineHeight: "1.5", fontSize: "0.85rem", margin: 0 }}>
                The Ollama-hosted LLM runs on our own GPU. User health data — weight, goals, dietary restrictions — never leaves our infrastructure. No outbound API calls to OpenAI or Anthropic.
              </p>
            </div>

            <div style={{ backgroundColor: 'rgba(155, 89, 182, 0.05)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(155, 89, 182, 0.2)' }}>
              <h4 style={{ color: "#d2b4de", fontSize: "1.05rem", margin: "0 0 10px 0" }}>6. Future: Horizontal Scaling</h4>
              <p style={{ color: "#cbd5e1", lineHeight: "1.5", fontSize: "0.85rem", margin: 0 }}>
                Because workers consume from a shared Redis queue, scaling out is just running more worker processes. With a containerized worker image, this becomes a kubectl scale deployment — multiple GPUs serving the same queue.
              </p>
            </div>

          </div>
        </div>

        <div style={{ marginTop: "40px", padding: "30px", backgroundColor: 'rgba(47, 123, 255, 0.05)', border: '1px solid rgba(47, 123, 255, 0.2)', borderRadius: "16px" }}>
          <h3 style={{ color: "white", marginTop: 0, marginBottom: "20px" }}>Tech Stack</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", fontSize: "0.85rem" }}>
            <div>
              <div style={{ color: "#3498db", fontWeight: 700, marginBottom: "6px" }}>Frontend</div>
              <div style={{ color: "#cbd5e1", lineHeight: 1.7 }}>React 18, Vite, React Router, axios</div>
            </div>
            <div>
              <div style={{ color: "#2ecc71", fontWeight: 700, marginBottom: "6px" }}>Backend</div>
              <div style={{ color: "#cbd5e1", lineHeight: 1.7 }}>FastAPI, SQLModel, Pydantic, JWT (HS256)</div>
            </div>
            <div>
              <div style={{ color: "#e74c3c", fontWeight: 700, marginBottom: "6px" }}>Data Layer</div>
              <div style={{ color: "#cbd5e1", lineHeight: 1.7 }}>SQLite (dev), Redis (cache + queue)</div>
            </div>
            <div>
              <div style={{ color: "#9b59b6", fontWeight: 700, marginBottom: "6px" }}>AI Engine</div>
              <div style={{ color: "#cbd5e1", lineHeight: 1.7 }}>Ollama, mistral-nemo, RTX 4070 Ti</div>
            </div>
            <div>
              <div style={{ color: "#f39c12", fontWeight: 700, marginBottom: "6px" }}>Infrastructure</div>
              <div style={{ color: "#cbd5e1", lineHeight: 1.7 }}>Cloudflare Tunnel, SQLAdmin panel</div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: "60px", textAlign: "center" }}>
          <Link to="/" style={{ color: "#2f7bff", textDecoration: "none", borderBottom: "1px solid #2f7bff", paddingBottom: "2px" }}>
            ← Back to Home
          </Link>
        </div>

      </div>
    </div>
  );
}