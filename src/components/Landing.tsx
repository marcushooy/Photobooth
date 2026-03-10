import React from 'react';
import { Camera } from 'lucide-react';

interface LandingProps {
  onStart: () => void;
}

const AbstractFlower = () => {
  const petals = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <svg
      width="220"
      height="220"
      viewBox="0 0 200 200"
      style={{
        animation: 'floatSlow 10s ease-in-out infinite',
        filter: 'drop-shadow(0 10px 28px rgba(255, 0, 122, 0.22))',
      }}
    >
      {/* Main petals */}
      {petals.map((deg, i) => (
        <path
          key={deg}
          d="M100,100 C82,80 72,47 100,25 C128,47 118,80 100,100 Z"
          fill={i % 2 === 0 ? '#FF007A' : '#FF66B3'}
          opacity={i % 2 === 0 ? 0.88 : 0.62}
          transform={`rotate(${deg} 100 100)`}
        />
      ))}
      {/* Leaves */}
      <path
        d="M100,100 C84,76 62,58 52,38 C76,36 93,58 100,100 Z"
        fill="#1D6348"
        opacity="0.70"
        transform="rotate(12 100 100)"
      />
      <path
        d="M100,100 C84,76 62,58 52,38 C76,36 93,58 100,100 Z"
        fill="#2D8A5E"
        opacity="0.52"
        transform="rotate(192 100 100)"
      />
      {/* Center ring */}
      <circle cx="100" cy="100" r="22" fill="#FFFAF4" stroke="#FF007A" strokeWidth="2.5" />
      {/* Center dot */}
      <circle cx="100" cy="100" r="10" fill="#FF007A" />
      <circle cx="100" cy="100" r="4" fill="#FFFAF4" />
      {/* Scattered accent dots */}
      <circle cx="30" cy="42" r="5" fill="#FF007A" opacity="0.22" />
      <circle cx="170" cy="36" r="3.5" fill="#2D8A5E" opacity="0.32" />
      <circle cx="164" cy="163" r="5.5" fill="#FF007A" opacity="0.18" />
      <circle cx="36" cy="157" r="4" fill="#2D8A5E" opacity="0.28" />
      <circle cx="100" cy="186" r="3" fill="#FF007A" opacity="0.22" />
    </svg>
  );
};

const FloatingPetal: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <svg
    width="20"
    height="34"
    viewBox="0 0 20 34"
    style={{ opacity: 0.2, animation: 'floatGentle 7s ease-in-out infinite', ...style }}
  >
    <ellipse cx="10" cy="17" rx="10" ry="17" fill="#FF007A" />
  </svg>
);

const FloatingLeaf: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <svg
    width="18"
    height="30"
    viewBox="0 0 18 30"
    style={{ opacity: 0.18, animation: 'floatSlow 9s ease-in-out infinite', ...style }}
  >
    <path d="M9,30 C4,20 0,10 9,0 C18,10 14,20 9,30 Z" fill="#1D6348" />
  </svg>
);

const SmallFlower: React.FC<{ style?: React.CSSProperties; color?: string }> = ({ style, color = '#FF007A' }) => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 28 28"
    style={{ opacity: 0.18, animation: 'floatGentle 11s ease-in-out infinite', ...style }}
  >
    {[0, 60, 120, 180, 240, 300].map((deg) => (
      <path
        key={deg}
        d="M14,14 C10,10 8,4 14,1 C20,4 18,10 14,14 Z"
        fill={color}
        transform={`rotate(${deg} 14 14)`}
      />
    ))}
    <circle cx="14" cy="14" r="4" fill={color} />
  </svg>
);

export const Landing: React.FC<LandingProps> = ({ onStart }) => {
  return (
    <div
      className="flex-center"
      style={{ height: '100%', position: 'relative', overflow: 'hidden' }}
    >
      {/* Scattered botanical decorations */}
      <FloatingPetal style={{ position: 'absolute', top: '10%', left: '6%', animationDelay: '0s' }} />
      <FloatingLeaf style={{ position: 'absolute', top: '18%', right: '8%', animationDelay: '1s' }} />
      <FloatingPetal style={{ position: 'absolute', bottom: '14%', left: '10%', transform: 'rotate(50deg)', animationDelay: '2s' }} />
      <FloatingLeaf style={{ position: 'absolute', bottom: '10%', right: '6%', transform: 'rotate(170deg)', animationDelay: '0.5s' }} />
      <FloatingPetal style={{ position: 'absolute', top: '42%', left: '2%', transform: 'rotate(30deg)', animationDelay: '3s' }} />
      <FloatingPetal style={{ position: 'absolute', top: '38%', right: '3%', transform: 'rotate(110deg)', animationDelay: '1.5s' }} />
      <SmallFlower style={{ position: 'absolute', top: '8%', left: '22%', animationDelay: '2s' }} />
      <SmallFlower style={{ position: 'absolute', bottom: '16%', right: '18%', animationDelay: '0.8s' }} color="#74C49D" />
      <SmallFlower style={{ position: 'absolute', top: '28%', right: '14%', animationDelay: '3.5s' }} />
      <SmallFlower style={{ position: 'absolute', bottom: '28%', left: '15%', animationDelay: '1.2s' }} color="#2D8A5E" />

      {/* Main content */}
      <div
        className="animate-fade-in"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2.25rem',
          textAlign: 'center',
          maxWidth: '540px',
          padding: '1rem',
        }}
      >
        {/* Abstract flower */}
        <AbstractFlower />

        {/* Title block */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
          <p
            style={{
              fontFamily: 'Cormorant Garamond',
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: '1.25rem',
              color: '#2D8A5E',
              margin: '0 0 0.15rem',
              letterSpacing: '0.1em',
            }}
          >
            welcome to
          </p>
          <h1
            style={{
              fontFamily: 'Pacifico',
              fontSize: '4.8rem',
              color: '#FF007A',
              margin: 0,
              lineHeight: 1.05,
              textShadow: '0 3px 0 rgba(255, 0, 122, 0.12)',
            }}
          >
            Elise's
          </h1>
          <h2
            style={{
              fontFamily: 'Cormorant Garamond',
              fontStyle: 'italic',
              fontWeight: 300,
              fontSize: '3.6rem',
              color: '#6B1845',
              margin: 0,
              lineHeight: 1,
              letterSpacing: '-0.01em',
            }}
          >
            Photobooth
          </h2>
          <p
            style={{
              fontFamily: 'DM Sans',
              fontSize: '0.95rem',
              color: '#A04070',
              marginTop: '0.6rem',
              letterSpacing: '0.08em',
              fontWeight: 500,
            }}
          >
            for my tts ♡
          </p>
        </div>

        {/* CTA */}
        <button
          className="btn-primary"
          onClick={onStart}
          style={{
            fontSize: '1.1rem',
            padding: '16px 52px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <Camera size={20} />
          Start
        </button>
      </div>
    </div>
  );
};
