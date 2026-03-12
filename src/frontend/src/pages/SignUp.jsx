import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const inputStyle = { width: '100%', padding: '12px', marginBottom: '20px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '1rem', color: '#333', boxSizing: 'border-box' };

export default function SignUp() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Redirect to dashboard if already logged in
  useEffect(() => { 
    if (localStorage.getItem('token')) navigate('/dashboard'); 
  }, [navigate]);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post(`${API_URL}/api/v1/register`, { username, email, password, is_active: true });
      navigate('/login');
    } catch (err) { 
      setError(err.response?.data?.detail || 'Registration failed'); 
    }
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