import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../css/sell.css";

function Sell() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState("");
    const [location, setLocation] = useState("");
    const [image, setImage] = useState(null);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));

        if (!storedUser) {
            navigate("/login");
            return;
        }

        setUser(storedUser);
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!image) {
            alert("Please upload an image.");
            return;
        }

        try {
            const formData = new FormData();

            formData.append("title", title);
            formData.append("description", description);
            formData.append("price", price);
            formData.append("category", category);
            formData.append("location", location);

            formData.append("sellerName", user.displayName);
            formData.append("sellerEmail", user.email);

            formData.append("image", image);

            await axios.post(
                "http://localhost:8080/api/items/upload",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            alert("Listing posted successfully!");
            navigate("/profile");
        } catch (err) {
            console.log(err);
            alert("Failed to post listing.");
        }
    };

    if (!user) return null;

    return (
        <div className="sell-container">
            <div className="sell-wrapper">
                <button className="back-btn" onClick={() => navigate("/dashboard")}>
                    ← Back
                </button>

                <div className="sell-header">
                    <h2>Create Listing</h2>
                    <p>Post an item for other students to trade or buy.</p>
                </div>

                <div className="sell-card">
                    <form className="sell-form" onSubmit={handleSubmit}>
                        <input
                            type="text"
                            placeholder="Item Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />

                        <textarea
                            placeholder="Item Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />

                        <div className="form-grid">
                            <input
                                type="number"
                                placeholder="Price (₱)"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                required
                            />

                            <input
                                type="text"
                                placeholder="Category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                required
                            />
                        </div>

                        <input
                            type="text"
                            placeholder="Location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            required
                        />

                        <label className="upload-box">
                            <span>
                                {image ? image.name : "Click to upload an image"}
                            </span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setImage(e.target.files[0])}
                                required
                            />
                        </label>

                        <button className="post-btn" type="submit">
                            Post Listing
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Sell;
