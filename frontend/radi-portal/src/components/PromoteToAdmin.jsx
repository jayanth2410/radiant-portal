import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast, ToastContainer } from "react-toastify";

// Define currentDate for consistency (10:49 AM IST on May 16, 2025)
const currentDate = new Date("2025-05-16T10:49:00+05:30");
const formattedDate = currentDate.toLocaleString("en-IN", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Kolkata",
});

const PromoteToAdmin = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [userToPromote, setUserToPromote] = useState(null);
  const [totalUsers, setTotalUsers] = useState(0); // To track total users before filtering

  useEffect(() => {
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
          console.log("API Response (data.users):", data.users); // Debug the response
          if (!Array.isArray(data.users)) {
            throw new Error(
              "Expected an array of users, but got: " + typeof data.users
            );
          }

          setTotalUsers(data.users.length); // Store total users before filtering
          // Filter users with category "user" (case-insensitive)
          const filteredUsers = data.users.filter(
            (user) => user.category && user.category.toLowerCase() === "user"
          );
          console.log("Filtered Users:", filteredUsers); // Debug the filtered result
          setUsers(filteredUsers);
          if (filteredUsers.length === 0 && data.users.length > 0) {
            const errorMessage =
              "No users with category 'user' found. Total users fetched: " +
              data.users.length;
            setError(errorMessage);
            toast.error(errorMessage, { autoClose: 5000 });
          }
        } else {
          setError(data.message || "Failed to fetch users.");
          toast.error(data.message || "Failed to fetch users.", {
            autoClose: 5000,
          });
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        let errorMessage;
        if (err.name === "AbortError") {
          errorMessage = "Request timed out. Please try again later.";
        } else {
          errorMessage = err.message || "Failed to fetch users.";
        }
        setError(errorMessage);
        toast.error(errorMessage, { autoClose: 5000 });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    // Clear error or success messages after 5 seconds
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const initiatePromote = (userId) => {
    setUserToPromote(userId);
    setShowConfirmModal(true);
  };

  const handlePromote = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(
        `http://localhost:5000/api/auth/promote-to-admin/${userToPromote}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      const data = await response.json();
      if (response.ok) {
        const successMessage =
          data.message || "User promoted to admin successfully.";
        setSuccess(successMessage);
        toast.success(successMessage, { autoClose: 5000 });
        setUsers(users.filter((user) => user._id !== userToPromote));
        setShowConfirmModal(false);
        setUserToPromote(null);
      } else {
        const errorMessage = data.message || "Failed to promote user.";
        setError(errorMessage);
        toast.error(errorMessage, { autoClose: 5000 });
      }
    } catch (err) {
      console.error("Error promoting user:", err);
      let errorMessage;
      if (err.name === "AbortError") {
        errorMessage = "Request timed out. Please try again later.";
      } else {
        errorMessage = "Failed to promote user.";
      }
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 5000 });
    }
  };

  if (isLoading) {
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
        {error && (
          <p
            className="text-danger mt-3"
            style={{ maxWidth: "300px", textAlign: "center" }}
          >
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover={false}
        theme="dark"
      />

      <div className="text-white">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2
            className="mb-4 text-white fw-bold"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Promote Users to Admin
          </h2>
        </div>

        {users.length > 0 ? (
          <div className="card bg-dark text-white" style={{ width: "100%" }}>
            <div className="card-body">
              <h3 className="mb-4">Available Users</h3>
              <table
                className="table table-dark table-hover mb-0"
                style={{ tableLayout: "fixed", width: "100%" }}
              >
                <thead>
                  <tr>
                    <th style={{ width: "30%" }}>Name</th>
                    <th style={{ width: "40%" }}>Email</th>
                    <th style={{ width: "30%" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td
                        style={{
                          width: "30%",
                          whiteSpace: "normal",
                          overflowWrap: "break-word",
                        }}
                      >
                        {user.fullName}
                      </td>
                      <td
                        style={{
                          width: "40%",
                          whiteSpace: "normal",
                          overflowWrap: "break-word",
                        }}
                      >
                        {user.email}
                      </td>
                      <td style={{ width: "30%" }}>
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => initiatePromote(user._id)}
                        >
                          Promote to Admin
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="text-muted">
            {totalUsers > 0
              ? `No users with category 'user' found out of ${totalUsers} total users.`
              : "No users available to promote."}
          </p>
        )}

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div
            className="modal fade show d-block"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            tabIndex="-1"
            role="dialog"
          >
            <div className="modal-dialog" role="document">
              <div className="modal-content bg-dark text-white">
                <div className="modal-header">
                  <h5 className="modal-title">Confirm Promotion</h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setShowConfirmModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>
                    Are you sure you want to promote this user to admin? This
                    action cannot be undone.
                  </p>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowConfirmModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handlePromote}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PromoteToAdmin;
