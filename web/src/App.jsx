import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import LandingPage from "./pages/LandingPage.jsx";
import Profile from "./pages/Profile.jsx";
import Sell from "./pages/Sell.jsx";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/landing" />} />
            <Route path="/landing" element={<LandingPage/>} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile/>} />
            <Route path="/sell" element={<Sell/>}/>
        </Routes>
    );
}

export default App;
