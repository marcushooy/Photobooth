import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, RefreshCw, Palette, Image as ImageIcon, Loader2, RotateCcw } from 'lucide-react';
import characterImg from '../assets/character_nobg_v2.png';
import character2Img from '../assets/character2_nobg.png';
import tiaraImg from '../assets/tiara.png';
import { type LayoutType } from './Camera';

interface PhotoStripProps {
    photos: string[];
    layout: LayoutType;
    onRetake: () => void;
    onRetakePhoto: (index: number) => void;
}

interface Theme {
    id: string;
    name: string;
    bg: string;
    text: string;
    border: string;
    font: string;
    hasTiara?: boolean;
    hasCharacter?: boolean;
    hasCharacter2?: boolean;
}

const THEMES: Theme[] = [
    {
        id: 'princess',
        name: 'Princess',
        bg: 'linear-gradient(180deg, #ffc0e3 0%, #ffb3d9 100%)',
        text: '#d946ef',
        border: '4px solid #ffd1f0',
        font: 'Pacifico',
        hasTiara: true
    },
    {
        id: 'pastel',
        name: 'Pastel Dream',
        bg: 'linear-gradient(180deg, #ffdde1 0%, #ee9ca7 100%)',
        text: '#5d5d5d',
        border: '4px solid white',
        font: 'Quicksand'
    },
    {
        id: 'dino',
        name: 'nailoooong',
        bg: '#fff9c4',
        text: '#f57f17',
        border: '4px solid #fff',
        font: 'Pacifico',
        hasCharacter: true,
        hasCharacter2: true
    },
    {
        id: 'retro',
        name: 'Retro Cute',
        bg: '#fff0f5',
        text: '#ff6b6b',
        border: '4px dashed #ff6b6b',
        font: 'Quicksand'
    },
    {
        id: 'starry',
        name: 'Starry Night',
        bg: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
        text: '#ffd700',
        border: '4px solid rgba(255,255,255,0.3)',
        font: 'Pacifico'
    },
    {
        id: 'cottage',
        name: 'Cottagecore',
        bg: '#d4edda',
        text: '#5a3e2b',
        border: '4px dashed #7da87b',
        font: 'Quicksand'
    },
];

