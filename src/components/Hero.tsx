import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Music, ShieldCheck, Zap } from 'lucide-react';
import './Hero.css';

const Hero: React.FC = () => {
    return (
        <section className="hero">
            <div className="container hero-content">
                <motion.div
                    className="hero-text"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <span className="badge">New: AI-Powered Matches</span>
                    <h1>
                        Discover Headphones <br />
                        <span className="gradient-text">Tailored to You</span>
                    </h1>
                    <p className="hero-sub">
                        Stop guessing based on sponsored reviews. Our intelligent recommendation engine analyzes your unique listening habits, budget, and comfort preferences to find your perfect audio companion.
                    </p>

                    <div className="hero-actions">
                        <Link to="/find" className="btn-primary flex-center">
                            Find Your Perfect Headphones <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                        </Link>
                        <Link to="/compare" className="btn-secondary">
                            Compare Models
                        </Link>
                    </div>

                    <div className="features-grid">
                        <div className="feature-item">
                            <div className="icon-box"><Music size={20} /></div>
                            <span>Sound Profile Matching</span>
                        </div>
                        <div className="feature-item">
                            <div className="icon-box"><Zap size={20} /></div>
                            <span>Tech Spec Analysis</span>
                        </div>
                        <div className="feature-item">
                            <div className="icon-box"><ShieldCheck size={20} /></div>
                            <span>Unbiased Rankings</span>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="hero-visual"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <div className="glowing-circle"></div>
                    <img
                        src="https://placehold.co/600x600/png?text=Headphone+Visual"
                        alt="Premium Headphones"
                        className="hero-img"
                    />
                    {/* Floating cards for visual interest */}
                    <motion.div
                        className="float-card card-1 glass-panel"
                        animate={{ y: [0, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    >
                        <span>Comfort Score</span>
                        <strong>9.8/10</strong>
                    </motion.div>
                    <motion.div
                        className="float-card card-2 glass-panel"
                        animate={{ y: [0, -15, 0] }}
                        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                    >
                        <span>Active Noise Canceling</span>
                        <strong>Enabled</strong>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
