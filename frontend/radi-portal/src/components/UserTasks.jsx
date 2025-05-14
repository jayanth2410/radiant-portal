import React, { useState, useEffect } from "react";

const UserTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUserTasks = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/users/", {
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
      console.error("Error fetching user tasks:", error);
      setError("Failed to fetch tasks.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserTasks();
  }, []);

  const handleCompleteTask = async (taskId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/tasks/complete/${taskId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        await fetchUserTasks();
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error("Error completing task:", error);
      setError("Failed to complete task.");
    }
  };

  if (loading) {
    return <div>Loading tasks...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const pendingTasks = tasks.filter((task) => task.status === "pending");
  const completedTasks = tasks.filter((task) =>
    ["completed", "completed after deadline"].includes(task.status)
  );

  return (
    <div>
      <h2>Your Tasks</h2>
      <h3>Pending Tasks</h3>
      {pendingTasks.length > 0 ? (
        <ul>
          {pendingTasks.map((task) => (
            <li key={task._id}>
              <strong>{task.title}</strong> - {task.description} <br />
              Assigned By: {task.assignedBy?.fullName || "Unknown"} <br />
              Deadline: {new Date(task.deadline).toLocaleString()} <br />
              Status: {task.status} <br />
              <button onClick={() => handleCompleteTask(task._id)}>
                Mark as Completed
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No pending tasks assigned to you.</p>
      )}

      <h3>Completed Tasks</h3>
      {completedTasks.length > 0 ? (
        <ul>
          {completedTasks.map((task) => (
            <li key={task._id}>
              <strong>{task.title}</strong> - {task.description} <br />
              Assigned By: {task.assignedBy?.fullName || "Unknown"} <br />
              Deadline: {new Date(task.deadline).toLocaleString()} <br />
              Status: {task.status}
            </li>
          ))}
        </ul>
      ) : (
        <p>No completed tasks.</p>
      )}
    </div>
  );
};

export default UserTasks;
