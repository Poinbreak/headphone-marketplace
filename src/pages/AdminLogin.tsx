import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';

const AdminLogin: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            const res = await fetch('http://localhost:5000/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Login failed');
            localStorage.setItem('admin_token', data.token);
            localStorage.setItem('admin_user', JSON.stringify(data.user));
            navigate('/admin');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const useDemo = () => { setEmail('admin@soundmatch.com'); setPassword('admin123'); };

    return (
        <div className="adm-login-page">
            <div className="adm-login-card">
                <div className="adm-lock-wrap">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                </div>
                <div className="adm-label">ADMINISTRATOR</div>
                <h1>Platform Management</h1>
                <p>Access the admin dashboard to view customer reviews, complaints, and platform analytics.</p>

                {error && <div className="adm-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="adm-field">
                        <label>ADMIN EMAIL</label>
                        <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@soundmatch.com" />
                    </div>
                    <div className="adm-field">
                        <label>ADMIN PASSWORD</label>
                        <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
                    </div>
                    <button className="adm-login-btn" type="submit" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In as Admin'}
                    </button>
                </form>
                <button className="adm-demo-link" onClick={useDemo}>Use demo credentials</button>
            </div>
        </div>
    );
};

export default AdminLogin;
