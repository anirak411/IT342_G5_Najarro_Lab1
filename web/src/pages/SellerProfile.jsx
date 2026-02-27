import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "../css/profile.css";
import { getPrimaryImage } from "../utils/itemImages";
import BackButton from "../components/BackButton";
import { getListingAgeLabel } from "../utils/itemTime";

function SellerProfile() {
    const { sellerName } = useParams();
    const decodedSellerName = decodeURIComponent(sellerName || "");
    const navigate = useNavigate();
    const formatPrice = (value) =>
        Number(value || 0).toLocaleString("en-PH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

    const [listings, setListings] = useState([]);

    useEffect(() => {
        const fetchSellerListings = async () => {
            try {
                const res = await axios.get("http://localhost:8080/api/items");

                const sellerItems = res.data.filter(
                    (item) => item.sellerName === decodedSellerName
                );

                setListings(sellerItems);
            } catch {
                console.log("Failed to load seller listings");
            }
        };

        fetchSellerListings();
    }, [decodedSellerName]);

    return (
        <div className="profile-page">
            <header className="profile-navbar">
                <BackButton fallback="/dashboard" />

                <h2 className="profile-logo">{decodedSellerName}'s Profile</h2>
            </header>

            <section className="profile-content">
                <h3>Listings by {decodedSellerName}</h3>

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
                                    src={getPrimaryImage(item)}
                                    alt={item.title}
                                    onError={(e) =>
                                        (e.target.src =
                                            "/images/landing-placeholder.png")
                                    }
                                />

                                <div className="listing-info">
                                    <h4>{item.title}</h4>
                                    <p className="listing-price">
                                        ₱{formatPrice(item.price)}
                                    </p>
                                    <p className="listing-category">
                                        {item.condition || "Used"} • {getListingAgeLabel(item)}
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
