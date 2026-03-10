import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, RefreshCw, Palette, Image as ImageIcon, Loader2, RotateCcw, Sparkles } from 'lucide-react';
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
        name: 'Passenger Princess',
        bg: 'linear-gradient(160deg, #FF007A 0%, #FF4DA6 55%, #FFB3D9 100%)',
        text: '#fff',
        border: '3px solid rgba(255,255,255,0.35)',
        font: 'Pacifico',
        hasTiara: true,
    },
    {
        id: 'garden',
        name: 'Garden Party',
        bg: 'linear-gradient(160deg, #D0EDE0 0%, #F5FDF8 100%)',
        text: '#1D6348',
        border: '3px solid #74C49D',
        font: 'Cormorant Garamond',
    },
    {
        id: 'bloom',
        name: 'In Bloom',
        bg: 'linear-gradient(160deg, #FFE8F4 0%, #FFFAF4 100%)',
        text: '#A04070',
        border: '3px solid #FFB3D9',
        font: 'Pacifico',
    },
    {
        id: 'dino',
        name: 'nailoooong',
        bg: '#fff9c4',
        text: '#f57f17',
        border: '4px solid #fff',
        font: 'Pacifico',
        hasCharacter: true,
        hasCharacter2: true,
    },
    {
        id: 'midnight',
        name: 'Midnight Garden',
        bg: 'linear-gradient(160deg, #0D2818 0%, #1D5C3A 100%)',
        text: '#74C49D',
        border: '3px solid rgba(116,196,157,0.35)',
        font: 'Cormorant Garamond',
    },
    {
        id: 'cottage',
        name: 'Cottagecore',
        bg: 'linear-gradient(160deg, #E8F5E9 0%, #DCEDC8 100%)',
        text: '#5a3e2b',
        border: '3px dashed #7da87b',
        font: 'Quicksand',
    },
];

const FILTERS = [
    { id: 'none',    name: 'None',    css: 'none' },
    { id: 'bw',      name: 'B&W',     css: 'grayscale(100%)' },
    { id: 'vintage', name: 'Vintage', css: 'sepia(70%)' },
    { id: 'warm',    name: 'Warm',    css: 'saturate(1.4) hue-rotate(-15deg) brightness(1.05)' },
    { id: 'cool',    name: 'Cool',    css: 'saturate(1.2) hue-rotate(20deg) brightness(1.05)' },
    { id: 'vivid',   name: 'Vivid',   css: 'saturate(1.8) contrast(1.1)' },
];

const SectionLabel: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <span style={{ color: '#FF007A' }}>{icon}</span>
        <span style={{
            fontFamily: 'Cormorant Garamond',
            fontStyle: 'italic',
            fontWeight: 600,
            fontSize: '1.3rem',
            color: '#6B1845',
            letterSpacing: '0.03em',
        }}>
            {label}
        </span>
    </div>
);

