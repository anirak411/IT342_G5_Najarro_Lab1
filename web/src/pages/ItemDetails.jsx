import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import "../css/details.css";

function ItemDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [item, setItem] = useState(null);
    const currentUser = localStorage.getItem("user");

    const [showEdit, setShowEdit] = useState(false);

    const [editData, setEditData] = useState({
        itemName: "",
        description: "",
        price: "",
        category: "",
    });

    useEffect(() => {
        fetchItem();
    }, []);

    const fetchItem = async () => {
        try {
            const res = await axios.get(`http://localhost:8080/api/items/${id}`);
            setItem(res.data);

            setEditData({
                itemName: res.data.itemName,
                description: res.data.description,
                price: res.data.price,
                category: res.data.category,
            });
        } catch {
            console.log("Failed to load item");
        }
    };

    const handleBack = () => {
        if (location.state?.from === "profile") {
            navigate("/profile");
        } else {
            navigate("/dashboard");
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Delete this listing?")) return;

        try {
            await axios.delete(`http://localhost:8080/api/items/${id}`);
            alert("Listing deleted!");

            if (location.state?.from === "profile") {
                navigate("/profile");
            } else {
                navigate("/dashboard");
            }
        } catch {
            alert("Failed to delete listing.");
        }
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();

        try {
            await axios.put(`http://localhost:8080/api/items/update/${id}`, editData);

            alert("Listing updated successfully!");
            setShowEdit(false);
            fetchItem();
        } catch {
            alert("Failed to update listing.");
        }
    };

    if (!item) return <p className="loading-text">Loading...</p>;

    const isOwner = currentUser === item.sellerName;

    return (
        <div className="details-page">
            <button className="back-btn" onClick={handleBack}>
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

                    <p className="details-desc">{item.description}</p>

                    <div className="details-seller-row">
                        <p className="details-seller">
                            Seller: <strong>{item.sellerName}</strong>
                        </p>

                        {!isOwner && (
                            <button
                                className="view-profile-btn"
                                onClick={() =>
                                    navigate(`/seller/${item.sellerName}`)
                                }
                            >
                                View Profile
                            </button>
                        )}
                    </div>

                    {!isOwner && (
                        <button className="contact-btn">Message Seller</button>
                    )}

                    {isOwner && (
                        <div className="owner-actions">
                            <button
                                className="edit-btn"
                                onClick={() => setShowEdit(true)}
                            >
                                Edit Listing
                            </button>

                            <button
                                className="delete-btn"
                                onClick={handleDelete}
                            >
                                Delete Listing
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {showEdit && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <h2>Edit Listing</h2>

                        <form onSubmit={handleSaveEdit}>
                            <input
                                type="text"
                                value={editData.itemName}
                                onChange={(e) =>
                                    setEditData({
                                        ...editData,
                                        itemName: e.target.value,
                                    })
                                }
                                placeholder="Item Name"
                                required
                            />

                            <textarea
                                value={editData.description}
                                onChange={(e) =>
                                    setEditData({
                                        ...editData,
                                        description: e.target.value,
                                    })
                                }
                                placeholder="Description"
                                required
                            />

                            <input
                                type="number"
                                value={editData.price}
                                onChange={(e) =>
                                    setEditData({
                                        ...editData,
                                        price: e.target.value,
                                    })
                                }
                                placeholder="Price"
                                required
                            />

                            <select
                                value={editData.category}
                                onChange={(e) =>
                                    setEditData({
                                        ...editData,
                                        category: e.target.value,
                                    })
                                }
                            >
                                <option>Electronics</option>
                                <option>Clothing</option>
                                <option>Books</option>
                                <option>Others</option>
                            </select>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() => setShowEdit(false)}
                                >
                                    Cancel
                                </button>

                                <button type="submit" className="save-btn">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ItemDetails;
