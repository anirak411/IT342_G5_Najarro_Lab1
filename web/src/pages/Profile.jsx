import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../css/profile.css";

function Profile() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [profilePic, setProfilePic] = useState("");
    const [coverPic, setCoverPic] = useState("");
    const [listings, setListings] = useState([]);

    useEffect(() => {
        let storedUser = null;

        try {
            storedUser = JSON.parse(localStorage.getItem("user"));
        } catch {
            localStorage.removeItem("user");
        }

        if (!storedUser) {
            navigate("/login");
            return;
        }

        setUser(storedUser);

        const profileKey = `profilePic_${storedUser.displayName}`;
        const coverKey = `coverPic_${storedUser.displayName}`;

        setProfilePic(localStorage.getItem(profileKey) || "");
        setCoverPic(localStorage.getItem(coverKey) || "");
    }, [navigate]);

    useEffect(() => {
        if (!user) return;

        const fetchListings = async () => {
            try {
                const res = await axios.get("http://localhost:8080/api/items");

                const myItems = res.data.filter((item) => {
                    return (
                        item.sellerName === user.displayName ||
                        item.seller === user.displayName ||
                        item.username === user.username ||
                        item.userId === user.id
                    );
                });

                setListings(myItems);
            } catch (err) {
                console.log("Failed to load listings:", err);
            }
        };

        fetchListings();
    }, [user]);

    const uploadImage = (e, type) => {
        if (!user) return;

        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onloadend = () => {
            const profileKey = `profilePic_${user.displayName}`;
            const coverKey = `coverPic_${user.displayName}`;

            if (type === "profile") {
                localStorage.setItem(profileKey, reader.result);
                setProfilePic(reader.result);
            }

            if (type === "cover") {
                localStorage.setItem(coverKey, reader.result);
                setCoverPic(reader.result);
            }
        };

        reader.readAsDataURL(file);
    };

    if (!user) return null;

    return (
        <div className="profile-page">
            <button className="back-btn" onClick={() => navigate("/dashboard")}>
                ←
            </button>

            <div
                className="profile-cover"
                style={{
                    backgroundImage: coverPic
                        ? `url(${coverPic})`
                        : `url("https://images.unsplash.com/photo-1522202176988-66273c2fd55f")`,
                }}
            >
                <label className="cover-upload">
                    ✎
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => uploadImage(e, "cover")}
                    />
                </label>
            </div>

            <div className="profile-card">
                <div className="profile-avatar-box">
                    {profilePic ? (
                        <img
                            src={profilePic}
                            alt="Profile"
                            className="profile-avatar-img"
                        />
                    ) : (
                        <div className="profile-avatar">
                            {user.displayName.charAt(0).toUpperCase()}
                        </div>
                    )}

                    <label className="avatar-upload">
                        ✎
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => uploadImage(e, "profile")}
                        />
                    </label>
                </div>

                <div className="profile-details">
                    <h2 className="profile-display">{user.displayName}</h2>
                    <p className="profile-fullname">{user.fullName}</p>
                </div>
            </div>

            <section className="profile-content">
                <div className="profile-section-header">
                    <h3>Your Listings</h3>
                    <p>{listings.length} items</p>
                </div>

                {listings.length === 0 ? (
                    <p className="empty-text">No listings yet.</p>
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
                                    className="listing-img"
                                />

                                <div className="listing-info">
                                    <h4>{item.title}</h4>
                                    <p className="listing-price">
                                        ₱{Number(item.price).toFixed(2)}
                                    </p>
                                    <p className="listing-category">
                                        {item.category}
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

export default Profile;
