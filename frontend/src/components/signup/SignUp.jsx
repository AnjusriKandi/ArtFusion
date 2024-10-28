import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../../api/axios";
import "./SignUp.css";
import Lottie from "react-lottie";
import SignupAnimation from "../../assets/Animations/SignupAnimation.json"; // Ensure path is correct

function SignUp() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        username: "",
        password: "",
    });
    const [errors, setErrors] = useState({});
    const [signUpError, setSignUpError] = useState("");

    const { email, username, password } = formData;

    const validate = () => {
        const newErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            newErrors.email = "Invalid email address.";
        }

        const usernameRegex = /^[A-Za-z_]{8,}$/;
        if (!usernameRegex.test(username)) {
            newErrors.username =
                "Username must be at least 8 characters and contain only letters and underscores.";
        }

        const passwordRegex =
            /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*().])[A-Za-z\d!@#$%^&*().]{4,}$/;
        if (!passwordRegex.test(password)) {
            newErrors.password =
                "Password must be at least 4 characters long, include at least one uppercase letter, one number, and one special character.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: SignupAnimation,
        rendererSettings: {
          preserveAspectRatio: "xMidYMid slice"
        }
      };
    async function handleSubmit(e) {
        e.preventDefault();
        setSignUpError(""); 
        if (validate()) {
            try {
                let response = await API.post('/auth/signup', formData);
                localStorage.setItem('token', response.data.token);
                console.log(formData); // Fixed typo
                navigate('/dashboard/edit-profile'); 
            } catch (error) {
                if (error.response) {
                    if (error.response.status === 409) {
                        setSignUpError(error.response.data.message);
                    } else {
                        setSignUpError("Something went wrong. Please try again later.");
                    }
                } else {
                    setSignUpError("Something went wrong. Please try again later.");
                }
            }
        }
    };

    return (
        <div className="signup-container">
            <div className="signup-box">
                <div className="signup-image">
                    {/* Display the Lottie animation */}
                    <Lottie 
                        options={defaultOptions}
                        height={550}
                        width={500}
                    />
                </div>
                <div className="signup-form">
                    <h2>Sign Up</h2>
                    {signUpError && (
                        <p className="error-message">
                            {signUpError}
                        </p>
                    )}
                    <form onSubmit={handleSubmit}>
                        <div className="signupform-group">
                            <label htmlFor="email">Email:</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={email}
                                onChange={handleChange}
                                required
                            />
                            {errors.email && (
                                <span className="error-message">{errors.email}</span>
                            )}
                        </div>
                        <div className="signupform-group">
                            <label htmlFor="username">Username:</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={username}
                                onChange={handleChange}
                                required
                            />
                            {errors.username && (
                                <span className="error-message">{errors.username}</span>
                            )}
                        </div>
                        <div className="signupform-group">
                            <label htmlFor="password">Password:</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={password}
                                onChange={handleChange}
                                required
                            />
                            {errors.password && (
                                <span className="error-message">{errors.password}</span>
                            )}
                        </div>
                        <button type="submit" className="signup-button">
                            Sign Up
                        </button>
                    </form>
                    <p>
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            className="login-link"
                            style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
                        >
                            Login here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default SignUp;
