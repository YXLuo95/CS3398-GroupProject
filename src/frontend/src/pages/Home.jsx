// ======================================================
// Home Page Component
// This is the landing page for the Falcon Fitness app.
// It contains the main hero section with the background
// falcon logo, large headline, and navigation buttons.
// ======================================================

// Import Link from react-router-dom so navigation
// happens without refreshing the page.
import { Link } from "react-router-dom";

// Import the falcon logo to use as the hero background
import falconBg from "../assets/blue-falcon-logo.png";

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0b1727", color: "white", paddingBottom: "60px" }}>

      {/* ==================================================
          HERO SECTION
          - Large background image (falcon logo)
          - Main headline for the application
          - Navigation buttons to main features
      ================================================== */}
      <section
        className="hero"
        style={{
          backgroundImage: `url(${falconBg})`,
          backgroundSize: "contain",      
          backgroundPosition: "calc(100% - 40px) center",   
          backgroundRepeat: "no-repeat",  
        }}
      >
        {/* Overlay darkens the image so text is readable */}
        <div className="hero-overlay">
          {/* Content container for text + buttons */}
          <div className="hero-content">
            {/* Main headline */}
            <h1 className="hero-title">
              <span className="hero-title-accent">FALCON</span> FITNESS
            </h1>

            {/* Subtitle / short description */}
            <p className="hero-subtitle">
              Your personalized fitness guide — built for speed, accuracy, and quality.
            </p>

            {/* ACTION BUTTONS */}
            <div className="hero-actions">
              <Link className="btn btn-primary" to="/quiz">
                Start Quiz
              </Link>
              <Link className="btn btn-outline" to="/about">
                Read More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          HOW IT WORKS SECTION
          Simple explanation of the app workflow
      ================================================== */}
      <section className="home-section" style={{ textAlign: "center", padding: "40px 20px" }}>
        <h2 style={{ marginBottom: "20px", color: "white" }}>How it works</h2>
        <p style={{ maxWidth: "800px", margin: "0 auto", lineHeight: "1.6", fontSize: "1.1rem", color: "#cbd5e1" }}>
          Take a quick quiz about your fitness goals, receive a personalized
          diet plan, and get supplement recommendations tailored specifically
          for your body and objectives.
        </p>
      </section>

      {/* ==================================================
          FEATURES GRID SECTION
          Three cards showcasing the main benefits
      ================================================== */}
      <section className="home-section" style={{ padding: "0 20px 60px 20px" }}>
        
        <h2 style={{ textAlign: "center", marginBottom: "40px", color: "white" }}>
          What Falcon Fitness Helps You Do
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "24px",
            maxWidth: "1000px",
            margin: "0 auto", 
          }}
        >
          {/* FEATURE CARD 1 */}
          <div
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.05)", 
              border: "1px solid rgba(255, 255, 255, 0.1)",
              padding: "30px 24px",
              borderRadius: "14px",
              boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
              textAlign: "left"
            }}
          >
            <h3 style={{ margin: "0 0 15px 0", fontSize: "1.3rem", color: "white" }}>Personalized Workouts</h3>
            <p style={{ color: "#94a3b8", margin: 0, lineHeight: "1.6", fontSize: "0.95rem" }}>
              Build workout plans based on your fitness goals like muscle gain,
              weight loss, or endurance.
            </p>
          </div>

          {/* FEATURE CARD 2 */}
          <div
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              padding: "30px 24px",
              borderRadius: "14px",
              boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
              textAlign: "left"
            }}
          >
            <h3 style={{ margin: "0 0 15px 0", fontSize: "1.3rem", color: "white" }}>Diet Planning</h3>
            <p style={{ color: "#94a3b8", margin: 0, lineHeight: "1.6", fontSize: "0.95rem" }}>
              Receive personalized nutrition suggestions aligned with your
              workout and lifestyle goals.
            </p>
          </div>

          {/* FEATURE CARD 3 */}
          <div
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              padding: "30px 24px",
              borderRadius: "14px",
              boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
              textAlign: "left"
            }}
          >
            <h3 style={{ margin: "0 0 15px 0", fontSize: "1.3rem", color: "white" }}>Supplement Guidance</h3>
            <p style={{ color: "#94a3b8", margin: 0, lineHeight: "1.6", fontSize: "0.95rem" }}>
              Discover supplement suggestions based on your personal fitness
              objectives.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}