import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Grid3x3, LayoutGrid } from 'lucide-react';

export type LayoutType = '2' | '3' | '4' | '2x2';

interface CameraViewProps {
    onComplete: (photos: string[], layout: LayoutType) => void;
}

const COUNTDOWN_SECONDS = 3;

const LAYOUTS: { type: LayoutType; label: string; iconType: 'grid' | 'grid3x3'; count: number }[] = [
    { type: '2', label: '2 Frames', iconType: 'grid', count: 2 },
    { type: '3', label: '3 Frames', iconType: 'grid', count: 3 },
    { type: '4', label: '4 Frames', iconType: 'grid', count: 4 },
    { type: '2x2', label: '2x2 Grid', iconType: 'grid3x3', count: 4 },
];

export const CameraView: React.FC<CameraViewProps> = ({ onComplete }) => {
    const webcamRef = useRef<Webcam>(null);
    const [photos, setPhotos] = useState<string[]>([]);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [isFlashing, setIsFlashing] = useState(false);
    const [status, setStatus] = useState<'idle' | 'selecting' | 'counting' | 'capturing'>('idle');
    const [selectedLayout, setSelectedLayout] = useState<LayoutType>('3');

    const getPhotoCount = (layout: LayoutType) => {
        return LAYOUTS.find(l => l.type === layout)?.count || 3;
    };

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            setIsFlashing(true);
            setTimeout(() => setIsFlashing(false), 150);
            setPhotos(prev => {
                const newPhotos = [...prev, imageSrc];
                const photoCount = getPhotoCount(selectedLayout);
                if (newPhotos.length >= photoCount) {
                    setTimeout(() => onComplete(newPhotos, selectedLayout), 1000);
                } else {
                    // Start next countdown automatically
                    setTimeout(() => startCountdown(), 1000);
                }
                return newPhotos;
            });
        }
    }, [onComplete, selectedLayout]);

    const startCountdown = () => {
        setStatus('counting');
        setCountdown(COUNTDOWN_SECONDS);
    };

    useEffect(() => {
        if (countdown === null) return;

        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            // Countdown finished, take photo
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
        startCountdown();
    };

    return (
        <div className="flex-col flex-center" style={{ height: '100%', gap: '2rem', position: 'relative' }}>
            <div className="glass-panel" style={{ padding: '1.5rem', position: 'relative', borderRadius: '32px' }}>
                <div style={{ borderRadius: '24px', overflow: 'hidden', border: '4px solid white', boxShadow: '0 10px 30px rgba(255, 105, 180, 0.2)' }}>
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        width={720}
                        height={480}
                        videoConstraints={{
                            width: 1280,
                            height: 720,
                            facingMode: "user"
                        }}
                        style={{ display: 'block' }}
                    />
                </div>

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
