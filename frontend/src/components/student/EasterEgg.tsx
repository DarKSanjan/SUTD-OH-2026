import { useEffect, useRef, useState } from 'react';

interface EasterEggProps {
  onComplete: () => void;
}

export default function EasterEgg({ onComplete }: EasterEggProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Attempt to play video with full volume
    if (videoRef.current) {
      videoRef.current.volume = 1.0;
      videoRef.current.play().catch(err => {
        console.error('Autoplay failed:', err);
      });
    }

    // Show confetti 1.8 seconds after video starts
    const confettiTimer = setTimeout(() => {
      setShowConfetti(true);
    }, 1800);

    // Prevent escape key and other shortcuts
    const preventEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener('keydown', preventEscape, true);
    
    return () => {
      clearTimeout(confettiTimer);
      document.removeEventListener('keydown', preventEscape, true);
    };
  }, []);

  const handleVideoEnd = () => {
    // Wait 3 seconds after video ends to show QR code
    setTimeout(() => {
      onComplete();
    }, 3000);
  };

  return (
    <div className="easter-egg-overlay">
      <video
        ref={videoRef}
        className="easter-egg-video"
        onEnded={handleVideoEnd}
        playsInline
        disablePictureInPicture
        controlsList="nodownload nofullscreen noremoteplayback"
      >
        <source src="/Cenafy John Cena.mp4" type="video/mp4" />
      </video>

      {showConfetti && <ExplosiveConfetti />}

      <style>{`
        .easter-egg-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: black;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .easter-egg-video {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .easter-egg-video::-webkit-media-controls {
          display: none !important;
        }

        .easter-egg-video::-webkit-media-controls-enclosure {
          display: none !important;
        }
      `}</style>
    </div>
  );
}

function ExplosiveConfetti() {
  const particles = Array.from({ length: 150 });
  const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#ff1493'];

  return (
    <div className="confetti-container">
      {particles.map((_, i) => {
        const angle = (Math.PI * 2 * i) / particles.length;
        const velocity = 200 + Math.random() * 300;
        const xVelocity = Math.cos(angle) * velocity;
        const yVelocity = Math.sin(angle) * velocity;
        
        return (
          <div
            key={i}
            className="confetti-particle"
            style={{
              left: '50%',
              top: '50%',
              backgroundColor: colors[Math.floor(Math.random() * colors.length)],
              width: `${8 + Math.random() * 12}px`,
              height: `${8 + Math.random() * 12}px`,
              '--x-velocity': `${xVelocity}px`,
              '--y-velocity': `${yVelocity}px`,
              '--rotation': `${Math.random() * 720}deg`,
              animationDelay: `${Math.random() * 0.1}s`,
            } as React.CSSProperties}
          />
        );
      })}

      <style>{`
        .confetti-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 10000;
          overflow: hidden;
        }

        .confetti-particle {
          position: absolute;
          border-radius: 50%;
          animation: explode 2s ease-out forwards;
        }

        @keyframes explode {
          0% {
            transform: translate(0, 0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translate(var(--x-velocity), calc(var(--y-velocity) + 500px)) rotate(var(--rotation));
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
