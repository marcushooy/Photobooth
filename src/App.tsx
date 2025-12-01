import { useState } from 'react';
import { Landing } from './components/Landing';
import { CameraView, LayoutType } from './components/Camera';
import { PhotoStrip } from './components/PhotoStrip';
import { Heart } from 'lucide-react';

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

  return (
    <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        padding: '1rem 2rem',
        background: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(10px)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        boxShadow: '0 4px 20px rgba(255, 105, 180, 0.1)'
      }}>
        <div className="container" style={{ padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{
            fontFamily: 'Pacifico',
            fontSize: '1.8rem',
            color: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Heart fill="var(--accent)" size={24} />
            Elise's Photobooth
          </div>
          {view !== 'landing' && (
            <button
              onClick={() => setView('landing')}
              style={{
                background: 'transparent',
                color: 'var(--text-secondary)',
                fontSize: '1rem',
                fontWeight: 600
              }}
            >
              Exit
            </button>
          )}
        </div>
      </header>

      <main style={{
        flex: 1,
        paddingTop: '80px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div className="container" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {view === 'landing' && <Landing onStart={handleStart} />}
          {view === 'camera' && <CameraView onComplete={handleCameraComplete} />}
          {view === 'result' && <PhotoStrip photos={photos} layout={layout} onRetake={handleRetake} />}
        </div>
      </main>
    </div>
  );
}

export default App;
