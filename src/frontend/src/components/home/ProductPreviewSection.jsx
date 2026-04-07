import styles from "../../pages/Home.module.css";

const bars = [72, 55, 84, 64, 94, 77];

const kpis = [
  { value: "92%", label: "Workout adherence" },
  { value: "4.8x", label: "Faster weekly planning" },
  { value: "21", label: "Avg active days / month" }
];

export default function ProductPreviewSection() {
  return (
    <section className={`${styles.section} ${styles.glassCard}`}>
      <span className={styles.tag}>Product Preview</span>
      <h2 className={styles.sectionTitle}>A Real Dashboard Experience</h2>
      <p className={styles.sectionSubtitle}>
        Falcon Fitness delivers command-center clarity with actionable insights at every touchpoint.
      </p>

      <div className={styles.previewPanel}>
        <div className={styles.dashboardMock}>
          <div className={styles.mockHeader}>
            <strong>Performance Trend</strong>
            <span className={styles.tag}>This Week</span>
          </div>

          <div className={styles.mockBars}>
            {bars.map((value, index) => (
              <div
                key={index}
                className={styles.bar}
                style={{ height: `${value}%` }}
                aria-label={`Progress bar ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <div className={styles.statsCol}>
          {kpis.map((kpi) => (
            <div key={kpi.label} className={styles.statItem}>
              <div className={styles.statNumber}>{kpi.value}</div>
              <div className={styles.sectionSubtitle}>{kpi.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}