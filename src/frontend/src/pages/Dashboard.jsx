import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// =======================================================
// Mock Data - Replace with API calls later
// =======================================================
const mockUser = {
  name: 'Alex Johnson',
  email: 'alex@example.com'
};

const mockQuizResults = {
  goal: 'lose_weight', // Options: lose_weight, gain_muscle, improve_endurance, general_fitness
  workoutFrequency: 4,
  dietPreference: 'balanced',
  calorieTarget: 2200,
  proteinTarget: 150,
  carbsTarget: 200,
  fatsTarget: 73,
  focusAreas: ['strength', 'cardio', 'fat_loss']
};

const mockActivityLog = [
  { id: 1, action: 'Completed quiz', timestamp: '2 hours ago', icon: '✅' },
  { id: 2, action: 'Viewed workout plan', timestamp: '1 day ago', icon: '💪' },
  { id: 3, action: 'Logged today\'s workout', timestamp: '2 days ago', icon: '🏋️' },
  { id: 4, action: 'Updated nutrition goal', timestamp: '3 days ago', icon: '🥗' }
];

const mockStats = {
  workoutsCompleted: 12,
  currentStreak: 5,
  caloriesTarget: mockQuizResults.calorieTarget,
  proteinTarget: mockQuizResults.proteinTarget,
  goalType: mockQuizResults.goal.replace('_', ' ')
};

// =======================================================
// Helper Functions
// =======================================================
const getGoalDisplay = (goal) => {
  const goals = {
    lose_weight: 'Lose Weight',
    gain_muscle: 'Gain Muscle',
    improve_endurance: 'Improve Endurance',
    general_fitness: 'General Fitness'
  };
  return goals[goal] || 'General Fitness';
};

const getMotivationalMessage = (goal) => {
  const messages = {
    lose_weight: 'Every step counts towards your transformation!',
    gain_muscle: 'Building strength, one rep at a time!',
    improve_endurance: 'Push your limits and discover your potential!',
    general_fitness: 'Your fitness journey starts here!'
  };
  return messages[goal] || 'Your fitness journey starts here!';
};

const getWorkoutRecommendations = (goal) => {
  const recommendations = {
    lose_weight: {
      split: '4-Day Split',
      frequency: '4x per week',
      focus: 'HIIT cardio + strength training',
      description: 'Combine high-intensity cardio with compound lifts for optimal fat loss'
    },
    gain_muscle: {
      split: 'Push/Pull/Legs',
      frequency: '5-6x per week',
      focus: 'Progressive overload + hypertrophy',
      description: 'Focus on compound movements with progressive weight increases'
    },
    improve_endurance: {
      split: 'Circuit Training',
      frequency: '5x per week',
      focus: 'Cardio + functional training',
      description: 'Build stamina with varied intensity and recovery periods'
    },
    general_fitness: {
      split: 'Full Body',
      frequency: '3-4x per week',
      focus: 'Balanced training',
      description: 'Comprehensive workouts covering all major muscle groups'
    }
  };
  return recommendations[goal] || recommendations.general_fitness;
};

const getDietRecommendations = (goal) => {
  const recommendations = {
    lose_weight: {
      focus: 'Calorie deficit with high protein',
      tips: ['Prioritize lean proteins', 'Include complex carbs', 'Healthy fats in moderation']
    },
    gain_muscle: {
      focus: 'Calorie surplus with ample protein',
      tips: ['High protein intake', 'Complex carbohydrates', 'Healthy fats for hormones']
    },
    improve_endurance: {
      focus: 'Carb-focused with moderate protein',
      tips: ['Complex carbs for energy', 'Moderate protein', 'Essential fats']
    },
    general_fitness: {
      focus: 'Balanced macronutrients',
      tips: ['Varied protein sources', 'Whole grain carbs', 'Healthy fats']
    }
  };
  return recommendations[goal] || recommendations.general_fitness;
};

