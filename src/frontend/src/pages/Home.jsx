import { Link } from "react-router-dom";
import falconBg from "../assets/blue-falcon-logo.png";

// =======================================================
// SHARED STYLES
// =======================================================
const pageStyle = {
  minHeight: "100vh",
  background: "radial-gradient(circle at 15% 12%, #1d3560, #0b1727 45%, #050b16)",
  color: "white",
  padding: "20px",
  fontFamily: "Inter, Arial, sans-serif"
};

const sectionStyle = {
  background: "linear-gradient(135deg, rgba(55, 111, 217, 0.08), rgba(7, 16, 35, 0.9))",
  border: "1px solid rgba(109, 181, 255, 0.15)",
  borderRadius: "20px",
  backdropFilter: "blur(12px)",
  padding: "40px",
  marginBottom: "40px",
  boxShadow: "0 8px 32px rgba(0,0,0,0.2)"
};

const cardStyle = {
  background: "linear-gradient(135deg, rgba(30, 80, 160, 0.25), rgba(7, 17, 37, 0.85))",
  border: "1px solid rgba(107, 156, 245, 0.25)",
  borderRadius: "16px",
  padding: "24px",
  boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
  transition: "all 0.3s ease",
  cursor: "pointer"
};

const statCardStyle = {
  background: "linear-gradient(135deg, rgba(47, 123, 255, 0.1), rgba(7, 17, 37, 0.8))",
  border: "1px solid rgba(47, 123, 255, 0.3)",
  borderRadius: "16px",
  padding: "20px",
  textAlign: "center",
  boxShadow: "0 4px 16px rgba(47, 123, 255, 0.1)"
};

const btnPrimary = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "14px 28px",
  borderRadius: "12px",
  border: "none",
  background: "linear-gradient(135deg, #2f7bff, #1d5fda)",
  color: "white",
  fontWeight: "700",
  fontSize: "16px",
  textDecoration: "none",
  boxShadow: "0 8px 24px rgba(47, 123, 255, 0.4)",
  transition: "all 0.3s ease",
  cursor: "pointer"
};

const btnSecondary = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "14px 28px",
  borderRadius: "12px",
  border: "2px solid rgba(109, 181, 255, 0.5)",
  background: "transparent",
  color: "white",
  fontWeight: "600",
  fontSize: "16px",
  textDecoration: "none",
  transition: "all 0.3s ease",
  cursor: "pointer"
};

const btnAccent = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "14px 28px",
  borderRadius: "12px",
  border: "none",
  background: "linear-gradient(135deg, #4ade80, #22c55e)",
  color: "#0b1727",
  fontWeight: "700",
  fontSize: "16px",
  textDecoration: "none",
  boxShadow: "0 8px 24px rgba(74, 222, 128, 0.4)",
  transition: "all 0.3s ease",
  cursor: "pointer"
};

// =======================================================
// DATA ARRAYS
// =======================================================
const quickStats = [
  { icon: "🎯", title: "Personalized Plans", desc: "Tailored to your goals" },
  { icon: "🥗", title: "Nutrition Guidance", desc: "Macro-based meal plans" },
  { icon: "📊", title: "Progress Tracking", desc: "AI-powered analytics" },
  { icon: "💪", title: "Goal-Based Training", desc: "Adaptive workout plans" }
];

const howItWorks = [
  { step: "01", title: "Take the Quiz", desc: "Answer a few questions about your goals, experience, and preferences.", icon: "📝" },
  { step: "02", title: "Get Your Plan", desc: "Receive personalized workout and nutrition recommendations.", icon: "🎯" },
  { step: "03", title: "Track Progress", desc: "Monitor your journey with detailed analytics and insights.", icon: "📈" },
  { step: "04", title: "Adjust & Improve", desc: "Fine-tune your plan as you progress toward your goals.", icon: "🔄" }
];

const featuredModules = [
  {
    title: "Workout Plans",
    subtitle: "Structured routines for every goal",
    desc: "From fat loss to strength building, get expert-crafted workouts.",
    buttonText: "Explore Workouts",
    link: "/workouts",
    color: "#2f7bff"
  },
  {
    title: "Nutrition Guide",
    subtitle: "Macro-based meal planning",
    desc: "Personalized nutrition plans with meal prep templates.",
    buttonText: "View Nutrition",
    link: "/nutrition",
    color: "#06b6d4"
  },
  {
    title: "Supplements",
    subtitle: "Evidence-backed recommendations",
    desc: "Science-based supplement guidance for recovery and performance.",
    buttonText: "See Supplements",
    link: "/supplements",
    color: "#8b5cf6"
  },
  {
    title: "Progress Reports",
    subtitle: "AI-generated insights",
    desc: "Track your fitness journey with detailed analytics.",
    buttonText: "Track Progress",
    link: "/dashboard",
    color: "#f59e0b"
  }
];

