// ==========================================
// IMPORTS
// ==========================================
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Global design system
import "./styles/designSystem.css";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import Quiz from "./pages/Quiz";
import Profile from "./pages/Profile";
import Chat from "./pages/Chat";
import Workouts from "./pages/Workouts";
import WorkoutDetail from "./pages/WorkoutDetail";
import Nutrition from "./pages/Nutrition";
import NutritionDetail from "./pages/NutritionDetail";
import Supplements from "./pages/Supplements";
import Reports from "./pages/Reports";
import DietPlan from "./pages/DietPlan";
import NotFound from "./pages/NotFound";

const Features = () => (
  <main className="ff-page">
    <div className="ff-container">
      <h1 className="ff-title">Features</h1>
    </div>
  </main>
);

import axios from "axios";

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);




// ==========================================
// MAIN APP COMPONENT (Router Wrapper)
// ==========================================
function App() {
  return (
    <Router>
      <div>
        {/* Global Navigation Bar */}
        <Navbar />

        {/* Page Routes */}
        <Routes>
          <Route path="/"                element={<Home />} />
          <Route path="/features"        element={<Features />} />
          <Route path="/about"           element={<About />} />
          <Route path="/login"           element={<Login />} />
          <Route path="/signup"          element={<SignUp />} />
          <Route path="/dashboard"       element={<Dashboard />} />
          <Route path="/quiz"            element={<Quiz />} />
          <Route path="/profile"         element={<Profile />} />
          <Route path="/chat"            element={<Chat />} />
          <Route path="/workouts"        element={<Workouts />} />
          <Route path="/workouts/:slug"  element={<WorkoutDetail />} />
          <Route path="/nutrition"       element={<Nutrition />} />
          <Route path="/nutrition/:slug" element={<NutritionDetail />} />
          <Route path="/supplements"     element={<Supplements />} />
          <Route path="/reports"         element={<Reports />} />
          <Route path="/diet-plan"       element={<DietPlan />} />
          <Route path="*"                element={<NotFound />} />
        </Routes>

        {/* Global Footer */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;