import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/landing.css";

function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="landing-page">
            <header className="landing-header">
                <h2 className="brand-name">TradeOff</h2>

                <div className="header-links">
                    <button
                        className="header-btn"
                        onClick={() => navigate("/login")}
                    >
                        Sign In
                    </button>

                    <button
                        className="header-btn primary"
                        onClick={() => navigate("/register")}
                    >
                        Register
                    </button>
                </div>
            </header>

            <main className="landing-main">
                <h1 className="landing-title">
                    Buy and Sell Secondhand Items
                </h1>

                <p className="landing-description">
                    TradeOff is a student marketplace where you can sell, trade,
                    and discover affordable pre-owned items. It’s a simple way
                    to connect with others and give items a new purpose.
                </p>

                <span className="landing-note">
                    Trading and selling made easier for students.
                </span>

                <section className="landing-features">
                    <h2>What You Can Do</h2>

                    <div className="feature-card">
                        <h3>Sell Items You Don’t Use</h3>
                        <p>Post your items and connect with other people.</p>
                    </div>

                    <div className="feature-card">
                        <h3>Find Affordable Deals</h3>
                        <p>Browse listings and save money on everyday needs.</p>
                    </div>

                    <div className="feature-card">
                        <h3>Trade in a Simple Way</h3>
                        <p>A safe and easy platform made for campus trading.</p>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default LandingPage;
