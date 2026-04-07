import { Link } from "react-router-dom";
import styles from "../../pages/Home.module.css";

const placeholderImage =
  "https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=1200&q=80";

export default function HeroSection({ isLoggedIn }) {
  return (
    <section className={`${styles.section} ${styles.hero} ${styles.glassCard}`}>
      <div className={styles.heroGrid}>
        <div>
          <span className={styles.tag}>Falcon Fitness SaaS</span>
          <h1 className={styles.headline}>
            Train With
            <span className={styles.headlineAccent}>Precision Intelligence</span>
          </h1>
          <p className={styles.subhead}>
            Build your strongest body with adaptive workout plans, nutrition insights,
            and real-time progress analytics in one premium training platform.
          </p>

          <div className={styles.ctaRow}>
            {isLoggedIn ? (
              <>
                <Link to="/dashboard" className={styles.buttonPrimary}>
                  Open Dashboard
                </Link>
                <Link to="/workouts" className={styles.buttonGhost}>
                  Continue Program
                </Link>
              </>
            ) : (
              <>
                <Link to="/signup" className={styles.buttonPrimary}>
                  Start Free Trial
                </Link>
                <Link to="/quiz" className={styles.buttonGhost}>
                  Take Fitness Quiz
                </Link>
              </>
            )}
          </div>
        </div>

        <div className={`${styles.heroPanel} ${styles.glassCard}`}>
          <img
            src={placeholderImage}
            alt="Athlete training with Falcon Fitness"
            className={styles.heroImage}
            loading="lazy"
          />
          <div className={styles.heroBadge}>Live coaching AI recommends your next set</div>
        </div>
      </div>
    </section>
  );
}