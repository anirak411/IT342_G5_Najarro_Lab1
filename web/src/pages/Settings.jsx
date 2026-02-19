import React from "react";
import "../css/settings.css";
import BackButton from "../components/BackButton";

function Settings() {
    return (
        <div className="settings-page">
            <div className="settings-shell">
                <BackButton className="settings-back-btn" fallback="/dashboard" />
                <h2 className="settings-title">Settings</h2>
                <p className="settings-sub">Manage your account preferences.</p>

                <div className="settings-grid">
                    <div className="settings-card">
                        <h3>Account</h3>
                        <p>Profile and account controls are available from your profile page.</p>
                    </div>
                    <div className="settings-card">
                        <h3>Notifications</h3>
                        <p>Notification settings will be available soon.</p>
                    </div>
                    <div className="settings-card">
                        <h3>Privacy</h3>
                        <p>Privacy controls are coming in a future update.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Settings;
