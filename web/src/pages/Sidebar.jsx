import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/sidebar.css";

function Sidebar({ isOpen, onToggle }) {
    const navigate = useNavigate();

    const goTo = (path) => {
        navigate(path);
        onToggle();
    };

    const handleLogout = () => {
        localStorage.removeItem("email");
        navigate("/login");
    };

    return (
        <div className={`sidebar ${isOpen ? "open" : ""}`}>
            <h2 className="sidebar-logo" onClick={() => goTo("/dashboard")}>
                TradeOff
            </h2>

            <nav className="sidebar-links">
                <button onClick={() => goTo("/dashboard")}>Marketplace</button>

                <button onClick={() => goTo("/my-items")}>My Listings</button>

                <button onClick={() => goTo("/profile")}>Profile</button>

                <button onClick={() => goTo("/settings")}>Settings</button>
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
