import React from 'react';
import { useParams, Link } from 'react-router-dom';

// =======================================================
// NUTRITION PLANS DATA
// =======================================================
const nutritionPlans = {
  'weight-loss-nutrition': {
    title: 'Weight Loss Nutrition',
    intro: 'A sustainable approach to fat loss through controlled calorie intake, high protein, and nutrient-dense foods that support metabolism and muscle preservation.',
    bestFor: 'Those focused on losing fat while maintaining muscle mass, improving body composition, or creating sustainable healthy eating habits.',
    calories: '500-750 calorie deficit below maintenance (based on TDEE)',
    macros: 'High protein (1.6-2.2g per kg bodyweight), moderate carbs, controlled fats',
    sampleMeals: [
      {
        meal: 'Breakfast',
        example: 'Greek yogurt with berries, chia seeds, and a sprinkle of nuts',
        calories: '~350 kcal',
        focus: 'High protein, fiber-rich'
      },
      {
        meal: 'Lunch',
        example: 'Grilled chicken salad with mixed greens, quinoa, avocado, and olive oil dressing',
        calories: '~450 kcal',
        focus: 'Lean protein, complex carbs'
      },
      {
        meal: 'Dinner',
        example: 'Baked salmon with sweet potato and steamed broccoli',
        calories: '~500 kcal',
        focus: 'Omega-3s, potassium, vitamins'
      },
      {
        meal: 'Snacks',
        example: 'Apple with almond butter, or cottage cheese with cucumber',
        calories: '~150-200 kcal each',
        focus: 'Satiation and nutrient density'
      }
    ],
    dailyTips: [
      'Focus on whole foods and prioritize protein at every meal',
      'Include vegetables with every meal for volume and nutrients',
      'Stay hydrated - aim for 3-4 liters of water daily',
      'Track portions initially to understand appropriate serving sizes',
      'Allow flexibility for social eating while maintaining overall deficit'
    ],
    hydration: '3-4 liters of water daily, plus herbal teas. Add electrolytes if exercising intensely.',
    mealTiming: '3 main meals + 1-2 snacks. Consider eating every 3-4 hours to maintain energy and control hunger.',
    benefits: [
      'Sustainable fat loss while preserving muscle mass',
      'Improved metabolic health and insulin sensitivity',
      'Better appetite control and reduced cravings',
      'Enhanced nutrient intake for overall wellness',
      'Long-term healthy eating habits that last'
    ]
  },
  'muscle-gain-nutrition': {
    title: 'Muscle Gain Nutrition',
    intro: 'A structured approach to building muscle through strategic calorie surplus, optimal protein intake, and nutrient timing to maximize recovery and growth.',
    bestFor: 'Those focused on building muscle mass, strength athletes, or individuals looking to improve body composition through hypertrophy training.',
    calories: '300-500 calorie surplus above maintenance (based on TDEE)',
    macros: 'High protein (1.6-2.2g per kg bodyweight), ample carbs for energy and recovery, moderate healthy fats',
    sampleMeals: [
      {
        meal: 'Pre-workout',
        example: 'Oatmeal with banana, protein powder, and peanut butter',
        calories: '~500 kcal',
        focus: 'Sustained energy, quick protein'
      },
      {
        meal: 'Post-workout',
        example: 'Whey protein shake with fruit and creatine',
        calories: '~300 kcal',
        focus: 'Rapid recovery and muscle repair'
      },
      {
        meal: 'Lunch',
        example: 'Turkey breast with brown rice, sweet potato, and mixed vegetables',
        calories: '~700 kcal',
        focus: 'Complete macronutrient profile'
      },
      {
        meal: 'Dinner',
        example: 'Grilled steak with quinoa, avocado, and asparagus',
        calories: '~650 kcal',
        focus: 'High-quality protein and micronutrients'
      }
    ],
    dailyTips: [
      'Consume protein within 1-2 hours post-workout for optimal recovery',
      'Include complex carbs to fuel training and replenish glycogen',
      'Track progress with photos and measurements, not just weight',
      'Ensure adequate healthy fats for hormone production',
      'Consider nutrient timing around training sessions'
    ],
    hydration: '3.5-4 liters of water daily. Include intra-workout hydration for longer sessions.',
    mealTiming: '4-6 meals per day. Pre and post-workout nutrition is crucial for muscle protein synthesis.',
    benefits: [
      'Accelerated muscle growth and strength gains',
      'Improved recovery between training sessions',
      'Enhanced workout performance and energy levels',
      'Better body composition and metabolic health',
      'Increased bone density and joint health'
    ]
  },
  'balanced-diet': {
    title: 'Balanced Diet',
    intro: 'A sustainable approach to everyday nutrition that provides optimal energy, supports overall health, and creates long-term healthy eating habits.',
    bestFor: 'Those seeking general health improvement, consistent energy levels, or a flexible approach to healthy eating that fits any lifestyle.',
    calories: 'Maintenance calories (based on TDEE) with flexibility for activity levels',
    macros: 'Balanced approach: 1.2-1.6g protein per kg, 40-50% carbs, 20-30% fats',
    sampleMeals: [
      {
        meal: 'Breakfast',
        example: 'Whole grain toast with avocado, eggs, and fruit',
        calories: '~400 kcal',
        focus: 'Balanced macros, sustained energy'
      },
      {
        meal: 'Lunch',
        example: 'Mediterranean bowl with chickpeas, vegetables, feta, and olive oil',
        calories: '~500 kcal',
        focus: 'Plant-based protein, healthy fats'
      },
      {
        meal: 'Dinner',
        example: 'Baked chicken with couscous, roasted vegetables, and salad',
        calories: '~550 kcal',
        focus: 'Complete nutrition, variety'
      },
      {
        meal: 'Snacks',
        example: 'Mixed nuts, yogurt with honey, or fruit with cheese',
        calories: '~200 kcal each',
        focus: 'Nutrient variety and satisfaction'
      }
    ],
    dailyTips: [
      'Fill half your plate with vegetables at lunch and dinner',
      'Include a variety of protein sources throughout the week',
      'Choose whole grains over refined carbohydrates',
      'Include healthy fats like avocados, nuts, and olive oil',
      'Practice mindful eating and enjoy your meals'
    ],
    hydration: '3 liters of water daily as a baseline, adjusted for activity and climate.',
    mealTiming: '3 meals per day with optional snacks. Listen to your hunger cues and eat when hungry.',
    benefits: [
      'Consistent energy levels throughout the day',
      'Improved overall health markers and wellness',
      'Sustainable approach that fits any lifestyle',
      'Better digestion and nutrient absorption',
      'Long-term health and disease prevention'
    ]
  },
  'meal-prep-guide': {
    title: 'Meal Prep Guide',
    intro: 'A comprehensive guide to planning, preparing, and storing meals ahead of time to maintain consistent nutrition while saving time and reducing stress.',
    bestFor: 'Busy professionals, parents, students, or anyone who wants to eat healthy but has limited time for daily cooking.',
    calories: 'Flexible - prepare meals according to your specific caloric needs',
    macros: 'Plan based on your goals: weight loss, muscle gain, or maintenance',
    sampleMeals: [
      {
        meal: 'Prep Day Breakfast',
        example: 'Overnight oats with chia seeds, prepared in batches',
        calories: '~350 kcal',
        focus: 'Quick assembly, portable'
      },
      {
        meal: 'Lunch Containers',
        example: 'Grilled chicken, quinoa, roasted vegetables in separate containers',
        calories: '~500 kcal',
        focus: 'Mix-and-match combinations'
      },
      {
        meal: 'Dinner Base',
        example: 'Turkey chili or stir-fry sauce with pre-cut vegetables',
        calories: '~450 kcal',
        focus: 'Versatile base for multiple meals'
      },
      {
        meal: 'Snacks',
        example: 'Pre-portioned nuts, cut vegetables with hummus',
        calories: '~150-200 kcal',
        focus: 'Convenient, healthy options'
      }
    ],
    dailyTips: [
      'Dedicate 2-3 hours on Sunday for weekly meal prep',
      'Use clear containers and label everything with dates',
      'Prep versatile ingredients that can be mixed and matched',
      'Store meals in fridge for 3-4 days, freeze for longer storage',
      'Wash and chop vegetables immediately after shopping'
    ],
    hydration: 'Pre-fill water bottles for the week. Consider infused water for variety.',
    mealTiming: 'Prep meals according to your schedule. Have quick options ready for busy days.',
    benefits: [
      'Significant time savings during the workweek',
      'Consistent nutrition without daily cooking stress',
      'Better portion control and reduced food waste',
      'Healthier eating habits through planning',
      'Reduced reliance on convenience foods and takeout'
    ]
  }
};

