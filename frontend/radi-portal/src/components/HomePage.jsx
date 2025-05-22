import React, { useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { UserContext } from "./UserContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaHome,
  FaUser,
  FaCertificate,
  FaProjectDiagram,
  FaSignOutAlt,
  FaClipboardCheck,
  FaSun,
  FaCheckCircle,
  FaTasks,
  FaAngleRight,
} from "react-icons/fa";

// Define currentDate (use current time for consistency)
const currentDate = new Date();

const HomePage = () => {
  const { user, refetchUser } = useContext(UserContext);
  const navigate = useNavigate();

  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [selectedTaskDescription, setSelectedTaskDescription] = useState("");
  const [pendingProjects, setPendingProjects] = useState(0);
  const [overdueTasks, setOverdueTasks] = useState(0);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);
  const [recentTasks, setRecentTasks] = useState([]);
  const [taskStatuses, setTaskStatuses] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [taskToAction, setTaskToAction] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [userMap, setUserMap] = useState({});
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);
  const [fetchUserError, setFetchUserError] = useState(null);

  // Combined effect for user data and tasks
  useEffect(() => {
    if (!user) {
      setPendingProjects(0);
      setOverdueTasks(0);
      setCompletionPercentage(0);
      setTotalTasks(0);
      setRecentTasks([]);
      setUserMap({});
      setIsFetchingUsers(false);
      setFetchUserError(null);
      setWelcomeMessage("");
      return;
    }

    let isMounted = true;

    // Set welcome message
    const activeSection = localStorage.getItem("activeSection");
    if (activeSection === "dashboard") {
      toast.info(
        "Welcome to your Dashboard! Here you can manage your tasks and projects.",
        { autoClose: 3000 }
      );
      setWelcomeMessage("");
    } else if (activeSection === "tasks") {
      setWelcomeMessage("Welcome to your Tasks! Manage your assignments here.");
    } else {
      setWelcomeMessage("Welcome back! Let’s get started.");
    }

    // Fetch users
    const fetchUsers = async (retryCount = 0, maxRetries = 2) => {
      if (!isMounted) return;

      setIsFetchingUsers(true);
      setFetchUserError(null);
      console.log("[DEBUG] Fetching users, attempt:", retryCount + 1);

      try {
        const response = await fetch("http://localhost:5000/api/users/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        console.log("[DEBUG] /api/users response status:", response.status);

        if (response.status === 401) {
          console.log("[DEBUG] Unauthorized, redirecting to login");
          localStorage.removeItem("token");
          toast.error("Session expired. Please log in again.", {
            autoClose: 2000,
          });
          if (isMounted) navigate("/login");
          return;
        }

        const data = await response.json();
        console.log("[DEBUG] /api/users response data:", data);

        if (response.ok && Array.isArray(data.users)) {
          const userDetails = {};
          data.users.forEach((u) => {
            userDetails[u._id] = { fullName: u.fullName || "Unknown" };
          });
          if (isMounted) {
            setUserMap(userDetails);
            console.log("[DEBUG] Users fetched successfully:", userDetails);
          }
        } else {
          throw new Error(data.message || "Failed to fetch users");
        }
      } catch (error) {
        console.error(
          "[ERROR] Fetching users, attempt:",
          retryCount + 1,
          error
        );
        if (retryCount < maxRetries) {
          console.log("[DEBUG] Retrying fetch users...");
          setTimeout(() => fetchUsers(retryCount + 1, maxRetries), 1000);
        } else {
          if (isMounted) {
            setFetchUserError(
              error.message || "Failed to load user names after retries."
            );
            toast.error(
              "Failed to load user names. Some data may be incomplete.",
              {
                autoClose: 2000,
              }
            );
          }
        }
      } finally {
        if (isMounted) {
          setIsFetchingUsers(false);
        }
      }
    };

    // Process tasks
    const processTasks = () => {
      if (!isMounted) return;

      console.log("[DEBUG] Processing tasks for user:", user._id);
      const taskField = user.category === "admin" ? "tasksCreated" : "tasks";
      let tasks = user[taskField] || [];

      const taskMap = new Map();
      tasks.forEach((task) => {
        if (task._id) {
          taskMap.set(task._id, task);
        }
      });
      tasks = Array.from(taskMap.values());

      const total = tasks.length;
      setTotalTasks(total);

      const pending = tasks.filter(
        (task) => task.status !== "completed"
      ).length;
      setPendingProjects(pending);

      const overdue = tasks.filter((task) => {
        const deadline = new Date(task.deadline);
        return task.status !== "completed" && deadline < currentDate;
      }).length;
      setOverdueTasks(overdue);

      const completedTasks = tasks.filter(
        (task) => task.status === "completed"
      ).length;

      const percentage =
        total > 0 ? Math.round((completedTasks / total) * 100) : 0;
      setCompletionPercentage(percentage);

      let recent = [];
      if (user.category === "admin") {
        recent = tasks.filter(
          (task) =>
            task.status === "resolved" ||
            task.status === "resolved after deadline"
        );
      } else {
        recent = tasks.filter((task) => task.status !== "completed");
      }

      recent = recent.sort(
        (a, b) => new Date(a.deadline) - new Date(b.deadline)
      );
      setRecentTasks(recent);

      const initialStatuses = {};
      recent.forEach((task) => {
        initialStatuses[task._id] = task.status || "in progress";
      });
      setTaskStatuses(initialStatuses);

      console.log("[DEBUG] Tasks processed, recentTasks:", recent);
    };

    // Execute fetch and task processing
    fetchUsers().then(() => {
      if (isMounted) processTasks();
    });

    return () => {
      isMounted = false;
    };
  }, [user, navigate]);

  const handleEsc = useCallback((event) => {
    if (event.key === "Escape") {
      console.log("[DEBUG] Escape key pressed, closing modals");
      closeModals();
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [handleEsc]);

  const closeModals = useCallback(() => {
    console.log("[DEBUG] Closing modals");
    setShowDescriptionModal(false);
    setSelectedTaskDescription("");
    setShowConfirmModal(false);
    setConfirmAction(null);
    setTaskToAction(null);
    setSelectedStatus(null);
  }, []);

  const handleViewDescription = (description) => {
    console.log("[DEBUG] Opening description modal");
    setSelectedTaskDescription(description);
    setShowDescriptionModal(true);
  };

  const initiateAction = (taskId, action, status = null) => {
    console.log("[DEBUG] Initiating action:", action, "for task:", taskId);
    setTaskToAction(taskId);
    setConfirmAction(action);
    setSelectedStatus(status);
    setShowConfirmModal(true);
  };

  const handleAction = async () => {
    if (!taskToAction || !confirmAction) {
      console.log("[DEBUG] No task or action to perform");
      return;
    }

    let status, completed;
    if (confirmAction === "reassign") {
      status = "in progress";
      completed = false;
    } else if (confirmAction === "mark-completed") {
      status = "completed";
      completed = true;
    } else if (confirmAction === "update-status") {
      status = selectedStatus;
      completed = status === "resolved";
    } else {
      console.log("[DEBUG] Invalid action:", confirmAction);
      return;
    }

    try {
      var date = new Date();
      const response = await fetch(
        `http://localhost:5000/api/tasks/update-status/${taskToAction}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ status, completed, date }),
        }
      );

      const data = await response.json();
      console.log("[DEBUG] Task status update response:", data);

      if (response.ok) {
        if (confirmAction === "mark-completed") {
          setRecentTasks((prevTasks) =>
            prevTasks.filter((task) => task._id !== taskToAction)
          );
        }
        await refetchUser();

        setTimeout(() => {
          toast.success(data.message || "Task status updated successfully", {
            autoClose: 2000,
          });
        }, 100);
      } else {
        toast.error(data.message || "Failed to update task status", {
          autoClose: 2000,
        });
      }
    } catch (error) {
      console.error(`[ERROR] Performing action ${confirmAction}:`, error);
      toast.error(
        `Failed to ${
          confirmAction === "reassign"
            ? "reassign task"
            : confirmAction === "mark-completed"
            ? "mark task as completed"
            : "update status"
        }.`,
        { autoClose: 2000 }
      );
    } finally {
      closeModals();
    }
  };

  const handleUndoComplete = async (taskId) => {
    const newStatus = taskStatuses[taskId];
    if (!newStatus) {
      toast.error("Please select a status", { autoClose: 2000 });
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/tasks/update-status/${taskId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ status: newStatus, completed: false }),
        }
      );

      const data = await response.json();
      console.log("[DEBUG] Undo complete response:", data);

      if (response.ok) {
        toast.success(data.message || "Task status updated successfully", {
          autoClose: 2000,
        });
        await refetchUser();
      } else {
        toast.error(data.message || "Failed to undo task completion", {
          autoClose: 2000,
        });
      }
    } catch (error) {
      console.error("[ERROR] Undoing task completion:", error);
      toast.error("Failed to undo task completion.", { autoClose: 2000 });
    }
  };

  const handleDropdownChange = (taskId, value) => {
    setTaskStatuses((prev) => ({
      ...prev,
      [taskId]: value,
    }));
  };

  return (
    <div className="flex-grow-1 mb-5">
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
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2
            className="mb-4 text-white fw-bold"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            <i className="bi bi-person-raised-hand"></i> Welcome back,{" "}
            {user?.fullName || "User"}
          </h2>
          <p className="text-info">{welcomeMessage}</p>
        </div>
      </div>
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-dark text-white mb-3">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h5>Active Projects</h5>
                  <h3>{pendingProjects}</h3>
                  <small className="text-success">⬆ 4 from last month</small>
                </div>
                <FaClipboardCheck size={30} />
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-dark text-white mb-3">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h5>Overdue Tasks</h5>
                  <h3>{overdueTasks}</h3>
                  <small className="text-danger">Past deadline</small>
                </div>
                <FaSun size={30} />
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-dark text-white mb-3">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h5>Task Completion</h5>
                  <h3>{completionPercentage}%</h3>
                  <small className="text-success">⬆ 6% from last week</small>
                </div>
                <FaCheckCircle size={30} />
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-dark text-white mb-3">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h5>Total Tasks</h5>
                  <h3>{totalTasks}</h3>
                  <small className="text-info">Total assigned tasks</small>
                </div>
                <FaTasks size={30} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="card bg-dark text-white" style={{ width: "100%" }}>
        <div className="card-body">
          <h3 className="mb-4">
            {user && user.category === "admin" ? "Resolved Tasks" : "My Tasks"}
          </h3>
          {isFetchingUsers || Object.keys(userMap).length === 0 ? (
            <div className="text-center my-4">
              <span
                className="spinner-border text-info"
                role="status"
                aria-hidden="true"
              ></span>
              <span className="ms-2">Loading users...</span>
            </div>
          ) : recentTasks.length > 0 ? (
            <div style={{ width: "100%", overflowX: "auto" }}>
              <table
                className="table table-dark table-hover mb-0"
                style={{ tableLayout: "fixed", width: "100%" }}
              >
                <thead style={{ textAlign: "center" }}>
                  <tr>
                    <th style={{ width: "30%" , textAlign: "left"}}>Title</th>
                    <th style={{ width: "15%" }}>Description</th>
                    <th style={{ width: "10%" }}>Assigned By</th>
                    {user && user.category === "admin" && (
                      <th style={{ width: "20%" }}>Assigned To</th>
                    )} 
                    <th
                      style={{
                        width:
                          user && user.category === "admin" ? "15%" : "25%",
                      }}
                    >
                      Due Date
                    </th>
                    <th style={{ width: "20%" }}>Actions</th>
                  </tr>
                </thead>
                <tbody style={{textAlign: "center"}}>
                  {recentTasks.map((task, index) => (
                    <tr key={`${task._id}-${index}`}>
                      <td
                        style={{
                          width: "30%",
                          whiteSpace: "normal",
                          textAlign: "left",
                          overflowWrap: "break-word",
                        }}
                      >
                        {task.title || "Untitled"}
                      </td>
                      <td
                        style={{
                          width: "15%",
                          whiteSpace: "normal",
                          overflowWrap: "break-word",
                        }}
                      >
                        <button
                          className="btn btn-outline-info btn-sm w-100"
                          onClick={() =>
                            handleViewDescription(task.description)
                          }
                          style={{
                            whiteSpace: "normal",
                            overflowWrap: "break-word",
                          }}
                        >
                          View Description
                        </button>
                      </td>
                      <td
                        style={{
                          width: "10%",
                          whiteSpace: "normal",
                          overflowWrap: "break-word",
                        }}
                      >
                        {typeof task.assignedBy === "string"
                          ? task.assignedBy === user?._id
                            ? "You"
                            : userMap[task.assignedBy]?.fullName || "N/A"
                          : task.assignedBy?._id === user?._id
                          ? "You"
                          : task.assignedBy?.fullName ||
                            userMap[task.assignedBy?._id]?.fullName ||
                            "N/A"}
                      </td>
                      {user && user.category === "admin" && (
                        <td
                          style={{
                            width: "20%",
                            whiteSpace: "normal",
                            overflowWrap: "break-word",
                          }}
                        >
                          {Array.isArray(task.assignedTo)
                            ? task.assignedTo
                                .map(
                                  (userId) =>
                                    userMap[userId]?.fullName || userId.fullName
                                )
                                .join(", ") || "N/A2"
                            : "N/A3"}
                        </td>
                      )}
                      <td
                        style={{
                          width:
                            user && user.category === "admin" ? "15%" : "25%",
                          whiteSpace: "normal",
                          overflowWrap: "break-word",
                        }}
                      >
                        {task.deadline
                          ? new Date(task.deadline).toLocaleString()
                          : "No deadline"}
                      </td>
                      <td style={{ width: "20%" }}>
                        {user && user.category === "admin" ? (
                          <div className="d-flex flex-column gap-2">
                            <button
                              className="btn btn-outline-primary btn-sm"
                              onClick={() =>
                                initiateAction(task._id, "reassign")
                              }
                            >
                              Reassign
                            </button>
                            <button
                              className="btn btn-outline-success btn-sm"
                              onClick={() =>
                                initiateAction(task._id, "mark-completed")
                              }
                            >
                              Complete
                            </button>
                          </div>
                        ) : (
                          <div className="d-flex flex-column gap-2">
                            <div className="d-flex align-items-center gap-2">
                              <select
                                className="form-select bg-dark text-white"
                                value={
                                  [
                                    "in progress",
                                    "testing",
                                    "resolved",
                                  ].includes(taskStatuses[task._id])
                                    ? taskStatuses[task._id]
                                    : "resolved"
                                }
                                onChange={(e) =>
                                  handleDropdownChange(task._id, e.target.value)
                                }
                              >
                                <option value="in progress">In Progress</option>
                                <option value="testing">Testing</option>
                                <option value="resolved">Resolved</option>
                              </select>

                              <button
                                className="btn btn-outline-success btn-sm"
                                onClick={() =>
                                  initiateAction(
                                    task._id,
                                    "update-status",
                                    taskStatuses[task._id]
                                  )
                                }
                              >
                                Save
                              </button>
                            </div>
                            {task.completed && (
                              <button
                                className="btn btn-outline-warning btn-sm"
                                onClick={() => handleUndoComplete(task._id)}
                              >
                                Undo
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted">
              {user && user.category === "admin"
                ? "No resolved tasks to display."
                : "No recent activity to display."}
            </p>
          )}
        </div>
      </div>
      {showDescriptionModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          tabIndex="-1"
          role="dialog"
          onClick={closeModals}
        >
          <div
            className="modal-dialog modal-lg"
            role="document"
            onClick={(e) => {
              e.stopPropagation();
              console.log(
                "[DEBUG] Clicked inside description modal, preventing close"
              );
            }}
          >
            <div className="modal-content bg-dark text-white">
              <div className="modal-header">
                <h5 className="modal-title">Task Description</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    console.log(
                      "[DEBUG] Description modal close button clicked"
                    );
                    closeModals();
                  }}
                  aria-label="Close"
                ></button>
              </div>
              <div
                className="modal-body"
                style={{ maxHeight: "400px", overflowY: "auto" }}
              >
                <p>{selectedTaskDescription}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      {showConfirmModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          tabIndex="-1"
          role="dialog"
          onClick={closeModals}
        >
          <div
            className="modal-dialog"
            role="document"
            onClick={(e) => {
              e.stopPropagation();
              console.log(
                "[DEBUG] Clicked inside confirm modal, preventing close"
              );
            }}
          >
            <div className="modal-content bg-dark text-white">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Action</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    console.log("[DEBUG] Confirm modal close button clicked");
                    closeModals();
                  }}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  {confirmAction === "reassign"
                    ? "Confirm reassign the task?"
                    : confirmAction === "mark-completed"
                    ? "Confirm mark the task as completed?"
                    : `Confirm mark the status as ${selectedStatus}?`}
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    console.log("[DEBUG] Confirm modal 'No' button clicked");
                    closeModals();
                  }}
                >
                  No
                </button>
                <button
                  type="button"
                  className="btn btn-dark"
                  onClick={handleAction}
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
