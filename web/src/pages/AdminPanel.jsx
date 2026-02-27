import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import "../css/settings.css";

function AdminPanel() {
    const navigate = useNavigate();
    const storedUser = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem("user") || "null");
        } catch {
            return null;
        }
    }, []);

    const adminEmail = (storedUser?.email || localStorage.getItem("email") || "").trim();
    const role = (storedUser?.role || localStorage.getItem("role") || "USER").toUpperCase();

    const [transactions, setTransactions] = useState([]);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        if (!adminEmail) return;
        setLoading(true);
        try {
            const [txRes, itemRes] = await Promise.all([
                axios.get("http://localhost:8080/api/transactions", {
                    params: { adminEmail },
                }),
                axios.get("http://localhost:8080/api/items"),
            ]);
            setTransactions(Array.isArray(txRes.data) ? txRes.data : []);
            setItems(Array.isArray(itemRes.data) ? itemRes.data : []);
        } catch (err) {
            const status = err?.response?.status;
            if (status === 403) {
                alert("Admin role required.");
                navigate("/dashboard");
                return;
            }
            setTransactions([]);
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!adminEmail) {
            navigate("/login");
            return;
        }
        if (role !== "ADMIN") {
            navigate("/settings");
            return;
        }
        fetchData();
    }, [adminEmail, role, navigate]);

    const callAdminAction = async (id, action) => {
        try {
            await axios.put(`http://localhost:8080/api/transactions/${id}/${action}`, {
                adminEmail,
            });
            await fetchData();
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                err?.response?.data ||
                `Failed to ${action} transaction.`;
            alert(msg);
        }
    };

    const deleteListing = async (item) => {
        if (!window.confirm(`Delete listing "${item.title}"?`)) return;

        try {
            await axios.delete(`http://localhost:8080/api/items/${item.id}`, {
                params: {
                    sellerEmail: item.sellerEmail || adminEmail,
                    sellerName: item.sellerName || "",
                    adminEmail,
                },
            });
            await fetchData();
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                err?.response?.data ||
                "Failed to delete listing.";
            alert(msg);
        }
    };

    const formatMoney = (value) =>
        Number(value || 0).toLocaleString("en-PH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

    return (
        <div className="settings-page">
            <div className="settings-shell">
                <BackButton className="settings-back-btn" fallback="/dashboard" />
                <h2 className="settings-title">Admin Panel</h2>
                <p className="settings-sub">Moderate listings and handle escrow transaction states.</p>

                {loading ? (
                    <p>Loading admin data...</p>
                ) : (
                    <>
                        <div className="settings-card">
                            <h3>Escrow Transactions</h3>
                            {transactions.length === 0 ? (
                                <p>No transactions found.</p>
                            ) : (
                                <div className="settings-grid">
                                    {transactions.map((tx) => (
                                        <div className="settings-card" key={tx.id}>
                                            <h3>{tx.itemTitle}</h3>
                                            <p>Amount: ₱{formatMoney(tx.itemPrice)}</p>
                                            <p>Status: {tx.status}</p>
                                            <p>Buyer: {tx.buyerName}</p>
                                            <p>Seller: {tx.sellerName}</p>
                                            <div className="settings-actions">
                                                {tx.status === "PENDING" && (
                                                    <button
                                                        className="apple-btn primary small"
                                                        onClick={() => callAdminAction(tx.id, "hold")}
                                                    >
                                                        Hold Payment
                                                    </button>
                                                )}
                                                {tx.status === "DELIVERY_CONFIRMED" && (
                                                    <button
                                                        className="apple-btn primary small"
                                                        onClick={() => callAdminAction(tx.id, "complete")}
                                                    >
                                                        Release Payment
                                                    </button>
                                                )}
                                                {(tx.status === "PAYMENT_HELD" ||
                                                    tx.status === "DELIVERY_CONFIRMED") && (
                                                    <button
                                                        className="apple-btn danger"
                                                        onClick={() => callAdminAction(tx.id, "refund")}
                                                    >
                                                        Refund
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="settings-card">
                            <h3>Listing Moderation</h3>
                            {items.length === 0 ? (
                                <p>No listings available.</p>
                            ) : (
                                <div className="settings-grid">
                                    {items.map((item) => (
                                        <div className="settings-card" key={item.id}>
                                            <h3>{item.title}</h3>
                                            <p>Seller: {item.sellerName}</p>
                                            <p>Price: ₱{formatMoney(item.price)}</p>
                                            <button
                                                className="apple-btn danger"
                                                onClick={() => deleteListing(item)}
                                            >
                                                Delete Listing
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default AdminPanel;
