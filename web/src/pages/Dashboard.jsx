import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../css/dashboard.css";

function Dashboard() {
    const navigate = useNavigate();
    const fullName = localStorage.getItem("user");

    const [items, setItems] = useState([]);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const res = await axios.get("http://localhost:8080/api/items");
            setItems(res.data);
        } catch (err) {
            console.log("Failed to load items");
        }
    };

    return (
        <div className="marketplace-page">
            <header className="marketplace-navbar">
                <h2 className="logo" onClick={() => navigate("/dashboard")}>
                    TradeOff
                </h2>

                <nav className="nav-links">
                    <span>Electronics</span>
                    <span>Clothing</span>
                    <span>Books</span>
                    <span>Others</span>
                </nav>

                <div className="nav-actions">
                    <button className="sell-btn" onClick={() => navigate("/sell")}>
                        Sell Item
                    </button>

                    <button
                        className="profile-circle"
                        onClick={() => navigate("/profile")}
                    >
                        {fullName ? fullName.charAt(0) : "U"}
                    </button>
                </div>
            </header>

            <section className="hero-banner">
                <div className="hero-overlay">
                    <h1>
                        Trade smarter. <br /> Find exciting deals.
                    </h1>

                    <div className="hero-search">
                        <input type="text" placeholder="What are you looking for?" />
                        <button>➜</button>
                    </div>

                    <div className="hero-tags">
                        <span>Electronics</span>
                        <span>Clothing</span>
                        <span>Books</span>
                        <span>Others</span>
                    </div>
                </div>
            </section>

            <section className="recent-section">
                <div className="recent-header">
                    <h2>Listed Recently</h2>
                </div>

                {items.length === 0 ? (
                    <p className="empty-text">No listings yet.</p>
                ) : (
                    <div className="listing-row">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="listing-card"
                                onClick={() => navigate(`/item/${item.id}`)}
                                style={{ cursor: "pointer" }}
                            >
                                <img src={item.imageUrl} alt="item" />

                                <div className="listing-info">
                                    <h3>{item.title}</h3>
                                    <p className="price">
                                        ₱{Number(item.price).toFixed(2)}
                                    </p>
                                    <p className="seller">{item.sellerName}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default Dashboard;
