import { useState } from 'react';
import { Landing } from './components/Landing';
import { CameraView, type LayoutType } from './components/Camera';
import { PhotoStrip } from './components/PhotoStrip';

type ViewState = 'landing' | 'camera' | 'result';

function App() {
  const [view, setView] = useState<ViewState>('landing');
  const [photos, setPhotos] = useState<string[]>([]);
  const [layout, setLayout] = useState<LayoutType>('3');

  const handleStart = () => {
    setView('camera');
  };

  const handleCameraComplete = (capturedPhotos: string[], selectedLayout: LayoutType) => {
    setPhotos(capturedPhotos);
    setLayout(selectedLayout);
    setView('result');
  };

  const handleRetake = () => {
    setPhotos([]);
    setView('camera');
  };

  const handleRetakePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setView('camera');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header
        style={{
          padding: '0.9rem 2rem',
          background: 'rgba(255, 250, 244, 0.82)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          borderBottom: '1px solid rgba(255, 0, 122, 0.08)',
          boxShadow: '0 2px 16px rgba(255, 0, 122, 0.06)',
        }}
      >
        <div
          className="container"
          style={{ padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {/* Mini flower mark */}
            <svg width="22" height="22" viewBox="0 0 22 22">
              {[0, 60, 120, 180, 240, 300].map((deg) => (
                <path
                  key={deg}
                  d="M11,11 C8,8 7,3 11,1 C15,3 14,8 11,11 Z"
                  fill="#FF007A"
                  opacity="0.85"
                  transform={`rotate(${deg} 11 11)`}
                />
              ))}
              <circle cx="11" cy="11" r="3.5" fill="#FF007A" />
            </svg>
            <span
              style={{
                fontFamily: 'Pacifico',
                fontSize: '1.4rem',
                color: '#FF007A',
                letterSpacing: '-0.01em',
              }}
            >
              Elise's Photobooth
            </span>
          </div>

          {view !== 'landing' && (
            <button
              onClick={() => setView('landing')}
              style={{
                background: 'transparent',
                color: '#A04070',
                fontSize: '0.9rem',
                fontWeight: 600,
                letterSpacing: '0.04em',
                padding: '0.4rem 1rem',
                borderRadius: '100px',
                border: '1.5px solid rgba(160, 64, 112, 0.25)',
              }}
            >
              Exit
            </button>
          )}
        </div>
      </header>

      <main style={{ flex: 1, paddingTop: '72px', display: 'flex', flexDirection: 'column' }}>
        <div className="container" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {view === 'landing' && <Landing onStart={handleStart} />}
          {view === 'camera' && (
            <CameraView
              onComplete={handleCameraComplete}
              initialPhotos={photos.length > 0 ? photos : undefined}
              initialLayout={layout}
            />
          )}
          {view === 'result' && (
            <PhotoStrip
              photos={photos}
              layout={layout}
              onRetake={handleRetake}
              onRetakePhoto={handleRetakePhoto}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
