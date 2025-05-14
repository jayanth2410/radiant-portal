import React, { useState, useContext, useEffect } from "react";
import Profile from "./Profile";
import "bootstrap/dist/css/bootstrap.min.css";
import Certification from "./Certifications";
import Projects from "./Projects";
import Home from "./HomePage";
import Test from "./Home";
import { UserContext } from "./UserContext";
import defaultImage from "../assets/default-profile.jpg";

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState("Home");
  const { user, loading } = useContext(UserContext);

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center min-vh-100"
        style={{ backgroundColor: "#000", color: "#fff" }}
      >
        <h2>Loading...</h2>
      </div>
    );
  }

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
      case "Testing":
        return <Test />;
      default:
        return <h2>Welcome back, {user.fullName}!</h2>;
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
          position: "fixed",
          top: 0,
          bottom: 0,
          left: 0,
        }}
      >
        {/* User Info */}
        <div>
          <div
            className="d-flex align-items-start mb-4 p-2 rounded"
            style={{
              background: "linear-gradient(135deg, #1f1f1f 0%, #2c2c2c 100%)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.5)",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.02)";
              e.currentTarget.style.boxShadow =
                "0 6px 15px rgba(124, 58, 237, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.5)";
            }}
          >
            <div
              className="rounded-circle overflow-hidden flex-shrink-0"
              style={{
                width: "60px",
                height: "60px",
                aspectRatio: "1 / 1",
                background: "linear-gradient(45deg, #7c3aed, #db2777)",
                padding: "3px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <img
                src={user?.profilePicture || defaultImage}
                alt="Profile"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  borderRadius: "50%",
                  backgroundColor: "#333",
                }}
                onError={(e) => {
                  console.log("[DEBUG] Sidebar image failed to load");
                  e.target.src = defaultImage;
                }}
              />
            </div>
            <div
  className="ms-3 d-flex flex-column"
  style={{
    flex: 1,
    overflow: "hidden",
  }}
>
  <h5
    className="mb-1 text-truncate"
    style={{
      fontFamily: "'Poppins', sans-serif",
      fontWeight: 600,
      fontSize: "1.1rem",
      color: "#fff",
      transition: "color 0.2s ease",
      maxWidth: "150px",
    }}
    onMouseEnter={(e) => (e.target.style.color = "#7c3aed")}
    onMouseLeave={(e) => (e.target.style.color = "#fff")}
    title={user?.fullName || "User"}
  >
    {user?.fullName || "User"}
  </h5>
  <span
    style={{
      backgroundColor: "rgba(124, 58, 237, 0.1)", // Softer background for better contrast
      border: "1px solid rgba(124, 58, 237, 0.3)", // Subtle border
      color: "#fff",
      fontSize: "0.6rem",
      fontFamily: "'Roboto', sans-serif",
      padding: "4px 8px 4px 8px", // Consistent padding, no extra left indent
      borderRadius: "12px",
      whiteSpace: "normal",
      lineHeight: "1.2",
      display: "block", // Ensure it takes the full width
      textAlign: "left", // Explicitly left-align the text
      width: "100%", // Span the full width of the parent
      boxSizing: "border-box", // Include padding in width calculation
    }}
  >
    {user?.role || "Role not set"}
  </span>
</div>
          </div>

          {/* Navigation Links */}
          <nav className="nav flex-column">
            <button
              className={`nav-link text-white d-flex align-items-center ${
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
              <i className="bi bi-house-door me-2"></i> Home
            </button>
            <button
              className={`nav-link text-white d-flex align-items-center ${
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
              <i className="bi bi-person me-2"></i> Profile
            </button>
            <button
              className={`nav-link text-white d-flex align-items-center ${
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
              <i className="bi bi-award me-2"></i> Certifications
            </button>
            <button
              className={`nav-link text-white d-flex align-items-center ${
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
              <i className="bi bi-kanban me-2"></i> Projects
            </button>
            <button
              className={`nav-link text-white d-flex align-items-center ${
                activeSection === "Testing" ? "bg-dark rounded mb-2" : ""
              }`}
              style={{
                padding: "10px",
                transition: "background-color 0.1s ease",
                border: "none",
                background: "none",
              }}
              onClick={() => setActiveSection("Testing")}
            >
              <i className="bi bi-gear me-2"></i> Testing
            </button>
          </nav>
        </div>

        {/* Logout */}
        <div>
          <a
            href="/"
            className="text-light d-flex align-items-center"
            style={{ textDecoration: "none" }}
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/";
            }}
          >
            <i className="bi bi-box-arrow-right me-2"></i> Logout
          </a>
        </div>
      </aside>

      {/* Content Area */}
      <div
        className="container py-4 flex-grow-1"
        style={{
          marginLeft: "250px",
          overflowY: "auto",
          height: "100vh",
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-4"></div>
        {renderContent()}
      </div>
    </div>
  );
};

export default Dashboard;