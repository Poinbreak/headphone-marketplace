import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogIn, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar: React.FC = () => {
    const location = useLocation();
    const { user, logout, isAuthenticated } = useAuth();

    const isActive = (path: string) => location.pathname === path ? 'active' : '';

    return (
        <nav className="navbar">
            <div className="navbar-content">
                <Link to="/" className="logo">
                    <div className="nav-dot" />
                    <span className="nav-brand-text">SoundMatch</span>
                </Link>

                <div className="nav-links">
                    <Link to="/" className={`nav-link ${isActive('/')}`}>Home</Link>
                    <Link to="/find" className={`nav-link ${isActive('/find')}`}>Find Headphones</Link>
                    <Link to="/compare" className={`nav-link ${isActive('/compare')}`}>Compare</Link>
                    <Link to="/feedback" className={`nav-link ${isActive('/feedback')}`}>Feedback</Link>
                </div>

                <div className="nav-actions">
                    <div className="nav-auth">
                        {isAuthenticated ? (
                            <div className="user-menu">
                                <span className="user-greeting">Hi, {user?.name.split(' ')[0]}</span>
                                <button onClick={logout} className="auth-btn logout-btn" title="Logout">
                                    <LogOut size={14} /> Logout
                                </button>
                            </div>
                        ) : (
                            <Link to="/auth" className="auth-btn login-btn">
                                <LogIn size={14} />
                                <span>Login</span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
