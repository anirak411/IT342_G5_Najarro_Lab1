import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/sidebar.css";

function Sidebar({ isOpen, onClose }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/login");
    };

    return (
        <>
            {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}

            <div className={`sidebar ${isOpen ? "open" : ""}`}>
                <h2 className="sidebar-logo" onClick={() => navigate("/dashboard")}>
                    TradeOff
                </h2>

                <nav className="sidebar-links">
                    <button
                        onClick={() => {
                            navigate("/dashboard");
                            onClose();
                        }}
                    >
                        Marketplace
                    </button>

                    <button
                        onClick={() => {
                            navigate("/my-items");
                            onClose();
                        }}
                    >
                        My Listings
                    </button>

                    <button
                        onClick={() => {
                            navigate("/profile");
                            onClose();
                        }}
                    >
                        Profile
                    </button>

                    <button
                        onClick={() => {
                            navigate("/settings");
                            onClose();
                        }}
                    >
                        Settings
                    </button>
                </nav>

                <div className="sidebar-footer">
                    <button className="logout-btn" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </div>
        </>
    );
}

export default Sidebar;
