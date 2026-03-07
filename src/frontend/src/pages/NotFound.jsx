// NotFound page component
// This shows when a user goes to a route that doesn't exist (404).
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div>
      <h1>404 - Page Not Found</h1>
      <p>This page does not exist.</p>

      {/* Link sends the user back to the home page */}
      <Link to="/">Go back Home</Link>
    </div>
  );
}