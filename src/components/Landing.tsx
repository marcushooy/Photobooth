import React from 'react';
import { Camera, Sparkles, Heart } from 'lucide-react';

interface LandingProps {
  onStart: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onStart }) => {
  return (
    <div className="flex-col flex-center" style={{ height: '100%', gap: '2rem', textAlign: 'center' }}>
      <div className="glass-panel animate-fade-in" style={{ padding: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', maxWidth: '600px' }}>
        <div style={{ position: 'relative' }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(255, 105, 180, 0.2)'
          }}>
            <Camera size={64} color="var(--accent)" />
          </div>
          <Sparkles
            size={32}
            color="#FFD700"
            fill="#FFD700"
            style={{ position: 'absolute', top: -10, right: -10, animation: 'bounce 2s infinite' }}
          />
          <Heart
            size={24}
            color="#ff6b6b"
            fill="#ff6b6b"
            style={{ position: 'absolute', bottom: 0, left: -10, animation: 'pulse 1.5s infinite' }}
          />
        </div>

        <div>
          <h1 className="title-gradient" style={{ fontSize: '4.5rem', margin: 0, lineHeight: 1.2 }}>
            Elise's<br />Photobooth
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.4rem', marginTop: '1rem', fontWeight: 500 }}>
            custom photobooth for my tts!
          </p>
        </div>

        <button className="btn-primary" onClick={onStart} style={{ fontSize: '1.5rem', padding: '18px 56px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Camera size={28} />
        </button>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
};
