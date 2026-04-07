import { Link } from "react-router-dom";
import styles from "../../pages/Home.module.css";

const features = [
  {
    code: "AI",
    title: "Adaptive Program Builder",
    text: "Auto-adjust your volume and intensity based on session quality and recovery data.",
    link: "/workouts"
  },
  {
    code: "NU",
    title: "Smart Nutrition Logic",
    text: "Daily macro targets and meal guidance that align with your exact training phase.",
    link: "/nutrition"
  },
  {
    code: "AN",
    title: "Analytics Dashboard",
    text: "Monitor consistency, body metrics, and progression trends in one clear command center.",
    link: "/dashboard"
  },
  {
    code: "CO",
    title: "Coach-Ready Insights",
    text: "Export progress snapshots and recommendations for coach or accountability partners.",
    link: "/profile"
  }
];

export default function FeaturesSection({ isLoggedIn }) {
  return (
    <section className={`${styles.section} ${styles.glassCard}`}>
      <span className={styles.tag}>Feature Stack</span>
      <h2 className={styles.sectionTitle}>Built Like A Product, Not A PDF Plan</h2>
      <p className={styles.sectionSubtitle}>
        Every feature is engineered to help users execute faster and stay engaged over months.
      </p>

      <div className={styles.featureGrid}>
        {features.map((feature) => (
          <article key={feature.title} className={styles.featureCard}>
            <div className={styles.featureTop}>
              <div className={styles.featureChip}>{feature.code}</div>
              <Link to={feature.link} className={styles.buttonGhost}>
                Open
              </Link>
            </div>
            <h3>{feature.title}</h3>
            <p className={styles.sectionSubtitle}>{feature.text}</p>
          </article>
        ))}
      </div>

      {!isLoggedIn && (
        <div className={styles.ctaRow}>
          <Link to="/signup" className={styles.buttonPrimary}>
            Create Falcon Account
          </Link>
          <Link to="/about" className={styles.buttonGhost}>
            Explore Product Story
          </Link>
        </div>
      )}
    </section>
  );
}