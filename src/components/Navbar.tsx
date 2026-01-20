import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Headphones, Moon, Sun } from 'lucide-react';
import './Navbar.css';

const Navbar: React.FC = () => {
    const location = useLocation();
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const isActive = (path: string) => location.pathname === path ? 'active' : '';

    return (
        <nav className="navbar glass-panel">
            <div className="container navbar-content">
                <Link to="/" className="logo">
                    <Headphones className="logo-icon" />
                    <span>SoundMatch</span>
                </Link>
                <div className="nav-actions">
                    <div className="nav-links">
                        <Link to="/" className={`nav-link ${isActive('/')}`}>Home</Link>
                        <Link to="/find" className={`nav-link ${isActive('/find')}`}>
                            Find Headphones
                        </Link>
                        <Link to="/compare" className={`nav-link ${isActive('/compare')}`}>
                            Compare
                        </Link>
                    </div>
                    <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
