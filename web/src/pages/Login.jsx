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
                const cleanUser = {
                    fullName: res.data.data.fullName,
                    displayName: res.data.data.displayName,
                    email: res.data.data.email,
                };

                localStorage.setItem(
                    "user",
                    JSON.stringify({
                        displayName: res.data.data.displayName,
                        fullName: res.data.data.fullName,
                        email: res.data.data.email,
                        profilePicUrl: res.data.data.profilePicUrl || "",
                        coverPicUrl: res.data.data.coverPicUrl || "",
                    })
                );
                    localStorage.setItem("displayName", res.data.data.displayName);
                localStorage.setItem("fullName", res.data.data.fullName);
                localStorage.setItem("email", res.data.data.email);


                navigate("/dashboard");
            } else {
                alert(res.data.message);
            }
        } catch (err) {
            alert("Login failed.");
        }
    };

    return (
        <div className="auth-page glass-bg">
            <div className="auth-glass-card">
                <div className="auth-left">
                    <img
                        src="/src/images/logo.png"
                        alt="TradeOff Logo"
                        className="auth-logo"
                    />

                    <h2>Welcome Back!</h2>
                    <p>
                        Sign in to explore listings, trade items, and connect with students.
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

                    <button className="back-link" onClick={() => navigate("/")}>
                        ← Back to Marketplace
                    </button>
                </div>

                <div className="auth-right">
                    <img
                        src="/src/images/roblox.png"
                        alt="Marketplace"
                        className="auth-illustration"
                    />
                </div>
            </div>
        </div>
    );
}

export default Login;
