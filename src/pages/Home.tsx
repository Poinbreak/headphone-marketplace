import React from 'react';
import Hero from '../components/Hero';
import { ClipboardList, Cpu, CheckCircle, BarChart, ExternalLink, Zap } from 'lucide-react';
import './Home.css';

const Home: React.FC = () => {
    return (
        <div className="home-page">
            <Hero />

            {/* How It Works Section */}
            <section className="section how-it-works">
                <div className="container">
                    <div className="section-header">
                        <h2>How It Works</h2>
                        <p>Three simple steps to audio nirvana</p>
                    </div>

                    <div className="steps-grid">
                        <div className="step-card">
                            <div className="step-number">01</div>
                            <div className="step-icon"><ClipboardList size={32} /></div>
                            <h3>Share Preferences</h3>
                            <p>Tell us about your budget, preferred music genres, and usage habits.</p>
                        </div>
                        <div className="step-card">
                            <div className="step-number">02</div>
                            <div className="step-icon"><Cpu size={32} /></div>
                            <h3>AI Analysis</h3>
                            <p>Our algorithm scans 500+ models matching specs to your specific needs.</p>
                        </div>
                        <div className="step-card">
                            <div className="step-number">03</div>
                            <div className="step-icon"><CheckCircle size={32} /></div>
                            <h3>Get Matched</h3>
                            <p>Receive a ranked list of the best headphones just for you.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Trust Us */}
            <section className="section trust-section">
                <div className="container trust-content">
                    <div className="trust-text">
                        <h2>Why Trust SoundMatch?</h2>
                        <p>Unlike massive tech blogs, we don't just push the most expensive gear. Our recommendation engine uses weighted scoring based on <strong>objective technical data</strong> and aggregated community sentiment.</p>
                        <ul className="trust-list">
                            <li><BarChart size={20} /> Data-driven scoring system</li>
                            <li><Zap size={20} /> Real-time price performance ratio</li>
                            <li><ExternalLink size={20} /> Transparent pros & cons</li>
                        </ul>
                    </div>
                    <div className="trust-visual glass-panel">
                        {/* Abstract visual representation of data matching */}
                        <div className="match-visual">
                            <div className="stat-row">
                                <span>Frequency Response</span>
                                <div className="bar"><div className="fill" style={{ width: '90%' }}></div></div>
                            </div>
                            <div className="stat-row">
                                <span>Battery Life</span>
                                <div className="bar"><div className="fill" style={{ width: '75%' }}></div></div>
                            </div>
                            <div className="stat-row">
                                <span>Comfort</span>
                                <div className="bar"><div className="fill" style={{ width: '85%' }}></div></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


        </div>
    );
};

export default Home;
