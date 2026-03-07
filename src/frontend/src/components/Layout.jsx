// Import Outlet from react-router-dom.
// Outlet is a placeholder where the page content will render.
import { Outlet } from "react-router-dom";

// Import the Navbar and Footer components
// These will appear on every page of the website.
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";

// Layout component acts as the "shell" of the website.
// It wraps every page with a consistent structure.
export default function Layout() {

  return (

    // This main container holds the entire page layout
    // minHeight: 100vh ensures the page takes up the full screen height
    // display: flex and flexDirection: column stacks items vertically
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* Navbar appears at the top of every page */}
      <Navbar />

      {/* 
        Main content area
        flex:1 pushes the footer to the bottom
        maxWidth centers the content nicely
      */}
      <main
        style={{
          flex: 1,
          padding: "16px",
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >

        {/* 
          Outlet renders whichever page is currently active.
          Example:
          "/" loads Home.jsx
          "/about" loads About.jsx
        */}
        <Outlet />

      </main>

      {/* Footer appears at the bottom of every page */}
      <Footer />

    </div>
  );
}