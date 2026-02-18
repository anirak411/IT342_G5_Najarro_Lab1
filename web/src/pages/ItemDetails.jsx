import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "../css/details.css";

function ItemDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [item, setItem] = useState(null);
    const currentUser = localStorage.getItem("user");

    useEffect(() => {
        fetchItem();
    }, []);

    const fetchItem = async () => {
        try {
            const res = await axios.get(`http://localhost:8080/api/items/${id}`);
            setItem(res.data);
        } catch {
            console.log("Failed to load item");
        }
    };

    const handleDelete = async () => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this listing?"
        );

        if (!confirmDelete) return;

        try {
            await axios.delete(`http://localhost:8080/api/items/${id}`);
            alert("Listing deleted successfully.");
            navigate("/dashboard");
        } catch {
            alert("Failed to delete listing.");
        }
    };

    if (!item) {
        return <p className="loading-text">Loading...</p>;
    }

    const isOwner = currentUser === item.sellerName;

    return (
        <div className="details-page">
            <button className="back-btn" onClick={() => navigate("/dashboard")}>
                ← Back
            </button>

            <div className="details-card">
                <div className="details-img-wrapper">
                    <img
                        src={item.imageUrl}
                        alt={item.itemName}
                        onError={(e) =>
                            (e.target.src = "/images/landing-placeholder.png")
                        }
                    />
                </div>

                <div className="details-info">
                    <h2>{item.itemName}</h2>

                    <p className="details-price">
                        ₱{Number(item.price).toFixed(2)}
                    </p>

                    <p className="details-desc">
                        {item.description || "No description provided."}
                    </p>

                    <p className="details-seller">
                        Seller: <strong>{item.sellerName}</strong>
                    </p>

                    {!isOwner && (
                        <button className="contact-btn">
                            Message Seller
                        </button>
                    )}

                    {isOwner && (
                        <button className="delete-btn" onClick={handleDelete}>
                            Delete Listing
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ItemDetails;
