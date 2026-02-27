import React from "react";
import ReactDOM from "react-dom/client";
import axios from "axios";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import "./index.css";

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080").replace(/\/+$/, "");

axios.interceptors.request.use((config) => {
    if (typeof config.url === "string" && config.url.startsWith("http://localhost:8080")) {
        config.url = config.url.replace("http://localhost:8080", apiBaseUrl);
    }
    return config;
});

ReactDOM.createRoot(document.getElementById("root")).render(
    <BrowserRouter>
        <App />
    </BrowserRouter>
);
