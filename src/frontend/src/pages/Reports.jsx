import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AppPage from "../components/ui/AppPage";
import SectionCard from "../components/ui/SectionCard";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ==========================================
// Cool Typewriter Effect Component
// ==========================================
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

  return (
    <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '0.95rem', color: '#e2e8f0' }}>
      {displayedText}
    </div>
  );
};

export default function Reports() {
  const navigate = useNavigate();
  const getToken = () => localStorage.getItem("token");

  // ==========================================
  // States
  // ==========================================
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasRecords, setHasRecords] = useState(false);
  
  // AI Polling States
  const [isGenerating, setIsGenerating] = useState(false);
  const [pollingActive, setPollingActive] = useState(false); 
  const [reportError, setReportError] = useState('');
  const [queueMessage, setQueueMessage] = useState('');

  // ==========================================
  // Fetch Existing Reports + Check Records
  // ==========================================
  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();
      if (!token) {
        navigate("/login");
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };

      try {
        // Fetch reports and records in parallel
        const [reportsRes, recordsRes] = await Promise.allSettled([
          axios.get(`${API_URL}/api/v1/reports`, { headers }),
          axios.get(`${API_URL}/api/v1/records?limit=1`, { headers }),
        ]);

        if (reportsRes.status === "fulfilled") {
          setReports(reportsRes.value.data || []);
        }

        // Check if user has at least one fitness record
        if (recordsRes.status === "fulfilled") {
          const records = recordsRes.value.data;
          setHasRecords(Array.isArray(records) && records.length > 0);
        }
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  // Track report count before generation
  const [reportCountBeforeGenerate, setReportCountBeforeGenerate] = useState(0);

  // ==========================================
  // AI Polling Logic
  // ==========================================
  useEffect(() => {
    let pollInterval;
    if (pollingActive) {
      pollInterval = setInterval(async () => {
        const token = getToken();
        try {
          const res = await axios.get(`${API_URL}/api/v1/reports`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const latestReports = res.data || [];
          
          // Stop polling when a new report appears (count increased)
          if (latestReports.length > reportCountBeforeGenerate) {
            setReports(latestReports);
            setPollingActive(false); 
            setIsGenerating(false);  
            setQueueMessage("");     
          }
        } catch (e) {
          console.error("Polling error:", e);
        }
      }, 5000);
    }
    return () => clearInterval(pollInterval);
  }, [pollingActive, reportCountBeforeGenerate]);

  // ==========================================
  // Trigger Report Generation
  // ==========================================
  const handleGenerateReport = async () => {
    setReportError('');
    setQueueMessage('');
    setIsGenerating(true);
    setReportCountBeforeGenerate(reports.length); // snapshot current count
    
    try {
      const res = await axios.post(`${API_URL}/api/v1/reports/generate`, {}, { 
        headers: { Authorization: `Bearer ${getToken()}` } 
      });
      if (res.status === 202) {
        setQueueMessage("🤖 Task Queued! Your AI Coach is analyzing your logs. Stand by, results will appear automatically...");
        setPollingActive(true); 
      }
    } catch (err) {
      const detail = err.response?.data?.detail || 'Error generating report.';
      setReportError(detail);
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#0b1727", color: "white", padding: "60px", textAlign: "center" }}>
        <h2>Loading your reports... 🦅</h2>
      </div>
    );
  }

  // Parse created_at as UTC (backend stores UTC without Z suffix)
  const parseUTC = (dateStr) => {
    if (!dateStr) return new Date(0);
    return dateStr.endsWith("Z") ? new Date(dateStr) : new Date(dateStr + "Z");
  };

  // Check if a report was already generated today
  const hasGeneratedToday = reports.length > 0 && 
    parseUTC(reports[0].created_at).toLocaleDateString() === new Date().toLocaleDateString();

  // Button is disabled if: no records, already generated today, or currently generating
  const generateDisabled = !hasRecords || (hasGeneratedToday && !pollingActive) || isGenerating;

  // Determine button label
  let generateLabel = '✨ Generate Insight';
  if (!hasRecords) {
    generateLabel = '⚠️ No Fitness Data Available';
  } else if (isGenerating) {
    generateLabel = '🤖 Analysis in Progress...';
  } else if (hasGeneratedToday) {
    generateLabel = '✅ Report Generated Today';
  }

  return (
    <AppPage
      eyebrow="AI COACH"
      title="Fitness Reports"
      subtitle="Deep dive insights based on your recent activity"
    >
      <SectionCard title="Generate New Insight">
        <div style={{ marginBottom: '20px' }}>
          <p style={{ color: "#a7b4c9", fontSize: "0.9rem", marginBottom: "15px" }}>
            The AI Coach will analyze your recent fitness logs, goals, and nutrition data to give you personalized, actionable advice.
          </p>

          {!hasRecords && (
            <div style={{ padding: '12px 16px', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', borderRadius: '8px', marginBottom: '15px', borderLeft: '4px solid #f59e0b', fontSize: '0.88rem' }}>
              📋 You need to log at least one fitness record before generating a report. Head to your <strong style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate('/dashboard')}>Dashboard</strong> to get started.
            </div>
          )}

          {hasGeneratedToday && !isGenerating && (
            <div style={{ padding: '12px 16px', backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', borderRadius: '8px', marginBottom: '15px', borderLeft: '4px solid #22c55e', fontSize: '0.88rem' }}>
              ✅ You've already generated a report today. Come back tomorrow for a fresh analysis!
            </div>
          )}
          
          <button 
            className="ff-btn"
            onClick={handleGenerateReport}
            disabled={generateDisabled}
            style={{ 
              backgroundColor: generateDisabled ? "rgba(255,255,255,0.1)" : "#9b59b6", 
              color: generateDisabled ? "#64748b" : "white", 
              border: "none", 
              padding: "12px 24px",
              fontWeight: "bold",
              cursor: generateDisabled ? "not-allowed" : "pointer",
              transition: "all 0.3s ease"
            }}
          >
            {generateLabel}
          </button>
        </div>

        {reportError && (
          <div style={{ color: '#e74c3c', fontSize: '0.88rem', marginTop: "10px", padding: "10px", backgroundColor: "rgba(231, 76, 60, 0.1)", borderRadius: "6px" }}>
            ⚠️ {reportError}
          </div>
        )}
        
        {queueMessage && (
          <div style={{ padding: '15px', backgroundColor: 'rgba(52, 152, 219, 0.1)', color: '#3498db', borderRadius: '6px', marginTop: '10px', borderLeft: '4px solid #3498db', fontSize: '0.9rem' }}>
            {queueMessage}
          </div>
        )}
      </SectionCard>

      {/* Latest Report uses Typewriter */}
      {reports.length > 0 ? (
        <SectionCard title={`Latest Report — ${new Date(reports[0].created_at).toLocaleDateString()}`}>
          <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(155, 89, 182, 0.3)', boxShadow: '0 4px 20px rgba(155, 89, 182, 0.05)' }}>
            <Typewriter text={reports[0].report_content} />
          </div>
        </SectionCard>
      ) : (
        <SectionCard title="Report History">
          <div style={{ textAlign: 'center', padding: '30px', color: '#64748b', fontSize: '0.95rem' }}>
            No reports generated yet. {hasRecords ? "Click the generate button above to start your AI coaching session!" : "Log some fitness data first, then come back to generate your first report."}
          </div>
        </SectionCard>
      )}

      {/* Historical Reports without Typewriter */}
      {reports.length > 1 && (
        <SectionCard title="Past Insights">
          <div className="ff-stack">
            {reports.slice(1).map((report) => (
              <div key={report.id} style={{ padding: "16px", backgroundColor: "rgba(255,255,255,0.03)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ color: "#3b82f6", fontWeight: "bold", fontSize: "0.85rem", marginBottom: "8px" }}>
                  {new Date(report.created_at).toLocaleDateString()}
                </div>
                <div style={{ color: "#a7b4c9", fontSize: "0.9rem", lineHeight: "1.5", whiteSpace: 'pre-wrap' }}>
                  {report.report_content}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      <button
        onClick={() => navigate("/dashboard")}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          border: "none",
          borderRadius: "8px",
          background: "transparent",
          color: "#64748b",
          cursor: "pointer",
          fontSize: "14px",
        }}
      >
        ← Back to Dashboard
      </button>
    </AppPage>
  );
}
