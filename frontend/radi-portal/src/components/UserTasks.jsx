import React, { useState, useContext, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { UserContext } from "./UserContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Define currentDate for consistency
const currentDate = new Date();

const UserTasks = () => {
  const { user, refetchUser } = useContext(UserContext);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [fetchError, setFetchError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // State for task actions
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [selectedTaskDescription, setSelectedTaskDescription] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [taskToAction, setTaskToAction] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [taskStatuses, setTaskStatuses] = useState({});

  // State for new task form
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    deadline: "",
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
          const userTasks = Array.isArray(data.tasks) ? data.tasks : [];
          setTasks(userTasks);

          // Initialize task statuses
          const initialStatuses = {};
          userTasks.forEach((task) => {
            initialStatuses[task._id] = task.status || "in progress";
          });
          setTaskStatuses(initialStatuses);
        } else {
          console.error("Failed to fetch user data:", data.message);
          setTasks([]);
          setFetchError(data.message || "Failed to fetch user data");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setTasks([]);
        if (error.name === "AbortError") {
          setFetchError("Request timed out. Please try again later.");
        } else {
          setFetchError("Error fetching user data. Please try again.");
        }
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
        console.log("Users data from /api/users:", data);
        if (response.ok) {
          setUsers(Array.isArray(data.users) ? data.users : []);
        } else {
          console.warn("Failed to fetch users:", data.message);
          setUsers([]);
          setFetchError("Error fetching users. Some features may be limited.");
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setUsers([]);
        if (error.name !== "AbortError") {
          setFetchError("Error fetching users. Some features may be limited.");
        }
      }
    };

    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchUserData(), fetchUsers()]);
      setIsLoading(false);
    };

    loadData();
  }, [refetchUser]);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        closeModals();
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const closeModals = () => {
    setShowDescriptionModal(false);
    setSelectedTaskDescription("");
    setShowConfirmModal(false);
    setConfirmAction(null);
    setTaskToAction(null);
    setSelectedStatus(null);
  };

  const handleViewDescription = (description) => {
    setSelectedTaskDescription(description || "No description available");
    setShowDescriptionModal(true);
  };

  const initiateAction = (taskId, action, status = null) => {
    setTaskToAction(taskId);
    setConfirmAction(action);
    setSelectedStatus(status);
    setShowConfirmModal(true);
  };

  const handleAction = async () => {
    if (!taskToAction || !confirmAction) return;

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
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/tasks/update-status/${taskToAction}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ status, completed }),
        }
      );

      const data = await response.json();
      console.log("[DEBUG] Task status update response:", data);

      if (response.ok) {
        if (confirmAction === "mark-completed") {
          setTasks((prevTasks) =>
            prevTasks.filter((task) => task._id !== taskToAction)
          );
        }
        await refetchUser();

        // Refetch tasks from /api/auth/me to update the list
        const userResponse = await fetch("http://localhost:5000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const userData = await userResponse.json();
        if (userResponse.ok) {
          setTasks(Array.isArray(userData.tasks) ? userData.tasks : []);
        }

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

        // Refetch tasks to update the list
        const userResponse = await fetch("http://localhost:5000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const userData = await userResponse.json();
        if (userResponse.ok) {
          setTasks(Array.isArray(userData.tasks) ? userData.tasks : []);
        }
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

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle task creation
  const handleCreateTask = async (e) => {
    e.preventDefault();
    const { title, description, deadline } = newTask;

    if (!title || !description || !deadline) {
      toast.error("All fields are required", { autoClose: 2000 });
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/tasks/create-user-task",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(newTask),
        }
      );

      const data = await response.json();
      if (response.ok) {
        // Refetch tasks to update the list
        const userResponse = await fetch("http://localhost:5000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const userData = await userResponse.json();
        if (userResponse.ok) {
          setTasks(Array.isArray(userData.tasks) ? userData.tasks : []);
        }

        toast.success("Task created successfully", { autoClose: 2000 });
        setNewTask({ title: "", description: "", deadline: "" });
      } else {
        toast.error(data.message || "Failed to create task", {
          autoClose: 2000,
        });
      }
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("Failed to create task", { autoClose: 2000 });
    }
  };

  if (isLoading) {
    return (
      <div
        className="d-flex flex-column justify-content-center align-items-center"
        style={{ height: "100%", backgroundColor: "#000", color: "#fff" }}
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

  // Filter tasks based on user category
  let filteredTasks = tasks;
  let completedTasks = tasks.filter(
    (task) =>
      task.status === "completed" || task.status === "completed after deadline"
  );

  if (user?.category === "admin") {
    filteredTasks = tasks.filter((task) => task.status === "resolved");
  } else {
    filteredTasks = tasks.filter((task) => task.status !== "completed");
  }
  filteredTasks = filteredTasks.sort(
    (a, b) => new Date(a.deadline) - new Date(b.deadline)
  );

  completedTasks = completedTasks.sort(
    (a, b) => new Date(a.deadline) - new Date(b.deadline)
  );

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
      <h2 className="text-white mb-4">Tasks</h2>

      {/* Task Creation Form */}
      <div className="card bg-dark text-white p-4 mb-4">
        <h4 className="text-white mb-3">Create New Task</h4>
        <form onSubmit={handleCreateTask}>
          <div className="mb-3">
            <label htmlFor="title" className="form-label text-white">
              Title
            </label>
            <input
              type="text"
              className="form-control bg-dark text-white border-secondary"
              id="title"
              name="title"
              value={newTask.title}
              onChange={handleInputChange}
              placeholder="Enter task title"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="description" className="form-label text-white">
              Description
            </label>
            <textarea
              className="form-control bg-dark text-white border-secondary"
              id="description"
              name="description"
              value={newTask.description}
              onChange={handleInputChange}
              placeholder="Enter task description"
              rows="3"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="deadline" className="form-label text-white">
              Deadline
            </label>
            <input
              type="datetime-local"
              className="form-control bg-dark text-white border-secondary"
              id="deadline"
              name="deadline"
              value={newTask.deadline}
              onChange={handleInputChange}
            />
          </div>
          <button className="btn btn-outline-success">Create Task</button>
        </form>
      </div>

      {/* Task List */}
      <div className="card bg-dark text-white mb-4" style={{ width: "100%" }}>
        <div className="card-body">
          <h3 className="mb-4">
            {user?.category === "admin" ? "Resolved Tasks" : "My Tasks"}
          </h3>
          {filteredTasks.length > 0 ? (
            <div style={{ width: "100%", overflowX: "auto" }}>
              <table
                className="table table-dark table-hover mb-0"
                style={{ tableLayout: "fixed", width: "100%" }}
              >
                <thead style={{textAlign: "center"}}>
                  <tr>
                    <th style={{ width: "30%", textAlign: "left" }}>Title</th>
                    <th style={{ width: "15%" }}>Description</th>
                    <th style={{ width: "10%" }}>Assigned By</th>
                    {user?.category === "admin" && (
                      <th style={{ width: "20%" }}>Assigned To</th>
                    )}
                    <th
                      style={{
                        width: user?.category === "admin" ? "15%" : "25%",
                      }}
                    >
                      Due Date
                    </th>
                    <th style={{ width: "20%" }}>Actions</th>
                  </tr>
                </thead>
                <tbody style={{textAlign: "center"}}>
                  {filteredTasks.map((task, index) => {
                    const assignedUserNames = Array.isArray(task.assignedTo)
                      ? task.assignedTo
                          .map((userId) => {
                            const user = users.find((u) => u._id === userId);
                            return user ? user.fullName : "Unknown User";
                          })
                          .join(", ") || "No users assigned1"
                      : "No users assigned2";

                    return (
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
                          {task.assignedBy?._id === user?._id
                            ? "You"
                            : task.assignedBy?.fullName || "Unknown"}
                        </td>
                        {user?.category === "admin" && (
                          <td
                            style={{
                              width: "20%",
                              whiteSpace: "normal",
                              overflowWrap: "break-word",
                            }}
                          >
                            {assignedUserNames}
                          </td>
                        )}
                        <td
                          style={{
                            width: user?.category === "admin" ? "15%" : "25%",
                            whiteSpace: "normal",
                            overflowWrap: "break-word",
                          }}
                        >
                          {task.deadline
                            ? new Date(task.deadline).toLocaleString()
                            : "No deadline"}
                        </td>
                        <td style={{ width: "20%" }}>
                          {user?.category === "admin" ? (
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
                                  value={taskStatuses[task._id] || task.status}
                                  onChange={(e) =>
                                    handleDropdownChange(
                                      task._id,
                                      e.target.value
                                    )
                                  }
                                >
                                  <option value="in progress">
                                    In Progress
                                  </option>
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
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted">
              {user?.category === "admin"
                ? "No resolved tasks to display."
                : "No recent activity to display."}
            </p>
          )}
        </div>
      </div>

      {/* Completed Tasks */}
      <div className="card bg-dark text-white p-4">
        <h4 className="card-title text-white mb-3">Completed Tasks</h4>
        <div className="table-responsive">
          <table className="table table-dark table-hover mb-0">
            <thead style={{textAlign: "center"}}>
              <tr>
                <th style={{ width: "20%", textAlign: "left" }}>Title</th>
                <th>Description</th>
                <th>Assigned to</th>
                <th>Deadline</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody style={{textAlign: "center"}}>
              {completedTasks.length > 0 ? (
                completedTasks.map((task) => {
                  const assignedUserNames = Array.isArray(task.assignedTo)
                    ? task.assignedTo
                        .map((userId) => {
                          const user = users.find((u) => u._id === userId);
                          return user ? user.fullName : "Unknown User";
                        })
                        .join(", ") || "No users assigned"
                    : user.fullName;
                  return (
                    <tr key={task._id}>
                      <td style={{textAlign: "left"}}>{task.title || "Untitled"}</td>
                      <td>
                        <button
                          className="btn btn-outline-info btn-sm"
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
                      <td>
                        <span
                          style={{
                            color:
                              assignedUserNames !== "No users assigned"
                                ? "inherit"
                                : "#888",
                            fontStyle:
                              assignedUserNames !== "No users assigned"
                                ? "normal"
                                : "italic",
                          }}
                        >
                          {assignedUserNames}
                        </span>
                      </td>
                      <td>
                        {task.deadline
                          ? new Date(task.deadline).toLocaleString()
                          : "No deadline"}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            task.status === "completed"
                              ? "bg-success"
                              : "bg-danger"
                          }`}
                        >
                          {task.status === "completed"
                            ? "completed"
                            : "delayed"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-white">
                    No completed tasks found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals for task actions */}
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
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content bg-dark text-white">
              <div className="modal-header">
                <h5 className="modal-title">Task Description</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={closeModals}
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
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content bg-dark text-white">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Action</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={closeModals}
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
                  onClick={closeModals}
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

export default UserTasks;
