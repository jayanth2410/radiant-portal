import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Line 9: This should now work

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        navigate("/"); // Redirect to login if no token
        return;
      }

      const response = await fetch("http://localhost:5000/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setUser(data);
      } else {
        localStorage.removeItem("token");
        navigate("/"); // Redirect to login on error
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      localStorage.removeItem("token");
      navigate("/"); // Redirect to login on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const refetchUser = async () => {
    await fetchUser();
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
  };

  return (
    <UserContext.Provider
      value={{ user, setUser, refetchUser, logout, loading }}
    >
      {children}
    </UserContext.Provider>
  );
};
