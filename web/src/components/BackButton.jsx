import React from "react";
import { useNavigate } from "react-router-dom";

function BackButton({ fallback = "/dashboard", className = "", label = "Back" }) {
    const navigate = useNavigate();

    const handleBack = () => {
        if (window.history.length > 1) {
            navigate(-1);
            return;
        }
        navigate(fallback);
    };

    return (
        <button
            type="button"
            className={`global-back-btn ${className}`.trim()}
            onClick={handleBack}
        >
            {label ? `← ${label}` : "←"}
        </button>
    );
}

export default BackButton;
