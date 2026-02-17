import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../css/global.css";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post("http://localhost:8080/api/auth/login", {
                email,
                password,
            });

            if (res.data.success) {
                localStorage.setItem("user", res.data.fullName);
                navigate("/dashboard");
            } else {
                alert(res.data.message);
            }
        } catch (err) {
            alert("Login failed.");
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-image">
                    <img
                        src="/src/images/roblox.png"
                        alt="roblox"
                        className="side-image"
                    />
                </div>

                <div className="auth-card">
                    <img
                        src="/src/images/logo.png"
                        alt="logo"
                        className="auth-logo"
                    />

                    <button className="back-button" onClick={() => navigate("/")}>
                        ← Back
                    </button>

                    <h2 className="auth-title">Welcome Back</h2>
                    <p className="auth-subtitle">
                        Sign in to continue trading smarter with TradeOff.
                    </p>

                    <form className="auth-form" onSubmit={handleLogin}>
                        <input
                            className="auth-input"
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <input
                            className="auth-input"
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <button className="auth-button" type="submit">
                            Sign In
                        </button>

                        <button
                            type="button"
                            className="auth-button outline"
                            onClick={() => navigate("/register")}
                        >
                            Create Account
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;
