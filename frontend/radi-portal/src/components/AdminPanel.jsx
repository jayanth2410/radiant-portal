import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "./UserContext";
import HomePage from "./HomePage";
import UserTable from "./UserTable";
import Tasks from "./Tasks";
import ErrorBoundary from "./ErrorBoundary";
import Profile from "./Profile";
import defaultImage from "../assets/default-profile.jpg";
import PromoteToAdmin from "./PromoteToAdmin";
import {
  FaHome,
  FaUser,
  FaUsers,
  FaTasks,
  FaCog,
  FaSignOutAlt,
  FaUserPlus,
} from "react-icons/fa";

// Define currentDate for display
const currentDate = new Date("2025-05-16T10:15:00+05:30");
const formattedDate = currentDate.toLocaleString("en-IN", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Kolkata",
});

const AdminDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [certificationFilter, setCertificationFilter] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [fetchError, setFetchError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, loading: contextLoading } = useContext(UserContext);
  const [adminRole, setAdminRole] = useState("");
  const [profilePicture, setProfilePicture] = useState(defaultImage);

  useEffect(() => {
    const fetchAdminData = async () => {
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
        if (response.ok) {
          setAdminRole(data.role || "Admin");
          setProfilePicture(data.profilePicture || defaultImage);
        } else {
          setFetchError(data.message || "Failed to fetch admin data");
          setAdminRole("Admin");
          setProfilePicture(defaultImage);
        }
      } catch (error) {
        console.error("Error fetching admin data:", error);
        if (error.name === "AbortError") {
          setFetchError("Request timed out. Please try again later.");
        } else {
          setFetchError("Error fetching admin data. Please try again.");
        }
        setAdminRole("Admin");
        setProfilePicture(defaultImage);
      }
    };

    const fetchUsers = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch("http://localhost:5000/api/users", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const data = await response.json();
        if (response.ok) {
          setUsers(data.users || []);
        } else {
          setFetchError(data.message || "Failed to fetch users");
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        if (error.name === "AbortError") {
          setFetchError("Request timed out. Please try again later.");
        } else {
          setFetchError("Error fetching users. Please try again.");
        }
      }
    };

    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchAdminData(), fetchUsers()]);
      setIsLoading(false);
    };

    if (user) {
      loadData();
    }
  }, [user]); // Added user as dependency

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

  if (!user || user.category !== "admin") {
    return (
      <div
        className="d-flex justify-content-center align-items-center min-vh-100"
        style={{ backgroundColor: "#000", color: "#fff" }}
      >
        <h2>Access denied. Admins only.</h2>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case "Dashboard":
        return <HomePage />;
      case "Profile":
        return <Profile />;
      case "Users":
        return (
          <ErrorBoundary>
            <UserTable
              users={users}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              certificationFilter={certificationFilter}
              setCertificationFilter={setCertificationFilter}
              skillFilter={skillFilter}
              setSkillFilter={setSkillFilter}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              setUsers={setUsers}
            />
          </ErrorBoundary>
        );
      case "Tasks":
        return (
          <ErrorBoundary>
            <Tasks users={users} tasks={tasks} setTasks={setTasks} />
          </ErrorBoundary>
        );
      case "Settings":
        return <div>Settings Page</div>;
      case "promote-to-admin":
        return <PromoteToAdmin />;
      default:
        return <HomePage />;
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
                src={profilePicture}
                alt="Profile"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "50%",
                  backgroundColor: "#333",
                }}
                onError={(e) => {
                  console.log("[DEBUG] AdminDashboard image failed to load");
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
                title={user?.fullName || "Admin"}
              >
                {user?.fullName || "Admin"}
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
                {adminRole || "Admin"}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="nav flex-column">
            <button
              className={`nav-link text-white d-flex align-items-center ${
                activeSection === "Dashboard" ? "bg-dark rounded mb-2" : ""
              }`}
              style={{
                padding: "10px",
                transition: "background-color 0.1s ease",
                border: "none",
                background: "none",
              }}
              onClick={() => setActiveSection("Dashboard")}
            >
              <FaHome className="me-2" /> Dashboard
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
                activeSection === "Users" ? "bg-dark rounded mb-2" : ""
              }`}
              style={{
                padding: "10px",
                transition: "background-color 0.1s ease",
                border: "none",
                background: "none",
              }}
              onClick={() => setActiveSection("Users")}
            >
              <FaUsers className="me-2" /> Users
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
            <button
              className={`nav-link text-white d-flex align-items-center ${
                activeSection === "Settings" ? "bg-dark rounded mb-2" : ""
              }`}
              style={{
                padding: "10px",
                transition: "background-color 0.1s ease",
                border: "none",
                background: "none",
                pointerEvents: "none",
              }}
              onClick={() => setActiveSection("Settings")}
            >
              <FaCog className="me-2" /> Settings
            </button>
            <button
              className={`nav-link text-white d-flex align-items-center ${
                activeSection === "promote-to-admin"
                  ? "bg-dark rounded mb-2"
                  : ""
              }`}
              style={{
                padding: "10px",
                transition: "background-color 0.1s ease",
                border: "none",
                background: "none",
              }}
              onClick={() => setActiveSection("promote-to-admin")}
            >
              <FaUserPlus className="me-2" /> Promote User
            </button>
          </nav>
        </div>

        {/* Logout */}
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

      {/* Main content */}
      <main
        className="container py-4 flex-grow-1"
        style={{
          marginLeft: "250px",
          overflowY: "auto",
          height: "100vh",
        }}
      >
        {error && <div className="alert alert-danger">{error}</div>}
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminDashboard;
