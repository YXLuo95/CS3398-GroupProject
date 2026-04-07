import styles from "../../pages/Home.module.css";

const steps = [
  {
    id: "01",
    title: "Profile Calibration",
    description: "Answer a smart onboarding flow so Falcon maps your goal, pace, and constraints."
  },
  {
    id: "02",
    title: "Adaptive Plan Engine",
    description: "Receive structured workouts and nutrition recommendations tuned to your weekly data."
  },
  {
    id: "03",
    title: "Progress Intelligence",
    description: "Track trends, performance score, and next best actions from your dashboard insights."
  }
];

export default function HowItWorksSection() {
  return (
    <section className={`${styles.section} ${styles.glassCard}`}>
      <span className={styles.tag}>How It Works</span>
      <h2 className={styles.sectionTitle}>From Onboarding To Visible Results</h2>
      <p className={styles.sectionSubtitle}>
        The Falcon system blends fitness science and product-grade UX so users move from
        guesswork to consistent weekly outcomes.
      </p>

      <div className={styles.flowGrid}>
        {steps.map((step) => (
          <article key={step.id} className={styles.flowCard}>
            <span className={styles.stepLabel}>STEP {step.id}</span>
            <h3>{step.title}</h3>
            <p className={styles.sectionSubtitle}>{step.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}