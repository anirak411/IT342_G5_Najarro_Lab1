import React, { useEffect, useState } from "react";
import axios from "axios";
import "../css/chat.css";

function ChatWidget() {
    const [open, setOpen] = useState(false);
    const [users, setUsers] = useState([]);
    const [activeChat, setActiveChat] = useState("Tech Support");
    const [messages, setMessages] = useState({
        "Tech Support": [],
    });
    const [input, setInput] = useState("");

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await axios.get("http://localhost:8080/api/users");

                const currentUser = localStorage.getItem("fullName");

                const filteredUsers = res.data.filter(
                    (u) => u.fullName !== currentUser
                );

                setUsers(filteredUsers);

                const newMessages = { "Tech Support": [] };

                filteredUsers.forEach((u) => {
                    newMessages[u.fullName] = [];
                });

                setMessages(newMessages);
            } catch (err) {
                console.log("Failed to load users");
            }
        };

        fetchUsers();
    }, []);

    const sendMessage = () => {
        if (!input.trim()) return;

        setMessages((prev) => ({
            ...prev,
            [activeChat]: [
                ...(prev[activeChat] || []),
                { sender: "You", text: input },
            ],
        }));

        setInput("");
    };

    return (
        <>
            <button className="chat-float-btn" onClick={() => setOpen(!open)}>
                Chat
            </button>

            {open && (
                <div className="chat-box">
                    <div className="chat-header">
                        <h3>Messages</h3>
                        <button onClick={() => setOpen(false)}>✕</button>
                    </div>

                    <div className="chat-contacts">
                        <button
                            className={
                                activeChat === "Tech Support"
                                    ? "contact active"
                                    : "contact"
                            }
                            onClick={() => setActiveChat("Tech Support")}
                        >
                            Tech Support
                        </button>

                        {users.map((u) => (
                            <button
                                key={u.id}
                                className={
                                    activeChat === u.fullName
                                        ? "contact active"
                                        : "contact"
                                }
                                onClick={() => setActiveChat(u.fullName)}
                            >
                                {u.fullName}
                            </button>
                        ))}
                    </div>

                    <div className="chat-body">
                        {(messages[activeChat] || []).length === 0 ? (
                            <p className="empty-chat">
                                No messages yet. Start the conversation.
                            </p>
                        ) : (
                            messages[activeChat].map((msg, index) => (
                                <div
                                    key={index}
                                    className={
                                        msg.sender === "You"
                                            ? "chat-message user"
                                            : "chat-message"
                                    }
                                >
                                    <strong>{msg.sender}:</strong> {msg.text}
                                </div>
                            ))
                        )}
                    </div>

                    <div className="chat-input-area">
                        <input
                            type="text"
                            placeholder={`Message ${activeChat}...`}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <button onClick={sendMessage}>Send</button>
                    </div>
                </div>
            )}
        </>
    );
}

export default ChatWidget;
