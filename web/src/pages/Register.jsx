import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../css/global.css";

function Register() {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post("http://localhost:8080/api/auth/register", {
                fullName,
                email,
                password,
            });

            alert(res.data);
            navigate("/login");
        } catch {
            alert("Registration failed.");
        }
    };

    return (
        <div className="page">
            <div className="card-wrapper">
                <button className="back-button" onClick={() => navigate("/login")}>
                    ← Back
                </button>

                <div className="auth-card">
                    <h2>Register</h2>

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
                            Register
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Register;
