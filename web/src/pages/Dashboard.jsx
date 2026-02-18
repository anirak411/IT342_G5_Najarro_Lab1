import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../pages/Sidebar";
import "../css/dashboard.css";

function Dashboard() {
    const navigate = useNavigate();
    const fullName = localStorage.getItem("user");

    const [items, setItems] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");
    const [category, setCategory] = useState("All");
    const [sortOption, setSortOption] = useState("Newest");

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const res = await axios.get("http://localhost:8080/api/items");
            setItems(res.data);
        } catch {
            console.log("Failed to load items");
        }
    };

    const filteredItems = items
        .filter((item) =>
            (item.itemName || item.title)
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
        )
        .filter((item) => {
            if (category === "All") return true;
            return (item.category || "Others") === category;
        })
        .sort((a, b) => {
            if (sortOption === "PriceLow") return a.price - b.price;
            if (sortOption === "PriceHigh") return b.price - a.price;
            return (b.id || 0) - (a.id || 0);
        });

    return (
        <div className="marketplace-page">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <header className="marketplace-navbar">
                <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
                    ☰
                </button>

                <h2 className="logo" onClick={() => navigate("/dashboard")}>
                    TradeOff
                </h2>

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
                        <input
                            type="text"
                            placeholder="Search items..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button>➜</button>
                    </div>

                    <div className="filter-bar">
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="All">All Categories</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Clothing">Clothing</option>
                            <option value="Books">Books</option>
                            <option value="Others">Others</option>
                        </select>

                        <select
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                        >
                            <option value="Newest">Newest</option>
                            <option value="PriceLow">Price: Low → High</option>
                            <option value="PriceHigh">Price: High → Low</option>
                        </select>
                    </div>
                </div>
            </section>

            <section className="recent-section">
                <div className="recent-header">
                    <h2>
                        {searchTerm || category !== "All"
                            ? "Filtered Results"
                            : "Listed Recently"}
                    </h2>
                </div>

                {filteredItems.length === 0 ? (
                    <p className="empty-text">No matching listings found.</p>
                ) : (
                    <div className="listing-row">
                        {filteredItems.map((item) => (
                            <div
                                key={item.id || item.itemid}
                                className="listing-card"
                                onClick={() =>
                                    navigate(`/item/${item.id || item.itemid}`)
                                }
                            >
                                <img
                                    src={item.imageUrl}
                                    alt={item.itemName}
                                    onError={(e) =>
                                        (e.target.src =
                                            "/images/landing-placeholder.png")
                                    }
                                />

                                <div className="listing-info">
                                    <h3>{item.itemName || item.title}</h3>

                                    <p className="price">
                                        ₱{Number(item.price).toFixed(2)}
                                    </p>

                                    <p className="seller">
                                        {item.category || "Others"}
                                    </p>
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
