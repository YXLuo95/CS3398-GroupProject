import { Link } from "react-router-dom";
import styles from "../../pages/Home.module.css";

export default function FinalCTASection({ isLoggedIn }) {
  return (
    <section className={`${styles.section} ${styles.glassCard} ${styles.ctaPanel}`}>
      <span className={styles.tag}>Ready To Commit</span>
      <h2 className={styles.sectionTitle}>
        {isLoggedIn ? "Your Next Milestone Starts Now" : "Launch Your Fitness System Today"}
      </h2>
      <p className={styles.sectionSubtitle}>
        {isLoggedIn
          ? "Return to your dashboard and execute the next best action Falcon has prepared for you."
          : "Go from scattered workouts to a focused plan built around data, progress, and consistency."}
      </p>

      <div className={styles.ctaRow} style={{ justifyContent: "center" }}>
        {isLoggedIn ? (
          <>
            <Link to="/dashboard" className={styles.buttonPrimary}>
              View My Dashboard
            </Link>
            <Link to="/workouts" className={styles.buttonGhost}>
              Start Today Session
            </Link>
          </>
        ) : (
          <>
            <Link to="/signup" className={styles.buttonPrimary}>
              Get Started Free
            </Link>
            <Link to="/login" className={styles.buttonGhost}>
              Sign In
            </Link>
          </>
        )}
      </div>
    </section>
  );
}