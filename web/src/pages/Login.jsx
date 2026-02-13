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
        <div className="page">
            <div className="card-wrapper">
                <div className="auth-card">
                    <button
                        type="button"
                        className="back-button"
                        onClick={() => navigate("/")}
                    >
                        ← Back
                    </button>

                    <h2>Welcome Back!</h2>

                    <form className="auth-form" onSubmit={handleLogin}>
                        <input
                            className="auth-input"
                            type="email"
                            placeholder="Email"
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
                            className="auth-button secondary"
                            onClick={() => navigate("/register")}
                        >
                            Register
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;
