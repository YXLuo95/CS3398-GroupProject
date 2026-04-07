/**
 * SectionCard — Reusable glass card section with optional top title row.
 *
 * Props:
 *   title    - Section heading
 *   subtitle - Smaller descriptive text below heading
 *   actions  - JSX rendered below children (e.g. a CTA button row)
 *   noPad    - Skip the default pad div (for custom padding needs)
 *   style    - Extra inline styles for the outer card
 *   children - Card body content
 */
export default function SectionCard({ title, subtitle, actions, noPad, style, children }) {
  return (
    <section className="ff-card ff-section" style={style}>
      <div className="ff-accent-bar" />
      <div className={noPad ? undefined : "ff-card-pad"}>
        {(title || subtitle) && (
          <div style={{ marginBottom: "1.2rem" }}>
            {title && (
              <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700, color: "#f8fbff" }}>
                {title}
              </h2>
            )}
            {subtitle && (
              <p style={{ margin: "0.38rem 0 0", color: "#a7b4c9", fontSize: "0.88rem", lineHeight: 1.55 }}>
                {subtitle}
              </p>
            )}
          </div>
        )}

        {children}

        {actions && <div className="ff-actions">{actions}</div>}
      </div>
    </section>
  );
}