// =======================================================
// STYLES
// =======================================================
const pageStyle = {
  minHeight: "100vh",
  background: "radial-gradient(circle at 23% 20%, #1e3b61, #0b1727 55%, #060c1a)",
  color: "white",
  padding: "36px 40px",
  fontFamily: "Inter, Arial, sans-serif"
};

const sectionStyle = {
  background: "linear-gradient(135deg, rgba(56, 110, 204, 0.08), rgba(7, 17, 37, 0.9))",
  border: "1px solid rgba(87, 143, 240, 0.2)",
  borderRadius: "16px",
  backdropFilter: "blur(12px)",
  padding: "24px",
  marginBottom: "26px"
};

const cardStyle = {
  background: "linear-gradient(145deg, rgba(58, 119, 215, 0.2), rgba(11, 24, 48, 0.8))",
  border: "1px solid rgba(112, 158, 255, 0.35)",
  borderRadius: "14px",
  boxShadow: "0 10px 26px rgba(0,0,0,0.35)",
  padding: "20px",
  marginBottom: "16px"
};

const btnPrimary = {
  padding: "12px 24px",
  borderRadius: "8px",
  border: "none",
  background: "linear-gradient(90deg, #2f7bff, #1765db)",
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
  border: "1px solid rgba(87, 143, 240, 0.5)",
  background: "transparent",
  color: "white",
  cursor: "pointer",
  fontWeight: "600",
  textDecoration: "none",
  display: "inline-block",
  textAlign: "center"
};

