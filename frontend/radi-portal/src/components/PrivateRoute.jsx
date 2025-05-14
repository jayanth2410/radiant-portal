import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "./UserContext";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(UserContext);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <h2 className="text-white">Loading...</h2>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
