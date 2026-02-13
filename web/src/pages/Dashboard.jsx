import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ChatWidget from "../pages/ChatWidget";
import "../css/dashboard.css";

function Dashboard() {
    const navigate = useNavigate();
    const fullName = localStorage.getItem("fullName");

    const [items, setItems] = useState([]);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const res = await axios.get("http://localhost:8080/api/items");
                setItems(res.data);
            } catch (err) {
                console.log("Failed to load items");
            }
        };

        fetchItems();
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    return (
        <div className="dashboard-page">
            <header className="dashboard-header">
                <h2 className="dashboard-logo">TradeOff</h2>

                <input
                    className="dashboard-search"
                    type="text"
                    placeholder="Search items..."
                />

                <button className="dashboard-logout" onClick={handleLogout}>
                    Logout
                </button>
            </header>

            <div className="dashboard-body">
                <aside className="dashboard-sidebar">
                    <h3>Menu</h3>
                    <button onClick={() => navigate("/dashboard")}>Home</button>
                    <button onClick={() => navigate("/sell")}>Post Item</button>
                    <button onClick={() => navigate("/marketplace")}>
                        Marketplace
                    </button>
                </aside>

                <main className="dashboard-feed">
                    <h2>Welcome back, {fullName}</h2>
                    <p>Recent listings: </p>

                    {items.length === 0 ? (
                        <p className="empty-feed">
                            No items have been posted yet.
                        </p>
                    ) : (
                        items.map((item) => (
                            <div key={item.id} className="post-card">
                                <h3>{item.title}</h3>
                                <p>{item.description}</p>
                                <p className="price">₱{item.price}</p>
                                <span className="seller">
                                    Posted by {item.sellerName}
                                </span>
                            </div>
                        ))
                    )}
                </main>

                <aside className="dashboard-right">
                    <h3>Quick Actions</h3>

                    <div className="quick-box">
                        <p>Post something today and reach more students.</p>
                        <button onClick={() => navigate("/sell")}>
                            Create Listing
                        </button>
                    </div>
                </aside>
            </div>

            <ChatWidget />
        </div>
    );
}

export default Dashboard;
