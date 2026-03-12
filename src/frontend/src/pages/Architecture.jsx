import { Link } from "react-router-dom";

export default function Architecture() {
  
  // Base glassmorphism card style
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
    zIndex: 2 // Keeps cards above the connecting lines
  };

  const PortBadge = ({ port, color }) => (
    <div style={{
      position: 'absolute', top: '-12px', right: '15px',
      backgroundColor: color, color: '#000', fontWeight: 'bold', fontSize: '0.75rem',
      padding: '4px 10px', borderRadius: '12px', boxShadow: `0 0 10px ${color}88`
    }}>
      Port: {port}
    </div>
  );

  // Horizontal Arrow Connector
  const ArrowWithText = ({ text }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#2f7bff', margin: '0 15px', flexShrink: 0 }}>
      <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 'bold', letterSpacing: '0.5px', marginBottom: '4px' }}>{text}</span>
      <div style={{ width: '40px', height: '3px', backgroundColor: '#2f7bff', position: 'relative' }}>
        <div style={{ position: 'absolute', right: '-2px', top: '-4px', borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderLeft: '8px solid #2f7bff' }}></div>
      </div>
    </div>
  );

  // SVG Fork Connector (Creates the clean "Y" split)
  const SVGForkConnector = () => (
    <div style={{ margin: '0 15px', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
      <svg width="50" height="180" viewBox="0 0 50 180">
        {/* Top branch to Redis */}
        <path d="M 0 90 L 20 90 L 20 30 L 45 30" stroke="#2f7bff" strokeWidth="3" fill="none" />
        <polygon points="45,25 52,30 45,35" fill="#2f7bff" />
        {/* Bottom branch to LLM */}
        <path d="M 0 90 L 20 90 L 20 150 L 45 150" stroke="#2f7bff" strokeWidth="3" fill="none" />
        <polygon points="45,145 52,150 45,155" fill="#2f7bff" />
      </svg>
    </div>
  );

  return (
    <div style={{ padding: "80px 20px", minHeight: "100vh", backgroundColor: "#0b1727", color: "white" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        
        {/* Header Section */}
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <h1 style={{ fontSize: "2.5rem", marginBottom: "15px", letterSpacing: "1px" }}>
            7. High-Level Architecture ⚙️
          </h1>
          <p style={{ color: "#cbd5e1", fontSize: "1.1rem", maxWidth: "850px", margin: "0 auto" }}>
            An enterprise-grade pipeline: Cloudflare routing to a FastAPI backend, utilizing Redis DB isolation for Auth/Queues, and offloading inference to a scalable LLM worker pool.
          </p>
        </div>

        {/* ==========================================
            STRICT HORIZONTAL PIPELINE
            Added overflowX: auto so it scrolls instead of breaking
            ========================================== */}
        <div style={{ 
          width: "100%", 
          overflowX: "auto", 
          paddingBottom: "30px", /* padding for scrollbar */
          marginBottom: "60px"
        }}>
          <div style={{ 
            display: "flex", 
            flexDirection: "row", 
            alignItems: "center", 
            justifyContent: "flex-start", 
            flexWrap: "nowrap", // 🚀 CRITICAL: NEVER WRAP!
            width: "max-content", // 🚀 CRITICAL: Forces container to fit contents
            margin: "0 auto" // Centers the whole diagram if screen is wide enough
          }}>
            
            {/* 1. Cloudflare Tunnel */}
            <div style={{ ...glassCardStyle, borderTop: "4px solid #f39c12" }}>
              <PortBadge port="443" color="#f39c12" />
              <div style={{ fontSize: "2rem", marginBottom: "5px" }}>☁️</div>
              <h3 style={{ margin: "0 0 10px 0", color: "#f39c12", fontSize: "1.1rem" }}>Cloudflare Tunnel</h3>
              <p style={{ fontSize: "0.8rem", color: "#94a3b8", margin: 0 }}>Secure public HTTPS gateway.</p>
            </div>

            <ArrowWithText text="HTTP" />

            {/* 2. React Frontend */}
            <div style={{ ...glassCardStyle, borderTop: "4px solid #3498db" }}>
              <PortBadge port="5173" color="#3498db" />
              <div style={{ fontSize: "2rem", marginBottom: "5px" }}>💻</div>
              <h3 style={{ margin: "0 0 10px 0", color: "#3498db", fontSize: "1.1rem" }}>React SPA</h3>
              <p style={{ fontSize: "0.8rem", color: "#94a3b8", margin: 0 }}>UI & JWT Token Management.</p>
            </div>

            <ArrowWithText text="REST API" />

            {/* 3. FastAPI Backend */}
            <div style={{ ...glassCardStyle, borderTop: "4px solid #2ecc71" }}>
              <PortBadge port="8000" color="#2ecc71" />
              <div style={{ fontSize: "2rem", marginBottom: "5px" }}>⚙️</div>
              <h3 style={{ margin: "0 0 10px 0", color: "#2ecc71", fontSize: "1.1rem" }}>FastAPI Server</h3>
              <p style={{ fontSize: "0.8rem", color: "#94a3b8", margin: 0 }}>Validates HS256 JWT & routes traffic.</p>
            </div>

            {/* 4. The SVG Splitter (Replaces text arrows) */}
            <SVGForkConnector />

            {/* 5. Right Side Branches */}
            <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
              
              {/* Upper Branch: Redis -> Database */}
              <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                <div style={{ ...glassCardStyle, borderTop: "4px solid #e74c3c", width: "220px" }}>
                  <PortBadge port="6379" color="#e74c3c" />
                  <div style={{ fontSize: "2rem", marginBottom: "5px" }}>⚡</div>
                  <h3 style={{ margin: "0 0 5px 0", color: "#e74c3c", fontSize: "1.1rem" }}>Redis Buffer</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '10px' }}>
                    <span style={{ fontSize: "0.75rem", backgroundColor: "rgba(231, 76, 60, 0.1)", color: "#e74c3c", padding: "2px 6px", borderRadius: "4px", border: "1px solid rgba(231, 76, 60, 0.3)" }}>DB 0: Auth State</span>
                    <span style={{ fontSize: "0.75rem", backgroundColor: "rgba(155, 89, 182, 0.1)", color: "#9b59b6", padding: "2px 6px", borderRadius: "4px", border: "1px solid rgba(155, 89, 182, 0.3)" }}>DB 2: Task Queue</span>
                  </div>
                </div>

                <ArrowWithText text="Persist" />

                <div style={{ ...glassCardStyle, borderTop: "4px solid #34495e", width: "180px" }}>
                  <PortBadge port="DB" color="#95a5a6" />
                  <div style={{ fontSize: "2rem", marginBottom: "5px" }}>🗄️</div>
                  <h3 style={{ margin: "0 0 10px 0", color: "#ecf0f1", fontSize: "1.1rem" }}>Database</h3>
                  <p style={{ fontSize: "0.8rem", color: "#94a3b8", margin: 0 }}>Persistent storage.</p>
                </div>
              </div>

              {/* Lower Branch: LLM Worker + Celery Scalability */}
              <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "15px" }}>
                
                <div style={{ ...glassCardStyle, width: "320px", borderTop: "4px solid #9b59b6", borderLeft: "4px solid #9b59b6", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 20px" }}>
                  <div style={{ textAlign: "left", maxWidth: "60%" }}>
                    <h3 style={{ margin: "0 0 5px 0", color: "#9b59b6", fontSize: "1rem" }}>Decoupled Worker</h3>
                    <p style={{ fontSize: "0.75rem", color: "#94a3b8", margin: 0, lineHeight: "1.5" }}>
                      Consumes tasks async via <strong style={{ color: "white" }}>mistral-nemo</strong>.
                    </p>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <PortBadge port="11434" color="#9b59b6" />
                    <div style={{ fontSize: "1.8rem", marginBottom: "5px" }}>🧠</div>
                  </div>
                </div>

                <div style={{ fontSize: "1.5rem", color: "rgba(155, 89, 182, 0.6)", fontWeight: "bold" }}>+</div>

                <div style={{ ...glassCardStyle, border: '2px dashed rgba(155, 89, 182, 0.5)', backgroundColor: 'transparent', boxShadow: 'none', width: "160px", padding: "15px" }}>
                  <div style={{ fontSize: "1.5rem", marginBottom: "5px", opacity: 0.7 }}>🚀</div>
                  <h3 style={{ margin: "0 0 5px 0", color: "rgba(155, 89, 182, 0.8)", fontSize: "0.9rem" }}>Celery Pool</h3>
                  <p style={{ fontSize: "0.7rem", color: "#64748b", margin: 0 }}>Future horizontal scaling.</p>
                </div>

              </div>

            </div>
          </div>
        </div>

        {/* Technical Details Section */}
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', padding: '40px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <h2 style={{ color: "white", marginTop: 0, borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "15px" }}>
            System Level Technical Details
          </h2>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "25px", marginTop: "20px" }}>
            
            <div>
              <h4 style={{ color: "#2ecc71", fontSize: "1.05rem", margin: "0 0 10px 0" }}>1. Secure Gateway</h4>
              <p style={{ color: "#cbd5e1", lineHeight: "1.5", fontSize: "0.85rem", margin: 0 }}>
                React SPA connects to FastAPI using <strong>HS256 JWT</strong>. Cloudflare Tunnel protects the local origin server from direct internet exposure.
              </p>
            </div>

            <div>
              <h4 style={{ color: "#e74c3c", fontSize: "1.05rem", margin: "0 0 10px 0" }}>2. Database Isolation</h4>
              <p style={{ color: "#cbd5e1", lineHeight: "1.5", fontSize: "0.85rem", margin: 0 }}>
                We enforce strict separation of concerns in Redis: <strong>DB 0</strong> for fast Auth state caching, and <strong>DB 2</strong> as an isolated message broker for AI tasks.
              </p>
            </div>

            <div>
              <h4 style={{ color: "#9b59b6", fontSize: "1.05rem", margin: "0 0 10px 0" }}>3. Decoupled Inference</h4>
              <p style={{ color: "#cbd5e1", lineHeight: "1.5", fontSize: "0.85rem", margin: 0 }}>
                To prevent blocking the API, the <strong>mistral-nemo</strong> LLM operates as a decoupled worker, asynchronously consuming tasks from Redis DB 2.
              </p>
            </div>

            <div style={{ backgroundColor: 'rgba(155, 89, 182, 0.05)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(155, 89, 182, 0.2)' }}>
              <h4 style={{ color: "#d2b4de", fontSize: "1.05rem", margin: "0 0 10px 0" }}>4. Future Scalability</h4>
              <p style={{ color: "#cbd5e1", lineHeight: "1.5", fontSize: "0.85rem", margin: 0 }}>
                Because the AI is already decoupled via Redis, we are fully prepared to drop in <strong>Celery</strong>. This allows us to scale horizontally by adding a pool of distributed LLM workers.
              </p>
            </div>

          </div>
        </div>

        {/* Navigation */}
        <div style={{ marginTop: "60px", textAlign: "center" }}>
          <Link to="/" style={{ color: "#2f7bff", textDecoration: "none", borderBottom: "1px solid #2f7bff", paddingBottom: "2px" }}>
            ← Back to Home
          </Link>
        </div>

      </div>
    </div>
  );
}