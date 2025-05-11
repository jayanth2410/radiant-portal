import React, { useState } from "react";
import "./Login.css";
import microsoft_icon from '../assets/microsoft_icon.png';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true); // Track which tab (Login/Signup) is active

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="icon-svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
            />
          </svg>
        </div>

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
          <form className="form-fields">
            <div>
              <label>Email address</label>
              <input type="email" placeholder="Enter your email" required/>
            </div>
            <div>
              <label>Password</label>
              <input type="password" placeholder="Enter your password" required/>
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
          <form className="form-fields">
            <div>
              <label>Full Name</label>
              <input type="text" placeholder="Enter your full name" required/>
            </div>
            <div>
              <label>Email address</label>
              <input type="email" placeholder="Enter your email" required/>
            </div>
            <div>
              <label>Password</label>
              <input type="password" placeholder="Enter your password" required/>
            </div>
            <div>
              <label>Confirm Password</label>
              <input type="password" placeholder="Confirm your password" required/>
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
  );
}
