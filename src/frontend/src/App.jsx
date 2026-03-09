// ==========================================
// IMPORTS
// ==========================================
import React, { useState, useEffect ,useCallback} from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import Quiz from "./pages/Quiz";
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import falconLogo from "./assets/blue-falcon-logo.png";

// ==========================================
// 1. SMART NAVIGATION BAR
// ==========================================
function Navigation() {
  const navigate = useNavigate();
  const location = useLocation(); // Triggers re-render on route change
  
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 40px", backgroundColor: "#061626", color: "white", position: "sticky", top: 0, zIndex: 1000 }}>
      <Link to="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", color: "white", fontWeight: "bold", fontSize: "1.4rem" }}>
        <img src={falconLogo} alt="Falcon Fitness Logo" style={{ width: "38px", height: "38px", objectFit: "contain" }} />
        Falcon Fitness
      </Link>

      <div style={{ display: "flex", gap: "24px" }}>
        <Link to="/" style={{ color: "white", textDecoration: "none" }}>Home</Link>
        <Link to="/features" style={{ color: "white", textDecoration: "none" }}>Features</Link>
        <Link to="/about" style={{ color: "white", textDecoration: "none" }}>About</Link>
      </div>

      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        {token ? (
          <>
            <Link to="/dashboard" style={{ color: "white", textDecoration: "none", fontWeight: "bold" }}>My Dashboard</Link>
            <button onClick={handleLogout} style={{ color: "white", backgroundColor: "#e74c3c", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: "white", textDecoration: "none", padding: "8px 16px", border: "1px solid white", borderRadius: "6px" }}>Login</Link>
            <Link to="/signup" style={{ color: "#0b1f3a", backgroundColor: "white", textDecoration: "none", padding: "8px 16px", borderRadius: "6px", fontWeight: "bold" }}>Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}

// ==========================================
// 2. PUBLIC PAGES (Home, Features, About)
// ==========================================
function Home() {
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(to bottom, #071a2d, #0d2b45, #12395d)", color: "white" }}>
      <section style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", padding: "80px 60px", gap: "40px" }}>
        <div style={{ flex: "1", minWidth: "300px" }}>
          <h1 style={{ fontSize: "3.5rem", marginBottom: "20px", lineHeight: "1.1" }}>Falcon Fitness</h1>
          <p style={{ fontSize: "1.2rem", maxWidth: "600px", lineHeight: "1.7", color: "#d6e6f2", marginBottom: "30px" }}>
            A personalized fitness guide designed to help users build better habits, reach their goals, and stay consistent.
          </p>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <Link to="/signup" style={{ backgroundColor: "white", color: "#0b1f3a", textDecoration: "none", padding: "14px 28px", borderRadius: "8px", fontWeight: "bold" }}>Get Started</Link>
            <Link to="/login" style={{ border: "1px solid white", color: "white", textDecoration: "none", padding: "14px 28px", borderRadius: "8px", fontWeight: "bold" }}>Login</Link>
          </div>
        </div>
        <div style={{ flex: "1", minWidth: "300px", display: "flex", justifyContent: "center" }}>
          <img src={falconLogo} alt="Falcon Fitness Logo" style={{ width: "100%", maxWidth: "420px", opacity: 0.95, filter: "drop-shadow(0px 8px 20px rgba(0,0,0,0.4))" }} />
        </div>
      </section>
    </div>
  );
}

function Features() { return <div style={{ padding: "60px", textAlign: "center" }}><h1>Features</h1></div>; }
function About() { return <div style={{ padding: "60px", textAlign: "center" }}><h1>About</h1></div>; }

// ==========================================
// 3. AUTHENTICATION PAGES (Login, SignUp)
// ==========================================
const inputStyle = { width: '100%', padding: '12px', marginBottom: '20px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '1rem', color: '#333', boxSizing: 'border-box' };

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => { if (localStorage.getItem('token')) navigate('/dashboard'); }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    try {
      const response = await axios.post('http://localhost:8000/api/v1/login/access-token', formData, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
      localStorage.setItem('token', response.data.access_token);
      navigate('/dashboard'); 
    } catch (err) { setError('Invalid username or password'); }
  };

  return (
    <div style={{ padding: "80px 20px", display: 'flex', justifyContent: 'center' }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', width: '100%', maxWidth: '400px', color: '#333' }}>
        <h1 style={{ marginBottom: '10px', color: '#000' }}>Welcome Back</h1>
        <form onSubmit={handleLogin}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Username</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} style={inputStyle} required />
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} required />
          {error && <p style={{ color: '#e74c3c', marginBottom: '15px' }}>{error}</p>}
          <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#0b1f3a', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Login</button>
        </form>
      </div>
    </div>
  );
}

