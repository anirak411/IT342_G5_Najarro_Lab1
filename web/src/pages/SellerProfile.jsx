import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "../css/profile.css";

function SellerProfile() {
    const { sellerName } = useParams();
    const navigate = useNavigate();

    const [listings, setListings] = useState([]);

    useEffect(() => {
        const fetchSellerListings = async () => {
            try {
                const res = await axios.get("http://localhost:8080/api/items");

                const sellerItems = res.data.filter(
                    (item) => item.sellerName === sellerName
                );

                setListings(sellerItems);
            } catch {
                console.log("Failed to load seller listings");
            }
        };

        fetchSellerListings();
    }, [sellerName]);

    return (
        <div className="profile-page">
            <header className="profile-navbar">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    ← Back
                </button>

                <h2 className="profile-logo">{sellerName}'s Profile</h2>
            </header>

            <section className="profile-content">
                <h3>Listings by {sellerName}</h3>

                {listings.length === 0 ? (
                    <p className="empty-text">No listings available.</p>
                ) : (
                    <div className="profile-listings">
                        {listings.map((item) => (
                            <div
                                key={item.id}
                                className="listing-card"
                                onClick={() => navigate(`/item/${item.id}`)}
                            >
                                <img
                                    src={item.imageUrl}
                                    alt={item.title}
                                    onError={(e) =>
                                        (e.target.src =
                                            "/images/landing-placeholder.png")
                                    }
                                />

                                <div className="listing-info">
                                    <h4>{item.title}</h4>
                                    <p className="listing-price">
                                        ₱{Number(item.price).toFixed(2)}
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

export default SellerProfile;
