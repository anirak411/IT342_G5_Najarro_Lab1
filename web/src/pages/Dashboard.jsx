import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ChatWidget from "../pages/ChatWidget";
import "../css/dashboard.css";

function Dashboard() {
    const navigate = useNavigate();
    const fullName = localStorage.getItem("user");

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
                <h2 className="dashboard-logo" onClick={() => navigate("/dashboard")}>
                    TradeOff
                </h2>

                <input
                    className="dashboard-search"
                    type="text"
                    placeholder="Search items, deals, trades..."
                />

                <div className="dashboard-header-actions">
                    <button className="profile-btn" onClick={() => navigate("/profile")}>
                        {fullName ? fullName.charAt(0) : "U"}
                    </button>

                    <button className="dashboard-logout" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </header>

            <div className="dashboard-body">
                <aside className="dashboard-sidebar">
                    <h3>Marketplace</h3>

                    <button onClick={() => navigate("/dashboard")}>Home</button>
                    <button onClick={() => navigate("/sell")}>Sell an Item</button>
                    <button onClick={() => navigate("/marketplace")}>Browse Items</button>
                    <button onClick={() => navigate("/profile")}>My Profile</button>
                </aside>

                <main className="dashboard-feed">
                    <div className="marketplace-header">
                        <h2>
                            Welcome, <span>{fullName}</span>
                        </h2>
                        <p>Discover the latest campus listings today.</p>

                        <div className="category-bar">
                            <button className="cat active">All</button>
                            <button className="cat">Electronics</button>
                            <button className="cat">Clothing</button>
                            <button className="cat">Books</button>
                            <button className="cat">Others</button>
                        </div>
                    </div>

                    {items.length === 0 ? (
                        <p className="empty-feed">No items posted yet.</p>
                    ) : (
                        <div className="market-grid">
                            {items.map((item) => (
                                <div key={item.id} className="market-card">
                                    <img
                                        src="/images/item-placeholder.png"
                                        alt="Item"
                                        className="item-img"
                                    />

                                    <div className="market-info">
                                        <h3>{item.title}</h3>
                                        <p className="market-price">₱{item.price}</p>
                                        <p className="market-desc">{item.description}</p>

                                        <span className="market-seller">
                      Seller: {item.sellerName}
                    </span>

                                        <button className="view-btn">
                                            View Listing
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>

                <aside className="dashboard-right">
                    <h3>Quick Actions</h3>

                    <div className="quick-box">
                        <p>Post your first item and reach more students.</p>
                        <button onClick={() => navigate("/sell")}>Create Listing</button>
                    </div>

                    <div className="quick-box secondary">
                        <p>Manage your profile and listings.</p>
                        <button onClick={() => navigate("/profile")}>Go to Profile</button>
                    </div>
                </aside>
            </div>

            <ChatWidget />
        </div>
    );
}

export default Dashboard;
