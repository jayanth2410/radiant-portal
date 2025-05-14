import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "./UserContext";
import HomePage from "./HomePage";
import UserTable from "./UserTable";
import Tasks from "./Tasks";
import ErrorBoundary from "./ErrorBoundary";
import Profile from "./Profile";
import defaultImage from "../assets/default-profile.jpg"; // adjust path if needed

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

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/auth/admin", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        if (!response.ok)
          setError(data.message || "Failed to fetch admin data");
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
        if (response.ok) setUsers(data.users);
        else setError(data.message || "Failed to fetch users");
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

  if (contextLoading || isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-black text-white">
        <h2>Loading...</h2>
      </div>
    );
  }

  if (!user || user.category !== "admin") {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-black text-white">
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
        <div>
          <div className="d-flex align-items-center mb-4">
            <img
              src={user.profileImage || defaultImage}
              alt="Profile"
              className="rounded-circle me-3"
              style={{ width: "48px", height: "48px", objectFit: "cover" }}
            />
            <div>
              <h6 className="mb-0 text-white">{user.fullName}</h6>
              <small className="text-muted">{user.category || "admin"}</small>
            </div>
          </div>

          <nav className="nav flex-column">
            {["Dashboard", "Profile", "Users", "Tasks", "Settings"].map(
              (section) => (
                <button
                  key={section}
                  className={`nav-link text-white ${
                    activeSection === section ? "bg-dark rounded mb-2" : ""
                  }`}
                  style={{
                    padding: "10px",
                    transition: "background-color 0.1s ease",
                    border: "none",
                    background: "none",
                    pointerEvents: section === "Settings" ? "none" : "auto",
                  }}
                  onClick={() => setActiveSection(section)}
                >
                  {section}
                </button>
              )
            )}
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
