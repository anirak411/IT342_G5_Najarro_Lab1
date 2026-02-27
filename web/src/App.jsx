import React, { useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import LandingPage from "./pages/LandingPage.jsx";
import Profile from "./pages/Profile.jsx";
import ItemDetails from "./pages/ItemDetails.jsx";
import Settings from "./pages/Settings.jsx";
import SellerProfile from "./pages/SellerProfile.jsx";
import ChatWidget from "./pages/ChatWidget.jsx";
import MyItems from "./pages/MyItems.jsx";
import Sidebar from "./pages/Sidebar.jsx";
import Transactions from "./pages/Transactions.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";

function App() {
    const location = useLocation();
    const storedUser = localStorage.getItem("user");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const hideChatOn = ["/landing", "/login", "/register"];
    const showChat = Boolean(storedUser) && !hideChatOn.includes(location.pathname);
    const hideSidebarTriggerOn = ["/dashboard", "/profile"];
    const showUniversalSidebar =
        showChat && !hideSidebarTriggerOn.includes(location.pathname);

    return (
        <>
            <Routes>
                <Route path="/" element={<Navigate to="/landing" />} />

                <Route path="/landing" element={<LandingPage />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />

                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/my-items" element={<MyItems />} />

                <Route path="/item/:id" element={<ItemDetails />} />

                <Route path="/seller/:sellerName" element={<SellerProfile />} />

                <Route path="/settings" element={<Settings />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/admin" element={<AdminPanel />} />
            </Routes>

            {showUniversalSidebar && (
                <>
                    <button
                        className="global-sidebar-trigger"
                        onClick={() => setSidebarOpen((prev) => !prev)}
                        aria-label="Toggle sidebar"
                    >
                        ☰
                    </button>
                    <Sidebar
                        isOpen={sidebarOpen}
                        onToggle={() => setSidebarOpen((prev) => !prev)}
                    />
                </>
            )}

            {showChat && <ChatWidget />}
        </>
    );
}

export default App;