const mealTable = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "16px"
};

const tableHeader = {
  background: "rgba(47, 123, 255, 0.2)",
  padding: "12px",
  textAlign: "left",
  fontWeight: "600",
  borderBottom: "1px solid rgba(87, 143, 240, 0.3)"
};

const tableCell = {
  padding: "12px",
  borderBottom: "1px solid rgba(87, 143, 240, 0.1)"
};

// =======================================================
// MAIN COMPONENT
// =======================================================
export default function NutritionDetail() {
  const { slug } = useParams();
  const plan = nutritionPlans[slug];

  if (!plan) {
    return (
      <div style={pageStyle}>
        <h1>Nutrition Plan Not Found</h1>
        <p>The requested nutrition plan could not be found.</p>
        <Link to="/nutrition" style={btnPrimary}>Back to Nutrition</Link>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={{ marginBottom: "20px" }}>
        <Link to="/nutrition" style={btnSecondary}>← Back to Nutrition</Link>
      </div>

      <h1 style={{ fontSize: "2.4rem", marginBottom: "8px" }}>{plan.title}</h1>
      <p style={{ color: "#cfdbed", marginBottom: "32px", maxWidth: "880px", fontSize: "1.1rem", lineHeight: "1.6" }}>
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
            <h3 style={{ margin: "0 0 8px 0", color: "#f59e0b" }}>Calories</h3>
            <p style={{ color: "#d9e5ff", margin: 0, lineHeight: "1.5" }}>{plan.calories}</p>
          </div>
          <div style={cardStyle}>
            <h3 style={{ margin: "0 0 8px 0", color: "#8b5cf6" }}>Macros</h3>
            <p style={{ color: "#d9e5ff", margin: 0, lineHeight: "1.5" }}>{plan.macros}</p>
          </div>
        </div>
      </section>

      {/* Sample Meals Section */}
      <section style={sectionStyle}>
        <h2 style={{ marginBottom: "16px", color: "#2f7bff" }}>Sample Meal Ideas</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={mealTable}>
            <thead>
              <tr>
                <th style={tableHeader}>Meal</th>
                <th style={tableHeader}>Example</th>
                <th style={tableHeader}>Approx. Calories</th>
                <th style={tableHeader}>Focus</th>
              </tr>
            </thead>
            <tbody>
              {plan.sampleMeals.map((meal, index) => (
                <tr key={index}>
                  <td style={{ ...tableCell, fontWeight: "600" }}>{meal.meal}</td>
                  <td style={tableCell}>{meal.example}</td>
                  <td style={tableCell}>{meal.calories}</td>
                  <td style={tableCell}>{meal.focus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Daily Tips Section */}
      <section style={sectionStyle}>
        <h2 style={{ marginBottom: "16px", color: "#2f7bff" }}>Daily Nutrition Tips</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
          {plan.dailyTips.map((tip, index) => (
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

      {/* Hydration & Timing Section */}
      <section style={sectionStyle}>
        <h2 style={{ marginBottom: "16px", color: "#2f7bff" }}>Hydration & Meal Timing</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "20px" }}>
          <div style={cardStyle}>
            <h3 style={{ margin: "0 0 12px 0", color: "#06b6d4" }}>💧 Hydration</h3>
            <p style={{ color: "#d9e5ff", margin: 0, lineHeight: "1.5" }}>{plan.hydration}</p>
          </div>
          <div style={cardStyle}>
            <h3 style={{ margin: "0 0 12px 0", color: "#f59e0b" }}>⏰ Meal Timing</h3>
            <p style={{ color: "#d9e5ff", margin: 0, lineHeight: "1.5" }}>{plan.mealTiming}</p>
          </div>
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

      {/* Back Button */}
      <div style={{ textAlign: "center", marginTop: "40px" }}>
        <Link to="/nutrition" style={btnPrimary}>Back to Nutrition</Link>
      </div>
    </div>
  );
}