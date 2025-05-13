import React, { useState, useContext, useEffect } from "react";
import Profile from "./Profile";
import "bootstrap/dist/css/bootstrap.min.css";
import Certification from "./Certifications";
import Projects from "./Projects";
import Home from "./HomePage";
import { UserContext } from "./UserContext";

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState("Home");
  const { user, loading } = useContext(UserContext); // Get loading state from UserContext
  const [hasRefreshed, setHasRefreshed] = useState(false); // Track if the page has been refreshed

  // Show loading screen while user data is being fetched
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

  // Handle the case where user is null
  if (!user) {
    if (!hasRefreshed) {
      // Refresh the page once
      setHasRefreshed(true);
      window.location.reload();
      return null; // Prevent rendering anything during the refresh
    }

    // If user is still null after refresh, show the "User not found" message
    return (
      <div
        className="d-flex justify-content-center align-items-center min-vh-100"
        style={{ backgroundColor: "#000", color: "#fff" }}
      >
        <h2>User not found. Please log in again.</h2>
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
              <h5 className="mb-0">{user.fullName}</h5>
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
          </nav>
        </div>

        {/* Logout */}
        <div>
          <a
            href="/"
            className="text-light d-flex align-items-center"
            style={{ textDecoration: "none" }}
            onClick={() => {
              localStorage.removeItem("token"); // Clear the token
              window.location.href = "/"; // Redirect to login
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
        {/* Main Content */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="text-white">Dashboard</h2>
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

export default Dashboard;