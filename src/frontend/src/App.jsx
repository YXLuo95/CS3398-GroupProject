// ==========================================
// IMPORTS
// ==========================================
import React from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Global design system
import "./styles/designSystem.css";

// Context
import { SubscriptionProvider, useSubscription } from "./context/SubscriptionContext";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AdBanner from "./components/AdBanner";

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
import Forum from "./pages/Forum";
import ForumPost from "./pages/ForumPost";
import History from "./pages/History";
import Upgrade from "./pages/Upgrade";

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

const Features = () => (
  <main className="ff-page">
    <div className="ff-container">
      <h1 className="ff-title">Features</h1>
    </div>
  </main>
);

// ==========================================
// Global ad banners — show on every page for non-premium users
// ==========================================
function GlobalAds() {
  const { isPremium } = useSubscription();
  return (
    <>
      <AdBanner position="left" isPremium={isPremium} />
      <AdBanner position="right" isPremium={isPremium} />
    </>
  );
}

// ==========================================
// MAIN APP COMPONENT (Router Wrapper)
// ==========================================
function App() {
  return (
    <Router>
      <SubscriptionProvider>
        <div>
          {/* Global Navigation Bar */}
          <Navbar />

          {/* Global ads — visible on every page unless premium */}
          <GlobalAds />

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
            <Route path="/forum"           element={<Forum />} />
            <Route path="/forum/:postId"   element={<ForumPost />} />
            <Route path="/history"         element={<History />} />
            <Route path="/upgrade"         element={<Upgrade />} />
            <Route path="*"                element={<NotFound />} />
          </Routes>

          {/* Global Footer */}
          <Footer />
        </div>
      </SubscriptionProvider>
    </Router>
  );
}

export default App;
