import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/landing.css";
import { getPrimaryImage } from "../utils/itemImages";
import { getListingAgeLabel } from "../utils/itemTime";

function LandingPage() {
    const navigate = useNavigate();

    const [items, setItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [selectedItemTitle, setSelectedItemTitle] = useState("");

    const fetchItems = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/items");
            setItems(response.data);
        } catch {
            console.log("Failed to fetch items");
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleItemClick = (title) => {
        setSelectedItemTitle(title || "this listing");
        setShowModal(true);
    };

    const filteredItems = items.filter((item) => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return true;
        const searchable = [
            item.itemName,
            item.title,
            item.category,
            item.condition,
            item.location,
            item.sellerName,
            String(item.price || ""),
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
        return searchable.includes(term);
    });

    return (
        <div className="marketplace-page">
            <header className="marketplace-header">
                <h2
                    className="brand-name"
                    onClick={() => navigate("/")}
                >
                    TradeOff
                </h2>

                <div className="search-box">
                    <input
                        placeholder="Search items on campus..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="header-links">
                    <button
                        className="header-btn"
                        onClick={() => navigate("/login")}
                    >
                        Sign In
                    </button>

                    <button
                        className="header-btn primary"
                        onClick={() => navigate("/register")}
                    >
                        Register
                    </button>
                </div>
            </header>

            <main className="marketplace-main">
                <section className="marketplace-banner">
                    <h1>TradeOff Marketplace</h1>
                    <p>
                        Browse affordable listings. Login to view full details and start
                        trading.
                    </p>
                </section>

                <section className="items-grid">
                    {filteredItems.length === 0 ? (
                        <p className="empty-msg">No listings available yet.</p>
                    ) : (
                        filteredItems.slice(0, 8).map((item) => (
                            <div
                                key={item.id || item.itemid}
                                className="item-card"
                                onClick={() => handleItemClick(item.itemName || item.title)}
                            >
                                <img
                                    src={getPrimaryImage(item)}
                                    alt={item.itemName || item.title}
                                    onError={(e) =>
                                        (e.target.src =
                                            "/images/landing-placeholder.png")
                                    }
                                />

                                <div className="item-info">
                                    <h3>{item.itemName || item.title}</h3>

                                    <p className="price">
                                        ₱
                                        {Number(item.price).toLocaleString(
                                            "en-PH",
                                            {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            }
                                        )}
                                    </p>

                                    <p className="preview-text">
                                        {item.condition || "Used"} • {getListingAgeLabel(item)}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </section>
            </main>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <h2>Login Required</h2>

                        <p>
                            You need an account to view full item details and message
                            sellers for "{selectedItemTitle}".
                        </p>

                        <div className="modal-actions">
                            <button
                                className="modal-btn secondary"
                                onClick={() => setShowModal(false)}
                            >
                                Cancel
                            </button>

                            <button
                                className="modal-btn primary"
                                onClick={() => navigate("/login")}
                            >
                                Sign In
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default LandingPage;
