/**
 * AppPage — Standard page wrapper for all Falcon Fitness pages.
 *
 * Props:
 *   eyebrow  - Small label above the title (e.g. "WORKOUTS")
 *   title    - Main page heading text
 *   accent   - Optional highlighted word appended to the title
 *   subtitle - Descriptive paragraph below heading
 *   actions  - JSX for CTA buttons in the header
 *   children - Page body content
 */
export default function AppPage({ eyebrow, title, accent, subtitle, actions, children }) {
  return (
    <main className="ff-page">
      <div className="ff-container">
        <header className="ff-header">
          {eyebrow && <span className="ff-eyebrow">{eyebrow}</span>}
          <h1 className="ff-title">
            {title}
            {accent && <> <span className="ff-title-accent">{accent}</span></>}
          </h1>
          {subtitle && <p className="ff-subtitle">{subtitle}</p>}
          {actions && <div className="ff-actions">{actions}</div>}
        </header>

        {children}
      </div>
    </main>
  );
}
