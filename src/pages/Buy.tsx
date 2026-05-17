import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { headphones } from '../data/headphones';
import { ArrowLeft, Loader, Check, X, ExternalLink } from 'lucide-react';
import './Buy.css';

const Buy: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const productId = searchParams.get('id');
  const product = headphones.find(h => h.id === productId);

  const [pros, setPros] = useState<string[]>([]);
  const [cons, setCons] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!product) {
      navigate('/');
      return;
    }

    // Fetch AI-generated pros and cons
    const fetchProsConsFromAI = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/generate-pros-cons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productName: product.name,
            productSpecs: {
              type: product.type,
              connectivity: product.connectivity,
              price: product.price,
              rating: product.rating
            }
          })
        });

        const data = await response.json();
        setPros(data.pros || []);
        setCons(data.cons || []);
      } catch (err) {
        console.error('Error fetching pros/cons:', err);
        setPros(['High quality sound', 'Comfortable fit', 'Good battery life']);
        setCons(['Expensive', 'Limited color options', 'Heavy design']);
      } finally {
        setLoading(false);
      }
    };

    fetchProsConsFromAI();
  }, [product, navigate]);

  if (!product) {
    return <div className="container" style={{ paddingTop: '100px' }}>Loading...</div>;
  }

  const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(product.name + ' headphones price')}`;
  const amazonSearchUrl = `https://www.amazon.in/s?k=${encodeURIComponent(product.name)}`;

  return (
    <div className="buy-page container">
      <Link to={`/product/${product.id}`} className="back-btn">
        <ArrowLeft size={18} /> Back to Product
      </Link>

      <div className="buy-layout">
        <div className="buy-main glass-panel">
          <div className="buy-header">
            <img src={product.image} alt={product.name} className="buy-image" />
            <div className="buy-details">
              <h1>{product.name}</h1>
              <p className="brand">{product.brand}</p>
              <div className="price-tag">₹{product.price}</div>
              <p className="description">
                {product.type} • {product.connectivity} • {product.rating}★ ({product.reviews} reviews)
              </p>
            </div>
          </div>

          <div className="buy-section">
            <h2>Where to Buy</h2>
            <div className="buy-links">
              <a href={googleSearchUrl} target="_blank" rel="noopener noreferrer" className="buy-link google">
                <ExternalLink size={16} />
                <div>
                  <strong>Google Search</strong>
                  <span>Compare prices across retailers</span>
                </div>
              </a>
              <a href={amazonSearchUrl} target="_blank" rel="noopener noreferrer" className="buy-link amazon">
                <ExternalLink size={16} />
                <div>
                  <strong>Amazon India</strong>
                  <span>Check availability and reviews</span>
                </div>
              </a>
            </div>
          </div>
        </div>

        <div className="pros-cons-section">
          <div className="pros-cons glass-panel">
            <div className="pc-col">
              <h3>Pros</h3>
              {loading ? (
                <div className="loading-skeleton">
                  <Loader size={20} className="spinner" />
                  <p>Analyzing product...</p>
                </div>
              ) : (
                pros.map((pro, idx) => (
                  <div key={idx} className="pc-row pro">
                    <Check size={16} /> {pro}
                  </div>
                ))
              )}
            </div>
            <div className="pc-col">
              <h3>Cons</h3>
              {loading ? (
                <div className="loading-skeleton">
                  <Loader size={20} className="spinner" />
                  <p>Analyzing product...</p>
                </div>
              ) : (
                cons.map((con, idx) => (
                  <div key={idx} className="pc-row con">
                    <X size={16} /> {con}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Buy;
