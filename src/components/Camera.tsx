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

const COUNTDOWN_OPTIONS = [3, 5, 10];

const LAYOUTS: { type: LayoutType; label: string; iconType: 'grid' | 'grid3x3'; count: number }[] = [
    { type: '2', label: '2 Frames', iconType: 'grid', count: 2 },
    { type: '3', label: '3 Frames', iconType: 'grid', count: 3 },
    { type: '4', label: '4 Frames', iconType: 'grid', count: 4 },
    { type: '2x2', label: '2x2 Grid', iconType: 'grid3x3', count: 4 },
];

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
        // Audio not available
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

            {/* Camera panel */}
            <div style={{ position: 'relative' }}>
                {/* Mirror toggle */}
                <button
                    onClick={() => setMirrored(m => !m)}
                    title={mirrored ? 'Show true view' : 'Show mirrored view'}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        zIndex: 30,
                        background: mirrored ? '#FF007A' : 'rgba(255,255,255,0.90)',
                        border: mirrored ? 'none' : '1.5px solid rgba(255,0,122,0.2)',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.10)',
                        color: mirrored ? 'white' : '#FF007A',
                    }}
                >
                    <FlipHorizontal size={18} />
                </button>

                <div
                    className="glass-panel"
                    style={{ padding: '1.25rem', position: 'relative', borderRadius: '32px' }}
                >
                    {cameraError ? (
                        <div style={{
                            width: '720px',
                            height: '480px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '1rem',
                            color: '#6B1845',
                            fontFamily: 'DM Sans',
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            textAlign: 'center',
                            padding: '2rem',
                        }}>
                            <span style={{ fontSize: '3rem' }}>📷</span>
                            <p style={{ margin: 0 }}>{cameraError}</p>
                            <button
                                className="btn-secondary"
                                onClick={() => window.location.reload()}
                                style={{ fontSize: '0.95rem', padding: '10px 28px' }}
                            >
                                Reload page
                            </button>
                        </div>
                    ) : (
                        <div style={{
                            borderRadius: '22px',
                            overflow: 'hidden',
                            border: '3px solid rgba(255,255,255,0.9)',
                            boxShadow: '0 8px 28px rgba(255, 0, 122, 0.15)',
                        }}>
                            <Webcam
                                audio={false}
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                width={720}
                                height={480}
                                mirrored={mirrored}
                                videoConstraints={{ width: 1280, height: 720, facingMode: 'user' }}
                                onUserMediaError={() =>
                                    setCameraError('Camera access denied or unavailable. Please allow camera permissions and reload.')
                                }
                                style={{ display: 'block' }}
                            />
                        </div>
                    )}

                    {/* Flash */}
                    <AnimatePresence>
                        {isFlashing && (
                            <motion.div
                                initial={{ opacity: 0.8 }}
                                animate={{ opacity: 0 }}
                                exit={{ opacity: 0 }}
                                style={{
                                    position: 'absolute', inset: 0,
                                    background: 'white', zIndex: 20, borderRadius: '32px',
                                }}
                            />
                        )}
                    </AnimatePresence>

                    {/* Countdown overlay */}
                    <AnimatePresence>
                        {countdown !== null && countdown > 0 && (
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 1.5, opacity: 0 }}
                                key={countdown}
                                style={{
                                    position: 'absolute', inset: 0,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    zIndex: 10,
                                    background: 'rgba(255, 250, 244, 0.18)',
                                    backdropFilter: 'blur(2px)',
                                    borderRadius: '32px',
                                }}
                            >
                                <div style={{
                                    background: 'white',
                                    width: '148px', height: '148px',
                                    borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 10px 36px rgba(255, 0, 122, 0.22)',
                                }}>
                                    <span style={{
                                        fontSize: '5rem', fontWeight: 'bold',
                                        color: '#FF007A', fontFamily: 'Pacifico',
                                    }}>
                                        {countdown}
                                    </span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Idle — start button */}
            {status === 'idle' && (
                <button
                    className="btn-primary"
                    onClick={startSession}
                    style={{ fontSize: '1.4rem', padding: '18px 56px', display: 'flex', alignItems: 'center', gap: '0.9rem' }}
                >
                    <Heart fill="white" size={22} />
                    I'm Ready!
                    <Heart fill="white" size={22} />
                </button>
            )}

            {/* Layout + timer selector */}
            {status === 'selecting' && (
                <div
                    className="glass-panel"
                    style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', maxWidth: '500px' }}
                >
                    <h3 style={{
                        fontFamily: 'Cormorant Garamond',
                        fontStyle: 'italic',
                        fontWeight: 400,
                        fontSize: '2rem',
                        color: '#6B1845',
                        margin: 0,
                        textAlign: 'center',
                        letterSpacing: '0.02em',
                    }}>
                        Choose Your Layout
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.9rem', width: '100%' }}>
                        {LAYOUTS.map(layout => (
                            <button
                                key={layout.type}
                                onClick={() => setSelectedLayout(layout.type)}
                                style={{
                                    background: selectedLayout === layout.type ? '#FF007A' : 'rgba(255,255,255,0.85)',
                                    color: selectedLayout === layout.type ? 'white' : '#6B1845',
                                    border: selectedLayout === layout.type ? '2px solid #FF007A' : '1.5px solid rgba(107,24,69,0.12)',
                                    padding: '1.4rem 1rem',
                                    borderRadius: '18px',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                                    cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem',
                                    transform: selectedLayout === layout.type ? 'scale(1.04)' : 'scale(1)',
                                    boxShadow: selectedLayout === layout.type ? '0 4px 16px rgba(255, 0, 122, 0.28)' : 'none',
                                    transition: 'all 0.25s ease',
                                }}
                            >
                                {layout.iconType === 'grid3x3' ? <Grid3x3 size={20} /> : <LayoutGrid size={20} />}
                                <span>{layout.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Countdown picker */}
                    <div style={{ width: '100%' }}>
                        <p style={{
                            margin: '0 0 0.75rem 0',
                            fontFamily: 'Cormorant Garamond',
                            fontStyle: 'italic',
                            fontSize: '1.1rem',
                            color: '#6B1845',
                            textAlign: 'center',
                            letterSpacing: '0.04em',
                        }}>
                            Countdown ⏱
                        </p>
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                            {COUNTDOWN_OPTIONS.map(sec => (
                                <button
                                    key={sec}
                                    onClick={() => setCountdownSeconds(sec)}
                                    style={{
                                        background: countdownSeconds === sec ? '#FF007A' : 'rgba(255,255,255,0.85)',
                                        color: countdownSeconds === sec ? 'white' : '#6B1845',
                                        border: countdownSeconds === sec ? '2px solid #FF007A' : '1.5px solid rgba(107,24,69,0.12)',
                                        padding: '0.55rem 1.3rem',
                                        borderRadius: '100px',
                                        fontWeight: 600, fontSize: '0.95rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
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
                        style={{ fontSize: '1.1rem', padding: '14px 44px', display: 'flex', alignItems: 'center', gap: '0.6rem' }}
                    >
                        <Heart fill="white" size={18} />
                        Start Taking Photos
                    </button>
                </div>
            )}

            {/* Pose counter */}
            {status !== 'idle' && status !== 'selecting' && photos.length < getPhotoCount(selectedLayout) && (
                <div style={{
                    fontFamily: 'Cormorant Garamond',
                    fontStyle: 'italic',
                    fontSize: '1.5rem',
                    color: '#6B1845',
                    background: 'rgba(255,255,255,0.82)',
                    padding: '0.5rem 1.8rem',
                    borderRadius: '100px',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,0,122,0.12)',
                    letterSpacing: '0.02em',
                }}>
                    Pose {photos.length + 1} of {getPhotoCount(selectedLayout)} ✦
                </div>
            )}
        </div>
    );
};
