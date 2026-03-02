import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Grid3x3, LayoutGrid, FlipHorizontal } from 'lucide-react';

export type LayoutType = '2' | '3' | '4' | '2x2';

interface CameraViewProps {
    onComplete: (photos: string[], layout: LayoutType) => void;
    initialPhotos?: string[];
    initialLayout?: LayoutType;
}

const LAYOUTS: { type: LayoutType; label: string; iconType: 'grid' | 'grid3x3'; count: number }[] = [
    { type: '2', label: '2 Frames', iconType: 'grid', count: 2 },
    { type: '3', label: '3 Frames', iconType: 'grid', count: 3 },
    { type: '4', label: '4 Frames', iconType: 'grid', count: 4 },
    { type: '2x2', label: '2x2 Grid', iconType: 'grid3x3', count: 4 },
];

const COUNTDOWN_OPTIONS = [3, 5, 10];

const playShutter = () => {
    try {
        const ctx = new AudioContext();
        const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.05), ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
            data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
        }
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.connect(ctx.destination);
        src.start();
    } catch {
        // Audio not available — silently skip
    }
};

export const CameraView: React.FC<CameraViewProps> = ({ onComplete, initialPhotos, initialLayout }) => {
    const webcamRef = useRef<Webcam>(null);
    const [photos, setPhotos] = useState<string[]>(initialPhotos ?? []);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [isFlashing, setIsFlashing] = useState(false);
    const [status, setStatus] = useState<'idle' | 'selecting' | 'counting' | 'capturing'>(
        initialPhotos && initialPhotos.length > 0 ? 'counting' : 'idle'
    );
    const [selectedLayout, setSelectedLayout] = useState<LayoutType>(initialLayout ?? '3');
    const [countdownSeconds, setCountdownSeconds] = useState(3);
    const [mirrored, setMirrored] = useState(true);
    const [cameraError, setCameraError] = useState<string | null>(null);

    const getPhotoCount = (layout: LayoutType) => {
        return LAYOUTS.find(l => l.type === layout)?.count || 3;
    };

    const startCountdown = useCallback((seconds?: number) => {
        setStatus('counting');
        setCountdown(seconds ?? countdownSeconds);
    }, [countdownSeconds]);

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            playShutter();
            setIsFlashing(true);
            setTimeout(() => setIsFlashing(false), 150);
            setPhotos(prev => {
                const newPhotos = [...prev, imageSrc];
                const photoCount = getPhotoCount(selectedLayout);
                if (newPhotos.length >= photoCount) {
                    setTimeout(() => onComplete(newPhotos, selectedLayout), 1000);
                } else {
                    setTimeout(() => startCountdown(), 1000);
                }
                return newPhotos;
            });
        }
    }, [onComplete, selectedLayout, startCountdown]);

    // Kick off countdown automatically when resuming mid-session
    useEffect(() => {
        if (initialPhotos && initialPhotos.length > 0) {
            startCountdown();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (countdown === null) return;

        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setStatus('capturing');
            capture();
            setCountdown(null);
        }
    }, [countdown, capture]);

    const startSession = () => {
        setPhotos([]);
        setStatus('selecting');
    };

    const confirmLayoutAndStart = () => {
        setPhotos([]);
        startCountdown(countdownSeconds);
    };

    return (
        <div className="flex-col flex-center" style={{ height: '100%', gap: '2rem', position: 'relative' }}>
            {/* Mirror toggle */}
            <div style={{ position: 'relative' }}>
                <button
                    onClick={() => setMirrored(m => !m)}
                    title={mirrored ? 'Show true view' : 'Show mirrored view'}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        zIndex: 30,
                        background: 'rgba(255,255,255,0.85)',
                        border: '2px solid rgba(255,105,180,0.3)',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                >
                    <FlipHorizontal size={18} color="var(--accent)" />
                </button>

                <div className="glass-panel" style={{ padding: '1.5rem', position: 'relative', borderRadius: '32px' }}>
                    {cameraError ? (
                        <div style={{
                            width: '720px',
                            height: '480px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '1rem',
                            color: 'var(--text-primary)',
                            fontFamily: 'Quicksand',
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            textAlign: 'center',
                            padding: '2rem'
                        }}>
                            <span style={{ fontSize: '3rem' }}>📷</span>
                            <p style={{ margin: 0 }}>{cameraError}</p>
                            <button
                                className="btn-secondary"
                                onClick={() => window.location.reload()}
                                style={{ fontSize: '0.95rem', padding: '10px 24px' }}
                            >
                                Reload page
                            </button>
                        </div>
                    ) : (
                        <div style={{ borderRadius: '24px', overflow: 'hidden', border: '4px solid white', boxShadow: '0 10px 30px rgba(255, 105, 180, 0.2)' }}>
                            <Webcam
                                audio={false}
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                width={720}
                                height={480}
                                mirrored={mirrored}
                                videoConstraints={{
                                    width: 1280,
                                    height: 720,
                                    facingMode: 'user'
                                }}
                                onUserMediaError={() => setCameraError('Camera access denied or unavailable. Please allow camera permissions and reload.')}
                                style={{ display: 'block' }}
                            />
                        </div>
                    )}

                    {/* Flash Effect */}
                    <AnimatePresence>
                        {isFlashing && (
                            <motion.div
                                initial={{ opacity: 0.8 }}
                                animate={{ opacity: 0 }}
                                exit={{ opacity: 0 }}
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    background: 'white',
                                    zIndex: 20,
                                    borderRadius: '32px'
                                }}
                            />
                        )}
                    </AnimatePresence>

                    {/* Countdown Overlay */}
                    <AnimatePresence>
                        {countdown !== null && countdown > 0 && (
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 1.5, opacity: 0 }}
                                key={countdown}
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    zIndex: 10,
                                    background: 'rgba(255, 255, 255, 0.2)',
                                    backdropFilter: 'blur(2px)',
                                    borderRadius: '32px'
                                }}
                            >
                                <div style={{
                                    background: 'white',
                                    width: '150px',
                                    height: '150px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 10px 30px rgba(255, 105, 180, 0.3)'
                                }}>
                                    <span style={{ fontSize: '5rem', fontWeight: 'bold', color: 'var(--accent)', fontFamily: 'Pacifico' }}>
                                        {countdown}
                                    </span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {status === 'idle' && (
                <button className="btn-primary" onClick={startSession} style={{ fontSize: '1.5rem', padding: '18px 56px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Heart fill="white" size={24} />
                    I'm Ready!
                    <Heart fill="white" size={24} />
                </button>
            )}

            {status === 'selecting' && (
                <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', maxWidth: '500px' }}>
                    <h3 style={{
                        fontFamily: 'Pacifico',
                        fontSize: '1.8rem',
                        color: 'var(--text-primary)',
                        margin: 0,
                        textAlign: 'center'
                    }}>
                        Choose Your Layout ✨
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', width: '100%' }}>
                        {LAYOUTS.map(layout => (
                            <button
                                key={layout.type}
                                onClick={() => setSelectedLayout(layout.type)}
                                style={{
                                    background: selectedLayout === layout.type ? 'var(--accent)' : 'white',
                                    color: selectedLayout === layout.type ? 'white' : 'var(--text-primary)',
                                    border: selectedLayout === layout.type ? '3px solid var(--accent)' : '2px solid rgba(0,0,0,0.1)',
                                    padding: '1.5rem 1rem',
                                    borderRadius: '16px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    cursor: 'pointer',
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    transform: selectedLayout === layout.type ? 'scale(1.05)' : 'scale(1)',
                                    boxShadow: selectedLayout === layout.type ? '0 4px 12px rgba(255, 105, 180, 0.3)' : 'none',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                {layout.iconType === 'grid3x3' ? <Grid3x3 size={20} /> : <LayoutGrid size={20} />}
                                <span>{layout.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Countdown selector */}
                    <div style={{ width: '100%' }}>
                        <p style={{
                            margin: '0 0 0.75rem 0',
                            fontFamily: 'Pacifico',
                            fontSize: '1rem',
                            color: 'var(--text-primary)',
                            textAlign: 'center'
                        }}>
                            Countdown ⏱
                        </p>
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                            {COUNTDOWN_OPTIONS.map(sec => (
                                <button
                                    key={sec}
                                    onClick={() => setCountdownSeconds(sec)}
                                    style={{
                                        background: countdownSeconds === sec ? 'var(--accent)' : 'white',
                                        color: countdownSeconds === sec ? 'white' : 'var(--text-primary)',
                                        border: countdownSeconds === sec ? '2px solid var(--accent)' : '2px solid rgba(0,0,0,0.1)',
                                        padding: '0.5rem 1.25rem',
                                        borderRadius: '50px',
                                        fontWeight: 700,
                                        fontSize: '1rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    {sec}s
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        className="btn-primary"
                        onClick={confirmLayoutAndStart}
                        style={{ fontSize: '1.2rem', padding: '14px 40px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <Heart fill="white" size={20} />
                        Start Taking Photos
                    </button>
                </div>
            )}

            {status !== 'idle' && status !== 'selecting' && (
                <div style={{
                    fontSize: '1.5rem',
                    color: 'var(--text-primary)',
                    fontFamily: 'Pacifico',
                    background: 'white',
                    padding: '0.5rem 1.5rem',
                    borderRadius: '50px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}>
                    Pose {photos.length + 1} of {getPhotoCount(selectedLayout)} ✨
                </div>
            )}
        </div>
    );
};
