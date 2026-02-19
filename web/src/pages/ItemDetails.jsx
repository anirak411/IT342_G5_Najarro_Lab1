import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "../css/details.css";

function ItemDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const storedUser = JSON.parse(localStorage.getItem("user"));
    const loggedInEmail = storedUser?.email || "";

    const [item, setItem] = useState(null);
    const [recommended, setRecommended] = useState([]);

    const cleanSellerName = (seller) => {
        try {
            const parsed = JSON.parse(seller);
            return parsed.displayName || "Unknown Seller";
        } catch {
            return seller;
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const itemRes = await axios.get(
                    `http://localhost:8080/api/items/${id}`
                );
                setItem(itemRes.data);

                const allRes = await axios.get("http://localhost:8080/api/items");

                const randomItems = allRes.data
                    .filter((x) => x.id !== parseInt(id))
                    .sort(() => 0.5 - Math.random())
                    .slice(0, 4);

                setRecommended(randomItems);
            } catch {
                console.log("Failed to load item details");
            }
        };

        fetchData();
    }, [id]);

    if (!item) return <p className="loading-text">Loading...</p>;

    const isOwner =
        loggedInEmail === item.sellerEmail ||
        storedUser?.displayName === cleanSellerName(item.sellerName);

    const handleDelete = async () => {
        if (!window.confirm("Delete this listing?")) return;

        try {
            await axios.delete(`http://localhost:8080/api/items/${id}`);
            alert("Listing deleted successfully!");
            navigate("/profile");
        } catch {
            alert("Failed to delete listing.");
        }
    };

    return (
        <div className="details-page">
            <button className="back-btn" onClick={() => navigate("/dashboard")}>
                ← Back
            </button>

            <div className="details-card">
                <div className="details-image">
                    <img src={item.imageUrl} alt={item.title} />
                </div>

                <div className="details-info">
                    <h2 className="details-price">
                        ₱
                        {Number(item.price).toLocaleString("en-PH", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}
                    </h2>

                    <p className="details-title">{item.title}</p>

                    <p className="details-seller">
                        Seller:{" "}
                        <strong>{cleanSellerName(item.sellerName)}</strong>
                    </p>

                    <p className="details-location">📍 {item.location}</p>

                    <div className="details-actions">
                        {isOwner ? (
                            <button
                                className="apple-btn danger"
                                onClick={handleDelete}
                            >
                                Delete Listing
                            </button>
                        ) : (
                            <button
                                className="apple-btn primary small"
                                onClick={() =>
                                    navigate(`/chat/${item.sellerEmail}`)
                                }
                            >
                                Message Seller
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <section className="recommended-section">
                <h3>Recommended Listings</h3>

                <div className="recommended-grid">
                    {recommended.map((rec) => (
                        <div
                            key={rec.id}
                            className="recommended-card"
                            onClick={() => navigate(`/item/${rec.id}`)}
                        >
                            <img src={rec.imageUrl} alt={rec.title} />

                            <div className="rec-info">
                                <p className="rec-title">{rec.title}</p>

                                <p className="rec-price">
                                    ₱
                                    {Number(rec.price).toLocaleString("en-PH", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </p>

                                <p className="rec-seller">
                                    {cleanSellerName(rec.sellerName)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default ItemDetails;