export const PhotoStrip: React.FC<PhotoStripProps> = ({ photos, layout, onRetake, onRetakePhoto }) => {
    const stripRef = useRef<HTMLDivElement>(null);
    const [selectedTheme, setSelectedTheme] = useState<Theme>(THEMES[0]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [caption, setCaption] = useState('xoxo');
    const [hoveredPhoto, setHoveredPhoto] = useState<number | null>(null);

    const isGridLayout = layout === '2x2';
    const containerStyle = isGridLayout
        ? {
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1.5rem',
            width: '100%'
        }
        : {
            display: 'flex',
            flexDirection: 'column' as const,
            gap: '1.5rem',
            alignItems: 'center',
            width: '100%'
        };

    const generateImage = async () => {
        if (!stripRef.current) return null;
        const canvas = await html2canvas(stripRef.current, {
            scale: 2,
            useCORS: true,
            backgroundColor: null
        });
        return canvas;
    };

    const downloadPDF = async () => {
        setIsGenerating(true);
        try {
            const canvas = await generateImage();
            if (!canvas) return;

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });

            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save('cute-photobooth-strip.pdf');
        } catch (err) {
            console.error('Error generating PDF:', err);
        } finally {
            setIsGenerating(false);
        }
    };

    const downloadJPEG = async () => {
        setIsGenerating(true);
        try {
            const canvas = await generateImage();
            if (!canvas) return;

            const link = document.createElement('a');
            link.download = 'cute-photobooth-strip.jpg';
            link.href = canvas.toDataURL('image/jpeg', 0.9);
            link.click();
        } catch (err) {
            console.error('Error generating JPEG:', err);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="flex-col flex-center" style={{ height: '100%', gap: '2rem', padding: '2rem 0' }}>
            <div style={{ display: 'flex', gap: '3rem', alignItems: 'flex-start', flexWrap: 'wrap', justifyContent: 'center' }}>

                {/* The Photo Strip */}
                <div
                    ref={stripRef}
                    className="shadow-lg"
                    style={{
                        background: selectedTheme.bg,
                        padding: '2rem 1.5rem',
                        ...containerStyle,
                        width: isGridLayout ? '500px' : '320px',
                        minWidth: isGridLayout ? '500px' : '320px',
                        borderRadius: '10px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {photos.map((photo, index) => (
                        <div
                            key={index}
                            style={{ position: 'relative', width: '100%', zIndex: 1 }}
                            onMouseEnter={() => setHoveredPhoto(index)}
                            onMouseLeave={() => setHoveredPhoto(null)}
                        >
                            <img
                                src={photo}
                                alt={`Capture ${index + 1}`}
                                style={{
                                    width: '100%',
                                    height: 'auto',
                                    display: 'block',
                                    border: selectedTheme.border,
                                    borderRadius: '4px',
                                    boxSizing: 'border-box',
                                    background: 'white',
                                    objectFit: 'cover'
                                }}
                            />
                            {selectedTheme.hasTiara && (
                                <img
                                    src={tiaraImg}
                                    alt="Tiara"
                                    style={{ position: 'absolute', top: -15, left: '50%', transform: 'translateX(-50%)', width: '60px', height: 'auto', zIndex: 3 }}
                                />
                            )}
                            {/* Retake overlay — shown on hover, excluded from html2canvas export */}
                            {hoveredPhoto === index && (
                                <button
                                    onClick={() => onRetakePhoto(index)}
                                    data-html2canvas-ignore="true"
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        background: 'rgba(0,0,0,0.45)',
                                        border: 'none',
                                        borderRadius: '4px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        color: 'white',
                                        fontSize: '0.9rem',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        zIndex: 4,
                                        fontFamily: 'Quicksand'
                                    }}
                                >
                                    <RotateCcw size={24} />
                                    Retake
                                </button>
                            )}
                        </div>
                    ))}

                    {/* Character Overlays */}
                    {selectedTheme.hasCharacter && (
                        <img
                            src={characterImg}
                            alt="Character"
                            style={{
                                position: 'absolute',
                                bottom: -10,
                                right: -20,
                                width: '140px',
                                height: 'auto',
                                zIndex: 2,
                                transform: 'rotate(-10deg)'
                            }}
                        />
                    )}
                    {selectedTheme.hasCharacter2 && (
                        <img
                            src={character2Img}
                            alt="Character 2"
                            style={{
                                position: 'absolute',
                                bottom: -10,
                                left: -20,
                                width: '120px',
                                height: 'auto',
                                zIndex: 2,
                                transform: 'rotate(10deg)'
                            }}
                        />
                    )}

                    {/* Caption — unified for strip and grid layouts */}
                    <div style={{
                        gridColumn: isGridLayout ? '1 / -1' : undefined,
                        textAlign: 'center',
                        fontFamily: selectedTheme.font,
                        color: selectedTheme.text,
                        marginTop: '0.5rem',
                        fontSize: '1.8rem',
                        textShadow: '1px 1px 0px rgba(0,0,0,0.1)',
                        zIndex: 1,
                        padding: '0.5rem 1rem',
                        borderRadius: '12px',
                        width: isGridLayout ? undefined : '100%'
                    }}>
                        {caption || 'xoxo'}
                        <div style={{ fontSize: '0.9rem', fontFamily: 'Quicksand', marginTop: '0.25rem', opacity: 0.9 }}>
                            {new Date().toLocaleDateString()}
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="glass-panel flex-col" style={{ padding: '2.5rem', gap: '2rem', width: '340px' }}>
                    <div>
                        <h3 style={{
                            margin: '0 0 1.5rem 0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontFamily: 'Pacifico',
                            fontSize: '1.8rem',
                            color: 'var(--text-primary)'
                        }}>
                            <Palette size={24} /> Pick a Vibe
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                            {THEMES.map(theme => (
                                <button
                                    key={theme.id}
                                    onClick={() => setSelectedTheme(theme)}
                                    style={{
                                        background: theme.bg,
                                        color: theme.text,
                                        border: selectedTheme.id === theme.id ? '3px solid var(--accent)' : '1px solid rgba(0,0,0,0.1)',
                                        padding: '0.75rem 0.5rem',
                                        borderRadius: '12px',
                                        textAlign: 'center',
                                        fontWeight: '700',
                                        fontSize: '0.8rem',
                                        cursor: 'pointer',
                                        transform: selectedTheme.id === theme.id ? 'scale(1.05)' : 'scale(1)',
                                        boxShadow: selectedTheme.id === theme.id ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    {theme.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Caption editor */}
                    <div>
                        <label style={{
                            display: 'block',
                            fontFamily: 'Pacifico',
                            fontSize: '1.1rem',
                            color: 'var(--text-primary)',
                            marginBottom: '0.5rem'
                        }}>
                            Caption ✏️
                        </label>
                        <input
                            type="text"
                            value={caption}
                            onChange={e => setCaption(e.target.value)}
                            maxLength={20}
                            placeholder="xoxo"
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                borderRadius: '50px',
                                border: '2px solid rgba(255,105,180,0.3)',
                                fontFamily: 'Quicksand',
                                fontSize: '1rem',
                                fontWeight: 600,
                                color: 'var(--text-primary)',
                                background: 'white',
                                outline: 'none',
                                boxSizing: 'border-box',
                                textAlign: 'center'
                            }}
                        />
                    </div>

                    <div className="flex-col" style={{ gap: '1rem' }}>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                className="btn-primary"
                                onClick={downloadPDF}
                                disabled={isGenerating}
                                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '14px' }}
                            >
                                {isGenerating ? <Loader2 size={20} className="spin" /> : <Download size={20} />}
                                {isGenerating ? 'Working...' : 'PDF'}
                            </button>
                            <button
                                className="btn-primary"
                                onClick={downloadJPEG}
                                disabled={isGenerating}
                                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '14px', background: '#4ecdc4' }}
                            >
                                {isGenerating ? <Loader2 size={20} className="spin" /> : <ImageIcon size={20} />}
                                {isGenerating ? 'Working...' : 'JPEG'}
                            </button>
                        </div>

                        <button
                            className="btn-secondary"
                            onClick={onRetake}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                        >
                            <RefreshCw size={20} />
                            New Pics
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
