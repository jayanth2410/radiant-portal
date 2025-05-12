import React, { useState } from "react";
import Profile from "./Profile";
import "bootstrap/dist/css/bootstrap.min.css";
import Certification from "./Certifications";
import Projects from "./Projects";
import Home from "./HomePage";

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState("Home");

  const renderContent = () => {
    switch (activeSection) {
      case "Home":
        return <Home />;
      case "Profile":
        return <Profile />;
      case "Certifications":
        return <Certification />;
      case "Projects":
        return <Projects />;
      default:
        return <h2>Welcome back, username!</h2>;
    }
  };

  return (
    <div
      className="d-flex min-vh-100"
      style={{ backgroundColor: "#000", color: "#fff" }}
    >
      {/* Sidebar */}
      <aside
        className="d-flex flex-column justify-content-between p-3"
        style={{
          width: "250px",
          backgroundColor: "#111",
          borderRight: "1px solid #444",
          position: "fixed", // Fix the sidebar
          top: 0,
          bottom: 0,
          left: 0,
        }}
      >
        {/* User Info */}
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
              <h5 className="mb-0">Username</h5>
              <small>Developer</small>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="nav flex-column">
            <button
              className={`nav-link text-white ${
                activeSection === "Home" ? "bg-dark rounded mb-2" : ""
              }`}
              style={{
                padding: "10px",
                transition: "background-color 0.1s ease",
                border: "none",
                background: "none",
              }}
              onClick={() => setActiveSection("Home")}
            >
              Home
            </button>
            <button
              className={`nav-link text-white ${
                activeSection === "Profile" ? "bg-dark rounded mb-2" : ""
              }`}
              style={{
                padding: "10px",
                transition: "background-color 0.1s ease",
                border: "none",
                background: "none",
              }}
              onClick={() => setActiveSection("Profile")}
            >
              Profile
            </button>
            <button
              className={`nav-link text-white ${
                activeSection === "Certifications" ? "bg-dark rounded mb-2" : ""
              }`}
              style={{
                padding: "10px",
                transition: "background-color 0.1s ease",
                border: "none",
                background: "none",
              }}
              onClick={() => setActiveSection("Certifications")}
            >
              Certifications
            </button>
            <button
              className={`nav-link text-white ${
                activeSection === "Projects" ? "bg-dark rounded mb-2" : ""
              }`}
              style={{
                padding: "10px",
                transition: "background-color 0.1s ease",
                border: "none",
                background: "none",
              }}
              onClick={() => setActiveSection("Projects")}
            >
              Projects
            </button>
            <button
              className={`nav-link text-white ${
                activeSection === "Allocations" ? "bg-dark rounded mb-2" : ""
              }`}
              style={{
                padding: "10px",
                transition: "background-color 0.1s ease",
                border: "none",
                background: "none",
              }}
              onClick={() => setActiveSection("Allocations")}
            >
              Allocations
            </button>
          </nav>
        </div>

        {/* Logout */}
        <div>
          <a
            href="/"
            className="text-light d-flex align-items-center"
            style={{ textDecoration: "none" }}
          >
            <i className="bi bi-box-arrow-right me-2"></i> Logout
          </a>
        </div>
      </aside>

      {/* Content Area */}
      <div
        className="container py-4 flex-grow-1"
        style={{
          marginLeft: "250px", // Offset the content to the right of the fixed sidebar
          overflowY: "auto", // Enable scrolling for the content area
          height: "100vh", // Ensure the content area takes the full viewport height
        }}
      >
        {/* Main Content */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="text-white">Dashboard</h2>
        </div>

        {/* Add your dashboard content here */}
        {renderContent()}
      </div>
    </div>
  );
};

export default Dashboard;
