import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, Music, Phone, Briefcase, ChevronRight, Check } from 'lucide-react';
import './FindHeadphones.css';

export interface Preferences {
    usage: string[]; // ['Gaming', 'Music', etc.]
    type: string[]; // ['Over-ear', 'In-ear', 'On-ear', 'IEM']
    connectivity: 'Wired' | 'Wireless' | 'Both';
    wiredInterface: string[]; // ['3.5mm', 'TRRS', 'Flat', 'USB-C']
    wirelessProtocol: string[]; // ['Bluetooth', '2.4GHz']
    mic: 'Yes' | 'No' | 'Any';
    micDetachable: boolean;
    cableDetachable: boolean;
    wirelessMultiMode: boolean; // "Over/On ear multi mode compactability"
    noiseCancellation: string[]; // ['Nil', 'Passive', 'ANC', 'ENC']
    batteryLife: number; // Min hours
    budget: number;
    minRating: number;
}

const FindHeadphones: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const totalSteps = 4;

    const [preferences, setPreferences] = useState<Preferences>({
        usage: [],
        type: [],
        connectivity: 'Both',
        wiredInterface: [],
        wirelessProtocol: [],
        mic: 'Any',
        micDetachable: false,
        cableDetachable: false,
        wirelessMultiMode: false,
        noiseCancellation: [],
        batteryLife: 0,
        budget: 20000,
        minRating: 0
    });

    const nextStep = () => setStep(s => Math.min(s + 1, totalSteps));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    const handleFinish = () => {
        navigate('/results', { state: { preferences } });
    };

    const toggleSelection = (key: keyof Preferences, value: string) => {
        setPreferences(prev => {
            const list = prev[key] as string[];
            if (list.includes(value)) {
                return { ...prev, [key]: list.filter(item => item !== value) };
            }
            return { ...prev, [key]: [...list, value] };
        });
    };

    const setSingle = (key: keyof Preferences, value: any) => {
        setPreferences(prev => ({ ...prev, [key]: value }));
    };

    // Helper for determining if we should show wired options
    const showWiredOptions = preferences.connectivity === 'Wired' || preferences.connectivity === 'Both';
    const showWirelessOptions = preferences.connectivity === 'Wireless' || preferences.connectivity === 'Both';

    // Logic to control 2.4GHz visibility (Only for Over-ear or On-ear)
    const hasLargeFormFactor = preferences.type.some(t => ['Over-ear', 'On-ear'].includes(t));

    useEffect(() => {
        // If the user switches to only In-ear/IEM, remove 2.4GHz if it was selected
        if (!hasLargeFormFactor && preferences.wirelessProtocol.includes('2.4GHz')) {
            setPreferences(prev => ({
                ...prev,
                wirelessProtocol: prev.wirelessProtocol.filter(p => p !== '2.4GHz')
            }));
        }
    }, [hasLargeFormFactor, preferences.wirelessProtocol]);

    return (
        <div className="find-page container">
            <div className="wizard-container glass-panel">
                <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
                </div>

                <AnimatePresence mode='wait'>
                    {/* STEP 1: Usage & Type */}
                    {step === 1 && (
                        <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="step-content">
                            <h2>Usage & Style</h2>

                            <p className="step-desc">What is your primary use case?</p>
                            <div className="options-grid">
                                {[
                                    { id: 'Music', icon: <Music />, label: 'Music' },
                                    { id: 'Gaming', icon: <Gamepad2 />, label: 'Gaming' },
                                    { id: 'Calls', icon: <Phone />, label: 'Calls' },
                                    { id: 'Movie', icon: <Briefcase />, label: 'Movies' },
                                    { id: 'Sound Production', icon: <Music />, label: 'Studio/Prod' }
                                ].map(opt => (
                                    <button key={opt.id} className={`option-card ${preferences.usage.includes(opt.id) ? 'selected' : ''}`}
                                        onClick={() => toggleSelection('usage', opt.id)}>
                                        <div className="icon">{opt.icon}</div>
                                        <span>{opt.label}</span>
                                    </button>
                                ))}
                            </div>

                            <p className="step-desc" style={{ marginTop: '1rem' }}>Preferred Form Factor?</p>
                            <div className="options-grid">
                                {['Over-ear', 'On-ear', 'In-ear', 'IEM'].map(t => (
                                    <button key={t} className={`option-card ${preferences.type.includes(t) ? 'selected' : ''}`}
                                        onClick={() => toggleSelection('type', t)}>
                                        <span className="text-large">{t}</span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2: Connectivity */}
                    {step === 2 && (
                        <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="step-content">
                            <h2>Connectivity</h2>

                            <div className="options-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                                {['Wired', 'Wireless', 'Both'].map(c => (
                                    <button key={c} className={`option-card ${preferences.connectivity === c ? 'selected' : ''}`}
                                        onClick={() => setSingle('connectivity', c)}>
                                        <span className="text-large">{c}</span>
                                    </button>
                                ))}
                            </div>

                            {showWiredOptions && (
                                <>
                                    <p className="step-desc" style={{ marginTop: '1rem' }}>Wired Interface (if applicable)</p>
                                    <div className="options-grid text-options">
                                        {['3.5mm', 'TRRS', 'Flat', 'USB-C'].map(port => (
                                            <button key={port} className={`option-card ${preferences.wiredInterface.includes(port) ? 'selected' : ''}`}
                                                onClick={() => toggleSelection('wiredInterface', port)}>
                                                <div className="check-circle">{preferences.wiredInterface.includes(port) && <Check size={14} />}</div>
                                                <span>{port}</span>
                                            </button>
                                        ))}
                                    </div>
                                    {/* IEM Cable Detachable */}
                                    {preferences.type.includes('IEM') && (
                                        <div className="options-grid text-options">
                                            <button className={`option-card ${preferences.cableDetachable ? 'selected' : ''}`}
                                                onClick={() => setSingle('cableDetachable', !preferences.cableDetachable)}>
                                                <div className="check-circle">{preferences.cableDetachable && <Check size={14} />}</div>
                                                <span>Detachable Cable (IEM)</span>
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}

                            {showWirelessOptions && (
                                <>
                                    <p className="step-desc" style={{ marginTop: '1rem' }}>Wireless Options</p>
                                    <div className="options-grid">
                                        {(hasLargeFormFactor ? ['Bluetooth', '2.4GHz'] : ['Bluetooth']).map(p => (
                                            <button key={p} className={`option-card ${preferences.wirelessProtocol.includes(p) ? 'selected' : ''}`}
                                                onClick={() => toggleSelection('wirelessProtocol', p)}>
                                                <div className="check-circle">{preferences.wirelessProtocol.includes(p) && <Check size={14} />}</div>
                                                <span>{p}</span>
                                            </button>
                                        ))}
                                    </div>
                                    {/* Multi Mode for Wireless Over/On ear */}
                                    {(preferences.type.includes('Over-ear') || preferences.type.includes('On-ear')) && (
                                        <div className="options-grid text-options" style={{ marginTop: '1rem' }}>
                                            <button className={`option-card ${preferences.wirelessMultiMode ? 'selected' : ''}`}
                                                onClick={() => setSingle('wirelessMultiMode', !preferences.wirelessMultiMode)}>
                                                <div className="check-circle">{preferences.wirelessMultiMode && <Check size={14} />}</div>
                                                <span>Multi-Device / Multi-Mode Support</span>
                                            </button>
                                        </div>
                                    )}
                                    <div className="budget-control">
                                        <span>Min Battery: {preferences.batteryLife}h</span>
                                        <input type="range" min="0" max="100" step="5" value={preferences.batteryLife}
                                            onChange={(e) => setSingle('batteryLife', parseInt(e.target.value))} className="range-slider" />
                                    </div>
                                </>
                            )}
                        </motion.div>
                    )}

                    {/* STEP 3: Features (Mic, NC) */}
                    {step === 3 && (
                        <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="step-content">
                            <h2>Microphone & Noise Control</h2>

                            <p className="step-desc">Microphone Needed?</p>
                            <div className="options-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                                {['Yes', 'No', 'Any'].map(opt => (
                                    <button key={opt} className={`option-card ${preferences.mic === opt ? 'selected' : ''}`}
                                        onClick={() => setSingle('mic', opt)}>
                                        <span className="text-large">{opt}</span>
                                    </button>
                                ))}
                            </div>

                            {preferences.mic === 'Yes' && (preferences.type.includes('Over-ear') || preferences.type.includes('On-ear')) && (
                                <div className="options-grid text-options" style={{ marginTop: '1rem' }}>
                                    <button className={`option-card ${preferences.micDetachable ? 'selected' : ''}`}
                                        onClick={() => setSingle('micDetachable', !preferences.micDetachable)}>
                                        <div className="check-circle">{preferences.micDetachable && <Check size={14} />}</div>
                                        <span>Detachable Microphone</span>
                                    </button>
                                </div>
                            )}

                            <p className="step-desc" style={{ marginTop: '2rem' }}>Noise Cancellation</p>
                            <div className="options-grid">
                                {['ANC', 'ENC', 'Passive', 'Nil'].map(nc => (
                                    <button key={nc} className={`option-card ${preferences.noiseCancellation.includes(nc) ? 'selected' : ''}`}
                                        onClick={() => toggleSelection('noiseCancellation', nc)}>
                                        <div className="check-circle">{preferences.noiseCancellation.includes(nc) && <Check size={14} />}</div>
                                        <span>{nc === 'Nil' ? 'None (Open)' : nc}</span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 4: Budget & Wrap up */}
                    {step === 4 && (
                        <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="step-content">
                            <h2>Perfecting the Match</h2>

                            <p className="step-desc">Max Budget</p>
                            <div className="budget-control">
                                <span className="currency">₹0</span>
                                <input type="range" min="1000" max="50000" step="1000" value={preferences.budget}
                                    onChange={(e) => setSingle('budget', parseInt(e.target.value))} className="range-slider" />
                                <span className="currency">₹{preferences.budget}+</span>
                            </div>
                            <div className="budget-display">
                                Max Price: <span className="highlight">₹{preferences.budget}</span>
                            </div>

                            <p className="step-desc" style={{ marginTop: '2rem' }}>Minimum Star Rating</p>
                            <div className="budget-control">
                                <span>1 ★</span>
                                <input type="range" min="1" max="5" step="0.5" value={preferences.minRating}
                                    onChange={(e) => setSingle('minRating', parseFloat(e.target.value))} className="range-slider" />
                                <span>{preferences.minRating} ★</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="wizard-actions">
                    {step > 1 && <button onClick={prevStep} className="btn-secondary">Back</button>}
                    {step < totalSteps ? (
                        <button onClick={nextStep} className="btn-primary with-icon">Next <ChevronRight size={18} /></button>
                    ) : (
                        <button onClick={handleFinish} className="btn-primary">See Results</button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FindHeadphones;