const getFitnessTips = (goal) => {
  const tips = {
    lose_weight: [
      'Stay in a moderate calorie deficit (300-500 kcal below maintenance)',
      'Prioritize protein intake to preserve muscle mass',
      'Include both cardio and strength training for optimal results'
    ],
    gain_muscle: [
      'Focus on progressive overload - gradually increase weights',
      'Ensure adequate protein intake (1.6-2.2g per kg bodyweight)',
      'Allow proper recovery between intense training sessions'
    ],
    improve_endurance: [
      'Incorporate both steady-state and interval training',
      'Stay hydrated and maintain electrolyte balance',
      'Include mobility work to prevent injuries'
    ],
    general_fitness: [
      'Consistency is key - aim for regular training sessions',
      'Balance different types of exercise',
      'Listen to your body and adjust intensity as needed'
    ]
  };
  return tips[goal] || tips.general_fitness;
};

// =======================================================
// Main Dashboard Component
// =======================================================
export default function Dashboard() {
  const navigate = useNavigate();
  const [user] = useState(mockUser);
  const [quizResults] = useState(mockQuizResults);
  const [activityLog] = useState(mockActivityLog);
  const [stats] = useState(mockStats);

  // Shared styles
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0b1727 0%, #1e293b 100%)',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    card: {
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      backdropFilter: 'blur(10px)',
      overflow: 'hidden'
    },
    accentBar: {
      height: '4px',
      background: 'linear-gradient(90deg, #3b82f6, #06b6d4)'
    },
    button: {
      padding: '12px 24px',
      borderRadius: '8px',
      border: 'none',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontSize: '14px'
    },
    primaryButton: {
      background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
      color: 'white'
    },
    secondaryButton: {
      background: 'rgba(255, 255, 255, 0.1)',
      color: 'white',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    },
    statCard: {
      background: 'rgba(0, 0, 0, 0.2)',
      borderRadius: '12px',
      padding: '20px',
      textAlign: 'center',
      border: '1px solid rgba(255, 255, 255, 0.05)'
    }
  };

  const workoutRecs = getWorkoutRecommendations(quizResults.goal);
  const dietRecs = getDietRecommendations(quizResults.goal);
  const fitnessTips = getFitnessTips(quizResults.goal);

  return (
    <div style={styles.container}>
      {/* Welcome / Hero Section */}
      <div style={{ ...styles.card, padding: '40px', marginBottom: '30px', textAlign: 'center' }}>
        <div style={styles.accentBar} />
        <h1 style={{ color: 'white', fontSize: '2.5rem', margin: '20px 0', fontWeight: '700' }}>
          Welcome back, {user.name}! 🦅
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.2rem', margin: '10px 0 20px' }}>
          {getMotivationalMessage(quizResults.goal)}
        </p>
        <div style={{
          display: 'inline-block',
          background: 'rgba(59, 130, 246, 0.1)',
          color: '#3b82f6',
          padding: '8px 16px',
          borderRadius: '20px',
          fontWeight: '600',
          border: '1px solid rgba(59, 130, 246, 0.3)'
        }}>
          🎯 Goal: {getGoalDisplay(quizResults.goal)}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px', marginBottom: '30px' }}>

        {/* Personalized Workout Recommendations */}
        <div style={styles.card}>
          <div style={styles.accentBar} />
          <div style={{ padding: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: 'white', margin: 0, fontSize: '1.5rem' }}>💪 Workout Plan</h2>
              <button
                style={{ ...styles.button, ...styles.primaryButton }}
                onClick={() => navigate('/workouts')}
              >
                View Full Plan
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              <div style={styles.statCard}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>{workoutRecs.split}</div>
                <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Workout Split</div>
              </div>
              <div style={styles.statCard}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#06b6d4' }}>{workoutRecs.frequency}</div>
                <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Frequency</div>
              </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <h3 style={{ color: 'white', fontSize: '1.1rem', margin: '0 0 8px 0' }}>Focus Areas</h3>
              <div style={{ color: '#cbd5e1', fontSize: '0.95rem' }}>{workoutRecs.focus}</div>
            </div>

            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.5' }}>
              {workoutRecs.description}
            </p>
          </div>
        </div>

        {/* Personalized Diet Plan */}
        <div style={styles.card}>
          <div style={styles.accentBar} />
          <div style={{ padding: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: 'white', margin: 0, fontSize: '1.5rem' }}>🥗 Nutrition Plan</h2>
              <button
                style={{ ...styles.button, ...styles.primaryButton }}
                onClick={() => navigate('/nutrition')}
              >
                View Full Plan
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
              <div style={styles.statCard}>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#10b981' }}>{quizResults.calorieTarget}</div>
                <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Calories</div>
              </div>
              <div style={styles.statCard}>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#f59e0b' }}>{quizResults.proteinTarget}g</div>
                <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Protein</div>
              </div>
              <div style={styles.statCard}>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#8b5cf6' }}>{quizResults.fatsTarget}g</div>
                <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Fats</div>
              </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <h3 style={{ color: 'white', fontSize: '1.1rem', margin: '0 0 8px 0' }}>Focus</h3>
              <div style={{ color: '#cbd5e1', fontSize: '0.95rem' }}>{dietRecs.focus}</div>
            </div>

            <div>
              <h3 style={{ color: 'white', fontSize: '1.1rem', margin: '0 0 10px 0' }}>Key Tips</h3>
              <ul style={{ color: '#94a3b8', fontSize: '0.9rem', paddingLeft: '20px', margin: 0 }}>
                {dietRecs.tips.map((tip, index) => (
                  <li key={index} style={{ marginBottom: '5px' }}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '30px' }}>

        {/* Activity Log Section */}
        <div style={styles.card}>
          <div style={styles.accentBar} />
          <div style={{ padding: '30px' }}>
            <h2 style={{ color: 'white', margin: '0 0 20px 0', fontSize: '1.5rem' }}>📋 Recent Activity</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {activityLog.map((activity) => (
                <div key={activity.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '15px',
                  background: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                  <span style={{ fontSize: '1.5rem', marginRight: '15px' }}>{activity.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: 'white', fontWeight: '500' }}>{activity.action}</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{activity.timestamp}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Progress / Stats Section */}
        <div style={styles.card}>
          <div style={styles.accentBar} />
          <div style={{ padding: '30px' }}>
            <h2 style={{ color: 'white', margin: '0 0 20px 0', fontSize: '1.5rem' }}>📊 Your Progress</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
              <div style={styles.statCard}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{stats.workoutsCompleted}</div>
                <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Workouts Completed</div>
              </div>
              <div style={styles.statCard}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>{stats.currentStreak}</div>
                <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Day Streak</div>
              </div>
              <div style={styles.statCard}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#06b6d4' }}>{stats.caloriesTarget}</div>
                <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Daily Calories</div>
              </div>
              <div style={styles.statCard}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#8b5cf6' }}>{stats.proteinTarget}g</div>
                <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Daily Protein</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div style={styles.card}>
          <div style={styles.accentBar} />
          <div style={{ padding: '30px' }}>
            <h2 style={{ color: 'white', margin: '0 0 20px 0', fontSize: '1.5rem' }}>⚡ Quick Actions</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <button
                style={{ ...styles.button, ...styles.primaryButton, height: '60px' }}
                onClick={() => navigate('/workouts')}
              >
                🏋️ Start Workout
              </button>
              <button
                style={{ ...styles.button, ...styles.secondaryButton, height: '60px' }}
                onClick={() => navigate('/nutrition')}
              >
                🥗 View Nutrition
              </button>
              <button
                style={{ ...styles.button, ...styles.secondaryButton, height: '60px' }}
                onClick={() => navigate('/quiz')}
              >
                📝 Retake Quiz
              </button>
              <button
                style={{ ...styles.button, ...styles.secondaryButton, height: '60px' }}
                onClick={() => navigate('/profile')}
              >
                👤 Update Profile
              </button>
            </div>
          </div>
        </div>

        {/* Tips / Recommendations Section */}
        <div style={styles.card}>
          <div style={styles.accentBar} />
          <div style={{ padding: '30px' }}>
            <h2 style={{ color: 'white', margin: '0 0 20px 0', fontSize: '1.5rem' }}>💡 Fitness Tips</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {fitnessTips.map((tip, index) => (
                <div key={index} style={{
                  padding: '15px',
                  background: 'rgba(59, 130, 246, 0.1)',
                  borderRadius: '8px',
                  border: '1px solid rgba(59, 130, 246, 0.2)'
                }}>
                  <div style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: '1.5' }}>
                    {tip}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}