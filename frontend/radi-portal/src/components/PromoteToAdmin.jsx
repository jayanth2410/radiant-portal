import React, { useState, useEffect } from "react";

const PromoteToAdmin = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/users", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setUsers(data.filter((user) => user.category === "user")); // Only show users
        } else {
          setError(data.message);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to fetch users.");
      }
    };

    fetchUsers();
  }, []);

  const handlePromote = async (userId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/auth/promote-to-admin/${userId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setSuccess(data.message);
        setUsers(users.filter((user) => user._id !== userId)); // Remove promoted user from the list
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error("Error promoting user:", err);
      setError("Failed to promote user.");
    }
  };

  return (
    <div>
      <h2>Promote Users to Admin</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
      <ul>
        {users.map((user) => (
          <li key={user._id}>
            {user.fullName} ({user.email})
            <button onClick={() => handlePromote(user._id)}>Promote to Admin</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PromoteToAdmin;