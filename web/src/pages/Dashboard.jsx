import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import Sidebar from "../pages/Sidebar";
import "../css/dashboard.css";

import { Bell, MessageCircle, X, Send } from "lucide-react";

function Dashboard() {
    const navigate = useNavigate();
    const location = useLocation();

    const storedUser = JSON.parse(localStorage.getItem("user"));
    const displayName = storedUser?.displayName || "User";

    const profileKey = `profilePic_${displayName}`;

    const [items, setItems] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");
    const [category, setCategory] = useState("All");
    const [sortOption, setSortOption] = useState("Newest");

    const [profilePic, setProfilePic] = useState(
        localStorage.getItem(profileKey) || ""
    );

    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");

    const menuRef = useRef(null);

    useEffect(() => {
        fetchItems();

        const updateProfilePic = () => {
            setProfilePic(localStorage.getItem(profileKey) || "");
        };

        window.addEventListener("storage", updateProfilePic);

        return () =>
            window.removeEventListener("storage", updateProfilePic);
    }, [profileKey]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setProfileMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchItems = async () => {
        try {
            const res = await axios.get("http://localhost:8080/api/items");
            setItems(res.data);
        } catch {
            console.log("Failed to load items");
        }
    };

    const fetchMessages = async () => {
        try {
            const res = await axios.get(
                `http://localhost:8080/api/chat/${displayName}`
            );
            setMessages(res.data);
        } catch {
            console.log("Failed to load messages");
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        try {
            await axios.post("http://localhost:8080/api/chat/send", {
                sender: displayName,
                receiver: "Admin",
                content: newMessage,
            });

            setNewMessage("");
            fetchMessages();
        } catch {
            console.log("Failed to send message");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/login");
    };

    useEffect(() => {
        if (chatOpen) fetchMessages();
    }, [chatOpen]);

    const filteredItems = items
        .filter((item) => {
            const term = searchTerm.toLowerCase();

            return (
                (item.title || "").toLowerCase().includes(term) ||
                (item.category || "").toLowerCase().includes(term) ||
                (item.location || "").toLowerCase().includes(term) ||
                (item.description || "").toLowerCase().includes(term) ||
                (item.sellerName || "").toLowerCase().includes(term)
            );
        })
        .filter((item) => {
            if (category === "All") return true;
            return (item.category || "Others") === category;
        })
        .sort((a, b) => {
            if (sortOption === "PriceLow") return a.price - b.price;
            if (sortOption === "PriceHigh") return b.price - a.price;
            return b.id - a.id;
        });

    const isDashboardHome = location.pathname === "/dashboard";

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

                <div className="nav-actions">
                    <button
                        className="sell-btn"
                        onClick={() => navigate("/sell")}
                    >
                        Sell Item
                    </button>

                    <button className="icon-btn">
                        <Bell size={20} />
                    </button>

                    <div className="profile-dropdown" ref={menuRef}>
                        <button
                            className="profile-circle"
                            onClick={() =>
                                setProfileMenuOpen(!profileMenuOpen)
                            }
                        >
                            {profilePic ? (
                                <img
                                    src={profilePic}
                                    alt="Profile"
                                    className="profile-pic"
                                />
                            ) : (
                                displayName.charAt(0).toUpperCase()
                            )}
                        </button>

                        {profileMenuOpen && (
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
                                    className="logout-btn"
                                    onClick={handleLogout}
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
                                    Trade smarter. <br /> Find exciting deals.
                                </h1>

                                <div className="hero-search">
                                    <input
                                        type="text"
                                        placeholder="Search listings..."
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                    />
                                    <button>➜</button>
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

                        <section className="recent-section">
                            <h2>
                                {searchTerm || category !== "All"
                                    ? "Filtered Results"
                                    : "Listed Recently"}
                            </h2>

                            {filteredItems.length === 0 ? (
                                <p className="empty-text">
                                    No matching listings found.
                                </p>
                            ) : (
                                <div className="listing-row">
                                    {filteredItems.map((item) => (
                                        <div
                                            key={item.id}
                                            className="listing-card"
                                            onClick={() =>
                                                navigate(`/item/${item.id}`)
                                            }
                                        >
                                            <img
                                                src={item.imageUrl}
                                                alt={item.title}
                                            />

                                            <div className="listing-info">
                                                <h3>{item.title}</h3>

                                                <p className="price">
                                                    ₱
                                                    {Number(
                                                        item.price
                                                    ).toLocaleString("en-PH", {
                                                        minimumFractionDigits: 2,
                                                    })}
                                                </p>

                                                <p className="seller">
                                                    {item.category || "Others"}
                                                </p>

                                                {item.location && (
                                                    <p className="seller">
                                                        {item.location}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </>
                )}
            </main>

            <button
                className="chat-widget"
                onClick={() => setChatOpen(!chatOpen)}
            >
                <MessageCircle size={22} />
            </button>

            {chatOpen && (
                <div className="chat-popup">
                    <div className="chat-header">
                        <h4>Messages</h4>

                        <button onClick={() => setChatOpen(false)}>
                            <X size={18} />
                        </button>
                    </div>

                    <div className="chat-body">
                        {messages.length === 0 ? (
                            <p>No messages yet.</p>
                        ) : (
                            messages.map((msg, index) => (
                                <div key={index} className="chat-message">
                                    {msg.sender}: {msg.content}
                                </div>
                            ))
                        )}
                    </div>

                    <div className="chat-input">
                        <input
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={(e) =>
                                setNewMessage(e.target.value)
                            }
                        />

                        <button onClick={sendMessage}>
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;
