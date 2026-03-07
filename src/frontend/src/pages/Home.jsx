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
    <div>

      {/* ==================================================
          HERO SECTION
          - Large background image (falcon logo)
          - Main headline for the application
          - Navigation buttons to main features
      ================================================== */}
      <section
        className="hero"
        style={{
          // Use the falcon logo as the background
          backgroundImage: `url(${falconBg})`,
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

            {/* ==================================================
                ACTION BUTTONS
                Use Link instead of <a> so React Router
                handles navigation without reloading.
            ================================================== */}
            <div className="hero-actions">

              {/* Button: takes user to onboarding quiz */}
              <Link className="btn btn-primary" to="/quiz">
                Start Quiz
              </Link>

              {/* Button: takes user to About page */}
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
      <section className="home-section">

        <h2>How it works</h2>

        <p>
          Take a quick quiz about your fitness goals, receive a personalized
          diet plan, and get supplement recommendations tailored specifically
          for your body and objectives.
        </p>

      </section>

    </div>
  );
}