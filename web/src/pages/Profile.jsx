import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../css/profile.css";

function Profile() {
    const navigate = useNavigate();

    const [fullName, setFullName] = useState(localStorage.getItem("user") || "");
    const [email] = useState(localStorage.getItem("email") || "");
    const [listings, setListings] = useState([]);

    useEffect(() => {
        const fetchListings = async () => {
            try {
                const res = await axios.get(
                    "http://localhost:8080/api/items/my-listings"
                );
                setListings(res.data);
            } catch (err) {
                console.log("Failed to load listings");
            }
        };

        fetchListings();
    }, []);

    return (
        <div className="profile-page">
            <button className="back-btn" onClick={() => navigate("/dashboard")}>
                ← Back
            </button>

            <div className="profile-cover">
                <img
                    src="/images/cover-placeholder.png"
                    alt="Cover"
                    className="cover-img"
                />

                <div className="profile-avatar-box">
                    <img
                        src="/images/profile-placeholder.png"
                        alt="Profile"
                        className="profile-avatar"
                    />
                </div>
            </div>

            <div className="profile-info">
                <h2>{fullName}</h2>
                <p>{email}</p>

                <button className="edit-btn">Edit Profile</button>
            </div>

            <div className="profile-tabs">
                <button className="tab active">Listings</button>
                <button className="tab">About</button>
                <button className="tab">Settings</button>
            </div>

            <div className="profile-content">
                <h3>Your Listings</h3>

                {listings.length === 0 ? (
                    <p className="empty-text">You haven’t posted anything yet.</p>
                ) : (
                    listings.map((item) => (
                        <div key={item.id} className="listing-post">
                            <h4>{item.title}</h4>
                            <p>{item.description}</p>
                            <span className="listing-price">₱{item.price}</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default Profile;
