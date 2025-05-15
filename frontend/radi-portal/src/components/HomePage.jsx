import React, { useContext, useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { UserContext } from "./UserContext";
import { toast } from "react-toastify";
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
} from "react-icons/fa";

// Define currentDate outside the component to prevent re-creation on every render
// Current date and time: May 14, 2025, 06:32 PM IST
const currentDate = new Date("2025-05-14T18:32:00+05:30");

const HomePage = () => {
  const { user, refetchUser } = useContext(UserContext);

  // State for marking/undoing task completion
  const [showConfirmComplete, setShowConfirmComplete] = useState(false);
  const [showConfirmUndo, setShowConfirmUndo] = useState(false);
  const [taskToComplete, setTaskToComplete] = useState(null);
  const [taskToUndo, setTaskToUndo] = useState(null);
  const [confirmInput, setConfirmInput] = useState("");

  // State for derived values
  const [pendingProjects, setPendingProjects] = useState(0);
  const [overdueTasks, setOverdueTasks] = useState(0);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);
  const [recentTasks, setRecentTasks] = useState([]);

  // Recalculate derived values when user changes
  useEffect(() => {
    if (!user) {
      setPendingProjects(0);
      setOverdueTasks(0);
      setCompletionPercentage(0);
      setTotalTasks(0);
      setRecentTasks([]);
      return;
    }

    const taskField = user.category === "admin" ? "tasksCreated" : "tasks";
    let tasks = user[taskField] || [];

    // Deduplicate tasks by _id
    const taskMap = new Map();
    tasks.forEach((task) => {
      if (task._id) {
        taskMap.set(task._id, task);
      }
    });
    tasks = Array.from(taskMap.values());

    // Count total tasks
    const total = tasks.length;
    setTotalTasks(total);

    // Count pending projects (status: "pending")
    const pending = tasks.filter((task) => task.status === "pending").length;
    setPendingProjects(pending);

    // Count overdue tasks (status: "pending" and deadline < current date)
    const overdue = tasks.filter((task) => {
      const deadline = new Date(task.deadline);
      return task.status === "pending" && deadline < currentDate;
    }).length;
    setOverdueTasks(overdue);

    // Calculate completion percentage
    const completedTasks = tasks.filter((task) =>
      ["completed", "completed after deadline"].includes(task.status)
    ).length;
    const percentage =
      total > 0 ? Math.round((completedTasks / total) * 100) : 0;
    setCompletionPercentage(percentage);

    // Determine recent tasks based on user role
    let recent = [];
    if (user.category === "admin") {
      // For admins: show completed tasks from tasksCreated
      recent = tasks.filter((task) =>
        ["completed", "completed after deadline"].includes(task.status)
      );
    } else {
      // For users: show all tasks assigned to them from tasks
      recent = tasks;
    }

    // Sort tasks by deadline (ascending)
    recent = recent.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    setRecentTasks(recent);
  }, [user]); // Dependency: user only

  // Initiate marking a task as completed
  const initiateComplete = (taskId) => {
    setTaskToComplete(taskId);
    setShowConfirmComplete(true);
    setConfirmInput("");
  };

  // Initiate undoing task completion
  const initiateUndo = (taskId) => {
    setTaskToUndo(taskId);
    setShowConfirmUndo(true);
    setConfirmInput("");
  };

  // Handle marking a task as completed
  const handleComplete = async () => {
    if (confirmInput !== "CONFIRM") {
      toast.error("Please type 'CONFIRM' to mark the task as completed.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/tasks/mark-completed/${taskToComplete}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        toast.success("Task marked as completed successfully");
        setShowConfirmComplete(false);
        setTaskToComplete(null);
        setConfirmInput("");
        await refetchUser();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error marking task as completed:", error);
      toast.error("Failed to mark task as completed.");
    }
  };

  // Handle undoing task completion
  const handleUndo = async () => {
    if (confirmInput !== "CONFIRM") {
      toast.error("Please type 'CONFIRM' to undo the task completion.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/tasks/undo-complete/${taskToUndo}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        toast.success("Task completion undone successfully");
        setShowConfirmUndo(false);
        setTaskToUndo(null);
        setConfirmInput("");
        await refetchUser();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error undoing task completion:", error);
      toast.error("Failed to undo task completion.");
    }
  };

  return (
    <div className="flex-grow-1 mb-5">
      <div className="d-flex align-items-center mb-3">
        <div>
          <h3 className="text-white">
            Welcome back, {user?.fullName || "User"}
          </h3>
          <p className="text-info">
            Here's what's happening with your projects today.
          </p>
        </div>
      </div>

      {/* Top Cards */}
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
                  <small className="text-muted">Total assigned tasks</small>
                </div>
                <FaTasks size={30} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity as Table */}
      <div className="card bg-dark text-white" style={{ width: "100%" }}>
        <div className="card-body">
          <h3 className="mb-4">
            {user.category === "admin" ? "Recent Completed Tasks" : "My Tasks"}
          </h3>
          {recentTasks.length > 0 ? (
            <div style={{ width: "100%", overflowX: "hidden" }}>
              <table
                className="table table-dark table-hover mb-0"
                style={{ tableLayout: "fixed", width: "100%" }}
              >
                <thead>
                  <tr>
                    <th style={{ width: "20%" }}>Title</th>
                    <th style={{ width: "30%" }}>Description</th>
                    <th style={{ width: "20%" }}>Assigned By</th>
                    <th style={{ width: "20%" }}>Due Date</th>
                    {user.category !== "admin" && (
                      <th style={{ width: "10%" }}>Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {recentTasks.map((task, index) => (
                    <tr key={`${task._id}-${index}`}>
                      <td
                        style={{
                          width: "20%",
                          whiteSpace: "normal",
                          overflowWrap: "break-word",
                        }}
                      >
                        {task.title}
                      </td>
                      <td
                        style={{
                          width: "30%",
                          whiteSpace: "normal",
                          overflowWrap: "break-word",
                        }}
                      >
                        {task.description}
                      </td>
                      <td
                        style={{
                          width: "20%",
                          whiteSpace: "normal",
                          overflowWrap: "break-word",
                        }}
                      >
                        {user.category === "admin"
                          ? "You"
                          : task.assignedBy?.fullName || "Unknown Admin"}
                      </td>
                      <td
                        style={{
                          width: "20%",
                          whiteSpace: "normal",
                          overflowWrap: "break-word",
                        }}
                      >
                        {new Date(task.deadline).toLocaleString()}
                      </td>
                      {user.category !== "admin" && (
                        <td style={{ width: "10%" }}>
                          {task.status === "pending" ? (
                            <button
                              className="btn btn-outline-success btn-sm"
                              onClick={() => initiateComplete(task._id)}
                              style={{
                                whiteSpace: "normal",
                                overflowWrap: "break-word",
                              }}
                            >
                              Mark as Completed
                            </button>
                          ) : (
                            <button
                              className="btn btn-outline-warning btn-sm"
                              onClick={() => initiateUndo(task._id)}
                              style={{
                                whiteSpace: "normal",
                                overflowWrap: "break-word",
                              }}
                            >
                              Undo Complete
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted">No recent activity to display.</p>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Marking as Completed */}
      {showConfirmComplete && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          tabIndex="-1"
          role="dialog"
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content bg-dark text-white">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Completion</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowConfirmComplete(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to mark this task as completed? This
                  action cannot be undone without using the Undo option.
                </p>
                <p>
                  Please type <strong>CONFIRM</strong> to proceed:
                </p>
                <input
                  type="text"
                  className="form-control bg-dark text-white"
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)}
                  placeholder="Type CONFIRM here"
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowConfirmComplete(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleComplete}
                >
                  Complete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Undoing Completion */}
      {showConfirmUndo && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          tabIndex="-1"
          role="dialog"
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content bg-dark text-white">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Undo Completion</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowConfirmUndo(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to undo the completion of this task?
                  This will revert the task status to pending.
                </p>
                <p>
                  Please type <strong>CONFIRM</strong> to proceed:
                </p>
                <input
                  type="text"
                  className="form-control bg-dark text-white"
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)}
                  placeholder="Type CONFIRM here"
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowConfirmUndo(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-warning"
                  onClick={handleUndo}
                >
                  Undo
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
