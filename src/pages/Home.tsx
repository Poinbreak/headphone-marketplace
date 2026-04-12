import React from 'react';
import Hero from '../components/Hero';
import './Home.css';

const FEATURES = [
  { icon: '🎯', title: 'Sound Profile Matching', body: 'Answer a few questions about your use case, budget, and preferences — get ranked results in seconds.' },
  { icon: '⚡', title: 'Tech Spec Analysis', body: 'Compare shortlisted models side-by-side with objective specs, bass profiles, and real user ratings.' },
  { icon: '🛡️', title: 'Unbiased Rankings', body: 'Every recommendation is backed by real data — not sponsored rankings. 22,000+ headphones in our database.' },
];

const Home: React.FC = () => {
  return (
    <div className="home-page">
      <Hero />

      {/* Feature Cards Section */}
      <section className="home-features-section">
        <div className="container">
          <div className="home-features">
            {FEATURES.map((f) => (
              <div className="feat-card" key={f.title}>
                <div className="feat-icon">{f.icon}</div>
                <div className="feat-title">{f.title}</div>
                <div className="feat-body">{f.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section how-it-works">
        <div className="container">
          <div className="section-header">
            <h2>How It Works</h2>
            <p>Three simple steps to audio nirvana</p>
          </div>
          <div className="steps-grid">
            {[
              { num: '01', emoji: '📋', title: 'Share Preferences', desc: 'Tell us about your budget, preferred music genres, and usage habits.' },
              { num: '02', emoji: '🤖', title: 'AI Analysis', desc: 'Our algorithm scans 22,000+ models matching specs to your specific needs.' },
              { num: '03', emoji: '✅', title: 'Get Matched', desc: 'Receive a ranked list of the best headphones just for you.' },
            ].map((s) => (
              <div className="step-card glass-panel" key={s.num}>
                <div className="step-number">{s.num}</div>
                <div className="step-icon">{s.emoji}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
