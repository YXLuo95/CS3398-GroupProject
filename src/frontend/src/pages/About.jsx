import React from "react";
export default function About() {
  return (
    <div style={{ padding: '80px 20px', minHeight: '100vh', backgroundColor: '#0b1727', color: 'white' }}>
      
      {/* Glassmorphism content card */}
      <div style={{ 
        padding: '50px 40px', 
        maxWidth: '800px', 
        margin: '0 auto', 
        lineHeight: '1.8', 
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '16px', 
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
      }}>
        
        <h1 style={{ color: '#ffffff', textAlign: 'center', marginBottom: '40px', fontSize: '2.5rem', letterSpacing: '1px' }}>
          About Falcon Fitness 🦅
        </h1>
        
        <p style={{ marginBottom: '20px', fontSize: '1.1rem', color: '#cbd5e1' }}>
          Falcon Fitness was created with one goal in mind: to make fitness simple, accessible, and motivating for everyone. Our platform is designed to help users take control of their health by providing an easy-to-use space where they can learn about fitness, track progress, and stay motivated on their journey.
        </p>

        <p style={{ marginBottom: '20px', fontSize: '1.1rem', color: '#cbd5e1' }}>
          At Falcon Fitness, we believe that building healthy habits should not feel overwhelming. Whether someone is just beginning their fitness journey or looking to stay consistent with their routine, our platform is designed to support users at every level. By combining a clean interface with helpful fitness resources, Falcon Fitness encourages users to stay active, set goals, and improve their overall well-being.
        </p>

        <p style={{ marginBottom: '40px', fontSize: '1.1rem', color: '#cbd5e1' }}>
          Our team developed Falcon Fitness as part of the <strong style={{ color: 'white' }}>Blue Falcons project</strong>, with a focus on creating a modern web application that emphasizes usability, simplicity, and accessibility. We are continuously working to improve the platform by adding new features that help users stay motivated and engaged in their fitness journey.
        </p>

        {/* Highlighted quote box */}
        <div style={{ 
          padding: '24px', 
          backgroundColor: 'rgba(47, 123, 255, 0.08)',
          borderRadius: '8px', 
          borderLeft: '6px solid #2f7bff'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.25rem', fontStyle: 'italic', color: '#e2e8f0' }}>
            "Falcon Fitness is more than just a fitness website — it’s a step toward building healthier habits and a stronger lifestyle."
          </p>
        </div>

      </div>
    </div>
  );
}