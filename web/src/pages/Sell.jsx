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
    const [image, setImage] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("description", description);
            formData.append("price", price);
            formData.append("category", category);
            formData.append("image", image);

            await axios.post("http://localhost:8080/api/items/create", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            alert("Listing posted successfully!");
            navigate("/dashboard");
        } catch (err) {
            alert("Failed to post listing.");
        }
    };

    return (
        <div className="sell-page">
            <div className="sell-card">
                <button className="back-btn" onClick={() => navigate("/dashboard")}>
                    ← Back
                </button>

                <h2 className="sell-title">Post a New Listing</h2>
                <p className="sell-subtitle">
                    Upload your item and start trading with students.
                </p>

                <form className="sell-form" onSubmit={handleSubmit}>
                    <label className="upload-box">
                        {image ? image.name : "Click to upload an image"}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImage(e.target.files[0])}
                            required
                        />
                    </label>

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

                    <input
                        type="number"
                        placeholder="Price (₱)"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                    />

                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <option>Electronics</option>
                        <option>Clothing</option>
                        <option>Books</option>
                        <option>Others</option>
                    </select>

                    <button type="submit" className="post-btn">
                        Post Listing
                    </button>
                </form>
            </div>
        </div>
    );
}

export default SellItem;
