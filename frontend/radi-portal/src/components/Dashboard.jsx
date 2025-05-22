import React, { useState, useContext, useEffect } from "react";
import Profile from "./Profile";
import "bootstrap/dist/css/bootstrap.min.css";
import Certification from "./Certifications";
import Projects from "./Projects";
import Home from "./HomePage";
import UserTasks from "./UserTasks"; // Import the new UserTasks component
import ErrorBoundary from "./ErrorBoundary";
import { UserContext } from "./UserContext";
import defaultImage from "../assets/default-profile.jpg";
import {
  FaHome,
  FaUser,
  FaCertificate,
  FaProjectDiagram,
  FaTasks,
  FaSignOutAlt,
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Define currentDate for consistency
const currentDate = new Date();

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState("Home");
  const {
    user,
    loading: contextLoading,
    refetchUser,
  } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [profile, setProfile] = useState({
    profilePicture: "",
    name: "",
    role: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch("http://localhost:5000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const data = await response.json();
        console.log("User data from /api/auth/me:", data);
        if (response.ok) {
          setProfile({
            profilePicture: data.profilePicture || defaultImage,
            name: data.fullName || "User",
            role: data.role || "Role not set",
          });
        } else {
          console.error("Failed to fetch user data:", data.message);
          setProfile({
            profilePicture: defaultImage,
            name: "User",
            role: "Role not set",
          });
          setFetchError(data.message || "Failed to fetch user data");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setProfile({
          profilePicture: defaultImage,
          name: "User",
          role: "Role not set",
        });
        if (error.name === "AbortError") {
          setFetchError("Request timed out. Please try again later.");
        } else {
          setFetchError("Error fetching user data. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (contextLoading || isLoading) {
    return (
      <div
        className="d-flex flex-column justify-content-center align-items-center min-vh-100"
        style={{ backgroundColor: "#000", color: "#fff" }}
      >
        <div
          className="spinner-border mb-3"
          role="status"
          style={{ color: "#7c3aed" }}
        >
          <span className="visually-hidden">Loading...</span>
        </div>
        <h2>Loading...</h2>
        {fetchError && (
          <p
            className="text-danger mt-3"
            style={{ maxWidth: "300px", textAlign: "center" }}
          >
            {fetchError}
          </p>
        )}
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
      case "Tasks":
        return <UserTasks />;
      default:
        return <h2>Welcome back, {user?.fullName || "User"}!</h2>;
    }
  };

  return (
    <div
      className="d-flex min-vh-100"
      style={{ backgroundColor: "#000", color: "#fff" }}
    >
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover={false}
        theme="dark"
      />
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
                src={profile.profilePicture}
                alt="Profile"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
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
                title={profile.name}
              >
                {profile.name}
              </h5>
              <span
                style={{
                  backgroundColor: "rgba(124, 58, 237, 0.1)",
                  border: "1px solid rgba(124, 58, 237, 0.3)",
                  color: "#fff",
                  fontSize: "0.6rem",
                  fontFamily: "'Roboto', sans-serif",
                  padding: "4px 8px",
                  borderRadius: "12px",
                  whiteSpace: "normal",
                  lineHeight: "1.2",
                  display: "block",
                  textAlign: "left",
                  width: "100%",
                  boxSizing: "border-box",
                }}
              >
                {profile.role}
              </span>
            </div>
          </div>

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
              <FaHome className="me-2" /> Home
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
              <FaUser className="me-2" /> Profile
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
              <FaCertificate className="me-2" /> Certifications
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
              <FaProjectDiagram className="me-2" /> Projects
            </button>
            <button
              className={`nav-link text-white d-flex align-items-center ${
                activeSection === "Tasks" ? "bg-dark rounded mb-2" : ""
              }`}
              style={{
                padding: "10px",
                transition: "background-color 0.1s ease",
                border: "none",
                background: "none",
              }}
              onClick={() => setActiveSection("Tasks")}
            >
              <FaTasks className="me-2" /> Tasks
            </button>
          </nav>
        </div>

        <div>
          <a
            href="/"
            className="text-light d-flex align-items-center"
            style={{ textDecoration: "none" }}
            onClick={(e) => {
              e.preventDefault();
              localStorage.removeItem("token");
              window.location.href = "/";
            }}
          >
            <FaSignOutAlt className="me-2" /> Logout
          </a>
        </div>
      </aside>

      <div
        className="container py-4 flex-grow-1"
        style={{
          marginLeft: "250px",
          overflowY: "auto",
          height: "100vh",
        }}
      >
        {fetchError && <div className="alert alert-danger">{fetchError}</div>}
        {renderContent()}
      </div>
    </div>
  );
};

export default Dashboard;