export const PhotoStrip: React.FC<PhotoStripProps> = ({ photos, layout, onRetake, onRetakePhoto }) => {
    const stripRef = useRef<HTMLDivElement>(null);
    const [selectedTheme, setSelectedTheme] = useState<Theme>(THEMES[0]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [caption, setCaption] = useState('xoxo');
    const [hoveredPhoto, setHoveredPhoto] = useState<number | null>(null);
    const [selectedFilter, setSelectedFilter] = useState(FILTERS[0]);

    const isGridLayout = layout === '2x2';
    const containerStyle = isGridLayout
        ? { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', width: '100%' }
        : { display: 'flex', flexDirection: 'column' as const, gap: '1.5rem', alignItems: 'center', width: '100%' };

    const generateImage = async () => {
        if (!stripRef.current) return null;
        return await html2canvas(stripRef.current, { scale: 2, useCORS: true, backgroundColor: null });
    };

    const downloadPDF = async () => {
        setIsGenerating(true);
        try {
            const canvas = await generateImage();
            if (!canvas) return;
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width, canvas.height] });
            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save('elise-photobooth.pdf');
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
            link.download = 'elise-photobooth.jpg';
            link.href = canvas.toDataURL('image/jpeg', 0.92);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error('Error generating JPEG:', err);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="flex-col flex-center" style={{ height: '100%', gap: '2.5rem', padding: '2rem 0' }}>
            <div style={{ display: 'flex', gap: '3rem', alignItems: 'flex-start', flexWrap: 'wrap', justifyContent: 'center' }}>

                {/* Photo Strip */}
                <div
                    ref={stripRef}
                    style={{
                        background: selectedTheme.bg,
                        padding: '1.75rem 1.5rem',
                        ...containerStyle,
                        width: isGridLayout ? '500px' : '300px',
                        minWidth: isGridLayout ? '500px' : '300px',
                        borderRadius: '12px',
                        boxShadow: '0 12px 40px rgba(107,24,69,0.12)',
                        position: 'relative',
                        overflow: 'hidden',
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
                                    width: '100%', height: 'auto', display: 'block',
                                    border: selectedTheme.border,
                                    borderRadius: '4px',
                                    boxSizing: 'border-box',
                                    background: 'white',
                                    objectFit: 'cover',
                                    filter: selectedFilter.css,
                                }}
                            />
                            {selectedTheme.hasTiara && (
                                <img
                                    src={tiaraImg}
                                    alt="Tiara"
                                    style={{ position: 'absolute', top: -15, left: '50%', transform: 'translateX(-50%)', width: '60px', height: 'auto', zIndex: 3 }}
                                />
                            )}
                            {hoveredPhoto === index && (
                                <button
                                    onClick={() => onRetakePhoto(index)}
                                    data-html2canvas-ignore="true"
                                    style={{
                                        position: 'absolute', inset: 0,
                                        background: 'rgba(107,24,69,0.5)',
                                        border: 'none', borderRadius: '4px',
                                        display: 'flex', flexDirection: 'column',
                                        alignItems: 'center', justifyContent: 'center',
                                        gap: '0.5rem', color: 'white',
                                        fontSize: '0.9rem', fontWeight: 600,
                                        cursor: 'pointer', zIndex: 4, fontFamily: 'DM Sans',
                                    }}
                                >
                                    <RotateCcw size={22} />
                                    Retake
                                </button>
                            )}
                        </div>
                    ))}

                    {/* Characters */}
                    {selectedTheme.hasCharacter && (
                        <img src={characterImg} alt="Character" style={{ position: 'absolute', bottom: -10, right: -20, width: '140px', height: 'auto', zIndex: 2, transform: 'rotate(-10deg)' }} />
                    )}
                    {selectedTheme.hasCharacter2 && (
                        <img src={character2Img} alt="Character 2" style={{ position: 'absolute', bottom: -10, left: -20, width: '120px', height: 'auto', zIndex: 2, transform: 'rotate(10deg)' }} />
                    )}

                    {/* Caption */}
                    <div style={{
                        gridColumn: isGridLayout ? '1 / -1' : undefined,
                        textAlign: 'center',
                        fontFamily: selectedTheme.font,
                        color: selectedTheme.text,
                        marginTop: '0.5rem',
                        fontSize: '1.8rem',
                        zIndex: 1, padding: '0.5rem 1rem',
                        borderRadius: '12px',
                        width: isGridLayout ? undefined : '100%',
                        fontStyle: selectedTheme.font === 'Cormorant Garamond' ? 'italic' : 'normal',
                    }}>
                        {caption || 'xoxo'}
                        <div style={{ fontSize: '0.85rem', fontFamily: 'DM Sans', fontStyle: 'normal', marginTop: '0.25rem', opacity: 0.75, fontWeight: 500 }}>
                            {new Date().toLocaleDateString()}
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div
                    className="glass-panel flex-col"
                    style={{ padding: '2.25rem', gap: '2rem', width: '340px' }}
                >
                    {/* Theme picker */}
                    <div>
                        <SectionLabel icon={<Palette size={18} />} label="Pick a Vibe" />
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem' }}>
                            {THEMES.map(theme => (
                                <button
                                    key={theme.id}
                                    onClick={() => setSelectedTheme(theme)}
                                    style={{
                                        background: theme.bg,
                                        color: theme.text,
                                        border: selectedTheme.id === theme.id ? '2.5px solid #FF007A' : '1px solid rgba(0,0,0,0.08)',
                                        padding: '0.75rem 0.4rem',
                                        borderRadius: '14px',
                                        textAlign: 'center',
                                        fontWeight: 600,
                                        fontSize: '0.75rem',
                                        cursor: 'pointer',
                                        transform: selectedTheme.id === theme.id ? 'scale(1.05)' : 'scale(1)',
                                        boxShadow: selectedTheme.id === theme.id ? '0 4px 14px rgba(255,0,122,0.18)' : 'none',
                                        transition: 'all 0.2s ease',
                                        fontFamily: 'DM Sans',
                                    }}
                                >
                                    {theme.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Filter picker */}
                    <div>
                        <SectionLabel icon={<Sparkles size={18} />} label="Filter" />
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.55rem' }}>
                            {FILTERS.map(filter => (
                                <button
                                    key={filter.id}
                                    onClick={() => setSelectedFilter(filter)}
                                    style={{
                                        background: selectedFilter.id === filter.id ? '#FF007A' : 'rgba(255,255,255,0.85)',
                                        color: selectedFilter.id === filter.id ? 'white' : '#6B1845',
                                        border: selectedFilter.id === filter.id ? 'none' : '1px solid rgba(107,24,69,0.12)',
                                        padding: '0.45rem 0.9rem',
                                        borderRadius: '100px',
                                        fontWeight: 600,
                                        fontSize: '0.82rem',
                                        cursor: 'pointer',
                                        transform: selectedFilter.id === filter.id ? 'scale(1.05)' : 'scale(1)',
                                        transition: 'all 0.2s ease',
                                        boxShadow: selectedFilter.id === filter.id ? '0 2px 10px rgba(255,0,122,0.22)' : 'none',
                                    }}
                                >
                                    {filter.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Caption editor */}
                    <div>
                        <label style={{
                            display: 'block',
                            fontFamily: 'Cormorant Garamond',
                            fontStyle: 'italic',
                            fontWeight: 600,
                            fontSize: '1.2rem',
                            color: '#6B1845',
                            marginBottom: '0.5rem',
                            letterSpacing: '0.03em',
                        }}>
                            Caption ✏️
                        </label>
                        <input
                            type="text"
                            value={caption}
                            onChange={e => setCaption(e.target.value)}
                            maxLength={24}
                            placeholder="xoxo"
                            style={{
                                width: '100%',
                                padding: '0.7rem 1.1rem',
                                borderRadius: '100px',
                                border: '1.5px solid rgba(255, 0, 122, 0.22)',
                                fontFamily: 'DM Sans',
                                fontSize: '1rem',
                                fontWeight: 500,
                                color: '#6B1845',
                                background: 'rgba(255,255,255,0.85)',
                                outline: 'none',
                                boxSizing: 'border-box',
                                textAlign: 'center',
                                transition: 'border-color 0.2s',
                            }}
                            onFocus={e => (e.target.style.borderColor = '#FF007A')}
                            onBlur={e => (e.target.style.borderColor = 'rgba(255, 0, 122, 0.22)')}
                        />
                    </div>

                    {/* Download + retake */}
                    <div className="flex-col" style={{ gap: '0.85rem' }}>
                        <div style={{ display: 'flex', gap: '0.85rem' }}>
                            <button
                                className="btn-primary"
                                onClick={downloadPDF}
                                disabled={isGenerating}
                                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '13px' }}
                            >
                                {isGenerating ? <Loader2 size={18} className="spin" /> : <Download size={18} />}
                                {isGenerating ? '...' : 'PDF'}
                            </button>
                            <button
                                className="btn-primary"
                                onClick={downloadJPEG}
                                disabled={isGenerating}
                                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '13px', background: '#2D8A5E' }}
                            >
                                {isGenerating ? <Loader2 size={18} className="spin" /> : <ImageIcon size={18} />}
                                {isGenerating ? '...' : 'JPEG'}
                            </button>
                        </div>
                        <button
                            className="btn-secondary"
                            onClick={onRetake}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                        >
                            <RefreshCw size={18} />
                            New Pics
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
