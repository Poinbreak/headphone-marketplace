import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { headphones } from '../data/headphones';
import { ArrowLeft, Check, X, Star, GitCompare } from 'lucide-react';
import './ProductDetails.css';

const ProductDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const product = headphones.find(h => h.id === id);

    const [competitorPrice, setCompetitorPrice] = useState<number | null>(null);
    const [aiPriceHint, setAiPriceHint] = useState<{price: number, reason: string} | null>(null);

    useEffect(() => {
        if (!product) return;

        fetch('http://localhost:5000/competitor-price')
            .then(res => res.json())
            .then(data => {
                if (data && data.competitorPrice) {
                    setCompetitorPrice(data.competitorPrice);

                    // Once we have competitor price, dynamically fetch AI analysis
                    fetch('http://localhost:5000/ai-price', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            productData: product,
                            competitorPrice: data.competitorPrice
                        })
                    })
                    .then(aiRes => aiRes.json())
                    .then(aiData => {
                        if (aiData && aiData.price) {
                            setAiPriceHint(aiData);
                        }
                    })
                    .catch(err => console.error('Error fetching AI price:', err));
                }
            })
            .catch(err => console.error('Error fetching competitor price:', err));
    }, [product]);

    if (!product) {
        return <div className="container" style={{ paddingTop: '100px' }}>Product not found</div>;
    }

    const handleCompare = () => {
        // Read existing compare list (up to 3 slots)
        const stored = JSON.parse(localStorage.getItem('compareIds') || '[]') as (string | null)[];
        const slots: (string | null)[] = [stored[0] ?? null, stored[1] ?? null, stored[2] ?? null];

        // Already in list — just navigate
        if (slots.includes(product.id)) {
            navigate('/compare');
            return;
        }

        // Fill the first empty slot
        const emptyIdx = slots.findIndex(s => s === null);
        if (emptyIdx !== -1) {
            slots[emptyIdx] = product.id;
        } else {
            // All slots full — replace the last one
            slots[2] = product.id;
        }

        localStorage.setItem('compareIds', JSON.stringify(slots));
        navigate('/compare');
    };

    return (
        <div className="details-page container">
            <Link to="/" className="back-btn"><ArrowLeft size={18} /> Back</Link>

            <div className="product-layout glass-panel">
                <div className="product-images">
                    <img src={product.image} alt={product.name} />
                </div>

                <div className="product-info-main">
                    <div className="brand-label">{product.brand}</div>
                    <h1>{product.name}</h1>
                    <div className="rating-block">
                        <span className="stars"><Star fill="currentColor" /> {product.rating}</span>
                        <span className="count">({product.reviews} reviews)</span>
                    </div>
                    <div className="price-block">₹{product.price}</div>
                    {competitorPrice !== null && (
                        <div style={{color: '#888', marginBottom: '8px', fontSize: '15px' }}>
                            Competitor Price: ₹{competitorPrice}
                        </div>
                    )}
                    {aiPriceHint !== null && (
                        <div style={{ 
                            padding: '12px', 
                            borderRadius: '8px', 
                            background: 'rgba(255, 255, 255, 0.05)', 
                            borderLeft: '4px solid var(--accent)',
                            marginBottom: '16px'
                        }}>
                            <strong style={{ color: 'var(--accent)', fontSize: '1.1em' }}>
                                AI Suggested Price: ₹{aiPriceHint.price}
                            </strong>
                            <p style={{ margin: '4px 0 0 0', fontSize: '0.85em', opacity: 0.8, lineHeight: '1.4' }}>
                                {aiPriceHint.reason}
                            </p>
                        </div>
                    )}

                    <div className="tags-row">
                        {product.bestFor.map(tag => (
                            <span key={tag} className="tag">{tag}</span>
                        ))}
                    </div>

                    <p className="description">
                        Experience premium audio with the {product.name}. Designed for {product.type} listening,
                        it features {product.connectivity} connectivity and {product.noiseCancellationType !== 'Nil' ? product.noiseCancellationType : 'natural'} sound isolation.
                    </p>

                    <div className="actions">
                        <button className="btn-primary">Buy Now</button>
                        <button className="btn-secondary with-icon" onClick={handleCompare}>
                            <GitCompare size={16} /> Compare This
                        </button>
                    </div>
                </div>
            </div>

            <div className="details-grid">
                <div className="spec-card glass-panel">
                    <h3>Specifications</h3>
                    <ul className="spec-list">
                        <li><span>Type</span> <strong>{product.type}</strong></li>
                        <li><span>Connectivity</span> <strong>{product.connectivity}</strong></li>
                        {product.connectivity === 'Wireless' && (
                            <>
                                <li><span>Protocol</span> <strong>{product.wirelessProtocol}</strong></li>
                                <li><span>Battery</span> <strong>{product.batteryLife ? `${product.batteryLife} hrs` : 'N/A'}</strong></li>
                                {product.wirelessMultiMode && <li><span>Multi-device</span> <strong>Yes</strong></li>}
                            </>
                        )}
                        {product.connectivity === 'Wired' && (
                            <li><span>Interface</span> <strong>{product.wiredInterface?.join(', ')}</strong></li>
                        )}

                        <li><span>Mic</span> <strong>{product.mic ? 'Yes' : 'No'}</strong></li>
                        {product.mic && product.micDetachable !== undefined && (
                            <li><span>Mic Detachable</span> <strong>{product.micDetachable ? 'Yes' : 'No'}</strong></li>
                        )}

                        <li><span>Noise Control</span> <strong>{product.noiseCancellationType}</strong></li>

                        {product.type === 'IEM' && product.cableDetachable !== undefined && (
                            <li><span>Detachable Cable</span> <strong>{product.cableDetachable ? 'Yes' : 'No'}</strong></li>
                        )}
                    </ul>
                </div>

                {(product.subBass !== undefined || product.bass !== undefined || product.upperBass !== undefined) && (
                    <div className="bass-card glass-panel">
                        <h3>Bass Response</h3>
                        <div className="bass-levels">
                            {[
                                { label: 'Sub Bass', value: product.subBass, range: '20–60 Hz' },
                                { label: 'Bass', value: product.bass, range: '60–250 Hz' },
                                { label: 'Upper Bass', value: product.upperBass, range: '250–500 Hz' },
                            ].map(({ label, value, range }) => (
                                <div key={label} className="bass-row">
                                    <div className="bass-label">
                                        <span>{label}</span>
                                        <small>{range}</small>
                                    </div>
                                    <div className="bass-bar-wrap">
                                        <div
                                            className="bass-bar-fill"
                                            style={{ width: value !== undefined ? `${value * 10}%` : '0%' }}
                                        />
                                    </div>
                                    <span className="bass-score">{value !== undefined ? `${value}/10` : 'N/A'}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="pros-cons-card glass-panel">
                    <div className="pc-col">
                        <h3>Pros</h3>
                        {product.pros.map(pro => (
                            <div key={pro} className="pc-row pro"><Check size={16} /> {pro}</div>
                        ))}
                    </div>
                    <div className="pc-col">
                        <h3>Cons</h3>
                        {product.cons.map(con => (
                            <div key={con} className="pc-row con"><X size={16} /> {con}</div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
