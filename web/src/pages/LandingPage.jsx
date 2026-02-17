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
                    <button className="header-btn" onClick={() => navigate("/login")}>
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
                <div className="hero-section">
                    <div className="hero-text">
                        <h1 className="landing-title">
                            Buy and Sell Secondhand Items Easily
                        </h1>

                        <p className="landing-description">
                            TradeOff is a marketplace where you can sell, trade, and
                            discover affordable pre-owned items. Simple, safe, and made for
                            students.
                        </p>
                    </div>

                    <div className="hero-image">
                        <img
                            src="/images/landing-placeholder.png"
                            alt="Marketplace Preview"
                        />
                    </div>
                </div>

                <section className="landing-features">
                    <h2>What You Can Do</h2>

                    <div className="features-grid">
                        <div className="feature-card">
                            <img
                                src="/images/sell-icon.png"
                                alt="Sell"
                                className="feature-icon"
                            />
                            <h3>Sell Items You Don’t Use</h3>
                            <p>Post your items and connect with other people.</p>
                        </div>

                        <div className="feature-card">
                            <img
                                src="/images/deals-icon.png"
                                alt="Deals"
                                className="feature-icon"
                            />
                            <h3>Find Affordable Deals</h3>
                            <p>Browse listings and save money on everyday needs.</p>
                        </div>

                        <div className="feature-card">
                            <img
                                src="/images/trade-icon.png"
                                alt="Trade"
                                className="feature-icon"
                            />
                            <h3>Trade in a Simple Way</h3>
                            <p>A safe and easy platform made for campus trading.</p>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default LandingPage;
