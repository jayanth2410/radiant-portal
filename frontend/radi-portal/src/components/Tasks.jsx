import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const Tasks = ({ users }) => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [assignedUserId, setAssignedUserId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

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

  // Handle task creation
  const handleCreateTask = async (e) => {
    e.preventDefault();

    if (!title || !description || !deadline || !assignedUserId) {
      setError("All fields are required");
      setSuccess("");
      return;
    }

    const newTask = {
      title,
      description,
      deadline,
      assignedTo: assignedUserId,
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
        setTasks([...tasks, data.task]); // Add new task to the list
        setSuccess("Task created successfully");
        setError("");
        setTitle("");
        setDescription("");
        setDeadline("");
        setAssignedUserId("");
      } else {
        setError(data.message);
        setSuccess("");
      }
    } catch (err) {
      console.error("Error creating task:", err);
      setError("Failed to create task.");
      setSuccess("");
    }
  };

  const handleDelete = async (taskId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/tasks/delete-task/${taskId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setTasks(tasks.filter((task) => task._id !== taskId));
        toast.success("Task deleted successfully");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task.");
    }
  };

  if (loading) {
    return <div className="text-white">Loading tasks...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="mb-5">
      <h2 className="text-white mb-4">Tasks</h2>

      {/* Task Creation Form */}
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
              Assign to User
            </label>
            <select
              className="form-select bg-dark text-white"
              id="assignedUser"
              value={assignedUserId}
              onChange={(e) => setAssignedUserId(e.target.value)}
              required
            >
              <option value="" className="bg-dark text-white">
                Select User
              </option>
              {users.map((user) => (
                <option
                  key={user._id}
                  value={user._id}
                  className="bg-dark text-white"
                >
                  {user.fullName}
                </option>
              ))}
            </select>
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

      {/* Tasks Table */}
      <div className="card bg-dark text-white p-4">
        <h4 className="card-title text-white mb-3">Task List</h4>
        <div className="table-responsive">
          <table className="table table-dark table-hover mb-0">
            <thead>
              <tr>
                <th>Title</th>
                <th>Assigned User</th>
                <th>Deadline</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks?.length > 0 ? (
                tasks.map((task) => (
                  <tr key={task._id}>
                    <td>{task.title}</td>
                    <td>
                      {users.find((user) => user._id === task.assignedTo)
                        ?.fullName || "Unknown"}
                    </td>
                    <td>{new Date(task.deadline).toLocaleString()}</td>
                    <td>
                      <span
                        className={`badge ${
                          task.status === "pending"
                            ? "bg-secondary"
                            : "bg-success"
                        }`}
                      >
                        {task.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDelete(task._id)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-white">
                    No tasks found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Tasks;
