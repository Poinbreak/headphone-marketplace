import React from 'react';
import { Star, Check, X, ArrowRight } from 'lucide-react';
import type { Headphone } from '../data/headphones';
import { Link } from 'react-router-dom';
import './ProductCard.css';

interface ProductCardProps {
    product: Headphone;
    rank?: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, rank }) => {
    return (
        <div className="product-card glass-panel">
            {rank && <div className="rank-badge">#{rank} Top Pick</div>}

            <div className="card-image">
                <img src={product.image} alt={product.name} />
            </div>

            <div className="card-content">
                <div className="card-header">
                    <div>
                        <h3>{product.name}</h3>
                        <span className="brand">{product.brand}</span>
                    </div>
                    <div className="price-tag">₹{product.price}</div>
                </div>

                <div className="rating-row">
                    <div className="stars">
                        <Star size={16} fill="var(--accent)" stroke="none" />
                        <span>{product.rating}</span>
                    </div>
                    <span className="reviews">({product.reviews} reviews)</span>
                </div>

                <div className="specs-preview">
                    <span className="spec-tag">{product.type}</span>
                    <span className="spec-tag">{product.connectivity}</span>
                    {product.noiseCancellationType !== 'Nil' && <span className="spec-tag">{product.noiseCancellationType}</span>}
                </div>

                <div className="pros-cons-preview">
                    <div className="pc-item pro">
                        <Check size={14} /> {product.pros[0]}
                    </div>
                    <div className="pc-item con">
                        <X size={14} /> {product.cons[0]}
                    </div>
                </div>

                <div className="card-actions">
                    <Link to={`/product/${product.id}`} className="btn-primary full-width">
                        View Details <ArrowRight size={16} />
                    </Link>
                    <button className="btn-secondary full-width">Compare</button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