const benefits = [
  { icon: "🎯", title: "Personalized Recommendations", desc: "Plans built specifically for your goals and lifestyle" },
  { icon: "📊", title: "Data-Driven Progress", desc: "Track every workout and meal with detailed analytics" },
  { icon: "⚡", title: "Adaptive Planning", desc: "Your plan evolves as you progress and improve" }
];

// =======================================================
// MAIN COMPONENT
// =======================================================
export default function Home() {
  // Check authentication status (same as navbar)
  const isLoggedIn = Boolean(localStorage.getItem('token'));

  return (
    <div style={pageStyle}>
      {/* Hero Section */}
      <section style={{
        ...sectionStyle,
        padding: "60px 40px",
        marginBottom: "60px",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 400px",
          gap: "60px",
          alignItems: "center",
          maxWidth: "1200px",
          margin: "0 auto"
        }}>
          {/* Left Content */}
          <div>
            <h1 style={{
              fontSize: "3.5rem",
              fontWeight: "800",
              marginBottom: "20px",
              background: "linear-gradient(135deg, #ffffff, #cbd5e1)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              lineHeight: "1.1"
            }}>
              Train Smarter.<br />
              Eat Better.<br />
              Track Progress.
            </h1>
            <p style={{
              color: "#cbd5e1",
              fontSize: "1.3rem",
              lineHeight: "1.6",
              marginBottom: "32px",
              maxWidth: "500px"
            }}>
              Personalized fitness and nutrition plans built around your goals.
              Transform your body with intelligent, goal-driven recommendations.
            </p>

            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              {isLoggedIn ? (
                <>
                  <Link to="/dashboard" style={btnPrimary}>Go to Dashboard</Link>
                  <Link to="/workouts" style={{ ...btnPrimary, background: "linear-gradient(135deg, #06b6d4, #0891b2)" }}>Continue Plan</Link>
                </>
              ) : (
                <>
                  <Link to="/quiz" style={btnPrimary}>Start Quiz</Link>
                  <Link to="/about" style={btnSecondary}>Learn More</Link>
                </>
              )}
            </div>
          </div>

          {/* Right Visual */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative"
          }}>
            <div style={{
              width: "300px",
              height: "300px",
              background: "linear-gradient(135deg, rgba(47, 123, 255, 0.1), rgba(6, 182, 212, 0.1))",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid rgba(47, 123, 255, 0.3)"
            }}>
              <img
                src={falconBg}
                alt="Falcon Fitness"
                style={{
                  width: "200px",
                  height: "200px",
                  objectFit: "contain",
                  filter: "brightness(1.2)"
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats Section */}
      <section style={{ marginBottom: "60px" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "24px",
          maxWidth: "1200px",
          margin: "0 auto"
        }}>
          {quickStats.map((stat, index) => (
            <div key={index} style={statCardStyle}>
              <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>{stat.icon}</div>
              <h3 style={{ margin: "0 0 8px 0", fontSize: "1.2rem", fontWeight: "700" }}>{stat.title}</h3>
              <p style={{ color: "#cbd5e1", margin: 0, fontSize: "0.95rem" }}>{stat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section style={sectionStyle}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h2 style={{ fontSize: "2.5rem", fontWeight: "700", marginBottom: "16px" }}>How It Works</h2>
          <p style={{ color: "#cbd5e1", fontSize: "1.1rem", maxWidth: "600px", margin: "0 auto" }}>
            Get started in four simple steps and transform your fitness journey
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "24px"
        }}>
          {howItWorks.map((step, index) => (
            <div key={index} style={{
              ...cardStyle,
              textAlign: "center",
              position: "relative"
            }}>
              <div style={{
                position: "absolute",
                top: "-15px",
                left: "50%",
                transform: "translateX(-50%)",
                background: "linear-gradient(135deg, #2f7bff, #06b6d4)",
                color: "#0b1727",
                fontWeight: "800",
                fontSize: "0.9rem",
                padding: "8px 16px",
                borderRadius: "20px",
                boxShadow: "0 4px 12px rgba(47, 123, 255, 0.3)"
              }}>
                {step.step}
              </div>

              <div style={{ fontSize: "3rem", margin: "20px 0" }}>{step.icon}</div>
              <h3 style={{ margin: "0 0 12px 0", fontSize: "1.3rem", fontWeight: "700" }}>{step.title}</h3>
              <p style={{ color: "#cbd5e1", margin: 0, lineHeight: "1.5" }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Modules Section */}
      <section style={sectionStyle}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h2 style={{ fontSize: "2.5rem", fontWeight: "700", marginBottom: "16px" }}>Featured Modules</h2>
          <p style={{ color: "#cbd5e1", fontSize: "1.1rem", maxWidth: "600px", margin: "0 auto" }}>
            Everything you need for a complete fitness transformation
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "24px"
        }}>
          {featuredModules.map((module, index) => (
            <div key={index} style={{
              ...cardStyle,
              height: "100%",
              display: "flex",
              flexDirection: "column"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)";
              e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.4)";
              e.currentTarget.style.borderColor = module.color + "50";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.3)";
              e.currentTarget.style.borderColor = "rgba(107, 156, 245, 0.25)";
            }}
            >
              <h3 style={{ margin: "0 0 8px 0", fontSize: "1.4rem", fontWeight: "700" }}>{module.title}</h3>
              <p style={{ color: "#cbd5e1", margin: "0 0 12px 0", fontSize: "1rem", fontWeight: "600" }}>{module.subtitle}</p>
              <p style={{ color: "#94a3b8", margin: "0 0 20px 0", lineHeight: "1.5", flex: 1 }}>{module.desc}</p>
              <Link to={module.link} style={{
                ...btnPrimary,
                background: `linear-gradient(135deg, ${module.color}, ${module.color}dd)`,
                alignSelf: "flex-start",
                fontSize: "14px",
                padding: "10px 20px"
              }}>
                {module.buttonText}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section style={sectionStyle}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h2 style={{ fontSize: "2.5rem", fontWeight: "700", marginBottom: "16px" }}>Why Choose Falcon Fitness?</h2>
          <p style={{ color: "#cbd5e1", fontSize: "1.1rem", maxWidth: "600px", margin: "0 auto" }}>
            Science-backed recommendations that adapt to your unique needs
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "24px"
        }}>
          {benefits.map((benefit, index) => (
            <div key={index} style={{
              ...cardStyle,
              textAlign: "center"
            }}>
              <div style={{ fontSize: "3rem", marginBottom: "16px" }}>{benefit.icon}</div>
              <h3 style={{ margin: "0 0 12px 0", fontSize: "1.3rem", fontWeight: "700" }}>{benefit.title}</h3>
              <p style={{ color: "#cbd5e1", margin: 0, lineHeight: "1.5" }}>{benefit.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA Section */}
      <section style={{
        ...sectionStyle,
        textAlign: "center",
        borderTop: "3px solid #2f7bff",
        background: "linear-gradient(135deg, rgba(47, 123, 255, 0.1), rgba(7, 16, 35, 0.95))"
      }}>
        {isLoggedIn ? (
          <div>
            <h2 style={{ fontSize: "2.2rem", fontWeight: "700", marginBottom: "16px" }}>Ready to Continue Your Journey? 🦅</h2>
            <p style={{ color: "#cbd5e1", fontSize: "1.1rem", marginBottom: "32px", maxWidth: "600px", margin: "0 auto 32px" }}>
              Your personalized fitness plan is waiting. Track progress, adjust goals, and keep pushing forward.
            </p>
            <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link to="/dashboard" style={btnPrimary}>View Dashboard</Link>
              <Link to="/workouts" style={{ ...btnPrimary, background: "linear-gradient(135deg, #06b6d4, #0891b2)" }}>Browse Workouts</Link>
              <Link to="/nutrition" style={btnAccent}>Nutrition Plans</Link>
            </div>
          </div>
        ) : (
          <div>
            <h2 style={{ fontSize: "2.2rem", fontWeight: "700", marginBottom: "16px" }}>Start Your Transformation Today</h2>
            <p style={{ color: "#cbd5e1", fontSize: "1.1rem", marginBottom: "32px", maxWidth: "600px", margin: "0 auto 32px" }}>
              Join thousands of users who have transformed their fitness with personalized plans and expert guidance.
            </p>
            <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link to="/signup" style={btnAccent}>Get Started Free</Link>
              <Link to="/login" style={btnSecondary}>Sign In</Link>
              <Link to="/quiz" style={{ ...btnPrimary, background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>Take Quiz</Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
