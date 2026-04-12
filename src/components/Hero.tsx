import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Music, ShieldCheck, Zap } from 'lucide-react';
import './Hero.css';

// Use every 4th frame from the 240-frame sequence
const FRAME_COUNT = 240;
const STEP = 4;
const frames = Array.from(
  { length: Math.floor(FRAME_COUNT / STEP) },
  (_, i) => `/frames/ezgif-frame-${String((i * STEP) + 1).padStart(3, '0')}.jpg`
);
const TOTAL_FRAMES = frames.length; // 60

const Hero: React.FC = () => {
  const [frameIdx, setFrameIdx] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  // Scroll-driven frame advancement
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const sectionH = sectionRef.current.offsetHeight;
      // Pin starts when top hits viewport top, ends when bottom leaves
      const scrolled = -rect.top;
      const ratio = Math.max(0, Math.min(1, scrolled / sectionH));
      setFrameIdx(Math.min(TOTAL_FRAMES - 1, Math.floor(ratio * TOTAL_FRAMES)));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="hero" ref={sectionRef}>
      {/* Pinned animation layer — always behind text */}
      <div className="hero-frame-bg">
        <div className="hero-glow" />
        <img
          src={frames[frameIdx]}
          alt="Headphone"
          className="frame-img"
          draggable={false}
        />
        {/* Float cards */}
        <div className="float-card glass-panel float-card--tl">
          <span>Comfort Score</span>
          <strong>9.8 / 10</strong>
        </div>
        <div className="float-card glass-panel float-card--br">
          <span>Active Noise Canceling</span>
          <strong style={{ color: 'var(--cyan)' }}>Enabled</strong>
        </div>
      </div>

      {/* Scrolling content that overlaps the frame */}
      <div className="hero-scroll-content container">
        {/* First screen — tagline */}
        <div className="hero-screen hero-screen--intro fade-up">
          <div className="hero-tag">
            <div className="hero-tag-dot" />
            <span className="hero-tag-text">AI-Powered Matching</span>
          </div>
          <h1>
            Discover Headphones<br />
            <span className="gradient-text">Tailored to You</span>
          </h1>
          <p className="hero-sub">
            Stop guessing based on sponsored reviews. Our intelligent engine analyzes your
            listening profile to find your perfect audio companion.
          </p>
          <div className="hero-actions">
            <Link to="/find" className="btn-primary flex-center">
              🎧 Find My Headphones <ArrowRight size={16} style={{ marginLeft: 6 }} />
            </Link>
            <Link to="/compare" className="btn-secondary">⚖️ Compare Models</Link>
          </div>
          <div className="features-grid">
            <div className="feature-item">
              <div className="icon-box"><Music size={18} /></div>
              <span>Sound Profile Matching</span>
            </div>
            <div className="feature-item">
              <div className="icon-box"><Zap size={18} /></div>
              <span>Tech Spec Analysis</span>
            </div>
            <div className="feature-item">
              <div className="icon-box"><ShieldCheck size={18} /></div>
              <span>Unbiased Rankings</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
