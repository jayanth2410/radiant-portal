import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import { FaTasks } from "react-icons/fa";
// Define currentDate (updated to match system time: 01:47 PM IST on May 23, 2025)
const currentDate = new Date("2025-05-23T13:47:00+05:30");
const formattedDate = currentDate.toLocaleString("en-IN", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Kolkata",
});

const Tasks = ({ users }) => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [assignedUserIds, setAssignedUserIds] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [confirmInput, setConfirmInput] = useState("");
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [taskToUpdate, setTaskToUpdate] = useState(null);
  const [updateTitle, setUpdateTitle] = useState("");
  const [updateDescription, setUpdateDescription] = useState("");
  const [updateDeadline, setUpdateDeadline] = useState("");
  const [updateAssignedUserIds, setUpdateAssignedUserIds] = useState([]);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [selectedTaskDescription, setSelectedTaskDescription] = useState("");

  // State for search
  const [ongoingSearchQuery, setOngoingSearchQuery] = useState("");
  const [completedSearchQuery, setCompletedSearchQuery] = useState("");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/tasks", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setTasks(data.tasks);
          setLoading(false);
        } else {
          setError(data.message);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
        setError("Failed to fetch tasks.");
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Add Escape key listener to close modals
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        if (showConfirmDelete) {
          setShowConfirmDelete(false);
          setTaskToDelete(null);
          setConfirmInput("");
        }
        if (showUpdateModal) {
          setShowUpdateModal(false);
          setTaskToUpdate(null);
          setUpdateTitle("");
          setUpdateDescription("");
          setUpdateDeadline("");
          setUpdateAssignedUserIds([]);
        }
        if (showDescriptionModal) {
          setShowDescriptionModal(false);
          setSelectedTaskDescription("");
        }
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [showConfirmDelete, showUpdateModal, showDescriptionModal]);

  const handleCreateTask = async (e) => {
    e.preventDefault();

    if (!title || !description || !deadline || assignedUserIds.length === 0) {
      toast.info("All fields are required", { autoClose: 2500 });
      setSuccess("");
      return;
    }

    const formattedDeadline = new Date(deadline).toISOString();

    const newTask = {
      title,
      description,
      deadline: formattedDeadline,
      assignedTo: assignedUserIds,
    };

    try {
      const response = await fetch(
        "http://localhost:5000/api/tasks/create-task",
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
        const fetchResponse = await fetch("http://localhost:5000/api/tasks", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const fetchData = await fetchResponse.json();
        if (fetchResponse.ok) {
          setTasks(fetchData.tasks);
        }

        toast.success("Task created successfully.", { autoClose: 1500 });
        setError("");
        setTitle("");
        setDescription("");
        setDeadline("");
        setAssignedUserIds([]);
      } else {
        toast.error(data.message || "Failed to create task", {
          autoClose: 1000,
        });
        if (data.error) {
          console.error("Server error details:", data.error);
        }
      }
    } catch (err) {
      console.error("Error creating task:", err);
      setError("Failed to create task: " + err.message);
      setSuccess("");
    }
  };

  const initiateDelete = (taskId) => {
    setTaskToDelete(taskId);
    setShowConfirmDelete(true);
    setConfirmInput("");
  };

  const handleDelete = async () => {
    if (confirmInput !== "CONFIRM") {
      toast.error("Please type 'CONFIRM' to delete the task.", {
        autoClose: 1500,
      });
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/tasks/delete-task/${taskToDelete}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setTasks(tasks.filter((task) => task._id !== taskToDelete));
        toast.success("Task deleted successfully.", { autoClose: 1000 });
        setShowConfirmDelete(false);
        setTaskToDelete(null);
        setConfirmInput("");
      } else {
        toast.error(data.message, { autoClose: 1000 });
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task.", { autoClose: 1000 });
    }
  };

  const initiateUpdate = (task) => {
    setTaskToUpdate(task._id);
    setUpdateTitle(task.title);
    setUpdateDescription(task.description);
    const formattedDeadline = new Date(task.deadline)
      .toISOString()
      .slice(0, 16);
    setUpdateDeadline(formattedDeadline);
    setUpdateAssignedUserIds(task.assignedTo.map((user) => user._id));
    setShowUpdateModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (
      !updateTitle ||
      !updateDescription ||
      !updateDeadline ||
      updateAssignedUserIds.length === 0
    ) {
      toast.error("All fields are required");
      return;
    }

    const formattedDeadline = new Date(updateDeadline).toISOString();

    const updatedTask = {
      title: updateTitle,
      description: updateDescription,
      deadline: formattedDeadline,
      assignedTo: updateAssignedUserIds,
    };

    try {
      const response = await fetch(
        `http://localhost:5000/api/tasks/update-task/${taskToUpdate}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(updatedTask),
        }
      );

      const data = await response.json();
      if (response.ok) {
        const fetchResponse = await fetch("http://localhost:5000/api/tasks", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const fetchData = await fetchResponse.json();
        if (fetchResponse.ok) {
          setTasks(fetchData.tasks);
        }

        toast.success("Task updated successfully", { autoClose: 1000 });
        setShowUpdateModal(false);
        setTaskToUpdate(null);
        setUpdateTitle("");
        setUpdateDescription("");
        setUpdateDeadline("");
        setUpdateAssignedUserIds([]);
      } else {
        toast.error(data.message, { autoClose: 2000 });
      }
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task.", { autoClose: 2000 });
    }
  };

  const handleViewDescription = (description) => {
    setSelectedTaskDescription(description);
    setShowDescriptionModal(true);
  };

  const handleAddUser = (e) => {
    const userId = e.target.value;
    if (userId && !assignedUserIds.includes(userId)) {
      setAssignedUserIds([...assignedUserIds, userId]);
    }
    e.target.value = "";
  };

  const handleRemoveUser = (userId) => {
    setAssignedUserIds(assignedUserIds.filter((id) => id !== userId));
  };

  const handleAddUpdateUser = (e) => {
    const userId = e.target.value;
    if (userId && !updateAssignedUserIds.includes(userId)) {
      setUpdateAssignedUserIds([...updateAssignedUserIds, userId]);
    }
    e.target.value = "";
  };

  const handleRemoveUpdateUser = (userId) => {
    setUpdateAssignedUserIds(
      updateAssignedUserIds.filter((id) => id !== userId)
    );
  };

  const availableUsers = users.filter(
    (user) => !assignedUserIds.includes(user._id)
  );
  const selectedUsers = users.filter((user) =>
    assignedUserIds.includes(user._id)
  );
  const availableUpdateUsers = users.filter(
    (user) => !updateAssignedUserIds.includes(user._id)
  );
  const selectedUpdateUsers = users.filter((user) =>
    updateAssignedUserIds.includes(user._id)
  );

  // Filter tasks into incomplete and completed
  const incompleteTasks = tasks.filter((task) => {
    if (
      task.status === "in progress" ||
      task.status === "testing" ||
      task.status === "resolved"
    ) {
      return task;
    }
  });
  const completedTasks = tasks.filter((task) => {
    if (
      task.status === "completed" ||
      task.status === "completed after deadline"
    ) {
      return task;
    }
  });

  // Apply search filter for Ongoing Tasks
  const filteredIncompleteTasks = ongoingSearchQuery
    ? incompleteTasks.filter((task) =>
        task.assignedTo.some((user) =>
          user.fullName
            ? user.fullName
                .toLowerCase()
                .includes(ongoingSearchQuery.toLowerCase())
            : false
        )
      )
    : incompleteTasks;

  // Apply search filter for Completed Tasks
  const filteredCompletedTasks = completedSearchQuery
    ? completedTasks.filter((task) =>
        task.assignedTo.some((user) =>
          user.fullName
            ? user.fullName
                .toLowerCase()
                .includes(completedSearchQuery.toLowerCase())
            : false
        )
      )
    : completedTasks;

  if (loading || !users) {
    return <div className="text-white">Loading tasks and users...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={1000}
        hideProgressBar
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover={false}
        theme="dark"
      />
      <div className="mb-5">
        <div>
          <h2
            className="mb-4 text-white fw-bold"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            <FaTasks className="me-2" />
            Tasks
          </h2>
        </div>

        <div className="card bg-dark text-white p-4 mb-4">
          <h4 className="card-title text-white mb-3">Create New Task</h4>
          {error && (
            <div
              className="alert alert-danger alert-dismissible fade show"
              role="alert"
            >
              {error}
              <button
                type="button"
                className="btn-close"
                onClick={() => setError("")}
              ></button>
            </div>
          )}
          {success && (
            <div
              className="alert alert-success alert-dismissible fade show"
              role="alert"
            >
              {success}
              <button
                type="button"
                className="btn-close"
                onClick={() => setSuccess("")}
              ></button>
            </div>
          )}
          <form onSubmit={handleCreateTask}>
            <div className="mb-3">
              <label
                htmlFor="title"
                className="form-label text-capitalize text-white"
              >
                Task Title
              </label>
              <input
                type="text"
                className="form-control bg-dark text-white"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label
                htmlFor="description"
                className="form-label text-capitalize text-white"
              >
                Description
              </label>
              <textarea
                className="form-control bg-dark text-white"
                id="description"
                rows="4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              ></textarea>
            </div>
            <div className="mb-3">
              <label
                htmlFor="deadline"
                className="form-label text-capitalize text-white"
              >
                Deadline
              </label>
              <input
                type="datetime-local"
                className="form-control bg-dark text-white"
                id="deadline"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label
                htmlFor="assignedUser"
                className="form-label text-capitalize text-white"
              >
                Assign to Users
              </label>
              <select
                className="form-select bg-dark text-white"
                id="assignedUser"
                onChange={handleAddUser}
              >
                <option value="" className="bg-dark text-white">
                  Select a user to assign
                </option>
                {availableUsers.map((user) => (
                  <option
                    key={user._id}
                    value={user._id}
                    className="bg-dark text-white"
                  >
                    {user.fullName}
                  </option>
                ))}
              </select>
              <div className="mt-2 d-flex flex-wrap gap-2">
                {selectedUsers.length > 0 ? (
                  selectedUsers.map((user) => (
                    <span
                      key={user._id}
                      className="badge bg-primary d-flex align-items-center"
                      style={{ fontSize: "0.9rem", padding: "0.5rem" }}
                    >
                      {user.fullName}
                      <button
                        type="button"
                        className="btn-close btn-close-white ms-2"
                        style={{ fontSize: "0.6rem" }}
                        onClick={() => handleRemoveUser(user._id)}
                        aria-label="Remove user"
                      ></button>
                    </span>
                  ))
                ) : (
                  <span className="text-muted">No users assigned yet</span>
                )}
              </div>
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "10rem" }}
            >
              Create Task
            </button>
          </form>
        </div>

        <div className="card bg-dark text-white p-4 mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="card-title text-white mb-0">On Going Tasks</h4>
            <div className="input-group" style={{ width: "250px" }}>
              <span className="input-group-text bg-dark text-white">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control bg-dark text-white outline-none shadow-none"
                placeholder="Search by assigned user..."
                value={ongoingSearchQuery}
                onChange={(e) => setOngoingSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="table-responsive">
            <table className="table table-dark table-hover mb-0">
              <thead>
                <tr>
                  <th style={{ width: "20%", textAlign: "left" }}>Title</th>
                  <th>Description</th>
                  <th>Assigned Users</th>
                  <th>Deadline</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredIncompleteTasks.length > 0 ? (
                  filteredIncompleteTasks.map((task) => {
                    const assignedUserNames = task.assignedTo
                      .map((user) => user.fullName || "Unknown User")
                      .join(", ");
                    return (
                      <tr style={{ textAlign: "left" }} key={task._id}>
                        <td>{task.title}</td>
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
                              color: assignedUserNames ? "inherit" : "#888",
                              fontStyle: assignedUserNames
                                ? "normal"
                                : "italic",
                            }}
                          >
                            {assignedUserNames || "Unknown Users"}
                          </span>
                        </td>
                        <td>{new Date(task.deadline).toLocaleString()}</td>
                        <td>
                          <span
                            className={`badge ${
                              task.status === "in progress"
                                ? "bg-info"
                                : task.status === "testing"
                                ? "bg-secondary"
                                : task.status === "resolved"
                                ? "bg-warning"
                                : "bg-light"
                            }`}
                          >
                            {task.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-outline-primary btn-sm me-2"
                            onClick={() => initiateUpdate(task)}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => initiateDelete(task._id)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-white">
                      No incomplete tasks found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card bg-dark text-white p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="card-title text-white mb-0">Completed Tasks</h4>
            <div className="input-group" style={{ width: "250px" }}>
              <span className="input-group-text bg-dark text-white">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control bg-dark text-white outline-none shadow-none"
                placeholder="Search by assigned user..."
                value={completedSearchQuery}
                onChange={(e) => setCompletedSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="table-responsive">
            <table className="table table-dark table-hover mb-0">
              <thead>
                <tr>
                  <th style={{ width: "20%" }}>Title</th>
                  <th>Description</th>
                  <th>Assigned Users</th>
                  <th>Deadline</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredCompletedTasks.length > 0 ? (
                  filteredCompletedTasks.map((task) => {
                    const assignedUserNames = task.assignedTo
                      .map((user) => user.fullName || "Unknown User")
                      .join(", ");
                    return (
                      <tr key={task._id}>
                        <td>{task.title}</td>
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
                              color: assignedUserNames ? "inherit" : "#888",
                              fontStyle: assignedUserNames
                                ? "normal"
                                : "italic",
                            }}
                          >
                            {assignedUserNames || "Unknown Users"}
                          </span>
                        </td>
                        <td>{new Date(task.deadline).toLocaleString()}</td>
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

        {showConfirmDelete && (
          <div
            className="modal fade show d-block"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            tabIndex="-1"
            role="dialog"
            onClick={() => {
              setShowConfirmDelete(false);
              setTaskToDelete(null);
              setConfirmInput("");
            }}
          >
            <div
              className="modal-dialog"
              role="document"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-content bg-dark text-white">
                <div className="modal-header">
                  <h5 className="modal-title">Confirm Deletion</h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowConfirmDelete(false);
                      setTaskToDelete(null);
                      setConfirmInput("");
                    }}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>
                    Are you sure you want to delete this task? This action
                    cannot be undone.
                  </p>
                  <p>
                    Please type <strong>CONFIRM</strong> to proceed "case
                    sensitive":
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
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowConfirmDelete(false);
                      setTaskToDelete(null);
                      setConfirmInput("");
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete();
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showUpdateModal && (
          <div
            className="modal fade show d-block"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            tabIndex="-1"
            role="dialog"
            onClick={() => {
              setShowUpdateModal(false);
              setTaskToUpdate(null);
              setUpdateTitle("");
              setUpdateDescription("");
              setUpdateDeadline("");
              setUpdateAssignedUserIds([]);
            }}
          >
            <div
              className="modal-dialog"
              role="document"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-content bg-dark text-white">
                <div className="modal-header">
                  <h5 className="modal-title">Update Task</h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowUpdateModal(false);
                      setTaskToUpdate(null);
                      setUpdateTitle("");
                      setUpdateDescription("");
                      setUpdateDeadline("");
                      setUpdateAssignedUserIds([]);
                    }}
                  ></button>
                </div>
                <div className="modal-body">
                  <form onSubmit={handleUpdate}>
                    <div className="mb-3">
                      <label
                        htmlFor="updateTitle"
                        className="form-label text-capitalize text-white"
                      >
                        Task Title
                      </label>
                      <input
                        type="text"
                        className="form-control bg-dark text-white"
                        id="updateTitle"
                        value={updateTitle}
                        onChange={(e) => setUpdateTitle(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label
                        htmlFor="updateDescription"
                        className="form-label text-capitalize text-white"
                      >
                        Description
                      </label>
                      <textarea
                        className="form-control bg-dark text-white"
                        id="updateDescription"
                        rows="4"
                        value={updateDescription}
                        onChange={(e) => setUpdateDescription(e.target.value)}
                        required
                      ></textarea>
                    </div>
                    <div className="mb-3">
                      <label
                        htmlFor="updateDeadline"
                        className="form-label text-capitalize text-white"
                      >
                        Deadline
                      </label>
                      <input
                        type="datetime-local"
                        className="form-control bg-dark text-white"
                        id="updateDeadline"
                        value={updateDeadline}
                        onChange={(e) => setUpdateDeadline(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label
                        htmlFor="updateAssignedUser"
                        className="form-label text-capitalize text-white"
                      >
                        Assign to Users
                      </label>
                      <select
                        className="form-select bg-dark text-white"
                        id="updateAssignedUser"
                        onChange={handleAddUpdateUser}
                      >
                        <option value="" className="bg-dark text-white">
                          Select a user to assign
                        </option>
                        {availableUpdateUsers.map((user) => (
                          <option
                            key={user._id}
                            value={user._id}
                            className="bg-dark text-white"
                          >
                            {user.fullName}
                          </option>
                        ))}
                      </select>
                      <div className="mt-2 d-flex flex-wrap gap-2">
                        {selectedUpdateUsers.length > 0 ? (
                          selectedUpdateUsers.map((user) => (
                            <span
                              key={user._id}
                              className="badge bg-primary d-flex align-items-center"
                              style={{ fontSize: "0.9rem", padding: "0.5rem" }}
                            >
                              {user.fullName}
                              <button
                                type="button"
                                className="btn-close btn-close-white ms-2"
                                style={{ fontSize: "0.6rem" }}
                                onClick={() => handleRemoveUpdateUser(user._id)}
                                aria-label="Remove user"
                              ></button>
                            </span>
                          ))
                        ) : (
                          <span className="text-muted">
                            No users assigned yet
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowUpdateModal(false);
                          setTaskToUpdate(null);
                          setUpdateTitle("");
                          setUpdateDescription("");
                          setUpdateDeadline("");
                          setUpdateAssignedUserIds([]);
                        }}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">
                        Update Task
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {showDescriptionModal && (
          <div
            className="modal fade show d-block"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            tabIndex="-1"
            role="dialog"
            onClick={() => {
              setShowDescriptionModal(false);
              setSelectedTaskDescription("");
            }}
          >
            <div
              className="modal-dialog"
              role="document"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-content bg-dark text-white">
                <div className="modal-header">
                  <h5 className="modal-title">Task Description</h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDescriptionModal(false);
                      setSelectedTaskDescription("");
                    }}
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
      </div>
    </>
  );
};

export default Tasks;
