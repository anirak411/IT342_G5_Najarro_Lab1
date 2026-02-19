import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../css/global.css";

function Register() {
    const [fullName, setFullName] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();

        try {
            await axios.post("http://localhost:8080/api/auth/register", {
                fullName,
                displayName,
                email,
                password,
            });

            alert("Account created successfully!");
            navigate("/login");
        } catch (err) {
            const msg =
                err.response?.data?.message ||
                err.response?.data ||
                "Registration failed.";

            alert(msg);
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

                    <h2>Create Account</h2>

                    <form className="auth-form" onSubmit={handleRegister}>
                        <input
                            className="auth-input"
                            type="text"
                            placeholder="Full Name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />

                        <input
                            className="auth-input"
                            type="text"
                            placeholder="Display Name (Username)"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            required
                        />

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
                            Register
                        </button>

                        <button
                            type="button"
                            className="auth-button outline"
                            onClick={() => navigate("/login")}
                        >
                            Already have an account?
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

export default Register;
