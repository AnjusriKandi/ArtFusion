// src/components/Login/Login.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../../api/axios"; 
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    emailOrUsername: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");

  const { emailOrUsername, password } = formData;

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("token", token);
      navigate("/dashboard");
    }
  }, [location, navigate]);

  const validate = () => {
    const newErrors = {};

    if (!emailOrUsername.trim()) {
      newErrors.emailOrUsername = "Email or Username is required.";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");
    if (validate()) {
      try {
        const response = await API.post('/auth/login', formData);
        localStorage.setItem("token", response.data.token);
        navigate("/dashboard/profile");
      } catch (err) {
        console.error(err);
        if (err.response && err.response.data.message) {
          setGeneralError(err.response.data.message);
        } else {
          setGeneralError("Something went wrong. Please try again.");
        }
      }
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/auth/google";
  };

  return (
    <div className="login-container">
        <div className="login-image">
          <img
            src="https://github.com/AnjusriKandi/full_stack/blob/main/frontend/src/assets/ArtFusion%20photo.jpg?raw=true"
            alt="Login"
          />
        </div>
      <div className="login-box">  
        <div className="login-form">
          <h2 className="text-center">Login</h2>
          {generalError && (
            <div className="error-message">{generalError}</div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-group " >
              <label htmlFor="emailOrUsername">Email or Username:</label>
              <input
                type="text"
                id="emailOrUsername"
                name="emailOrUsername"
                value={emailOrUsername}
                onChange={handleChange}
                required
                
              />
              {errors.emailOrUsername && (
                <span className="error-message">{errors.emailOrUsername}</span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={handleChange}
                required
                width={50}
              
              />
              {errors.password && (
                <span className="error-message">{errors.password}</span>
              )}
            </div>
            <button type="submit" className="login-button">
              Login
            </button>
          </form>
          {/* <div className="divider">OR</div>
          <button onClick={handleGoogleLogin} className="google-login-button">
            Login with Google
          </button> */}
        </div>
      </div>
    </div>
  );
}

export default Login;
