import React, { useState, useContext } from "react";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import "./Login.css";

import microsoft_icon from "../assets/microsoft_icon.png";
import { UserContext } from "./UserContext"; // ✅ updated path

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext); // ✅ get setUser from context

  const handleSignup = async (e) => {
    e.preventDefault();

    const fullName = e.target.fullName.value;
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password, category: "user" }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("Sign up successful! Redirecting to login...");
        setTimeout(() => setIsLogin(true), 2000);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error("Signup error:", err);
      toast.error("An error occurred. Please try again.");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        setUser(data.user); // ✅ set user in context
        console.log("User data on 59 login:", data.user.category);

        toast.success("Login successful! Redirecting...");
        setTimeout(() => {
          if (data.user.category === "admin") {
            console.log("admin data", data.user);
            navigate("/admin");
          } else if (data.user.category === "user") {
            console.log("user data", data.user);
            navigate("/dashboard");
          } else {
            toast.error("Invalid user category.");
          }
        }, 2000);
      } else {
        toast.error(data.message || "Login failed.");
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error("An error occurred. Please try again.");
    }
  };

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
    <div className="login-container">
      <div className="login-box">
        <div className="login-icon">{/* Your icon SVG here */}</div>

        <div className="tabs">
          <button
            className={isLogin ? "active-tab" : "inactive-tab"}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button
            className={!isLogin ? "active-tab" : "inactive-tab"}
            onClick={() => setIsLogin(false)}
          >
            Signup
          </button>
        </div>

        {isLogin ? (
          <form className="form-fields" onSubmit={handleLogin}>
            <div>
              <label>Email address</label>
              <input type="email" name="email" required />
            </div>
            <div>
              <label>Password</label>
              <input type="password" name="password" required />
            </div>
            <div className="options">
              <label>
                <input type="checkbox" /> Remember me
              </label>
              <span className="forgot">Forgot password?</span>
            </div>
            <button className="sign-in-btn">Sign in</button>
          </form>
        ) : (
          <form className="form-fields" onSubmit={handleSignup}>
            <div>
              <label>Full Name</label>
              <input type="text" name="fullName" required />
            </div>
            <div>
              <label>Email address</label>
              <input type="email" name="email" required />
            </div>
            <div>
              <label>Password</label>
              <input type="password" name="password" required />
            </div>
            <div>
              <label>Confirm Password</label>
              <input type="password" required />
            </div>
            <button className="sign-in-btn">Sign up</button>
          </form>
        )}

        <div className="divider">
          <span>Or continue with</span>
        </div>

        <button className="ms-login">
          <img src={microsoft_icon} alt="Microsoft" className="ms-icon" />
          <span>Microsoft.</span>
        </button>
      </div>
    </div>
    </>
  );
}
