// Import React so we can create components
import React from "react";

// Import routing tools so the app can navigate between pages
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

// Import the Falcon logo image from the assets folder
import falconLogo from "./assets/blue-falcon-logo.png";



/*
-------------------------------------------------------
HOME PAGE COMPONENT
This is the landing page users will see first
-------------------------------------------------------
*/
function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #071a2d, #0d2b45, #12395d)",
        color: "white",
      }}
    >
      {/* HERO SECTION */}
      <section
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "80px 60px",
          gap: "40px",
        }}
      >
        {/* LEFT SIDE TEXT */}
        <div style={{ flex: "1", minWidth: "300px" }}>
          <h1
            style={{
              fontSize: "3.5rem",
              marginBottom: "20px",
              lineHeight: "1.1",
            }}
          >
            Falcon Fitness
          </h1>

          <p
            style={{
              fontSize: "1.2rem",
              maxWidth: "600px",
              lineHeight: "1.7",
              color: "#d6e6f2",
              marginBottom: "30px",
            }}
          >
            A personalized fitness guide designed to help users build better
            habits, reach their goals, and stay consistent with customized
            workout, diet, and supplement recommendations.
          </p>

          {/* CALL TO ACTION BUTTONS */}
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <Link
              to="/signup"
              style={{
                backgroundColor: "white",
                color: "#0b1f3a",
                textDecoration: "none",
                padding: "14px 28px",
                borderRadius: "8px",
                fontWeight: "bold",
              }}
            >
              Get Started
            </Link>

            <Link
              to="/login"
              style={{
                border: "1px solid white",
                color: "white",
                textDecoration: "none",
                padding: "14px 28px",
                borderRadius: "8px",
                fontWeight: "bold",
              }}
            >
              Login
            </Link>
          </div>
        </div>

        {/* RIGHT SIDE LOGO */}
        <div
          style={{
            flex: "1",
            minWidth: "300px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <img
            src={falconLogo}
            alt="Falcon Fitness Logo"
            style={{
              width: "100%",
              maxWidth: "420px",
              opacity: 0.95,
              filter: "drop-shadow(0px 8px 20px rgba(0,0,0,0.4))",
            }}
          />
        </div>
      </section>



      {/* FEATURE SECTION */}
      <section
        style={{
          padding: "40px 60px 80px 60px",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            fontSize: "2rem",
            marginBottom: "40px",
          }}
        >
          What Falcon Fitness Helps You Do
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "24px",
          }}
        >
          {/* FEATURE CARD 1 */}
          <div
            style={{
              backgroundColor: "rgba(255,255,255,0.08)",
              padding: "24px",
              borderRadius: "14px",
              boxShadow: "0 6px 18px rgba(0,0,0,0.2)",
            }}
          >
            <h3>Personalized Workouts</h3>
            <p style={{ color: "#d6e6f2" }}>
              Build workout plans based on your fitness goals like muscle gain,
              weight loss, or endurance.
            </p>
          </div>

          {/* FEATURE CARD 2 */}
          <div
            style={{
              backgroundColor: "rgba(255,255,255,0.08)",
              padding: "24px",
              borderRadius: "14px",
              boxShadow: "0 6px 18px rgba(0,0,0,0.2)",
            }}
          >
            <h3>Diet Planning</h3>
            <p style={{ color: "#d6e6f2" }}>
              Receive personalized nutrition suggestions aligned with your
              workout and lifestyle goals.
            </p>
          </div>

          {/* FEATURE CARD 3 */}
          <div
            style={{
              backgroundColor: "rgba(255,255,255,0.08)",
              padding: "24px",
              borderRadius: "14px",
              boxShadow: "0 6px 18px rgba(0,0,0,0.2)",
            }}
          >
            <h3>Supplement Guidance</h3>
            <p style={{ color: "#d6e6f2" }}>
              Discover supplement suggestions based on your personal fitness
              objectives.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}



/*
-------------------------------------------------------
FEATURES PAGE
-------------------------------------------------------
*/
function Features() {
  return (
    <div style={{ padding: "60px", textAlign: "center" }}>
      <h1>Features</h1>
      <p>
        Falcon Fitness helps users with personalized workout planning,
        nutrition, and supplement guidance.
      </p>
    </div>
  );
}



/*
-------------------------------------------------------
ABOUT PAGE
-------------------------------------------------------
*/
function About() {
  return (
    <div style={{ padding: "60px", textAlign: "center" }}>
      <h1>About</h1>
      <p>
        Falcon Fitness is a personalized fitness platform focused on helping
        users improve their health through guided recommendations.
      </p>
    </div>
  );
}



/*
-------------------------------------------------------
LOGIN PAGE
-------------------------------------------------------
*/
function Login() {
  return (
    <div style={{ padding: "60px", textAlign: "center" }}>
      <h1>Login</h1>
      <p>Users will log into their account here.</p>
    </div>
  );
}



/*
-------------------------------------------------------
SIGNUP PAGE
-------------------------------------------------------
*/
function SignUp() {
  return (
    <div style={{ padding: "60px", textAlign: "center" }}>
      <h1>Sign Up</h1>
      <p>Create a Falcon Fitness account.</p>
    </div>
  );
}



/*
-------------------------------------------------------
MAIN APP COMPONENT
Controls navigation and routes
-------------------------------------------------------
*/
function App() {
  return (
    <Router>
      <div style={{ fontFamily: "Arial, sans-serif" }}>

        {/* NAVBAR */}
        <nav
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "18px 40px",
            backgroundColor: "#061626",
            color: "white",
            position: "sticky",
            top: 0,
            zIndex: 1000,
          }}
        >

          {/* LEFT SIDE: LOGO + TITLE */}
          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              textDecoration: "none",
              color: "white",
              fontWeight: "bold",
              fontSize: "1.4rem",
            }}
          >
            <img
              src={falconLogo}
              alt="Falcon Fitness Logo"
              style={{
                width: "38px",
                height: "38px",
                objectFit: "contain",
              }}
            />

            Falcon Fitness
          </Link>



          {/* MIDDLE NAV LINKS */}
          <div style={{ display: "flex", gap: "24px" }}>
            <Link to="/" style={{ color: "white", textDecoration: "none" }}>
              Home
            </Link>

            <Link
              to="/features"
              style={{ color: "white", textDecoration: "none" }}
            >
              Features
            </Link>

            <Link
              to="/about"
              style={{ color: "white", textDecoration: "none" }}
            >
              About
            </Link>
          </div>



          {/* RIGHT SIDE AUTH BUTTONS */}
          <div style={{ display: "flex", gap: "12px" }}>
            <Link
              to="/login"
              style={{
                color: "white",
                textDecoration: "none",
                padding: "8px 16px",
                border: "1px solid white",
                borderRadius: "6px",
              }}
            >
              Login
            </Link>

            <Link
              to="/signup"
              style={{
                color: "#0b1f3a",
                backgroundColor: "white",
                textDecoration: "none",
                padding: "8px 16px",
                borderRadius: "6px",
                fontWeight: "bold",
              }}
            >
              Sign Up
            </Link>
          </div>
        </nav>



        {/* ROUTES */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<Features />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
        </Routes>

      </div>
    </Router>
  );
}



// Export the App component
export default App;