import React from 'react';
import { useParams, Link } from 'react-router-dom';

// =======================================================
// WORKOUT PLANS DATA
// =======================================================
const workoutPlans = {
  'beginner-training': {
    title: 'Beginner Training',
    intro: 'Perfect for those new to fitness or returning after a break. This program focuses on building proper form, consistency, and confidence in the gym.',
    bestFor: 'Complete beginners, people returning to fitness after a break, or those wanting to learn proper exercise technique.',
    duration: '4 weeks (with option to repeat)',
    schedule: '3-4 workouts per week, 45-60 minutes per session',
    exercises: [
      {
        name: 'Bodyweight Squats',
        sets: '3 sets',
        reps: '10-12 reps',
        rest: '60-90 seconds',
        notes: 'Focus on depth and form'
      },
      {
        name: 'Push-ups (Modified if needed)',
        sets: '3 sets',
        reps: '8-10 reps',
        rest: '60-90 seconds',
        notes: 'Drop to knees if needed'
      },
      {
        name: 'Dumbbell Rows',
        sets: '3 sets',
        reps: '10 reps per arm',
        rest: '60-90 seconds',
        notes: 'Keep back straight, squeeze shoulder blades'
      },
      {
        name: 'Plank',
        sets: '3 sets',
        reps: '20-30 seconds',
        rest: '60 seconds',
        notes: 'Keep body in straight line'
      },
      {
        name: 'Walking Lunges',
        sets: '3 sets',
        reps: '8-10 reps per leg',
        rest: '60-90 seconds',
        notes: 'Step forward with control'
      }
    ],
    benefits: [
      'Learn proper exercise form and technique',
      'Build foundational strength and muscle',
      'Develop workout consistency and habits',
      'Reduce injury risk through proper progression',
      'Gain confidence in gym environment'
    ],
    tips: [
      'Focus on quality over quantity - perfect form is essential',
      'Start with lighter weights and increase gradually',
      'Rest when needed, but try to complete all sets',
      'Track your workouts to see progress over time',
      'Stay hydrated and fuel your body properly'
    ]
  },
  'strength-training': {
    title: 'Strength Training',
    intro: 'A comprehensive strength-building program designed for consistent muscle and power gains through progressive overload.',
    bestFor: 'Intermediate lifters focused on building muscle mass, experienced gym users, or athletes looking to improve overall strength.',
    duration: '8-12 weeks (with progression)',
    schedule: '4-5 workouts per week, 60-90 minutes per session',
    exercises: [
      {
        name: 'Barbell Squats',
        sets: '4 sets',
        reps: '5-8 reps',
        rest: '2-3 minutes',
        notes: 'Full depth, keep chest up'
      },
      {
        name: 'Bench Press',
        sets: '4 sets',
        reps: '5-8 reps',
        rest: '2-3 minutes',
        notes: 'Full range of motion, controlled descent'
      },
      {
        name: 'Deadlifts',
        sets: '4 sets',
        reps: '5 reps',
        rest: '2-3 minutes',
        notes: 'Keep back straight, engage lats'
      },
      {
        name: 'Overhead Press',
        sets: '3 sets',
        reps: '6-8 reps',
        rest: '2 minutes',
        notes: 'Press straight up, avoid leaning back'
      },
      {
        name: 'Bent-over Rows',
        sets: '3 sets',
        reps: '8-10 reps',
        rest: '90 seconds',
        notes: 'Pull with back, squeeze shoulder blades'
      }
    ],
    benefits: [
      'Significant muscle mass and strength gains',
      'Improved bone density and joint health',
      'Enhanced metabolism and fat burning',
      'Better posture and functional movement',
      'Increased confidence and mental toughness'
    ],
    tips: [
      'Progressive overload is key - increase weight/reps over time',
      'Rest adequately between heavy sets',
      'Focus on compound movements for maximum gains',
      'Track your lifts and celebrate small victories',
      'Prioritize recovery with sleep and nutrition'
    ]
  },
  'fat-loss-training': {
    title: 'Fat Loss Training',
    intro: 'High-intensity training designed to maximize calorie burn while preserving muscle mass and improving cardiovascular fitness.',
    bestFor: 'Those focused on fat loss, improving conditioning, or combining strength training with cardio for optimal body composition.',
    duration: '6-8 weeks (repeatable)',
    schedule: '4-5 workouts per week, 45-60 minutes per session',
    exercises: [
      {
        name: 'Burpees',
        sets: '4 sets',
        reps: '10-15 reps',
        rest: '30-45 seconds',
        notes: 'Full movement, explosive jump'
      },
      {
        name: 'Mountain Climbers',
        sets: '4 sets',
        reps: '30 seconds',
        rest: '30 seconds',
        notes: 'Fast pace, keep core tight'
      },
      {
        name: 'Kettlebell Swings',
        sets: '3 sets',
        reps: '15-20 reps',
        rest: '45 seconds',
        notes: 'Hinge at hips, drive with glutes'
      },
      {
        name: 'Battle Ropes',
        sets: '3 sets',
        reps: '30 seconds',
        rest: '45 seconds',
        notes: 'Alternating waves, full power'
      },
      {
        name: 'Circuit: Push-ups + Squat Jumps',
        sets: '3 rounds',
        reps: '10 + 10',
        rest: '60 seconds between rounds',
        notes: 'Minimal rest between exercises'
      }
    ],
    benefits: [
      'Accelerated fat loss through high calorie burn',
      'Improved cardiovascular fitness and endurance',
      'Preserved muscle mass during weight loss',
      'Enhanced metabolism and afterburn effect',
      'Better overall conditioning and recovery'
    ],
    tips: [
      'Combine with proper nutrition for best results',
      'Stay hydrated and maintain electrolyte balance',
      'Include recovery days to prevent overtraining',
      'Track body measurements, not just weight',
      'Focus on progressive intensity increases'
    ]
  },
  'home-workouts': {
    title: 'Home Workouts',
    intro: 'Equipment-free or minimal-equipment workouts designed for convenience, perfect for busy schedules or limited space.',
    bestFor: 'People with limited access to gym equipment, busy professionals, parents, or those preferring to workout at home.',
    duration: 'Flexible (ongoing program)',
    schedule: '3-5 workouts per week, 30-45 minutes per session',
    exercises: [
      {
        name: 'Push-ups',
        sets: '3-4 sets',
        reps: '10-15 reps',
        rest: '60 seconds',
        notes: 'Modify on knees if needed'
      },
      {
        name: 'Bodyweight Squats',
        sets: '3-4 sets',
        reps: '15-20 reps',
        rest: '60 seconds',
        notes: 'Full depth, keep chest up'
      },
      {
        name: 'Lunges',
        sets: '3 sets',
        reps: '10 reps per leg',
        rest: '60 seconds',
        notes: 'Alternating legs, controlled movement'
      },
      {
        name: 'Plank Variations',
        sets: '3 sets',
        reps: '20-45 seconds',
        rest: '60 seconds',
        notes: 'Try side planks for variety'
      },
      {
        name: 'Burpees (or modified)',
        sets: '3 sets',
        reps: '8-12 reps',
        rest: '60 seconds',
        notes: 'Step back instead of jumping if needed'
      }
    ],
    benefits: [
      'Convenient workouts anytime, anywhere',
      'No gym membership or equipment required',
      'Flexible scheduling around busy life',
      'Build functional strength and fitness',
      'Develop discipline and consistency habits'
    ],
    tips: [
      'Create a dedicated workout space at home',
      'Use household items as weights when possible',
      'Focus on bodyweight mastery before adding weight',
      'Track progress with photos or measurements',
      'Stay consistent - short daily workouts beat long infrequent ones'
    ]
  }
};

