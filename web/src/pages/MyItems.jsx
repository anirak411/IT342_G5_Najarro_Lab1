import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import { getPrimaryImage } from "../utils/itemImages";
import "../css/profile.css";
import { getListingAgeLabel } from "../utils/itemTime";
import { isItemOwnedByUser } from "../utils/ownership";

function MyItems() {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);

    useEffect(() => {
        let user = null;
        try {
            user = JSON.parse(localStorage.getItem("user"));
        } catch {
            user = null;
        }

        const currentEmail = (user?.email || localStorage.getItem("email") || "")
            .trim()
            .toLowerCase();
        const currentName = (
            user?.displayName ||
            localStorage.getItem("displayName") ||
            user?.fullName ||
            localStorage.getItem("fullName") ||
            ""
        )
            .trim()
            .toLowerCase();

        if (!currentEmail && !currentName) {
            navigate("/login");
            return;
        }

        const fetchItems = async () => {
            try {
                const res = await axios.get("http://localhost:8080/api/items");
                const mine = res.data.filter((item) =>
                    isItemOwnedByUser(item, user)
                );
                setItems(mine);
            } catch (err) {
                console.log("Failed to load my listings", err);
            }
        };

        fetchItems();
    }, [navigate]);

    return (
        <div className="profile-page">
            <header className="profile-navbar">
                <BackButton fallback="/dashboard" />
                <h2 className="profile-logo">My Listings</h2>
            </header>

            <section className="profile-content">
                <div className="profile-section-header">
                    <h3>Your Listings</h3>
                    <p>{items.length} items</p>
                </div>

                {items.length === 0 ? (
                    <p className="empty-text">No listings yet.</p>
                ) : (
                    <div className="profile-listings">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="listing-card"
                                onClick={() => navigate(`/item/${item.id}`)}
                            >
                                <img src={getPrimaryImage(item)} alt={item.title} />
                                <div className="listing-info">
                                    <h4>{item.title}</h4>
                                    <p className="listing-price">
                                        ₱
                                        {Number(item.price || 0).toLocaleString("en-PH", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </p>
                                    <p className="listing-category">
                                        {item.category} • {item.condition || "Used"} •{" "}
                                        {getListingAgeLabel(item)}
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

export default MyItems;
