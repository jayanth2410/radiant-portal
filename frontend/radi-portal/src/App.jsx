import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // Import BrowserRouter
import "./App.css";
import "bootstrap-icons/font/bootstrap-icons.css";

import Login from "./components/Login.jsx";
import Dashboard from "./components/Dashboard.jsx";
import AdminPanel from "./components/AdminPanel.jsx";
import Projects from "./components/Projects.jsx";
import Certifications from "./components/Certifications.jsx";
import Home from "./components/Home.jsx";
import { UserProvider } from "./components/UserContext.jsx"; // Import UserProvider
import PrivateRoute from "./components/PrivateRoute.jsx"; // Import PrivateRoute

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          {/* Public Route */}
          <Route path="/" element={<Login />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <AdminPanel />
              </PrivateRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <PrivateRoute>
                <Projects />
              </PrivateRoute>
            }
          />
          <Route
            path="/certifications"
            element={
              <PrivateRoute>
                <Certifications />
              </PrivateRoute>
            }
          />
          <Route
            path="/home"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;