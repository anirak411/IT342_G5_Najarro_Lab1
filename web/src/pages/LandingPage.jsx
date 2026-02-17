import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/landing.css";

function LandingPage() {
    const navigate = useNavigate();

    const [items, setItems] = useState([]);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/items");
            setItems(response.data);
        } catch (error) {
            console.error("Error fetching items:", error);
        }
    };

    const handleItemClick = () => {
        setShowModal(true);
    };

    return (
        <div className="marketplace-page">
            <header className="marketplace-header">
                <h2 className="brand-name">TradeOff</h2>

                <div className="search-box">
                    <input placeholder="Search items on campus..." />
                </div>

                <div className="header-links">
                    <button className="header-btn" onClick={() => navigate("/login")}>
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
                    <h1>Campus Marketplace Preview</h1>
                    <p>
                        Browse real student listings. Login to view full details and start
                        trading.
                    </p>
                </section>

                <section className="items-grid">
                    {items.length === 0 ? (
                        <p className="empty-msg">No listings available yet.</p>
                    ) : (
                        items.slice(0, 8).map((item) => (
                            <div
                                key={item.itemid}
                                className="item-card"
                                onClick={handleItemClick}
                            >
                                <img
                                    src={item.imageUrl}
                                    alt={item.itemName}
                                    onError={(e) =>
                                        (e.target.src = "/images/landing-placeholder.png")
                                    }
                                />

                                <div className="item-info">
                                    <h3>{item.itemName}</h3>
                                    <p className="price">₱{item.price}</p>
                                    <p className="preview-text">Preview only • Login to view</p>
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
                        <p>You need an account to view full item details and message sellers.</p>

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
