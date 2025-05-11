import React, { useState } from "react";
import Profile from "./Profile";
import "bootstrap/dist/css/bootstrap.min.css";

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState("Home");

  const renderContent = () => {
    switch (activeSection) {
      case "Home":
        return <h2>Welcome back, Sri! Here's what's happening with your projects today.</h2>;
      case "Profile":
        return <Profile />;
      case "Certifications":
        return <h2>Certifications Section: View and manage your certifications.</h2>;
      case "Projects":
        return <h2>Projects Section: Track and manage your projects here.</h2>;
      default:
        return <h2>Welcome back, Sri!</h2>;
    }
  };

  return (
    <div className="d-flex min-vh-100" style={{ backgroundColor: "#000", color: "#fff" }}>
      {/* Sidebar */}
      <aside
        className="d-flex flex-column justify-content-between p-3"
        style={{ width: "250px", backgroundColor: "#111", borderRight: "1px solid #444" }}
      >
        <div>
          <div className="d-flex align-items-center mb-4">
            <div
              className="rounded-circle"
              style={{
                width: "48px",
                height: "48px",
                backgroundColor: "#7c3aed",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "#fff",
              }}
            >
              <i className="bi bi-person"></i>
            </div>
            <div className="ms-3">
              <h5 className="mb-0">Sri</h5>
              <small>Developer</small>
            </div>
          </div>
          <nav className="nav flex-column">
            <button
              className={`nav-link text-white ${activeSection === "Home" ? "bg-dark rounded mb-2" : ""}`}
              style={{ padding: "10px", transition: "background-color 0.1s ease", border: "none", background: "none" }}
              onClick={() => setActiveSection("Home")}
            >
              Home
            </button>
            <button
              className={`nav-link text-white ${activeSection === "Profile" ? "bg-dark rounded mb-2" : ""}`}
              style={{ padding: "10px", transition: "background-color 0.1s ease", border: "none", background: "none" }}
              onClick={() => setActiveSection("Profile")}
            >
              Profile
            </button>
            <button
              className={`nav-link text-white ${activeSection === "Certifications" ? "bg-dark rounded mb-2" : ""}`}
              style={{ padding: "10px", transition: "background-color 0.1s ease", border: "none", background: "none" }}
              onClick={() => setActiveSection("Certifications")}
            >
              New Courses
            </button>
            <button
              className={`nav-link text-white ${activeSection === "Projects" ? "bg-dark rounded mb-2" : ""}`}
              style={{ padding: "10px", transition: "background-color 0.1s ease", border: "none", background: "none" }}
              onClick={() => setActiveSection("Projects")}
            >
              Projects Allocated
            </button>
          </nav>
        </div>
        <div>
          <a
            href="#logout"
            className="text-light d-flex align-items-center"
            style={{ textDecoration: "none" }}
          >
            <i className="bi bi-box-arrow-right me-2"></i> Logout
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow-1 p-4">
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;