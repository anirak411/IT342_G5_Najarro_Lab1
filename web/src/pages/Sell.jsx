import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../css/sell.css";

function SellItem() {
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState("Others");
    const [location, setLocation] = useState("");
    const [image, setImage] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const formData = new FormData();

            formData.append("sellerName", localStorage.getItem("user"));
            formData.append("sellerEmail", localStorage.getItem("email"));

            formData.append("title", title);
            formData.append("description", description);
            formData.append("price", price);
            formData.append("category", category);
            formData.append("location", location);
            formData.append("image", image);

            await axios.post("http://localhost:8080/api/items/upload", formData);

            alert("Listing posted successfully!");
            navigate("/dashboard");
        } catch (err) {
            alert("Failed to post listing.");
        }
    };

    return (
        <div className="sell-container">
            <div className="sell-wrapper">
                <div className="sell-header">
                    <button className="back-btn" onClick={() => navigate("/dashboard")}>
                        ← Back
                    </button>

                    <h2>Post Listing</h2>
                    <p>Upload your item and start trading.</p>
                </div>

                <div className="sell-card">
                    <form onSubmit={handleSubmit} className="sell-form">
                        <label className="upload-box">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setImage(e.target.files[0])}
                                required
                            />
                            <span>{image ? image.name : "Click to upload an image"}</span>
                        </label>

                        <div className="form-grid">
                            <input
                                type="text"
                                placeholder="Item Title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />

                            <input
                                type="number"
                                step="0.01"
                                placeholder="Price (₱)"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                required
                            />
                        </div>

                        <textarea
                            placeholder="Item Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />

                        <div className="form-grid">
                            <input
                                type="text"
                                placeholder="Location (e.g. CIT-U)"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                required
                            />

                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                <option value="Electronics">Electronics</option>
                                <option value="Clothing">Clothing</option>
                                <option value="Books">Books</option>
                                <option value="Others">Others</option>
                            </select>
                        </div>

                        <button type="submit" className="post-btn">
                            Post Listing
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default SellItem;
