import React from 'react';
import { Headphones, Github, Twitter, Linkedin } from 'lucide-react';
import './Footer.css';

const Footer: React.FC = () => {
    return (
        <footer className="footer">
            <div className="container footer-content">
                <div className="footer-brand">
                    <div className="logo">
                        <Headphones className="logo-icon" />
                        <span>SoundMatch</span>
                    </div>
                    <p>Finding your perfect sound since 2024.</p>
                </div>

                <div className="footer-links">
                    <div className="link-col">
                        <h4>Product</h4>
                        <a href="/find">Find Headphones</a>
                        <a href="/compare">Compare</a>
                        <a href="#">Reviews</a>
                    </div>
                    <div className="link-col">
                        <h4>Support</h4>
                        <a href="#">How it Works</a>
                        <a href="#">FAQ</a>
                        <a href="#">Contact</a>
                    </div>
                </div>

                <div className="footer-social">
                    <a href="#" aria-label="Github"><Github size={20} /></a>
                    <a href="#" aria-label="Twitter"><Twitter size={20} /></a>
                    <a href="#" aria-label="LinkedIn"><Linkedin size={20} /></a>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; 2024 SoundMatch. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