// =======================================================
// STYLES
// =======================================================
const pageStyle = {
  minHeight: "100vh",
  background: "radial-gradient(circle at 20% 15%, #1b2a45, #0b1727 52%, #070f1e)",
  color: "white",
  padding: "36px 40px",
  fontFamily: "Inter, Arial, sans-serif"
};

const sectionStyle = {
  background: "linear-gradient(135deg, rgba(63, 150, 255, 0.08), rgba(7, 17, 37, 0.8))",
  border: "1px solid rgba(109, 171, 255, 0.25)",
  borderRadius: "16px",
  backdropFilter: "blur(10px)",
  padding: "24px",
  marginBottom: "26px"
};

const cardStyle = {
  background: "linear-gradient(135deg, rgba(49, 95, 202, 0.25), rgba(10, 22, 44, 0.7))",
  border: "1px solid rgba(115, 151, 255, 0.35)",
  borderRadius: "14px",
  boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
  padding: "20px",
  marginBottom: "16px"
};

const btnPrimary = {
  padding: "12px 24px",
  borderRadius: "8px",
  border: "none",
  background: "linear-gradient(90deg, #2f7bff, #1d5fda)",
  color: "white",
  cursor: "pointer",
  fontWeight: "700",
  boxShadow: "0 6px 16px rgba(47, 123, 255, 0.32)",
  textDecoration: "none",
  display: "inline-block",
  textAlign: "center"
};

