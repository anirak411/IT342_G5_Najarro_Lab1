import React, { useEffect, useState } from 'react';

function Dashboard({ user }) {
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchMe = async () => {
            const res = await fetch('http://localhost:8080/api/auth/me', {
                credentials: 'include'
            });
            const data = await res.text();
            setMessage(data);
        };
        fetchMe();
    }, []);

    return (
        <div>
            <h2>Dashboard</h2>
            <p>User: {user}</p>
            <p>{message}</p>
        </div>
    );
}

export default Dashboard;
