import React, { useState, useContext, useEffect } from "react";
import Profile from "./Profile";
import "bootstrap/dist/css/bootstrap.min.css";
import Certification from "./Certifications";
// import Projects from "./Projects";
import Home from "./HomePage";
import { UserContext } from "./UserContext";
// import UserTasks from "./UserTasks";
import Projects from "./Projects";
import defaultImage from "../assets/default-profile.jpg";

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState("Home");
  const { user, loading } = useContext(UserContext); // Get loading state from UserContext

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
              className="rounded-circle overflow-hidden"
              style={{
                width: "48px",
                height: "48px",
                backgroundColor: "#7c3aed", // Fallback background color if the image fails to load
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "#fff",
              }}
            >
              <img
                src={user?.profilePicture || defaultImage } // Fallback image if user.profilePicture is not available
                alt="Profile"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover", // Ensure the image fills the circle without distortion
                }}
              />
            </div>
            <div className="ms-3">
              <h5 className="mb-0">{user?.fullName || "User"}</h5>
              <small>{user?.role || "Role not set"}</small>
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
          {/* <h2 className="text-white">Dashboard</h2> */}
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

export default Dashboard;