const btnSecondary = {
  padding: "12px 24px",
  borderRadius: "8px",
  border: "1px solid rgba(109, 171, 255, 0.5)",
  background: "transparent",
  color: "white",
  cursor: "pointer",
  fontWeight: "600",
  textDecoration: "none",
  display: "inline-block",
  textAlign: "center"
};

const exerciseTable = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "16px"
};

const tableHeader = {
  background: "rgba(47, 123, 255, 0.2)",
  padding: "12px",
  textAlign: "left",
  fontWeight: "600",
  borderBottom: "1px solid rgba(109, 171, 255, 0.3)"
};

const tableCell = {
  padding: "12px",
  borderBottom: "1px solid rgba(109, 171, 255, 0.1)"
};

// =======================================================
// MAIN COMPONENT
// =======================================================
export default function WorkoutDetail() {
  const { slug } = useParams();
  const plan = workoutPlans[slug];

  if (!plan) {
    return (
      <div style={pageStyle}>
        <h1>Workout Plan Not Found</h1>
        <p>The requested workout plan could not be found.</p>
        <Link to="/workouts" style={btnPrimary}>Back to Workouts</Link>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={{ marginBottom: "20px" }}>
        <Link to="/workouts" style={btnSecondary}>← Back to Workouts</Link>
      </div>

      <h1 style={{ fontSize: "2.4rem", marginBottom: "8px" }}>{plan.title}</h1>
      <p style={{ color: "#c9d5e8", marginBottom: "32px", maxWidth: "880px", fontSize: "1.1rem", lineHeight: "1.6" }}>
        {plan.intro}
      </p>

      {/* Overview Section */}
      <section style={sectionStyle}>
        <h2 style={{ marginBottom: "16px", color: "#2f7bff" }}>Plan Overview</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
          <div style={cardStyle}>
            <h3 style={{ margin: "0 0 8px 0", color: "#4ade80" }}>Best For</h3>
            <p style={{ color: "#d9e5ff", margin: 0, lineHeight: "1.5" }}>{plan.bestFor}</p>
          </div>
          <div style={cardStyle}>
            <h3 style={{ margin: "0 0 8px 0", color: "#f59e0b" }}>Duration</h3>
            <p style={{ color: "#d9e5ff", margin: 0, lineHeight: "1.5" }}>{plan.duration}</p>
          </div>
          <div style={cardStyle}>
            <h3 style={{ margin: "0 0 8px 0", color: "#8b5cf6" }}>Schedule</h3>
            <p style={{ color: "#d9e5ff", margin: 0, lineHeight: "1.5" }}>{plan.schedule}</p>
          </div>
        </div>
      </section>

      {/* Exercises Section */}
      <section style={sectionStyle}>
        <h2 style={{ marginBottom: "16px", color: "#2f7bff" }}>Workout Exercises</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={exerciseTable}>
            <thead>
              <tr>
                <th style={tableHeader}>Exercise</th>
                <th style={tableHeader}>Sets</th>
                <th style={tableHeader}>Reps</th>
                <th style={tableHeader}>Rest</th>
                <th style={tableHeader}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {plan.exercises.map((exercise, index) => (
                <tr key={index}>
                  <td style={{ ...tableCell, fontWeight: "600" }}>{exercise.name}</td>
                  <td style={tableCell}>{exercise.sets}</td>
                  <td style={tableCell}>{exercise.reps}</td>
                  <td style={tableCell}>{exercise.rest}</td>
                  <td style={tableCell}>{exercise.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Benefits Section */}
      <section style={sectionStyle}>
        <h2 style={{ marginBottom: "16px", color: "#2f7bff" }}>Benefits</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
          {plan.benefits.map((benefit, index) => (
            <div key={index} style={{
              ...cardStyle,
              display: "flex",
              alignItems: "flex-start",
              gap: "12px"
            }}>
              <span style={{ color: "#4ade80", fontSize: "1.2rem" }}>✓</span>
              <p style={{ color: "#d9e5ff", margin: 0, lineHeight: "1.5" }}>{benefit}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tips Section */}
      <section style={sectionStyle}>
        <h2 style={{ marginBottom: "16px", color: "#2f7bff" }}>Training Tips</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
          {plan.tips.map((tip, index) => (
            <div key={index} style={{
              ...cardStyle,
              display: "flex",
              alignItems: "flex-start",
              gap: "12px"
            }}>
              <span style={{ color: "#f59e0b", fontSize: "1.2rem" }}>💡</span>
              <p style={{ color: "#d9e5ff", margin: 0, lineHeight: "1.5" }}>{tip}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Back Button */}
      <div style={{ textAlign: "center", marginTop: "40px" }}>
        <Link to="/workouts" style={btnPrimary}>Back to Workouts</Link>
      </div>
    </div>
  );
}