function SignUp() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => { if (localStorage.getItem('token')) navigate('/dashboard'); }, [navigate]);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post('http://localhost:8000/api/v1/register', { username, email, password, is_active: true });
      navigate('/login');
    } catch (err) { setError(err.response?.data?.detail || 'Registration failed'); }
  };

  return (
    <div style={{ padding: "80px 20px", display: 'flex', justifyContent: 'center' }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', width: '100%', maxWidth: '400px', color: '#333' }}>
        <h1 style={{ marginBottom: '10px', color: '#000' }}>Create Account</h1>
        <form onSubmit={handleSignUp}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Username</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} style={inputStyle} required />
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} required />
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} required />
          {error && <p style={{ color: '#e74c3c', marginBottom: '15px' }}>{error}</p>}
          <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#0b1f3a', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Sign Up</button>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// 4. ONBOARDING QUIZ (Strictly aligned with QuizSubmit Schema)
// ==========================================
function OnboardingQuiz() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Initialize form matching exact backend literals
  const [formData, setFormData] = useState({
    goal_type: 'lose_weight',
    age: '',
    gender: 'male',
    height_in: '',
    weight_lbs: '',
    target_weight: '',
    activity_level: 'sedentary',
    workout_days: 3,
    dietary_preferences: '',
    allergies: '',
    limitations: ''
  });

  useEffect(() => { if (!localStorage.getItem('token')) navigate('/login'); }, [navigate]);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    // Helper to convert comma-separated strings to List[str]
    const toArray = (str) => str && str.toLowerCase() !== 'none' ? str.split(',').map(s => s.trim()) : [];

    // Cast types to strictly match QuizSubmit Pydantic Schema
    const payload = {
      goal_type: formData.goal_type,
      age: parseInt(formData.age),
      gender: formData.gender,
      height_in: parseFloat(formData.height_in),
      weight_lbs: parseFloat(formData.weight_lbs),
      target_weight: formData.target_weight ? parseFloat(formData.target_weight) : null,
      activity_level: formData.activity_level,
      workout_days: parseInt(formData.workout_days),
      dietary_preferences: toArray(formData.dietary_preferences),
      allergies: toArray(formData.allergies),
      limitations: formData.limitations || null
    };

    try {
      await axios.post('http://localhost:8000/api/v1/onboarding/quiz', payload, { headers });
      navigate('/dashboard'); 
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to submit quiz. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  const formInputStyle = { ...inputStyle, marginBottom: '15px', backgroundColor: '#f9f9f9', padding: '10px' };

  return (
    <div style={{ padding: "60px 20px", display: 'flex', justifyContent: 'center', backgroundColor: "#f4f7f6", minHeight: "100vh" }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '100%', maxWidth: '800px' }}>
        <h1 style={{ color: '#0b1f3a', textAlign: 'center', marginBottom: '10px' }}>Fitness Profile Setup</h1>
        <p style={{ color: '#666', textAlign: 'center', marginBottom: '30px' }}>Tell us about yourself to calculate your BMI, BMR, and TDEE.</p>
        
        {error && <div style={{ color: 'white', backgroundColor: '#e74c3c', padding: '10px', borderRadius: '6px', marginBottom: '20px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            
            {/* COLUMN 1: Body Metrics */}
            <div>
              <h3 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Body Metrics</h3>
              <label style={{ fontWeight: 'bold' }}>Age</label>
              <input type="number" name="age" value={formData.age} onChange={handleChange} style={formInputStyle} required min="1" max="120" />
              
              <label style={{ fontWeight: 'bold' }}>Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} style={formInputStyle}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>

              <label style={{ fontWeight: 'bold' }}>Height (Inches)</label>
              <input type="number" step="0.1" name="height_in" value={formData.height_in} onChange={handleChange} style={formInputStyle} required />

              <label style={{ fontWeight: 'bold' }}>Current Weight (lbs)</label>
              <input type="number" step="0.1" name="weight_lbs" value={formData.weight_lbs} onChange={handleChange} style={formInputStyle} required />
            </div>

            {/* COLUMN 2: Goals */}
            <div>
              <h3 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Fitness Goals</h3>
              <label style={{ fontWeight: 'bold' }}>Primary Goal</label>
              <select name="goal_type" value={formData.goal_type} onChange={handleChange} style={formInputStyle}>
                <option value="lose_weight">Lose Weight</option>
                <option value="gain_muscle">Gain Muscle</option>
                <option value="maintain">Maintain</option>
                <option value="improve_endurance">Improve Endurance</option>
              </select>

              <label style={{ fontWeight: 'bold' }}>Target Weight (lbs) (Optional)</label>
              <input type="number" step="0.1" name="target_weight" value={formData.target_weight} onChange={handleChange} style={formInputStyle} />

              <label style={{ fontWeight: 'bold' }}>Activity Level</label>
              <select name="activity_level" value={formData.activity_level} onChange={handleChange} style={formInputStyle}>
                <option value="sedentary">Sedentary</option>
                <option value="lightly_active">Lightly Active</option>
                <option value="moderately_active">Moderately Active</option>
                <option value="very_active">Very Active</option>
                <option value="extra_active">Extra Active</option>
              </select>

              <label style={{ fontWeight: 'bold' }}>Workout Days/Week</label>
              <input type="number" name="workout_days" value={formData.workout_days} onChange={handleChange} style={formInputStyle} required min="1" max="7" />
            </div>
          </div>

          {/* FULL WIDTH: Dietary */}
          <div style={{ marginTop: '20px' }}>
            <h3 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Medical & Dietary (Comma Separated)</h3>
            <label style={{ fontWeight: 'bold' }}>Dietary Preferences</label>
            <input type="text" name="dietary_preferences" value={formData.dietary_preferences} onChange={handleChange} style={formInputStyle} placeholder="e.g. Vegan, Keto" />
            <label style={{ fontWeight: 'bold' }}>Allergies</label>
            <input type="text" name="allergies" value={formData.allergies} onChange={handleChange} style={formInputStyle} placeholder="e.g. Peanuts, Dairy" />
            <label style={{ fontWeight: 'bold' }}>Limitations</label>
            <input type="text" name="limitations" value={formData.limitations} onChange={handleChange} style={formInputStyle} placeholder="e.g. Bad knees" />
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '16px', backgroundColor: loading ? '#ccc' : '#0b1f3a', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '1.1rem', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Calculating Metrics...' : 'Submit Profile & Calculate'}
          </button>
        </form>
      </div>
    </div>
  );
}

/* =======================================================
TYPEWRITER COMPONENT 
Handles the smooth "AI Thinking" animation
=======================================================
*/
const Typewriter = ({ text, speed = 15 }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let i = 0;
    setDisplayedText(""); // Clear text when a new report arrives
    const timer = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(i));
      i++;
      if (i >= text.length) clearInterval(timer);
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>{displayedText}</div>;
};

