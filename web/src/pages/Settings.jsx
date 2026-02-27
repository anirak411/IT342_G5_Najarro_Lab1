import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../css/settings.css";
import BackButton from "../components/BackButton";

function Settings() {
    const navigate = useNavigate();
    const storedUser = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem("user") || "null");
        } catch {
            return null;
        }
    }, []);

    const [prefs, setPrefs] = useState({
        notifications: localStorage.getItem("pref_notifications") !== "off",
        profileVisibility: localStorage.getItem("pref_profile_visibility") || "public",
    });
    const [adminExists, setAdminExists] = useState(true);
    const [loadingAdminAction, setLoadingAdminAction] = useState(false);

    useEffect(() => {
        const fetchAdminStatus = async () => {
            try {
                const res = await axios.get("http://localhost:8080/api/auth/admin-exists");
                setAdminExists(Boolean(res.data?.data));
            } catch {
                setAdminExists(true);
            }
        };
        fetchAdminStatus();
    }, []);

    const persistPrefs = (next) => {
        setPrefs(next);
        localStorage.setItem("pref_notifications", next.notifications ? "on" : "off");
        localStorage.setItem("pref_profile_visibility", next.profileVisibility);
    };

    const handleBootstrapAdmin = async () => {
        if (!storedUser?.email) {
            alert("Please login first.");
            navigate("/login");
            return;
        }

        const password = window.prompt("Enter your current password to become the initial admin:");
        if (!password) return;

        try {
            setLoadingAdminAction(true);
            const res = await axios.post("http://localhost:8080/api/auth/bootstrap-admin", {
                email: storedUser.email,
                password,
            });

            const currentUser = storedUser || {};
            const nextUser = {
                ...currentUser,
                role: res.data?.data?.role || "ADMIN",
            };

            localStorage.setItem("user", JSON.stringify(nextUser));
            localStorage.setItem("role", nextUser.role);
            alert("Admin role granted. You can now access the Admin Panel.");
            navigate("/admin");
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                err?.response?.data ||
                "Failed to grant admin role.";
            alert(msg);
        } finally {
            setLoadingAdminAction(false);
        }
    };

    const handleLogout = async () => {
        try {
            await axios.post("http://localhost:8080/api/auth/logout");
        } catch {
            // local logout fallback
        }
        localStorage.removeItem("user");
        localStorage.removeItem("displayName");
        localStorage.removeItem("fullName");
        localStorage.removeItem("email");
        localStorage.removeItem("role");
        navigate("/login");
    };

    const userRole = (storedUser?.role || localStorage.getItem("role") || "USER").toUpperCase();

    return (
        <div className="settings-page">
            <div className="settings-shell">
                <BackButton className="settings-back-btn" fallback="/dashboard" />
                <h2 className="settings-title">Settings</h2>
                <p className="settings-sub">Manage your account preferences and access controls.</p>

                <div className="settings-grid">
                    <div className="settings-card">
                        <h3>Account</h3>
                        <p>Signed in as: {storedUser?.email || "Guest"}</p>
                        <p>Role: {userRole}</p>
                        <div className="settings-actions">
                            <button className="apple-btn primary small" onClick={() => navigate("/profile")}>
                                Edit Profile
                            </button>
                            <button className="apple-btn primary small" onClick={() => navigate("/transactions")}>
                                View Transactions
                            </button>
                        </div>
                    </div>

                    <div className="settings-card">
                        <h3>Notifications</h3>
                        <p>Enable or disable in-app notifications.</p>
                        <div className="settings-actions">
                            <button
                                className="apple-btn primary small"
                                onClick={() =>
                                    persistPrefs({
                                        ...prefs,
                                        notifications: !prefs.notifications,
                                    })
                                }
                            >
                                {prefs.notifications ? "Turn Off" : "Turn On"}
                            </button>
                            <span>{prefs.notifications ? "Enabled" : "Disabled"}</span>
                        </div>
                    </div>

                    <div className="settings-card">
                        <h3>Privacy</h3>
                        <p>Control whether your profile is public or limited.</p>
                        <div className="settings-actions">
                            <button
                                className="apple-btn primary small"
                                onClick={() =>
                                    persistPrefs({
                                        ...prefs,
                                        profileVisibility:
                                            prefs.profileVisibility === "public" ? "limited" : "public",
                                    })
                                }
                            >
                                Switch to {prefs.profileVisibility === "public" ? "Limited" : "Public"}
                            </button>
                            <span>{prefs.profileVisibility}</span>
                        </div>
                    </div>

                    <div className="settings-card">
                        <h3>Admin Access</h3>
                        {userRole === "ADMIN" ? (
                            <div className="settings-actions">
                                <p>Admin access is active.</p>
                                <button className="apple-btn primary small" onClick={() => navigate("/admin")}>
                                    Open Admin Panel
                                </button>
                            </div>
                        ) : adminExists ? (
                            <p>An admin account already exists. Contact the current admin for role changes.</p>
                        ) : (
                            <div className="settings-actions">
                                <p>No admin exists yet. You can claim initial admin access.</p>
                                <button
                                    className="apple-btn danger"
                                    onClick={handleBootstrapAdmin}
                                    disabled={loadingAdminAction}
                                >
                                    {loadingAdminAction ? "Processing..." : "Become Admin"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="settings-logout">
                    <button className="apple-btn danger" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Settings;
