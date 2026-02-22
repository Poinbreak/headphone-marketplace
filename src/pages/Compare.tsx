import React, { useState, useEffect } from 'react';
import { headphones } from '../data/headphones';
import { ChevronDown, X } from 'lucide-react';
import './Compare.css';

const Compare: React.FC = () => {
    const [selectedIds, setSelectedIds] = useState<(string | null)[]>(() => {
        try {
            const stored = JSON.parse(localStorage.getItem('compareIds') || '[]') as (string | null)[];
            return [stored[0] ?? null, stored[1] ?? null, stored[2] ?? null];
        } catch {
            return [null, null, null];
        }
    });

    // Keep localStorage in sync whenever slots change
    useEffect(() => {
        localStorage.setItem('compareIds', JSON.stringify(selectedIds));
    }, [selectedIds]);

    const handleSelect = (index: number, id: string) => {
        const newSelected = [...selectedIds];
        newSelected[index] = id;
        setSelectedIds(newSelected);
    };

    const clearSlot = (index: number) => {
        const newSelected = [...selectedIds];
        newSelected[index] = null;
        setSelectedIds(newSelected);
    };

    const getProduct = (id: string | null) => headphones.find(h => h.id === id);

    const specs = [
        { label: 'Price', key: 'price', format: (v: any) => `₹${v}` },
        { label: 'Type', key: 'type' },
        { label: 'Connectivity', key: 'connectivity' },
        { label: 'Wireless Protocol', key: 'wirelessProtocol', format: (v: any) => v || '-' },
        { label: 'Wired Interface', key: 'wiredInterface', format: (v: string[]) => v ? v.join(', ') : '-' },
        { label: 'Mic', key: 'mic', format: (v: boolean) => v ? 'Yes' : 'No' },
        { label: 'Mic Detachable', key: 'micDetachable', format: (v: boolean | undefined) => v === undefined ? '-' : (v ? 'Yes' : 'No') },
        { label: 'Cable Detachable', key: 'cableDetachable', format: (v: boolean | undefined) => v === undefined ? '-' : (v ? 'Yes' : 'No') },
        { label: 'Multi-Mode', key: 'wirelessMultiMode', format: (v: boolean | undefined) => v ? 'Yes' : '-' },
        { label: 'Noise Cancellation', key: 'noiseCancellationType' },
        { label: 'Battery', key: 'batteryLife', format: (v: number) => v ? `${v}h` : '-' },
    ];

    return (
        <div className="compare-page container">
            <div className="compare-header">
                <h1>Headphone Comparison</h1>
                <p>Select up to 3 models to compare specs side-by-side.</p>
            </div>

            <div className="compare-table-container glass-panel">
                <table className="compare-table">
                    <thead>
                        <tr>
                            <th className="feature-col">Feature</th>
                            {[0, 1, 2].map(i => (
                                <th key={i} className="product-col">
                                    {selectedIds[i] ? (
                                        <div className="selected-header">
                                            <button className="remove-btn" onClick={() => clearSlot(i)}><X size={14} /></button>
                                            <img src={getProduct(selectedIds[i])?.image} alt="" className="thumb" />
                                            <h4>{getProduct(selectedIds[i])?.name}</h4>
                                        </div>
                                    ) : (
                                        <div className="select-placeholder">
                                            <select
                                                onChange={(e) => handleSelect(i, e.target.value)}
                                                value=""
                                            >
                                                <option value="" disabled>Select Headphone</option>
                                                {headphones.map(h => (
                                                    <option key={h.id} value={h.id} disabled={selectedIds.includes(h.id)}>
                                                        {h.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown className="select-icon" size={16} />
                                            <span>Add Headphone</span>
                                        </div>
                                    )}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {specs.map(spec => (
                            <tr key={spec.label}>
                                <td className="feature-label">{spec.label}</td>
                                {[0, 1, 2].map(i => {
                                    const product = getProduct(selectedIds[i]);
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    const val = product ? (product as any)[spec.key] : null;
                                    return (
                                        <td key={i}>
                                            {product ? (spec.format ? (spec.format as any)(val) : (val || '-')) : '-'}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                        <tr>
                            <td>Rating</td>
                            {[0, 1, 2].map(i => (
                                <td key={i}>
                                    {getProduct(selectedIds[i]) ? (
                                        <div className="stars-sm">
                                            {getProduct(selectedIds[i])?.rating} / 5
                                        </div>
                                    ) : '-'}
                                </td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Compare;