/*
=======================================================
MAIN DASHBOARD COMPONENT
=======================================================
*/
function Dashboard() {
  const navigate = useNavigate();
  
  // -- User & Profile States --
  const [username, setUsername] = useState('');
  const [quizStatus, setQuizStatus] = useState(null); 
  const [fullQuizData, setFullQuizData] = useState(null);
  const [fitnessRecords, setFitnessRecords] = useState([]);
  const [reports, setReports] = useState([]);

  // -- Logging States --
  const [newWeight, setNewWeight] = useState('');
  const [isLogging, setIsLogging] = useState(false);
  const [logError, setLogError] = useState('');

  // -- AI Async States --
  const [isGenerating, setIsGenerating] = useState(false);
  const [pollingActive, setPollingActive] = useState(false); // Controls the background sniffer
  const [reportError, setReportError] = useState('');
  const [queueMessage, setQueueMessage] = useState('');

  const getToken = () => localStorage.getItem('token');

  // Unified Data Fetcher
  const fetchDashboardData = useCallback(async () => {
    const token = getToken();
    if (!token) { navigate('/login'); return; }

    const headers = { Authorization: `Bearer ${token}` };

    try {
      // 1. JWT Decode
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.sub) setUsername(payload.sub);

      // 2. Fetch Quiz Status & Data (To merge with daily logs)
      const statusRes = await axios.get('http://localhost:8000/api/v1/onboarding/status', { headers });
      setQuizStatus(statusRes.data.completed);
      
      if (statusRes.data.completed) {
        const quizRes = await axios.get('http://localhost:8000/api/v1/onboarding/quiz', { headers });
        setFullQuizData(quizRes.data);
      }

      // 3. Fetch Records
      const recordsRes = await axios.get('http://localhost:8000/api/v1/records?limit=30', { headers });
      setFitnessRecords(recordsRes.data);

      // 4. Fetch Reports
      const reportsRes = await axios.get('http://localhost:8000/api/v1/reports', { headers });
      setReports(reportsRes.data || []);
      
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  }, [navigate]);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  /* =======================================================
  POLLING LOGIC (The "Background Sniffer")
  Watches the DB for the worker to finish
  =======================================================
  */
  useEffect(() => {
    let pollInterval;

    if (pollingActive) {
      pollInterval = setInterval(async () => {
        console.log("Polling for async AI report...");
        const token = getToken();
        const headers = { Authorization: `Bearer ${token}` };

        try {
          const res = await axios.get('http://localhost:8000/api/v1/reports', { headers });
          const latestReports = res.data || [];
          
          if (latestReports.length > 0) {
            const latestDate = new Date(latestReports[0].created_at).toLocaleDateString();
            const today = new Date().toLocaleDateString();

            // If a report exists for TODAY, the worker is done!
            if (latestDate === today) {
              setReports(latestReports);
              setPollingActive(false); // Stop sniffer
              setIsGenerating(false);  // Stop spinner
              setQueueMessage("");     // Clear queue alert
            }
          }
        } catch (e) {
          console.error("Polling error:", e);
        }
      }, 5000); // Check every 5 seconds
    }

    return () => clearInterval(pollInterval);
  }, [pollingActive]);

  // -- Function: Log Daily Weight (Safe Merge) --
  const handleLogRecord = async (e) => {
    e.preventDefault();
    if (!fullQuizData) {
      setLogError("Please complete your Fitness Profile (Quiz) first!");
      return;
    }

    setLogError('');
    setIsLogging(true);
    const headers = { Authorization: `Bearer ${getToken()}` };

    const payload = {
      age: parseInt(fullQuizData.age),
      gender: fullQuizData.gender,
      height_in: parseFloat(fullQuizData.height_in),
      weight_lbs: parseFloat(newWeight),
      activity_level: fullQuizData.activity_level,
      fitness_goal: fullQuizData.goal_type
    };

    try {
      await axios.post('http://localhost:8000/api/v1/records', payload, { headers });
      setNewWeight('');
      await fetchDashboardData(); 
    } catch (err) {
      setLogError('Logging failed. Check backend fields.');
    } finally {
      setIsLogging(false);
    }
  };

  // -- Function: Trigger Report Generation --
  const handleGenerateReport = async () => {
    setReportError('');
    setQueueMessage('');
    setIsGenerating(true);
    const headers = { Authorization: `Bearer ${getToken()}` };

    try {
      const res = await axios.post('http://localhost:8000/api/v1/reports/generate', {}, { headers });
      if (res.status === 202) {
        setQueueMessage("🤖 Task Queued! AI Coach is analyzing your logs. Hang tight, results will appear automatically...");
        setPollingActive(true); // START SNIFFER
      }
    } catch (err) {
      setReportError(err.response?.data?.detail || 'Error enqueuing report.');
      setIsGenerating(false);
    }
  };

  // Logic Guards
  const hasTwoRecords = fitnessRecords.length >= 2;
  const hasGeneratedToday = reports.length > 0 && 
    new Date(reports[0].created_at).toLocaleDateString() === new Date().toLocaleDateString();

  const chartData = [...fitnessRecords].reverse().map(r => ({
    date: r.created_at ? new Date(r.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Log',
    weight: r.weight_lbs
  }));

  return (
    <div style={{ padding: "60px 40px", minHeight: "100vh", backgroundColor: "#f4f7f6" }}>
      <h1 style={{ color: "#0b1f3a", marginBottom: '40px' }}>{username ? `Welcome, ${username}!` : 'Dashboard'}</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px', marginBottom: '30px' }}>
        
        {/* PROFILE CARD */}
        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <h2 style={{ color: "#0b1f3a", borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Fitness Profile</h2>
          {quizStatus === null ? <p>Loading...</p> : (
            <div>
              <p style={{ color: quizStatus ? "#2ecc71" : "#f39c12", fontWeight: "bold" }}>
                {quizStatus ? "✅ Profile Completed" : "⚠️ Profile Incomplete"}
              </p>
              <button onClick={() => navigate(quizStatus ? '/quiz?retake=true' : '/quiz')} style={{ marginTop: '15px', padding: "10px 20px", border: "1px solid #0b1f3a", color: "#0b1f3a", backgroundColor: "transparent", borderRadius: "6px", cursor: "pointer" }}>
                {quizStatus ? "Update Profile" : "Start Quiz"}
              </button>
            </div>
          )}
        </div>

        {/* TRACKER CARD */}
        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <h2 style={{ color: "#0b1f3a", borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Daily Weight Log</h2>
          <form onSubmit={handleLogRecord} style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input type="number" step="0.1" placeholder="Lbs" value={newWeight} onChange={(e) => setNewWeight(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #ddd' }} required />
              <button type="submit" disabled={isLogging} style={{ padding: "10px 20px", backgroundColor: isLogging ? "#ccc" : "#0b1f3a", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
                {isLogging ? 'Saving...' : 'Log'}
              </button>
            </div>
            {logError && <p style={{ color: 'red', fontSize: '0.8rem', marginTop: '5px' }}>{logError}</p>}
          </form>

          {fitnessRecords.length > 1 ? (
            <div style={{ height: '150px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="date" hide />
                  <YAxis domain={['auto', 'auto']} hide />
                  <Tooltip />
                  <Line type="monotone" dataKey="weight" stroke="#2ecc71" strokeWidth={3} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : <p style={{ color: '#999', textAlign: 'center' }}>Logging entries...</p>}
        </div>
      </div>

      {/* AI COACHING SECTION */}
      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '15px', marginBottom: '20px' }}>
          <h2 style={{ color: "#0b1f3a", margin: 0 }}>🧠 AI Personal Coach</h2>
          
          <button 
            onClick={handleGenerateReport}
            disabled={!hasTwoRecords || (hasGeneratedToday && !pollingActive) || isGenerating}
            style={{ 
              padding: "12px 24px", 
              backgroundColor: (!hasTwoRecords || (hasGeneratedToday && !pollingActive) || isGenerating) ? "#ccc" : "#9b59b6", 
              color: "white", border: "none", borderRadius: "6px", 
              cursor: "pointer", fontWeight: "bold"
            }}
          >
            {isGenerating ? '🤖 Analysis in Progress...' : '✨ Generate Daily Insight'}
          </button>
        </div>

        {/* Async Notifications */}
        {reportError && <p style={{ color: '#e74c3c' }}>{reportError}</p>}
        {queueMessage && (
          <div style={{ padding: '15px', backgroundColor: '#e8f4fd', color: '#2980b9', borderRadius: '6px', marginBottom: '20px', borderLeft: '5px solid #3498db' }}>
            {queueMessage}
          </div>
        )}

        {/* Report Content */}
        {reports.length > 0 ? (
          <div style={{ marginTop: '20px', backgroundColor: '#fdfdfd', padding: '25px', borderRadius: '10px', border: '1px solid #efefef' }}>
            <h4 style={{ margin: '0 0 15px 0', color: '#555' }}>
              Latest Insight — {new Date(reports[0].created_at).toLocaleDateString()}
            </h4>
            <div style={{ color: '#333', fontSize: '1.05rem' }}>
              {/* Typewriter only triggers when reports[0] is updated */}
              <Typewriter text={reports[0].report_content} />
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#bbb' }}>No reports found. Submit your data to start!</div>
        )}
      </div>
    </div>
  );
}
// ==========================================
// 6. MAIN APP COMPONENT (Router Wrapper)
// ==========================================
function App() {
  return (
    <Router>
      <div style={{ fontFamily: "Arial, sans-serif" }}>
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<Features />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/quiz" element={<Quiz />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;