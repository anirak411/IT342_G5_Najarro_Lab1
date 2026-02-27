import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import "../css/dashboard.css";
import { getPrimaryImage, getItemImages } from "../utils/itemImages";
import { getListingAgeLabel } from "../utils/itemTime";
import { getCleanSellerName } from "../utils/seller";
import { isItemOwnedByUser } from "../utils/ownership";

import { Bell, User } from "lucide-react";

function Dashboard() {
    const navigate = useNavigate();
    const location = useLocation();
    let sessionUser = null;
    try {
        sessionUser = JSON.parse(localStorage.getItem("user"));
    } catch {
        sessionUser = null;
    }

    const getCurrentUser = () => {
        let parsedUser = null;
        try {
            parsedUser = JSON.parse(localStorage.getItem("user"));
        } catch {
            parsedUser = null;
        }

        return {
            displayName:
                parsedUser?.displayName ||
                localStorage.getItem("displayName") ||
                parsedUser?.fullName ||
                localStorage.getItem("fullName") ||
                "User",
            email:
                parsedUser?.email ||
                localStorage.getItem("email") ||
                "",
            profilePicUrl: parsedUser?.profilePicUrl || "",
            role:
                parsedUser?.role ||
                localStorage.getItem("role") ||
                "USER",
        };
    };

    const currentUser = getCurrentUser();
    const displayName = currentUser.displayName;
    const profileKey = `profilePic_${displayName}`;

    const [items, setItems] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");
    const [category, setCategory] = useState("All");
    const [sortOption, setSortOption] = useState("Newest");

    const [profilePic, setProfilePic] = useState(
        localStorage.getItem(profileKey) || currentUser?.profilePicUrl || ""
    );

    const [notifOpen, setNotifOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [chatUnreadCount, setChatUnreadCount] = useState(0);
    const [chatUnreadPreview, setChatUnreadPreview] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [modalPhotoIndex, setModalPhotoIndex] = useState(0);
    const [sellModalOpen, setSellModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingItemId, setEditingItemId] = useState(null);
    const [sellForm, setSellForm] = useState({
        title: "",
        description: "",
        price: "",
        category: "Electronics",
        condition: "Used",
        location: "",
        images: [],
    });
    const getApiErrorMessage = (error, fallback) => {
        const data = error?.response?.data;
        if (!data) return fallback;
        if (typeof data === "string") return data;
        return data.detail || data.message || fallback;
    };

    const dropdownRef = useRef(null);
    const listingsRef = useRef(null);

    useEffect(() => {
        fetchItems();

        const updateProfilePic = () => {
            setProfilePic(localStorage.getItem(profileKey) || "");
        };

        window.addEventListener("storage", updateProfilePic);

        return () => window.removeEventListener("storage", updateProfilePic);
    }, [profileKey]);

    useEffect(() => {
        const closeDropdowns = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setNotifOpen(false);
                setProfileOpen(false);
            }
        };

        document.addEventListener("mousedown", closeDropdowns);

        return () => document.removeEventListener("mousedown", closeDropdowns);
    }, []);

    useEffect(() => {
        const loadUnread = () => {
            const total = Number(localStorage.getItem("chat_unread_total") || "0");
            const previewRaw = localStorage.getItem("chat_unread_preview");
            let preview = [];
            try {
                preview = previewRaw ? JSON.parse(previewRaw) : [];
            } catch {
                preview = [];
            }
            setChatUnreadCount(total);
            setChatUnreadPreview(Array.isArray(preview) ? preview : []);
        };

        loadUnread();
        window.addEventListener("chatUnreadUpdated", loadUnread);
        return () => window.removeEventListener("chatUnreadUpdated", loadUnread);
    }, []);

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") {
                setSelectedIndex(null);
                setSellModalOpen(false);
            }

            if (selectedIndex !== null && e.key === "ArrowLeft") {
                showPreviousListing();
            }

            if (selectedIndex !== null && e.key === "ArrowRight") {
                showNextListing();
            }
        };

        document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, [selectedIndex, items.length, category, sortOption, searchTerm]);

    const fetchItems = async () => {
        try {
            const res = await axios.get("http://localhost:8080/api/items");
            setItems(res.data);
        } catch {
            console.log("Failed to load items");
        }
    };

    const normalizedSearch = searchTerm.trim().toLowerCase();

    const filteredItems = items
        .filter((item) => {
            if (!normalizedSearch) return true;

            const searchableText = [
                item.title,
                item.description,
                item.category,
                item.location,
                item.condition,
                getCleanSellerName(item.sellerName),
                item.sellerEmail,
                String(item.price ?? ""),
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return searchableText.includes(normalizedSearch);
        })
        .filter((item) => {
            if (category === "All") return true;
            return item.category === category;
        })
        .sort((a, b) => {
            if (sortOption === "PriceLow") return a.price - b.price;
            if (sortOption === "PriceHigh") return b.price - a.price;
            return b.id - a.id;
        });

    const formatPrice = (value) =>
        Number(value || 0).toLocaleString("en-PH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

    const isDashboardHome = location.pathname === "/dashboard";
    const selectedItem =
        selectedIndex !== null ? filteredItems[selectedIndex] : null;
    const selectedItemImages = selectedItem ? getItemImages(selectedItem) : [];
    const activeModalImage =
        selectedItemImages[modalPhotoIndex] || getPrimaryImage(selectedItem);

    const closeSellModal = () => {
        setSellModalOpen(false);
        setIsEditing(false);
        setEditingItemId(null);
        setSellForm({
            title: "",
            description: "",
            price: "",
            category: "Electronics",
            condition: "Used",
            location: "",
            images: [],
        });
    };

    const handleSellFormChange = (e) => {
        const { name, value } = e.target;
        setSellForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files || []);
        setSellForm((prev) => ({ ...prev, images: files }));
    };

    const handleSellSubmit = async (e) => {
        e.preventDefault();

        if (!currentUser.displayName || !currentUser.email) {
            alert("Please log in first.");
            navigate("/login");
            return;
        }

        if (!sellForm.images.length && !isEditing) {
            alert("Please upload at least one photo.");
            return;
        }

        const payload = new FormData();
        payload.append("title", sellForm.title);
        payload.append("description", sellForm.description);
        payload.append("price", sellForm.price);
        payload.append("category", sellForm.category);
        payload.append("condition", sellForm.condition);
        payload.append("location", sellForm.location);
        payload.append("sellerName", currentUser.displayName);
        payload.append("sellerEmail", currentUser.email);
        if (sellForm.images.length) {
            sellForm.images.forEach((file) => payload.append("images", file));
        }

        try {
            setIsSubmitting(true);
            if (isEditing && editingItemId) {
                await axios.put(
                    `http://localhost:8080/api/items/${editingItemId}`,
                    payload,
                    { headers: { "Content-Type": "multipart/form-data" } }
                );
            } else {
                await axios.post("http://localhost:8080/api/items/upload", payload, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            }
            await fetchItems();
            closeSellModal();
            alert(isEditing ? "Item updated successfully!" : "Item posted successfully!");
        } catch {
            alert(isEditing ? "Failed to update item." : "Failed to post item.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const openListingModal = (index) => setSelectedIndex(index);
    const closeListingModal = () => {
        setSelectedIndex(null);
        setModalPhotoIndex(0);
    };

    useEffect(() => {
        setModalPhotoIndex(0);
    }, [selectedItem?.id]);

    const showPreviousListing = () => {
        if (!filteredItems.length || selectedIndex === null) return;
        if (selectedIndex > 0) {
            setSelectedIndex(selectedIndex - 1);
        }
    };

    const showNextListing = () => {
        if (!filteredItems.length || selectedIndex === null) return;
        if (selectedIndex < filteredItems.length - 1) {
            setSelectedIndex(selectedIndex + 1);
        }
    };

    const showPreviousPhoto = () => {
        if (selectedItemImages.length <= 1) return;
        setModalPhotoIndex(
            (prev) => (prev - 1 + selectedItemImages.length) % selectedItemImages.length
        );
    };

    const showNextPhoto = () => {
        if (selectedItemImages.length <= 1) return;
        setModalPhotoIndex((prev) => (prev + 1) % selectedItemImages.length);
    };

    const isSelectedItemOwner =
        !!selectedItem && isItemOwnedByUser(selectedItem, currentUser);

    const handleEditListing = () => {
        if (!selectedItem || !isSelectedItemOwner) {
            alert("Only the listing owner can edit this item.");
            return;
        }

        setIsEditing(true);
        setEditingItemId(selectedItem.id);
        setSellForm({
            title: selectedItem.title || "",
            description: selectedItem.description || "",
            price: selectedItem.price || "",
            category: selectedItem.category || "Others",
            condition: selectedItem.condition || "Used",
            location: selectedItem.location || "",
            images: [],
        });
        closeListingModal();
        setSellModalOpen(true);
    };

    const handleDeleteListing = async () => {
        if (!selectedItem || !isSelectedItemOwner) {
            alert("Only the listing owner can delete this item.");
            return;
        }
        if (!window.confirm("Delete this listing?")) return;

        try {
            await axios.delete(
                `http://localhost:8080/api/items/${selectedItem.id}`,
                {
                    params: {
                        sellerEmail: sessionUser?.email || currentUser.email,
                        sellerName: currentUser.displayName,
                    },
                }
            );
            closeListingModal();
            await fetchItems();
            alert("Listing deleted.");
        } catch {
            alert("Failed to delete listing.");
        }
    };

    const handleMessageSellerFromModal = () => {
        if (!selectedItem) return;

        const sellerDisplayName = getCleanSellerName(selectedItem.sellerName);
        localStorage.setItem(
            "pendingChat",
            JSON.stringify({
                id: Date.now(),
                sellerName: sellerDisplayName,
                sellerEmail: selectedItem.sellerEmail,
                text: `Hi ${sellerDisplayName}, is "${selectedItem.title}" still available?`,
            })
        );
        window.dispatchEvent(new Event("pendingChat"));
        closeListingModal();
    };

    const handleStartEscrowFromModal = async () => {
        if (!selectedItem) return;
        if (!currentUser.email) {
            alert("Please log in first.");
            navigate("/login");
            return;
        }

        try {
            await axios.post("http://localhost:8080/api/transactions", {
                itemId: selectedItem.id,
                buyerEmail: currentUser.email,
                buyerName: currentUser.displayName || currentUser.email,
            });
            closeListingModal();
            if (window.confirm("Secure purchase started. Open Transactions page now?")) {
                navigate("/transactions");
            }
        } catch (err) {
            const msg = getApiErrorMessage(err, "Could not start secure purchase.");
            alert(msg);
        }
    };

    const clearNotifications = () => {
        setChatUnreadCount(0);
        setChatUnreadPreview([]);
        localStorage.setItem("chat_unread_total", "0");
        localStorage.setItem("chat_unread_preview", "[]");
        if (currentUser.email) {
            localStorage.setItem(
                `chat_mark_all_read_at_${currentUser.email.trim().toLowerCase()}`,
                new Date().toISOString()
            );
        }
        window.dispatchEvent(new Event("chatUnreadUpdated"));
    };

    const jumpToListings = () => {
        listingsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    return (
        <div className={`marketplace-page ${sidebarOpen ? "shifted" : ""}`}>
            <Sidebar
                isOpen={sidebarOpen}
                onToggle={() => setSidebarOpen(!sidebarOpen)}
            />

            <header className="marketplace-navbar">
                <button
                    className="menu-btn"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                    ☰
                </button>

                <h2 className="logo" onClick={() => navigate("/dashboard")}>
                    TradeOff
                </h2>

                <div className="nav-actions" ref={dropdownRef}>
                    <button
                        className="sell-btn"
                        onClick={() => setSellModalOpen(true)}
                    >
                        Sell Item
                    </button>

                    <div className="dropdown">
                        <button
                            className="icon-btn"
                            onClick={() => {
                                setNotifOpen(!notifOpen);
                                setProfileOpen(false);
                            }}
                        >
                            <Bell size={20} />
                            {chatUnreadCount > 0 && (
                                <span className="notif-badge">{chatUnreadCount}</span>
                            )}
                        </button>

                        {notifOpen && (
                            <div className="dropdown-menu">
                                <p className="dropdown-title">
                                    Notifications
                                </p>
                                {chatUnreadCount > 0 && (
                                    <button onClick={clearNotifications}>
                                        Mark all as read
                                    </button>
                                )}
                                {chatUnreadCount > 0 ? (
                                    <>
                                        {chatUnreadPreview.map((row) => (
                                            <p key={row.email} className="dropdown-empty">
                                                {`${
                                                    row?.type === "message"
                                                        ? "Message"
                                                        : "Notification"
                                                }: ${
                                                    row?.type === "message"
                                                        ? `New message from ${row.label}`
                                                        : row.label || "Activity update"
                                                } (${row.count})`}
                                            </p>
                                        ))}
                                    </>
                                ) : (
                                    <p className="dropdown-empty">
                                        No notifications yet.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="dropdown">
                        <button
                            className="profile-btn"
                            onClick={() => {
                                setProfileOpen(!profileOpen);
                                setNotifOpen(false);
                            }}
                        >
                            {profilePic ? (
                                <img src={profilePic} alt="Profile" />
                            ) : (
                                <User size={20} />
                            )}
                        </button>

                        {profileOpen && (
                            <div className="dropdown-menu">
                                <button
                                    onClick={() => navigate("/profile")}
                                >
                                    My Profile
                                </button>

                                <button
                                    onClick={() => navigate("/settings")}
                                >
                                    Settings
                                </button>

                                <button
                                    className="logout-option"
                                    onClick={() => {
                                        localStorage.removeItem("user");
                                        localStorage.removeItem("displayName");
                                        localStorage.removeItem("fullName");
                                        localStorage.removeItem("email");
                                        localStorage.removeItem("role");
                                        navigate("/login");
                                    }}
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="marketplace-content">
                <Outlet />

                {isDashboardHome && (
                    <>
                        <section className="hero-banner">
                            <div className="hero-overlay">
                                <h1>
                                    Trade smarter. <br />
                                    Find exciting deals.
                                </h1>

                                <div className="hero-search">
                                    <input
                                        placeholder="Search listings..."
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                    />

                                    <button className="search-btn" onClick={jumpToListings}>
                                        ➜
                                    </button>
                                </div>

                                <div className="filter-bar">
                                    <select
                                        value={category}
                                        onChange={(e) =>
                                            setCategory(e.target.value)
                                        }
                                    >
                                        <option value="All">
                                            All Categories
                                        </option>
                                        <option value="Electronics">
                                            Electronics
                                        </option>
                                        <option value="Clothing">
                                            Clothing
                                        </option>
                                        <option value="Books">Books</option>
                                        <option value="Others">Others</option>
                                    </select>

                                    <select
                                        value={sortOption}
                                        onChange={(e) =>
                                            setSortOption(e.target.value)
                                        }
                                    >
                                        <option value="Newest">Newest</option>
                                        <option value="PriceLow">
                                            Price: Low → High
                                        </option>
                                        <option value="PriceHigh">
                                            Price: High → Low
                                        </option>
                                    </select>
                                </div>
                            </div>
                        </section>

                        <section className="recent-section" ref={listingsRef}>
                            <h2>Listed Recently</h2>

                            <div className="listing-row">
                                {filteredItems.map((item, index) => (
                                    <div
                                        key={item.id}
                                        className="listing-card"
                                        onClick={() => openListingModal(index)}
                                    >
                                        <div className="listing-image-wrap">
                                            <img
                                                src={getPrimaryImage(item)}
                                                alt={item.title}
                                            />
                                        </div>

                                        <div className="listing-info">
                                            <p className="listing-price">
                                                ₱{formatPrice(item.price)}
                                            </p>
                                            <p className="listing-title">
                                                {item.title}
                                            </p>
                                            <p className="listing-sub">
                                                {item.location} •{" "}
                                                {item.category} • {item.condition || "Used"} •{" "}
                                                {getListingAgeLabel(item)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </>
                )}
            </main>

            {selectedItem && (
                <div className="modal-overlay" onClick={closeListingModal}>
                    <div
                        className="fb-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button className="fb-close" onClick={closeListingModal}>
                            ✕
                        </button>

                        {selectedIndex > 0 && (
                            <button className="fb-arrow left" onClick={showPreviousListing}>
                                ←
                            </button>
                        )}

                        <div className="fb-modal-left">
                            <img
                                src={activeModalImage}
                                alt={selectedItem.title}
                            />
                            {selectedItemImages.length > 1 && (
                                <>
                                    <button
                                        className="photo-carousel-btn left"
                                        onClick={showPreviousPhoto}
                                    >
                                        ‹
                                    </button>
                                    <button
                                        className="photo-carousel-btn right"
                                        onClick={showNextPhoto}
                                    >
                                        ›
                                    </button>
                                    <div className="photo-carousel-indicator">
                                        {modalPhotoIndex + 1} / {selectedItemImages.length}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="fb-modal-right">
                            <div className="modal-item-head">
                                <p className="modal-item-price">
                                    ₱{formatPrice(selectedItem.price)}
                                </p>
                                <h3 className="modal-item-title">
                                    {selectedItem.title}
                                </h3>
                            </div>

                            <div className="modal-chip-row">
                                <span className="modal-chip">{selectedItem.category}</span>
                                <span className="modal-chip">
                                    {selectedItem.condition || "Used"}
                                </span>
                                <span className="modal-chip">
                                    {getListingAgeLabel(selectedItem)}
                                </span>
                            </div>

                            <div className="modal-info-card">
                                <p className="modal-item-seller">
                                    Seller: {getCleanSellerName(selectedItem.sellerName)}
                                </p>
                                <p className="modal-item-sub">
                                    Location: {selectedItem.location}
                                </p>
                            </div>

                            <div className="modal-description-card">
                                <p className="modal-description-label">Description</p>
                                <p className="modal-item-description">
                                    {selectedItem.description || "No description provided."}
                                </p>
                            </div>

                            {isSelectedItemOwner ? (
                                <div className="owner-actions modal-actions">
                                    <button className="post-btn" onClick={handleEditListing}>
                                        Edit Listing
                                    </button>
                                    <button
                                        className="owner-delete-btn"
                                        onClick={handleDeleteListing}
                                    >
                                        Delete Listing
                                    </button>
                                </div>
                            ) : (
                                <div className="modal-actions owner-actions">
                                    <button
                                        className="post-btn"
                                        onClick={handleMessageSellerFromModal}
                                    >
                                        Message Seller
                                    </button>
                                    <button
                                        className="owner-delete-btn"
                                        onClick={handleStartEscrowFromModal}
                                    >
                                        Secure This Purchase
                                    </button>
                                </div>
                            )}
                        </div>

                        {selectedIndex < filteredItems.length - 1 && (
                            <button className="fb-arrow right" onClick={showNextListing}>
                                →
                            </button>
                        )}
                    </div>
                </div>
            )}

            {sellModalOpen && (
                <div className="modal-overlay" onClick={closeSellModal}>
                    <div
                        className="sell-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button className="fb-close" onClick={closeSellModal}>
                            ✕
                        </button>

                        <h3>{isEditing ? "Edit Listing" : "Sell Item"}</h3>
                        <form onSubmit={handleSellSubmit}>
                            <input
                                name="title"
                                value={sellForm.title}
                                onChange={handleSellFormChange}
                                placeholder="Title"
                                required
                            />

                            <textarea
                                name="description"
                                value={sellForm.description}
                                onChange={handleSellFormChange}
                                placeholder="Description"
                                required
                            />

                            <div className="form-grid">
                                <input
                                    name="price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={sellForm.price}
                                    onChange={handleSellFormChange}
                                    placeholder="Price"
                                    required
                                />
                                <input
                                    name="location"
                                    value={sellForm.location}
                                    onChange={handleSellFormChange}
                                    placeholder="Location"
                                    required
                                />
                            </div>

                            <select
                                name="category"
                                value={sellForm.category}
                                onChange={handleSellFormChange}
                                required
                            >
                                <option value="Electronics">Electronics</option>
                                <option value="Clothing">Clothing</option>
                                <option value="Books">Books</option>
                                <option value="Others">Others</option>
                            </select>

                            <select
                                name="condition"
                                value={sellForm.condition}
                                onChange={handleSellFormChange}
                                required
                            >
                                <option value="Brand New">Brand New</option>
                                <option value="Like New">Like New</option>
                                <option value="Used">Used</option>
                                <option value="Heavily Used">Heavily Used</option>
                            </select>

                            <label className="upload-box">
                                {sellForm.images.length
                                    ? `${sellForm.images.length} photo(s) selected`
                                    : isEditing
                                      ? "Upload new photos (optional)"
                                      : "Upload item photos"}
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageChange}
                                    required={!isEditing}
                                />
                            </label>

                            <button
                                className="post-btn"
                                type="submit"
                                disabled={isSubmitting}
                            >
                                {isSubmitting
                                    ? isEditing
                                        ? "Updating..."
                                        : "Posting..."
                                    : isEditing
                                      ? "Update Listing"
                                      : "Post Listing"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;
