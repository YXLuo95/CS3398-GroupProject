// ==========================================
// IMPORTS
// ==========================================
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Components
import Navbar from "./components/Navbar";

// Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import Quiz from "./pages/Quiz";
import Architecture from "./pages/Architecture";
import Profile from "./pages/Profile";
// Otherwise, I created a simple inline placeholder to prevent crashes.
const Features = () => <div style={{ padding: "60px", textAlign: "center" }}><h1>Features</h1></div>;

// ==========================================
// MAIN APP COMPONENT (Router Wrapper)
// ==========================================
function App() {
  return (
    <Router>
      <div style={{ fontFamily: "Arial, sans-serif" }}>
        
        {/* Global Navigation Bar */}
        <Navbar /> 

        {/* Page Routes */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<Features />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/architecture" element={<Architecture />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
        
      </div>
    </Router>
  );
}

export default App;