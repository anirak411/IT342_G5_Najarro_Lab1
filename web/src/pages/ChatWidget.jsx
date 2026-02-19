import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import "../css/chat.css";

function ChatWidget() {
    const [open, setOpen] = useState(false);
    const [users, setUsers] = useState([]);
    const [activeChat, setActiveChat] = useState("");
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [unreadCount, setUnreadCount] = useState(0);
    const handledPendingId = useRef(null);
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const currentEmail = (storedUser?.email || "").trim();
    const unreadStorageKey = currentEmail ? `chat_last_seen_${currentEmail}` : "";

    const readLastSeen = useCallback(() => {
        if (!unreadStorageKey) return {};
        const raw = localStorage.getItem(unreadStorageKey);
        try {
            return raw ? JSON.parse(raw) : {};
        } catch {
            return {};
        }
    }, [unreadStorageKey]);

    const writeLastSeen = useCallback(
        (value) => {
            if (!unreadStorageKey) return;
            localStorage.setItem(unreadStorageKey, JSON.stringify(value));
        },
        [unreadStorageKey]
    );

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await axios.get("http://localhost:8080/api/users");
                const filteredUsers = res.data.filter(
                    (u) => (u.email || "").toLowerCase() !== currentEmail.toLowerCase()
                );
                setUsers(filteredUsers);
                if (!activeChat && filteredUsers.length > 0) {
                    setActiveChat(filteredUsers[0].email);
                }
            } catch (err) {
                console.log("Failed to load users");
            }
        };

        if (currentEmail) fetchUsers();
    }, [currentEmail]);

    const contacts = useMemo(
        () =>
            users.map((u) => ({
                key: u.email,
                label: u.displayName || u.fullName || u.email,
                email: u.email,
            })),
        [users]
    );

    const activeContact = contacts.find((c) => c.key === activeChat);

    const loadConversation = useCallback(async () => {
        if (!currentEmail || !activeChat) return;
        try {
            const res = await axios.get("http://localhost:8080/api/messages", {
                params: { user1: currentEmail, user2: activeChat },
            });
            setMessages(res.data || []);
        } catch (err) {
            console.log("Failed to load messages");
        }
    }, [activeChat, currentEmail]);

    useEffect(() => {
        loadConversation();
    }, [loadConversation]);

    const refreshUnreadCounts = useCallback(async () => {
        if (!currentEmail || contacts.length === 0) return;

        const lastSeen = readLastSeen();
        const globalMarkRaw = localStorage.getItem(
            `chat_mark_all_read_at_${currentEmail.toLowerCase()}`
        );
        const globalMarkTime = globalMarkRaw
            ? new Date(globalMarkRaw).getTime()
            : 0;
        const rows = await Promise.all(
            contacts.map(async (contact) => {
                try {
                    const res = await axios.get("http://localhost:8080/api/messages", {
                        params: { user1: currentEmail, user2: contact.email },
                    });
                    const conv = res.data || [];
                    const seenIso = lastSeen[contact.email] || "";
                    const seenTime = Math.max(
                        seenIso ? new Date(seenIso).getTime() : 0,
                        globalMarkTime
                    );
                    const unread = conv.filter((msg) => {
                        const fromOther =
                            (msg.senderEmail || "").toLowerCase() !==
                            currentEmail.toLowerCase();
                        const toMe =
                            (msg.receiverEmail || "").toLowerCase() ===
                            currentEmail.toLowerCase();
                        const msgTime = msg.createdAt
                            ? new Date(msg.createdAt).getTime()
                            : 0;
                        return fromOther && toMe && msgTime > seenTime;
                    }).length;
                    return {
                        type: "message",
                        email: contact.email,
                        label: contact.label,
                        count: unread,
                    };
                } catch {
                    return {
                        type: "message",
                        email: contact.email,
                        label: contact.label,
                        count: 0,
                    };
                }
            })
        );

        const unreadRows = rows.filter((r) => r.count > 0);
        const total = unreadRows.reduce((sum, r) => sum + r.count, 0);
        setUnreadCount(total);
        localStorage.setItem("chat_unread_total", String(total));
        localStorage.setItem("chat_unread_preview", JSON.stringify(unreadRows.slice(0, 3)));
        window.dispatchEvent(new Event("chatUnreadUpdated"));
    }, [contacts, currentEmail, readLastSeen]);

    useEffect(() => {
        if (!open || !activeChat) return;
        const id = setInterval(() => {
            loadConversation();
        }, 3000);
        return () => clearInterval(id);
    }, [open, activeChat, loadConversation]);

    useEffect(() => {
        if (!currentEmail) return;
        refreshUnreadCounts();
        const id = setInterval(() => {
            refreshUnreadCounts();
        }, 8000);
        return () => clearInterval(id);
    }, [currentEmail, refreshUnreadCounts]);

    useEffect(() => {
        const onUnreadUpdated = () => refreshUnreadCounts();
        window.addEventListener("chatUnreadUpdated", onUnreadUpdated);
        return () => window.removeEventListener("chatUnreadUpdated", onUnreadUpdated);
    }, [refreshUnreadCounts]);

    useEffect(() => {
        if (!open || !activeChat || !currentEmail) return;
        const lastSeen = readLastSeen();
        lastSeen[activeChat] = new Date().toISOString();
        writeLastSeen(lastSeen);
        refreshUnreadCounts();
    }, [open, activeChat, currentEmail, readLastSeen, writeLastSeen, refreshUnreadCounts]);

    const sendMessage = async (content) => {
        const text = (content ?? input).trim();
        if (!text || !currentEmail || !activeChat) return;

        try {
            await axios.post("http://localhost:8080/api/messages", {
                senderEmail: currentEmail,
                receiverEmail: activeChat,
                content: text,
            });
            if (content === undefined) setInput("");
            await loadConversation();
            await refreshUnreadCounts();
        } catch (err) {
            const status = err?.response?.status;
            const serverMsg =
                err?.response?.data?.message ||
                (typeof err?.response?.data === "string"
                    ? err.response.data
                    : "");

            if (!status) {
                alert("Failed to send message: backend is not running/reachable.");
                return;
            }

            alert(
                `Failed to send message${serverMsg ? `: ${serverMsg}` : ` (HTTP ${status})`}.`
            );
        }
    };

    const applyPendingChat = useCallback(async () => {
        const raw = localStorage.getItem("pendingChat");
        if (!raw) return;

        try {
            const pending = JSON.parse(raw);
            if (!pending?.id || handledPendingId.current === pending.id) return;
            handledPendingId.current = pending.id;

            const targetEmail = (pending.sellerEmail || "").trim();
            if (!targetEmail) {
                localStorage.removeItem("pendingChat");
                return;
            }

            setOpen(true);
            setActiveChat(targetEmail);

            setUsers((prev) => {
                const exists = prev.some(
                    (u) => (u.email || "").toLowerCase() === targetEmail.toLowerCase()
                );
                if (exists) return prev;
                return [
                    ...prev,
                    {
                        id: `pending-${pending.id}`,
                        email: targetEmail,
                        displayName: pending.sellerName || targetEmail,
                        fullName: pending.sellerName || targetEmail,
                    },
                ];
            });

            if (pending.text && currentEmail) {
                await axios.post("http://localhost:8080/api/messages", {
                    senderEmail: currentEmail,
                    receiverEmail: targetEmail,
                    content: pending.text,
                });
            }
            localStorage.removeItem("pendingChat");
            await loadConversation();
        } catch {
            localStorage.removeItem("pendingChat");
        }
    }, [currentEmail, loadConversation]);

    useEffect(() => {
        applyPendingChat();
        window.addEventListener("pendingChat", applyPendingChat);
        return () => window.removeEventListener("pendingChat", applyPendingChat);
    }, [applyPendingChat]);

    return (
        <>
            <button className="chat-float-btn" onClick={() => setOpen(!open)}>
                Chat
                {unreadCount > 0 && (
                    <span className="chat-badge">{unreadCount}</span>
                )}
            </button>

            {open && (
                <div className="chat-box">
                    <div className="chat-header">
                        <h3>Messages</h3>
                        <button onClick={() => setOpen(false)}>✕</button>
                    </div>

                    <div className="chat-contacts">
                        {contacts.length === 0 ? (
                            <p className="empty-chat">No users found.</p>
                        ) : (
                            contacts.map((contact) => (
                                <button
                                    key={contact.key}
                                    className={
                                        activeChat === contact.key
                                            ? "contact active"
                                            : "contact"
                                    }
                                    onClick={() => setActiveChat(contact.key)}
                                >
                                    {contact.label}
                                </button>
                            ))
                        )}
                    </div>

                    <div className="chat-body">
                        {messages.length === 0 ? (
                            <p className="empty-chat">
                                No messages yet. Start the conversation.
                            </p>
                        ) : (
                            messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={
                                        (msg.senderEmail || "").toLowerCase() ===
                                        currentEmail.toLowerCase()
                                            ? "chat-message user"
                                            : "chat-message"
                                    }
                                >
                                    <strong>
                                        {(msg.senderEmail || "").toLowerCase() ===
                                        currentEmail.toLowerCase()
                                            ? "You"
                                            : activeContact?.label || msg.senderEmail}
                                        :
                                    </strong>{" "}
                                    {msg.content}
                                </div>
                            ))
                        )}
                    </div>

                    <div className="chat-input-area">
                        <input
                            type="text"
                            placeholder={`Message ${activeContact?.label || "user"}...`}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    sendMessage();
                                }
                            }}
                        />
                        <button onClick={() => sendMessage()}>Send</button>
                    </div>
                </div>
            )}
        </>
    );
}

export default ChatWidget;
