import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "./UserContext"; // Assuming this is your context file
import HomePage from "./HomePage"; // Adjust imports as needed
import UserTable from "./UserTable";
import Tasks from "./Tasks";
import ErrorBoundary from "./ErrorBoundary";

const AdminDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [certificationFilter, setCertificationFilter] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { user, loading: contextLoading } = useContext(UserContext);

  // Fetch admin user data (if not already handled by UserContext)
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/auth/admin", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          console.log("Admin User Data:", data.user);
          // If UserContext doesn't set the user, you can set it in local state
          // For now, we assume UserContext handles this
        } else {
          setError(data.message || "Failed to fetch admin data");
        }
      } catch (error) {
        console.error("Error fetching admin data:", error);
        setError("Error fetching admin data");
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/users", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setUsers(data.users);
          console.log("Users Data in AdminPanel:", data.users);
        } else {
          setError(data.message || "Failed to fetch users");
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Error fetching users");
      }
    };

    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchAdminData(), fetchUsers()]);
      setIsLoading(false);
    };

    loadData();
  }, []);

  // Log user data from context (for debugging)
  useEffect(() => {
    if (user) {
      console.log("Admin User Data from Context:", user);
    }
  }, [user]);

  // Combine loading states
  if (contextLoading || isLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center min-vh-100"
        style={{ backgroundColor: "#121212", color: "#fff" }}
      >
        <h2>Loading...</h2>
      </div>
    );
  }

  // If user is not an admin, show an error (optional, depending on your requirements)
  if (!user || user.category !== "admin") {
    return (
      <div
        className="d-flex justify-content-center align-items-center min-vh-100"
        style={{ backgroundColor: "#121212", color: "#fff" }}
      >
        <h2>Access denied. Admins only.</h2>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case "Dashboard":
        return <HomePage />;
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
      default:
        return <HomePage />;
    }
  };

  return (
    <div
      className="d-flex"
      style={{ minHeight: "100vh", backgroundColor: "#121212" }}
    >
      <div
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
            <div className="ms-3 text-white">
              <h5 className="mb-0">{user.fullName}</h5>
              <small>{user.category || "Admin"}</small>
            </div>
          </div>

          <nav className="nav flex-column">
            <button
              className={`nav-link text-white ${
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
              Dashboard
            </button>
            <button
              className={`nav-link text-white ${
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
              Users
            </button>
            <button
              className={`nav-link text-white ${
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
              Tasks
            </button>
            <button
              className={`nav-link text-white ${
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
              Settings
            </button>
          </nav>
        </div>

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
      </div>

      <div
        className="container py-4 flex-grow-1"
        style={{
          marginLeft: "250px",
          overflowY: "auto",
          height: "100vh",
        }}
      >
        {error && <div className="alert alert-danger">{error}</div>}
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;