import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// =======================================================
// Typewriter Animation Component
// =======================================================
const Typewriter = ({ text, speed = 15 }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let i = 0;
    setDisplayedText(""); 
    const timer = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(i));
      i++;
      if (i >= text.length) clearInterval(timer);
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>{displayedText}</div>;
};

// =======================================================
// Main Dashboard Component
// =======================================================
export default function Dashboard() {
  const navigate = useNavigate();
  
  // -- User & Data States --
  const [username, setUsername] = useState('');
  const [quizStatus, setQuizStatus] = useState(null); 
  const [fullQuizData, setFullQuizData] = useState(null);
  const [fitnessRecords, setFitnessRecords] = useState([]);
  const [reports, setReports] = useState([]);

  // -- Logging States --
  const [newWeight, setNewWeight] = useState('');
  const [isLogging, setIsLogging] = useState(false);
  const [logError, setLogError] = useState('');

  // -- AI Generation & Polling States --
  const [isGenerating, setIsGenerating] = useState(false);
  const [pollingActive, setPollingActive] = useState(false); 
  const [reportError, setReportError] = useState('');
  const [queueMessage, setQueueMessage] = useState('');

  const getToken = () => localStorage.getItem('token');

  // -- Data Fetcher --
  const fetchDashboardData = useCallback(async () => {
    const token = getToken();
    if (!token) { navigate('/login'); return; }

    const headers = { Authorization: `Bearer ${token}` };

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.sub) setUsername(payload.sub);

      const statusRes = await axios.get(`${API_URL}/api/v1/onboarding/status`, { headers });
      setQuizStatus(statusRes.data.completed);
      
      if (statusRes.data.completed) {
        const quizRes = await axios.get(`${API_URL}/api/v1/onboarding/quiz`, { headers });
        setFullQuizData(quizRes.data);
      }

      const recordsRes = await axios.get(`${API_URL}/api/v1/records?limit=30`, { headers });
      setFitnessRecords(recordsRes.data);

      const reportsRes = await axios.get(`${API_URL}/api/v1/reports`, { headers });
      setReports(reportsRes.data || []);
      
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  }, [navigate]);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  // -- Polling for AI Reports --
  useEffect(() => {
    let pollInterval;
    if (pollingActive) {
      pollInterval = setInterval(async () => {
        const token = getToken();
        const headers = { Authorization: `Bearer ${token}` };
        try {
          const res = await axios.get(`${API_URL}/api/v1/reports`, { headers });
          const latestReports = res.data || [];
          if (latestReports.length > 0) {
            const latestDate = new Date(latestReports[0].created_at).toLocaleDateString();
            const today = new Date().toLocaleDateString();
            if (latestDate === today) {
              setReports(latestReports);
              setPollingActive(false); 
              setIsGenerating(false);  
              setQueueMessage("");     
            }
          }
        } catch (e) {
          console.error("Polling error:", e);
        }
      }, 5000); 
    }
    return () => clearInterval(pollInterval);
  }, [pollingActive]);

  // -- Handlers --
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
      await axios.post(`${API_URL}/api/v1/records`, payload, { headers });
      setNewWeight('');
      await fetchDashboardData(); 
    } catch (err) {
      setLogError('Logging failed. Check backend fields.');
    } finally {
      setIsLogging(false);
    }
  };

  const handleGenerateReport = async () => {
    setReportError('');
    setQueueMessage('');
    setIsGenerating(true);
    const headers = { Authorization: `Bearer ${getToken()}` };

    try {
      const res = await axios.post(`${API_URL}/api/v1/reports/generate`, {}, { headers });
      if (res.status === 202) {
        setQueueMessage("🤖 Task Queued! AI Coach is analyzing your logs. Hang tight, results will appear automatically...");
        setPollingActive(true); 
      }
    } catch (err) {
      setReportError(err.response?.data?.detail || 'Error enqueuing report.');
      setIsGenerating(false);
    }
  };

  // -- Derived Data --
  const hasTwoRecords = fitnessRecords.length >= 2;
  const hasGeneratedToday = reports.length > 0 && 
    new Date(reports[0].created_at).toLocaleDateString() === new Date().toLocaleDateString();

  const chartData = [...fitnessRecords].reverse().map(r => ({
    date: r.created_at ? new Date(r.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Log',
    weight: r.weight_lbs
  }));

  // -- Shared Styles --
  const glassCardStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '16px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    overflow: 'hidden'
  };

  return (
    <div style={{ padding: "60px 40px", minHeight: "100vh", backgroundColor: "#0b1727" }}>
      <h1 style={{ color: "white", marginBottom: '40px' }}>{username ? `Welcome, ${username}!` : 'Dashboard'}</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px', marginBottom: '30px' }}>
        
        {/* Profile Card */}
        <div style={glassCardStyle}>
          <div style={{ height: '6px', background: 'linear-gradient(to right, #2f7bff, #3498db)' }} />
          <div style={{ padding: '24px 28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: "white", margin: 0, fontSize: '1.2rem' }}>🦅 Fitness Profile</h2>
              <button onClick={() => navigate(quizStatus ? '/quiz?retake=true' : '/quiz')} style={{ padding: "7px 16px", border: "1px solid #2f7bff", color: "#2f7bff", backgroundColor: "transparent", borderRadius: "20px", cursor: "pointer", fontSize: '0.8rem', fontWeight: 'bold' }}>
                {quizStatus ? "Update" : "Start Quiz"}
              </button>
            </div>

            {quizStatus === null ? <p style={{ color: '#94a3b8' }}>Loading...</p> : !quizStatus ? (
              <p style={{ color: "#f39c12", fontWeight: "bold" }}>⚠️ Complete your profile to get started</p>
            ) : fullQuizData ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
                  {[
                    { label: 'BMI',  value: fullQuizData.bmi,  unit: '',     color: '#3498db' },
                    { label: 'BMR',  value: fullQuizData.bmr,  unit: 'kcal', color: '#2ecc71' },
                    { label: 'TDEE', value: fullQuizData.tdee, unit: 'kcal', color: '#9b59b6' },
                  ].map(m => (
                    <div key={m.label} style={{ backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '14px 10px', textAlign: 'center', border: `1px solid ${m.color}44` }}>
                      <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: m.color }}>{m.value}</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '1px' }}>{m.unit}</div>
                      <div style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 'bold', marginTop: '4px' }}>{m.label}</div>
                    </div>
                  ))}
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {[
                    { label: 'Goal',     value: fullQuizData.goal_type?.replace(/_/g, ' ') },
                    { label: 'Activity', value: fullQuizData.activity_level?.replace(/_/g, ' ') },
                    { label: 'Weight',   value: `${fullQuizData.weight_lbs} lbs` },
                    { label: 'Workouts', value: `${fullQuizData.workout_days}x / week` },
                  ].map(d => (
                    <div key={d.label} style={{ backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '10px 12px', border: '1px solid rgba(255,255,255,0.02)' }}>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{d.label}</div>
                      <div style={{ fontSize: '0.9rem', color: 'white', fontWeight: 'bold', marginTop: '2px', textTransform: 'capitalize' }}>{d.value}</div>
                    </div>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        </div>

        {/* Tracker Card */}
        <div style={{ ...glassCardStyle, padding: '30px' }}>
          <h2 style={{ color: "white", borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px', marginTop: 0 }}>Daily Weight Log</h2>
          <form onSubmit={handleLogRecord} style={{ marginBottom: '20px', marginTop: '20px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input type="number" step="0.1" placeholder="Lbs" value={newWeight} onChange={(e) => setNewWeight(e.target.value)} 
                style={{ flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(0,0,0,0.3)', color: 'white' }} required />
              <button type="submit" disabled={isLogging} 
                style={{ padding: "10px 20px", backgroundColor: isLogging ? "#555" : "#2f7bff", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
                {isLogging ? 'Saving...' : 'Log'}
              </button>
            </div>
            {logError && <p style={{ color: '#e74c3c', fontSize: '0.8rem', marginTop: '8px' }}>{logError}</p>}
          </form>

          {fitnessRecords.length > 1 ? (
            <div style={{ height: '150px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" hide />
                  <YAxis domain={['auto', 'auto']} hide />
                  <Tooltip contentStyle={{ backgroundColor: '#0b1727', border: '1px solid #2f7bff', color: 'white' }} itemStyle={{ color: '#2ecc71' }}/>
                  <Line type="monotone" dataKey="weight" stroke="#2ecc71" strokeWidth={3} dot={{ r: 3, fill: '#0b1727', stroke: '#2ecc71', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : <p style={{ color: '#64748b', textAlign: 'center' }}>Logging entries to see your progress chart...</p>}
        </div>
      </div>

      {/* AI Coaching Section */}
      <div style={{ ...glassCardStyle, padding: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px', marginBottom: '20px' }}>
          <h2 style={{ color: "white", margin: 0 }}>🧠 AI Personal Coach</h2>
          
          <button 
            onClick={handleGenerateReport}
            disabled={!hasTwoRecords || (hasGeneratedToday && !pollingActive) || isGenerating}
            style={{ 
              padding: "10px 20px", 
              backgroundColor: (!hasTwoRecords || (hasGeneratedToday && !pollingActive) || isGenerating) ? "rgba(255,255,255,0.1)" : "#9b59b6", 
              color: (!hasTwoRecords || (hasGeneratedToday && !pollingActive) || isGenerating) ? "#64748b" : "white", 
              border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", transition: "all 0.3s ease"
            }}
          >
            {isGenerating ? '🤖 Analysis in Progress...' : '✨ Generate Insight'}
          </button>
        </div>

        {reportError && <p style={{ color: '#e74c3c' }}>{reportError}</p>}
        {queueMessage && (
          <div style={{ padding: '15px', backgroundColor: 'rgba(52, 152, 219, 0.1)', color: '#3498db', borderRadius: '6px', marginBottom: '20px', borderLeft: '5px solid #3498db' }}>
            {queueMessage}
          </div>
        )}

        {reports.length > 0 ? (
          <div style={{ marginTop: '20px', backgroundColor: 'rgba(0,0,0,0.2)', padding: '25px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h4 style={{ margin: '0 0 15px 0', color: '#94a3b8' }}>
              Latest Insight — {new Date(reports[0].created_at).toLocaleDateString()}
            </h4>
            <div style={{ color: '#e2e8f0', fontSize: '1.05rem' }}>
              <Typewriter text={reports[0].report_content} />
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No reports found. Submit your data to start!</div>
        )}
      </div>
    </div>
  );
}