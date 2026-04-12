import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './Feedback.css';

const CATEGORIES = ['Algorithm Bug', 'Data Accuracy', 'Technical Bug', 'UI Issue', 'Missing Product', 'Pricing Error', 'Other'];

type Mode = 'complaint' | 'review';

const Feedback: React.FC = () => {
    const [mode, setMode] = useState<Mode>('complaint');
    const [form, setForm] = useState({ name: '', email: '', category: '', title: '', description: '', product: '', rating: 5, body: '' });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const update = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        try {
            const endpoint = mode === 'complaint' ? '/api/complaints' : '/api/reviews';
            const payload = mode === 'complaint'
                ? { name: form.name, email: form.email, category: form.category, title: form.title, description: form.description }
                : { name: form.name, email: form.email, product: form.product, rating: form.rating, body: form.body };
            const res = await fetch(`http://localhost:5000${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed');
            setStatus('success');
            setMessage(mode === 'complaint' ? 'Your complaint has been submitted! Our team will review it shortly.' : 'Thank you for your review!');
            setForm({ name: '', email: '', category: '', title: '', description: '', product: '', rating: 5, body: '' });
        } catch (err: any) {
            setStatus('error');
            setMessage(err.message || 'Something went wrong. Please try again.');
        }
    };

    return (
        <div className="feedback-page">
            <div className="feedback-hero fade-up">
                <div className="feedback-label">— YOUR VOICE MATTERS —</div>
                <h1>Submit a Complaint<br />or Review</h1>
                <p>Share your experience with the platform — all feedback goes directly to our admin team.</p>

                <div className="mode-toggle">
                    <button className={`mode-btn ${mode === 'complaint' ? 'active' : ''}`} onClick={() => setMode('complaint')}>
                        ⚠️ Complaint
                    </button>
                    <button className={`mode-btn ${mode === 'review' ? 'active' : ''}`} onClick={() => setMode('review')}>
                        ★ Review
                    </button>
                </div>
            </div>

            <div className="container">
                <motion.form
                    className="feedback-form glass-panel"
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    key={mode}
                >
                    {status === 'success' && (
                        <div className="feedback-success">✅ {message}</div>
                    )}
                    {status === 'error' && (
                        <div className="feedback-error">❌ {message}</div>
                    )}

                    <div className="form-row">
                        <div className="form-group">
                            <label>YOUR NAME</label>
                            <input required value={form.name} onChange={e => update('name', e.target.value)} placeholder="e.g. Arjun M." />
                        </div>
                        <div className="form-group">
                            <label>EMAIL ADDRESS</label>
                            <input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="you@example.com" />
                        </div>
                    </div>

                    {mode === 'complaint' ? (
                        <>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>CATEGORY</label>
                                    <select value={form.category} onChange={e => update('category', e.target.value)} required>
                                        <option value="">Select category</option>
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>ISSUE TITLE</label>
                                    <input required value={form.title} onChange={e => update('title', e.target.value)} placeholder="Brief summary" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>DESCRIBE THE ISSUE</label>
                                <textarea required value={form.description} onChange={e => update('description', e.target.value)} placeholder="Please describe the problem in detail..." rows={5} />
                            </div>
                            <button className="submit-btn complaint-btn" type="submit" disabled={status === 'loading'}>
                                {status === 'loading' ? 'Submitting...' : '⚠️ Submit Complaint'}
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>PRODUCT NAME</label>
                                    <input value={form.product} onChange={e => update('product', e.target.value)} placeholder="e.g. Sony WH-1000XM5" />
                                </div>
                                <div className="form-group">
                                    <label>STAR RATING</label>
                                    <div className="star-picker">
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <span key={s} className={`star ${form.rating >= s ? 'active' : ''}`} onClick={() => update('rating', s)}>★</span>
                                        ))}
                                        <span className="rating-label">{form.rating}/5</span>
                                    </div>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>YOUR REVIEW</label>
                                <textarea required value={form.body} onChange={e => update('body', e.target.value)} placeholder="Share your experience..." rows={5} />
                            </div>
                            <button className="submit-btn review-btn" type="submit" disabled={status === 'loading'}>
                                {status === 'loading' ? 'Submitting...' : '★ Submit Review'}
                            </button>
                        </>
                    )}
                </motion.form>
            </div>
        </div>
    );
};

export default Feedback;
