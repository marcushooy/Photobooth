import React, { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import GIF from 'gif.js';
import { Reorder } from 'framer-motion';
import { Download, RefreshCw, Palette, Image as ImageIcon, Loader2, RotateCcw, Sparkles, GripVertical, Share2, Copy, Film } from 'lucide-react';
import { addEntry } from '../utils/historyStorage';
import characterImg from '../assets/character_nobg_v2.png';
import character2Img from '../assets/character2_nobg.png';
import tiaraImg from '../assets/tiara.png';
import { type LayoutType } from './Camera';

interface PhotoStripProps {
    photos: string[];
    layout: LayoutType;
    onRetake: () => void;
    onRetakePhoto: (index: number) => void;
    initialThemeId?: string;
    initialFilterId?: string;
    initialCaption?: string;
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
    { id: 'none',    name: 'None',        css: 'none' },
    { id: 'bw',      name: 'B&W',         css: 'grayscale(100%)' },
    { id: 'noir',    name: 'Noir',         css: 'grayscale(100%) contrast(1.4) brightness(0.85)' },
    { id: 'vintage', name: 'Vintage',      css: 'sepia(70%)' },
    { id: 'film',    name: 'Film',         css: 'sepia(30%) saturate(0.85) contrast(1.05) brightness(1.05)' },
    { id: 'fade',    name: 'Fade',         css: 'brightness(1.1) contrast(0.85) saturate(0.75)' },
    { id: 'warm',    name: 'Warm',         css: 'saturate(1.4) hue-rotate(-15deg) brightness(1.05)' },
    { id: 'golden',  name: 'Golden',       css: 'sepia(40%) saturate(1.6) hue-rotate(-10deg) brightness(1.1)' },
    { id: 'cool',    name: 'Cool',         css: 'saturate(1.2) hue-rotate(20deg) brightness(1.05)' },
    { id: 'vivid',   name: 'Vivid',        css: 'saturate(1.8) contrast(1.1)' },
    { id: 'pop',     name: 'Pop',          css: 'saturate(2.0) contrast(1.15) brightness(1.05)' },
    { id: 'dreamy',  name: 'Dreamy',       css: 'brightness(1.15) contrast(0.9) saturate(1.3) hue-rotate(330deg)' },
];

interface Sticker {
    id: string;
    emoji: string;
    photoIndex: number;
    x: number; // percentage of photo width
    y: number; // percentage of photo height
}

const STICKER_EMOJIS = ['🌸', '⭐', '💕', '🎀', '✨', '🌈', '🦋', '🍀', '💫', '🎉', '🤍', '🌟'];

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

export const PhotoStrip: React.FC<PhotoStripProps> = ({
    photos, layout, onRetake, onRetakePhoto,
    initialThemeId, initialFilterId, initialCaption,
}) => {
    const stripRef = useRef<HTMLDivElement>(null);
    const [selectedTheme, setSelectedTheme] = useState<Theme>(
        () => THEMES.find(t => t.id === initialThemeId) ?? THEMES[0]
    );
    const [isGenerating, setIsGenerating] = useState(false);
    const [caption, setCaption] = useState(initialCaption ?? 'xoxo');
    const [hoveredPhoto, setHoveredPhoto] = useState<number | null>(null);
    const [selectedFilter, setSelectedFilter] = useState(
        () => FILTERS.find(f => f.id === initialFilterId) ?? FILTERS[0]
    );
    const [orderedPhotos, setOrderedPhotos] = useState<string[]>(photos);
    const [stickers, setStickers] = useState<Sticker[]>([]);
    const [pendingSticker, setPendingSticker] = useState<string | null>(null);
    const [copySuccess, setCopySuccess] = useState(false);

    // Always reflects latest state for use in unmount cleanup
    const savedRef = useRef(false);
    const latestRef = useRef({ orderedPhotos, selectedTheme, selectedFilter, caption });
    useEffect(() => {
        latestRef.current = { orderedPhotos, selectedTheme, selectedFilter, caption };
    }, [orderedPhotos, selectedTheme, selectedFilter, caption]);

    // Auto-save when user leaves the result view
    useEffect(() => {
        return () => {
            if (savedRef.current) return; // already saved via download
            const { orderedPhotos, selectedTheme, selectedFilter, caption } = latestRef.current;
            if (orderedPhotos.length === 0) return;
            addEntry({
                id: Date.now().toString(),
                timestamp: Date.now(),
                photos: orderedPhotos,
                layout,
                themeId: selectedTheme.id,
                filterId: selectedFilter.id,
                themeName: selectedTheme.name,
                filterName: selectedFilter.name,
                caption,
            });
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const isGridLayout = layout === '2x2';
    const containerStyle = isGridLayout
        ? { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', width: '100%' }
        : { display: 'flex', flexDirection: 'column' as const, gap: '1.5rem', alignItems: 'center', width: '100%' };

    const applyFilterToPhoto = (src: string, filter: string): Promise<string> =>
        new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const c = document.createElement('canvas');
                c.width = img.naturalWidth;
                c.height = img.naturalHeight;
                const ctx = c.getContext('2d')!;
                ctx.filter = filter;
                ctx.drawImage(img, 0, 0);
                resolve(c.toDataURL('image/jpeg', 0.95));
            };
            img.onerror = () => resolve(src); // fallback to original on error
            img.src = src;
        });

    const generateImage = async () => {
        if (!stripRef.current) return null;
        const imgEls = Array.from(stripRef.current.querySelectorAll<HTMLImageElement>('img[data-photo]'));
        const origSrcs = imgEls.map(el => el.src);

        if (selectedFilter.css !== 'none') {
            await Promise.all(imgEls.map(async (el, i) => {
                el.src = await applyFilterToPhoto(origSrcs[i], selectedFilter.css);
                el.style.filter = 'none';
            }));
        }

        const canvas = await html2canvas(stripRef.current, { scale: 2, useCORS: true, backgroundColor: null });

        imgEls.forEach((el, i) => {
            el.src = origSrcs[i];
            el.style.filter = selectedFilter.css;
        });

        return canvas;
    };

    const saveToHistory = () => {
        addEntry({
            id: Date.now().toString(),
            timestamp: Date.now(),
            photos: orderedPhotos,
            layout,
            themeId: selectedTheme.id,
            filterId: selectedFilter.id,
            themeName: selectedTheme.name,
            filterName: selectedFilter.name,
            caption,
        });
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
            saveToHistory();
            savedRef.current = true;
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
            saveToHistory();
            savedRef.current = true;
        } catch (err) {
            console.error('Error generating JPEG:', err);
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = async () => {
        setIsGenerating(true);
        try {
            const canvas = await generateImage();
            if (!canvas) return;
            canvas.toBlob(async (blob) => {
                if (!blob) return;
                await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 2000);
            }, 'image/png');
        } catch (err) {
            console.error('Copy failed:', err);
        } finally {
            setIsGenerating(false);
        }
    };

    const shareNative = async () => {
        setIsGenerating(true);
        try {
            const canvas = await generateImage();
            if (!canvas) return;
            canvas.toBlob(async (blob) => {
                if (!blob) return;
                const file = new File([blob], 'photobooth.png', { type: 'image/png' });
                if (navigator.share && navigator.canShare({ files: [file] })) {
                    await navigator.share({ files: [file], title: 'My Photo Strip' });
                } else {
                    // Fallback: open in new tab
                    window.open(canvas.toDataURL('image/png'), '_blank');
                }
            }, 'image/png');
        } catch (err) {
            console.error('Share failed:', err);
        } finally {
            setIsGenerating(false);
        }
    };

    const downloadGIF = async () => {
        setIsGenerating(true);
        try {
            const imgEls = stripRef.current
                ? Array.from(stripRef.current.querySelectorAll<HTMLImageElement>('img[data-photo]'))
                : [];
            const origSrcs = imgEls.map(el => el.src);

            const frames: string[] = selectedFilter.css !== 'none'
                ? await Promise.all(origSrcs.map(src => applyFilterToPhoto(src, selectedFilter.css)))
                : origSrcs;

            const gif = new GIF({
                workers: 2,
                quality: 10,
                workerScript: 'https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.worker.js',
            });

            await Promise.all(frames.map(src => new Promise<void>((resolve) => {
                const img = new Image();
                img.onload = () => { gif.addFrame(img, { delay: 800 }); resolve(); };
                img.onerror = () => resolve();
                img.src = src;
            })));

            gif.on('finished', (blob: Blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.download = 'photobooth.gif';
                a.href = url;
                a.click();
                URL.revokeObjectURL(url);
                setIsGenerating(false);
            });

            gif.render();
        } catch (err) {
            console.error('GIF export failed:', err);
            setIsGenerating(false);
        }
    };

    const placeSticker = (photoIndex: number, e: React.MouseEvent<HTMLDivElement>) => {
        if (!pendingSticker) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setStickers(prev => [...prev, { id: `${Date.now()}`, emoji: pendingSticker, photoIndex, x, y }]);
        setPendingSticker(null);
    };

    return (
        <div className="flex-col flex-center" style={{ height: '100%', gap: '2.5rem', padding: '2rem 0' }}>
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap', justifyContent: 'center', width: '100%', padding: '0 1rem', boxSizing: 'border-box' }}>

                {/* Photo Strip */}
                <div
                    ref={stripRef}
                    style={{
                        background: selectedTheme.bg,
                        padding: '1.75rem 1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 0,
                        width: isGridLayout ? 'min(500px, 100vw - 2rem)' : 'min(300px, 100vw - 2rem)',
                        minWidth: 0,
                        borderRadius: '12px',
                        boxShadow: '0 12px 40px rgba(107,24,69,0.12)',
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    <Reorder.Group
                        as="div"
                        axis={isGridLayout ? 'y' : 'y'}
                        values={orderedPhotos}
                        onReorder={setOrderedPhotos}
                        style={{
                            ...containerStyle,
                            width: '100%',
                            listStyle: 'none',
                            margin: 0,
                            padding: 0,
                        }}
                    >
                        {orderedPhotos.map((photo, index) => (
                            <Reorder.Item
                                as="div"
                                key={photo}
                                value={photo}
                                style={{ position: 'relative', width: '100%', zIndex: 1, cursor: pendingSticker ? 'crosshair' : 'grab' }}
                                onMouseEnter={() => setHoveredPhoto(index)}
                                onMouseLeave={() => setHoveredPhoto(null)}
                                whileDrag={{ scale: 1.03, boxShadow: '0 8px 28px rgba(107,24,69,0.22)', zIndex: 10 }}
                                onClick={(e) => placeSticker(index, e as unknown as React.MouseEvent<HTMLDivElement>)}
                            >
                                <img
                                    src={photo}
                                    data-photo="true"
                                    alt={`Capture ${index + 1}`}
                                    style={{
                                        width: '100%', height: 'auto', display: 'block',
                                        border: selectedTheme.border,
                                        borderRadius: '4px',
                                        boxSizing: 'border-box',
                                        background: 'white',
                                        objectFit: 'cover',
                                        filter: selectedFilter.css,
                                        pointerEvents: 'none',
                                    }}
                                />
                                {selectedTheme.hasTiara && (
                                    <img
                                        src={tiaraImg}
                                        alt="Tiara"
                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                        style={{ position: 'absolute', top: -15, left: '50%', transform: 'translateX(-50%)', width: '60px', height: 'auto', zIndex: 3, pointerEvents: 'none' }}
                                    />
                                )}
                                {/* Stickers on this photo */}
                                {stickers.filter(s => s.photoIndex === index).map(s => (
                                    <div
                                        key={s.id}
                                        onClick={(e) => { e.stopPropagation(); setStickers(prev => prev.filter(x => x.id !== s.id)); }}
                                        title="Click to remove"
                                        style={{
                                            position: 'absolute',
                                            left: `${s.x}%`,
                                            top: `${s.y}%`,
                                            transform: 'translate(-50%, -50%)',
                                            fontSize: '1.6rem',
                                            zIndex: 6,
                                            cursor: 'pointer',
                                            userSelect: 'none',
                                            pointerEvents: 'auto',
                                            lineHeight: 1,
                                        }}
                                    >
                                        {s.emoji}
                                    </div>
                                ))}
                                {/* Drag handle */}
                                <div
                                    data-html2canvas-ignore="true"
                                    style={{
                                        position: 'absolute', top: '6px', left: '6px',
                                        background: 'rgba(255,255,255,0.75)',
                                        backdropFilter: 'blur(4px)',
                                        borderRadius: '6px',
                                        padding: '2px 3px',
                                        color: '#6B1845',
                                        opacity: hoveredPhoto === index && !pendingSticker ? 1 : 0,
                                        transition: 'opacity 0.15s',
                                        zIndex: 5,
                                        display: 'flex',
                                        alignItems: 'center',
                                        pointerEvents: 'none',
                                    }}
                                >
                                    <GripVertical size={14} />
                                </div>
                                {hoveredPhoto === index && !pendingSticker && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onRetakePhoto(photos.indexOf(photo)); }}
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
                            </Reorder.Item>
                        ))}
                    </Reorder.Group>

                    {/* Characters */}
                    {selectedTheme.hasCharacter && (
                        <img src={characterImg} alt="Character" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} style={{ position: 'absolute', bottom: -10, right: -20, width: '140px', height: 'auto', zIndex: 2, transform: 'rotate(-10deg)' }} />
                    )}
                    {selectedTheme.hasCharacter2 && (
                        <img src={character2Img} alt="Character 2" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} style={{ position: 'absolute', bottom: -10, left: -20, width: '120px', height: 'auto', zIndex: 2, transform: 'rotate(10deg)' }} />
                    )}

                    {/* Caption */}
                    <div style={{
                        textAlign: 'center',
                        fontFamily: selectedTheme.font,
                        color: selectedTheme.text,
                        marginTop: '0.5rem',
                        fontSize: '1.8rem',
                        zIndex: 1, padding: '0.5rem 1rem',
                        borderRadius: '12px',
                        width: '100%',
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
                    style={{ padding: '2.25rem', gap: '2rem', width: 'min(340px, 100vw - 2rem)', boxSizing: 'border-box' }}
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

                    {/* Sticker picker */}
                    <div>
                        <SectionLabel icon={<span>🎀</span>} label="Stickers" />
                        {pendingSticker && (
                            <p style={{ fontSize: '0.8rem', color: '#FF007A', margin: '0 0 0.5rem', textAlign: 'center', fontWeight: 600 }}>
                                Click a photo to place {pendingSticker} — click again to cancel
                            </p>
                        )}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', justifyContent: 'center' }}>
                            {STICKER_EMOJIS.map(emoji => (
                                <button
                                    key={emoji}
                                    onClick={() => setPendingSticker(prev => prev === emoji ? null : emoji)}
                                    style={{
                                        background: pendingSticker === emoji ? '#FF007A' : 'rgba(255,255,255,0.85)',
                                        border: pendingSticker === emoji ? '2px solid #FF007A' : '1.5px solid rgba(107,24,69,0.12)',
                                        borderRadius: '10px',
                                        padding: '0.4rem',
                                        fontSize: '1.3rem',
                                        cursor: 'pointer',
                                        minWidth: '44px',
                                        minHeight: '44px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.15s',
                                        transform: pendingSticker === emoji ? 'scale(1.15)' : 'scale(1)',
                                    }}
                                >
                                    {emoji}
                                </button>
                            ))}
                            {stickers.length > 0 && (
                                <button
                                    onClick={() => setStickers([])}
                                    style={{
                                        background: 'rgba(255,255,255,0.85)',
                                        border: '1.5px solid rgba(107,24,69,0.12)',
                                        borderRadius: '10px',
                                        padding: '0.4rem 0.7rem',
                                        fontSize: '0.75rem',
                                        color: '#A04070',
                                        cursor: 'pointer',
                                        fontWeight: 600,
                                        minHeight: '44px',
                                    }}
                                >
                                    Clear all
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Download + retake */}
                    <div className="flex-col" style={{ gap: '0.85rem' }}>
                        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                            <button
                                className="btn-primary"
                                onClick={downloadPDF}
                                disabled={isGenerating}
                                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '13px', minWidth: '70px' }}
                            >
                                {isGenerating ? <Loader2 size={18} className="spin" /> : <Download size={18} />}
                                {isGenerating ? '...' : 'PDF'}
                            </button>
                            <button
                                className="btn-primary"
                                onClick={downloadJPEG}
                                disabled={isGenerating}
                                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '13px', background: '#2D8A5E', minWidth: '70px' }}
                            >
                                {isGenerating ? <Loader2 size={18} className="spin" /> : <ImageIcon size={18} />}
                                {isGenerating ? '...' : 'JPEG'}
                            </button>
                            <button
                                className="btn-primary"
                                onClick={downloadGIF}
                                disabled={isGenerating}
                                title="Download animated GIF"
                                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '13px', background: '#7B2D8B', minWidth: '70px' }}
                            >
                                {isGenerating ? <Loader2 size={18} className="spin" /> : <Film size={18} />}
                                {isGenerating ? '...' : 'GIF'}
                            </button>
                        </div>
                        <div style={{ display: 'flex', gap: '0.6rem' }}>
                            <button
                                className="btn-secondary"
                                onClick={copyToClipboard}
                                disabled={isGenerating}
                                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.9rem', padding: '11px' }}
                            >
                                <Copy size={16} />
                                {copySuccess ? 'Copied!' : 'Copy'}
                            </button>
                            <button
                                className="btn-secondary"
                                onClick={shareNative}
                                disabled={isGenerating}
                                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.9rem', padding: '11px' }}
                            >
                                <Share2 size={16} />
                                Share
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
