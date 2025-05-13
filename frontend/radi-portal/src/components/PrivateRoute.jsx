import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "./UserContext";

const PrivateRoute = ({ children }) => {
  const { user } = useContext(UserContext);

  const token = localStorage.getItem("token"); // Check if a token exists

  // Redirect to login if no user or token is found
  if (!user && !token) {
    return <Navigate to="/" />;
  }

  return children;
};

export default PrivateRoute;
