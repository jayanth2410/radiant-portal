import React, { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state

  const fetchUserData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      localStorage.removeItem("token");
      setLoading(false); // Stop loading if no token is found
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data); // Set the user data in state
      } else {
        console.error("Failed to fetch user data.");
        localStorage.removeItem("token");
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
    } finally {
      setLoading(false); // Stop loading after the fetch is complete
    }
  };

  useEffect(() => {
    fetchUserData(); // Fetch user data on app load
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};