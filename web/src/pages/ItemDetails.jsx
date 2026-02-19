import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "../css/details.css";
import { getItemImages, getPrimaryImage } from "../utils/itemImages";
import BackButton from "../components/BackButton";
import { getListingAgeLabel } from "../utils/itemTime";
import { getCleanSellerName } from "../utils/seller";
import { isItemOwnedByUser } from "../utils/ownership";

function ItemDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    let storedUser = null;
    try {
        storedUser = JSON.parse(localStorage.getItem("user"));
    } catch {
        storedUser = null;
    }
    const resolvedUser = {
        email: storedUser?.email || localStorage.getItem("email") || "",
        displayName:
            storedUser?.displayName ||
            localStorage.getItem("displayName") ||
            storedUser?.fullName ||
            localStorage.getItem("fullName") ||
            "",
    };
    const loggedInEmail = resolvedUser.email;

    const [item, setItem] = useState(null);
    const [recommended, setRecommended] = useState([]);
    const [activeImage, setActiveImage] = useState("");
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const formatPrice = (value) =>
        Number(value || 0).toLocaleString("en-PH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setLoadError("");
                const itemRes = await axios.get(
                    `http://localhost:8080/api/items/${id}`
                );
                setItem(itemRes.data);
                setActiveImage(getPrimaryImage(itemRes.data));

                const allRes = await axios.get("http://localhost:8080/api/items");

                const randomItems = allRes.data
                    .filter((x) => x.id !== parseInt(id))
                    .sort(() => 0.5 - Math.random())
                    .slice(0, 4);

                setRecommended(randomItems);
            } catch (err) {
                setLoadError("Failed to load item details.");
                console.log("Failed to load item details", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (loading) return <p className="loading-text">Loading...</p>;
    if (loadError) return <p className="loading-text">{loadError}</p>;
    if (!item) return <p className="loading-text">Listing not found.</p>;

    const isOwner = isItemOwnedByUser(item, resolvedUser);

    const handleDelete = async () => {
        if (!window.confirm("Delete this listing?")) return;

        try {
            await axios.delete(`http://localhost:8080/api/items/${id}`, {
                params: {
                    sellerEmail: loggedInEmail,
                    sellerName: resolvedUser.displayName || "",
                },
            });
            alert("Listing deleted successfully!");
            navigate("/profile");
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                err?.response?.data ||
                "Failed to delete listing.";
            alert(msg);
        }
    };

    const handleMessageSeller = () => {
        const sellerDisplayName = getCleanSellerName(item.sellerName);
        localStorage.setItem(
            "pendingChat",
            JSON.stringify({
                id: Date.now(),
                sellerName: sellerDisplayName,
                sellerEmail: item.sellerEmail,
                text: `Hi ${sellerDisplayName}, is "${item.title}" still available?`,
            })
        );
        window.dispatchEvent(new Event("pendingChat"));
    };

    return (
        <div className="details-page">
            <BackButton className="details-back-btn" fallback="/dashboard" />

            <div className="details-card">
                <div className="details-image">
                    <img src={activeImage || getPrimaryImage(item)} alt={item.title} />
                    {getItemImages(item).length > 1 && (
                        <div className="details-thumb-row">
                            {getItemImages(item).map((img, idx) => (
                                <button
                                    key={`${img}-${idx}`}
                                    className={`details-thumb-btn ${
                                        (activeImage || getPrimaryImage(item)) === img
                                            ? "active"
                                            : ""
                                    }`}
                                    onClick={() => setActiveImage(img)}
                                >
                                    <img src={img} alt={`${item.title} ${idx + 1}`} />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="details-info">
                    <h2 className="details-price">
                        ₱{formatPrice(item.price)}
                    </h2>

                    <p className="details-title">{item.title}</p>

                    <p className="details-seller">
                        Seller:{" "}
                        <strong>{getCleanSellerName(item.sellerName)}</strong>
                    </p>

                    <p className="details-location">📍 {item.location}</p>
                    <p className="details-location">
                        Condition: {item.condition || "Used"}
                    </p>
                    <p className="details-location">{getListingAgeLabel(item)}</p>

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
                                onClick={handleMessageSeller}
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
                            <img src={getPrimaryImage(rec)} alt={rec.title} />

                            <div className="rec-info">
                                <p className="rec-title">{rec.title}</p>

                                <p className="rec-price">
                                    ₱{formatPrice(rec.price)}
                                </p>

                                <p className="rec-seller">
                                    {getCleanSellerName(rec.sellerName)}
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
