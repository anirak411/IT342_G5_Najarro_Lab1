import React, { useState } from 'react';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
    const [page, setPage] = useState('register');
    const [user, setUser] = useState(null);

    return (
        <div style={{ padding: '20px' }}>
            <nav>
                <button onClick={() => setPage('register')}>Register</button>
                <button onClick={() => setPage('login')}>Login</button>
                <button onClick={() => setPage('dashboard')}>Dashboard</button>
            </nav>

            <hr />

            {page === 'register' && <Register />}
            {page === 'login' && <Login setUser={setUser} />}
            {page === 'dashboard' && <Dashboard user={user} />}
        </div>
    );
}

export default App;
