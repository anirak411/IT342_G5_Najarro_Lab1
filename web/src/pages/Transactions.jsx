import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import "../css/settings.css";

function Transactions() {
    const navigate = useNavigate();
    const storedUser = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem("user") || "null");
        } catch {
            return null;
        }
    }, []);

    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const email = (storedUser?.email || localStorage.getItem("email") || "").trim();
    const role = (storedUser?.role || localStorage.getItem("role") || "USER").toUpperCase();

    const fetchTransactions = async () => {
        if (!email) return;
        setLoading(true);
        try {
            const res = await axios.get("http://localhost:8080/api/transactions", {
                params: { email },
            });
            setTransactions(Array.isArray(res.data) ? res.data : []);
        } catch {
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!email) {
            navigate("/login");
            return;
        }
        fetchTransactions();
    }, [email, navigate]);

    const confirmDelivery = async (id) => {
        try {
            await axios.put(`http://localhost:8080/api/transactions/${id}/confirm-delivery`, {
                buyerEmail: email,
            });
            await fetchTransactions();
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                err?.response?.data ||
                "Failed to confirm delivery.";
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
                <h2 className="settings-title">Transactions</h2>
                <p className="settings-sub">Track escrow flow for your purchases and sales.</p>

                {role === "ADMIN" && (
                    <div className="settings-card">
                        <p>You are an admin. Use the admin panel to hold/release/refund escrow.</p>
                        <button className="apple-btn primary small" onClick={() => navigate("/admin")}>
                            Open Admin Panel
                        </button>
                    </div>
                )}

                {loading ? (
                    <p>Loading transactions...</p>
                ) : transactions.length === 0 ? (
                    <p>No transactions yet.</p>
                ) : (
                    <div className="settings-grid">
                        {transactions.map((tx) => {
                            const isBuyer = (tx.buyerEmail || "").toLowerCase() === email.toLowerCase();
                            return (
                                <div className="settings-card" key={tx.id}>
                                    <h3>{tx.itemTitle}</h3>
                                    <p>Amount: ₱{formatMoney(tx.itemPrice)}</p>
                                    <p>Status: {tx.status}</p>
                                    <p>Seller: {tx.sellerName}</p>
                                    <p>Buyer: {tx.buyerName}</p>
                                    <p>Created: {new Date(tx.createdAt).toLocaleString()}</p>

                                    {isBuyer && tx.status === "PAYMENT_HELD" && (
                                        <button
                                            className="apple-btn primary small"
                                            onClick={() => confirmDelivery(tx.id)}
                                        >
                                            Confirm Delivery
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Transactions;
