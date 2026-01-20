import React, { useMemo } from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { headphones, type Headphone } from '../data/headphones';
import ProductCard from '../components/ProductCard';
import type { Preferences } from './FindHeadphones';
import { ArrowLeft } from 'lucide-react';
import './Results.css';

const Results: React.FC = () => {
    const location = useLocation();
    const state = location.state as { preferences: Preferences } | null;

    if (!state) {
        return <Navigate to="/find" replace />;
    }

    const { preferences } = state;

    const results = useMemo(() => {
        return headphones
            .map(item => {
                let score = 0;
                let isMatch = true;

                // --- HARD FILTERS ---

                // 1. Budget
                if (item.price > preferences.budget) isMatch = false;

                // 2. Rating
                if (item.rating < preferences.minRating) isMatch = false;

                // 3. Type
                if (preferences.type.length > 0 && !preferences.type.includes(item.type)) isMatch = false;

                // 4. Connectivity
                if (preferences.connectivity !== 'Both') {
                    if (item.connectivity !== preferences.connectivity) isMatch = false;
                }

                // 5. Mic
                if (preferences.mic === 'Yes' && !item.mic) isMatch = false;
                if (preferences.mic === 'No' && item.mic) isMatch = false;

                // 6. Detachable Mic
                if (preferences.micDetachable && !item.micDetachable) isMatch = false;

                // 7. Detachable Cable (IEM only check usually, but applied globally if selected)
                if (preferences.cableDetachable && item.type === 'IEM' && !item.cableDetachable) isMatch = false;

                // 8. Wireless Multi Mode
                if (preferences.wirelessMultiMode && item.connectivity === 'Wireless' && !item.wirelessMultiMode) isMatch = false;

                // 9. Wired Interface
                if (preferences.wiredInterface.length > 0 && item.connectivity === 'Wired') {
                    // Check if item has ANY of the selected interfaces
                    const itemInterfaces = item.wiredInterface || [];
                    const hasInterface = preferences.wiredInterface.some(pi => itemInterfaces.includes(pi as any));
                    if (!hasInterface) isMatch = false;
                }

                // 10. Wireless Protocol
                if (preferences.wirelessProtocol.length > 0 && item.connectivity === 'Wireless') {
                    // Item protocol: 'Bluetooth', '2.4GHz', 'Both'
                    // Pref protocol: ['Bluetooth', '2.4GHz']
                    const supportsBT = item.wirelessProtocol === 'Bluetooth' || item.wirelessProtocol === 'Both';
                    const supports24 = item.wirelessProtocol === '2.4GHz' || item.wirelessProtocol === 'Both';

                    let protocolMatch = false;
                    if (preferences.wirelessProtocol.includes('Bluetooth') && supportsBT) protocolMatch = true;
                    if (preferences.wirelessProtocol.includes('2.4GHz') && supports24) protocolMatch = true;

                    if (!protocolMatch) isMatch = false;
                }

                // 11. Noise Cancellation
                if (preferences.noiseCancellation.length > 0) {
                    if (!preferences.noiseCancellation.includes(item.noiseCancellationType)) isMatch = false;
                }

                // 12. Battery
                if (preferences.batteryLife > 0 && item.connectivity === 'Wireless') {
                    if ((item.batteryLife || 0) < preferences.batteryLife) isMatch = false;
                }

                if (!isMatch) return null;

                // --- SCORING ---

                // Usage Match
                preferences.usage.forEach(u => {
                    if (item.bestFor.includes(u as any)) score += 5;
                });

                // Price Value (Cheaper is better? Or closer to budget? Let's just bonus high rating)
                score += item.rating * 2;

                // Feature Density Bonus
                if (item.noiseCancellationType === 'ANC') score += 2;
                if (item.mic) score += 1;

                return { ...item, score };
            })
            .filter((item): item is Headphone & { score: number } => item !== null)
            .sort((a, b) => b.score - a.score);
    }, [preferences]);

    return (
        <div className="results-page container">
            <div className="results-header">
                <Link to="/find" className="back-link"><ArrowLeft size={20} /> Retake Quiz</Link>
                <h1>Your Perfect Matches</h1>
                <p>Found {results.length} headphones based on your specific requirements.</p>
            </div>

            {results.length > 0 ? (
                <div className="results-grid">
                    {results.map((product, index) => (
                        <ProductCard key={product.id} product={product} rank={index + 1} />
                    ))}
                </div>
            ) : (
                <div className="no-results glass-panel">
                    <h3>No perfect matches found.</h3>
                    <p>Your criteria might be too strict. Try searching with fewer specific filters (like unchecking specific ports or noise cancellation types).</p>
                    <Link to="/find" className="btn-primary">Adjust Preferences</Link>
                </div>
            )}
        </div>
    );
};

export default Results;
