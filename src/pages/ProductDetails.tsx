import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { headphones } from '../data/headphones';
import { ArrowLeft, Check, X, Star } from 'lucide-react';
import './ProductDetails.css';

const ProductDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const product = headphones.find(h => h.id === id);

    if (!product) {
        return <div className="container" style={{ paddingTop: '100px' }}>Product not found</div>;
    }

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
                        <Link to="/compare" className="btn-secondary">Compare This</Link>
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
