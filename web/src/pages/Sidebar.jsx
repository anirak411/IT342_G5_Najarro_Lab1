import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/sidebar.css";

function Sidebar({ isOpen, onToggle }) {
    const navigate = useNavigate();

    const goTo = (path) => {
        navigate(path);
        if (onToggle) onToggle();
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("displayName");
        localStorage.removeItem("fullName");
        localStorage.removeItem("email");
        navigate("/login");
        if (onToggle) onToggle();
    };

    return (
        <div className={`sidebar ${isOpen ? "open" : ""}`}>
            <div className="sidebar-header">
                <h2 className="sidebar-logo" onClick={() => goTo("/dashboard")}>
                    TradeOff
                </h2>
                <button
                    className="sidebar-toggle-btn"
                    onClick={onToggle}
                    aria-label="Collapse sidebar"
                >
                    ☰
                </button>
            </div>

            <nav className="sidebar-links">
                <button onClick={() => goTo("/dashboard")}>
                    Marketplace
                </button>

                <button onClick={() => goTo("/my-items")}>
                    My Listings
                </button>

                <button onClick={() => goTo("/profile")}>
                    Profile
                </button>

                <button onClick={() => goTo("/settings")}>
                    Settings
                </button>
            </nav>

            <div className="sidebar-footer">
                <button className="logout-btn" onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </div>
    );
}

export default Sidebar;
