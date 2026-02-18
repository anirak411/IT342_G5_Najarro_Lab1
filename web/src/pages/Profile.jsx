import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../css/profile.css";

function Profile() {
    const navigate = useNavigate();

    const email = localStorage.getItem("email") || "";

    const [fullName, setFullName] = useState(
        localStorage.getItem("user") || "User"
    );

    const [profilePic, setProfilePic] = useState(
        localStorage.getItem("profilePic") || ""
    );

    const [coverPic, setCoverPic] = useState(
        localStorage.getItem("coverPic") || ""
    );

    const [listings, setListings] = useState([]);

    useEffect(() => {
        const fetchListings = async () => {
            try {
                const res = await axios.get("http://localhost:8080/api/items");

                const myItems = res.data.filter(
                    (item) => item.sellerEmail === email
                );

                setListings(myItems);
            } catch {
                console.log("Failed to load listings");
            }
        };

        fetchListings();
    }, [email]);

    const uploadImage = (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onloadend = () => {
            if (type === "profile") {
                localStorage.setItem("profilePic", reader.result);
                setProfilePic(reader.result);
            }

            if (type === "cover") {
                localStorage.setItem("coverPic", reader.result);
                setCoverPic(reader.result);
            }
        };

        reader.readAsDataURL(file);
    };

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
                        <img src={profilePic} alt="Profile" className="profile-avatar-img" />
                    ) : (
                        <div className="profile-avatar">{fullName.charAt(0)}</div>
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
                    <input
                        className="name-edit"
                        value={fullName}
                        onChange={(e) => {
                            setFullName(e.target.value);
                            localStorage.setItem("user", e.target.value);
                        }}
                    />

                    <p>{email}</p>
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
                                <img src={item.imageUrl} alt={item.title} />

                                <div className="listing-info">
                                    <h4>{item.title}</h4>
                                    <p className="listing-price">
                                        ₱{Number(item.price).toFixed(2)}
                                    </p>
                                    <p className="listing-category">{item.category}</p>
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
