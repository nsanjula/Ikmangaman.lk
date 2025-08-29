import React, { useEffect, useRef, useState } from 'react';

interface SmokingTrainLoaderProps {
  progress?: number; // 0-100
  width?: number;
  height?: number;
  className?: string;
  showPercent?: boolean;
}

export const SmokingTrainLoader: React.FC<SmokingTrainLoaderProps> = ({
  progress = 0,
  width = 400,
  height = 160,
  className = '',
  showPercent = false,
}) => {
  const trainRef = useRef<SVGGElement>(null);
  const smokeContainerRef = useRef<SVGGElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [smokeFrames, setSmokeFrames] = useState<number[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check for dark mode preference
  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };

    // Initial check
    checkDarkMode();

    // Create a MutationObserver to watch for changes to the html class
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  // Intersection Observer for performance
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Update train position based on progress
  useEffect(() => {
    if (!isVisible || !trainRef.current) return;

    const clampedProgress = Math.max(0, Math.min(progress, 100));
    const startX = -120; // Train starts off-screen left
    const endX = width - 85; // Train front reaches closer to edge at 100%
    const bridgeLength = endX - startX;

    const newX = startX + (bridgeLength * clampedProgress) / 100;

    // Apply smooth transform to train
    const transform = `translateX(${newX}px)`;
    trainRef.current.style.transform = transform;

    // Update smoke container position to follow train
    if (smokeContainerRef.current) {
      smokeContainerRef.current.style.transform = transform;
    }
  }, [progress, isVisible, width]);

  // Manage smoke puff frames - new puff every 0.5s (always active when visible)
  useEffect(() => {
    if (!isVisible) {
      setSmokeFrames([]);
      return;
    }

    const interval = setInterval(() => {
      setSmokeFrames(prev => {
        const now = Date.now();
        // Add new smoke puff
        const newFrames = [...prev, now];
        // Remove old smoke puffs (after 3 seconds)
        return newFrames.filter(timestamp => now - timestamp < 3000);
      });
    }, 300); // New puff every 0.3s

    return () => clearInterval(interval);
  }, [isVisible]); // Removed progress dependency so smoke always shows

  // Generate smoke animation for a single puff
  const generateSmokeFrames = (timestamp: number, index: number) => {
    const now = Date.now();
    const age = (now - timestamp) / 1000; // Age in seconds
    const maxAge = 3; // 3 seconds lifetime

    if (age > maxAge) return null;

    // Calculate animation phase (0-1)
    const phase = age / maxAge;

    // Smoke properties based on age
    const baseScale = 0.3 + phase * 1.2; // Grows from 0.3 to 1.5
    const opacity = Math.max(0, 1 - phase); // Fades out
    const xOffset = -phase * 25 - index * 2; // Drifts backward
    const yOffset = -phase * 30 - index * 3; // Drifts upward

    // Different frame shapes based on age
    const getFrameShape = (phase: number) => {
      if (phase < 0.2) {
        // Frame 1: Small initial puff
        return (
          <g>
            <circle cx="-5" cy="-3" r="8" fill="#000000" stroke="white" strokeWidth="1.5" />
          </g>
        );
      } else if (phase < 0.4) {
        // Frame 2: Growing cloud
        return (
          <g>
            <circle cx="-2" cy="-3" r="10" fill="#000000" stroke="white" strokeWidth="1.5" />
            <circle cx="-3" cy="-6" r="8" fill="#000000" stroke="white" strokeWidth="1.5" />
          </g>
        );
      } else if (phase < 0.6) {
        // Frame 3: Larger expanding cloud
        return (
          <g>
            <circle cx="-4" cy="-5" r="12" fill="#000000" stroke="white" strokeWidth="1.5" />
            <circle cx="2" cy="-2" r="10" fill="#000000" stroke="white" strokeWidth="1.5" />
            <circle cx="6" cy="4" r="9" fill="#000000" stroke="white" strokeWidth="1.5" />
          </g>
        );
      } else if (phase < 0.8) {
        // Frame 4: Breaking into smaller clouds
        return (
          <g>
            <circle cx="-8" cy="-8" r="10" fill="#000000" stroke="white" strokeWidth="1.5" />
            <circle cx="0" cy="-4" r="8" fill="#000000" stroke="white" strokeWidth="1.5" />
            <circle cx="8" cy="2" r="7" fill="#000000" stroke="white" strokeWidth="1.5" />
            <circle cx="3" cy="8" r="6" fill="#000000" stroke="white" strokeWidth="1.5" />
          </g>
        );
      } else {
        // Frame 5-8: Dispersing fragments
        const fragmentCount = Math.floor(phase * 8) + 3;
        return (
          <g>
            {Array.from({ length: fragmentCount }, (_, i) => {
              const angle = (i / fragmentCount) * Math.PI * 2;
              const distance = 10 + phase * 15;
              const x = Math.cos(angle) * distance;
              const y = Math.sin(angle) * distance;
              const size = Math.max(2, 8 - phase * 6);
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r={size}
                  fill="#000000"
                  stroke="white"
                  strokeWidth="1"
                  opacity={opacity * 0.7}
                />
              );
            })}
          </g>
        );
      }
    };

    return (
      <g
        key={timestamp}
        transform={`translate(${xOffset}, ${yOffset}) scale(${baseScale})`}
        opacity={opacity}
      >
        {getFrameShape(phase)}
      </g>
    );
  };

  return (
    <div
      ref={containerRef}
      className={`inline-flex flex-col items-center justify-center ${className}`}
      style={{ width: `${width}px`, maxWidth: '100%' }}
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Loading ${Math.round(progress)}% complete`}
      aria-live="polite"
    >
      <svg
        width={width}
        height={height + 180}
        viewBox={`0 0 ${width} ${height + 180}`}
        style={{ overflow: 'visible', background: 'transparent' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Clip path for train visibility bounds only - not smoke */}
          <clipPath id="bridgeClip">
            <rect x="0" y="60" width={width} height={height + 60} />
          </clipPath>

          {/* Gradients for bridge elements */}
          <linearGradient id="bridgeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2D3748" />
            <stop offset="50%" stopColor="#1A202C" />
            <stop offset="100%" stopColor="#0F1419" />
          </linearGradient>

          <linearGradient id="archShadow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0F1419" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {/* Bridge Sprite */}
        <image
          href="https://cdn.builder.io/api/v1/image/assets%2Fc9ab74d0d22a403180b3c3116f1f10c6%2F080c438356354942a76bf58a8307dff0?format=webp&width=800"
          x="0"
          y={height - 60}
          width={width}
          height="95"
          preserveAspectRatio="xMidYMid slice"
          filter={isDarkMode ? "invert(1) hue-rotate(180deg)" : undefined}
        />

        {/* Train with clipping */}
        <g clipPath="url(#bridgeClip)">
          {/* Train Sprite Image */}
          <g ref={trainRef} id="train" style={{ transform: 'translateX(-120px)' }}>
            <image
              href="https://cdn.builder.io/api/v1/image/assets%2Fc9ab74d0d22a403180b3c3116f1f10c6%2F5f405452f7564a47886458ad134593f1?format=webp&width=800"
              x="-105"
              y={height - 100}
              width="280"
              height="75"
              preserveAspectRatio="xMidYMid meet"
              filter={isDarkMode ? "invert(1) hue-rotate(180deg)" : undefined}
            />

            {/* Train Shadow */}
            <g transform="translate(8, 25)" opacity="0.4">
              <image
                href="https://cdn.builder.io/api/v1/image/assets%2Fa1c5dbf260fa4e85b0c45061d6234b64%2F9e3f2d4e61c6491399be215df77cb99f?format=webp&width=800"
                x="-120"
                y={height - 37}
                width="280"
                height="75"
                preserveAspectRatio="xMidYMid meet"
                filter={isDarkMode ? "invert(1) hue-rotate(180deg)" : undefined}
              />
            </g>
          </g>
        </g>

        {/* Animated Smoke Effects - OUTSIDE CLIPPING */}
        <g ref={smokeContainerRef} style={{ transform: 'translateX(-120px)' }}>
          {smokeFrames.map((timestamp, index) => (
            <g key={timestamp} transform={`translate(65, ${height - 65})`}>
              {generateSmokeFrames(timestamp, index)}
            </g>
          ))}
        </g>

      </svg>

      {/* Percentage text */}
      {showPercent && (
        <div
          className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300"
          style={{
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            fontSize: '14px'
          }}
        >
          {Math.round(progress)}%
        </div>
      )}

      {/* Screen reader announcement */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Train crossing bridge: {Math.round(progress)} percent complete
      </div>
    </div>
  );
};

// Usage example component
export const SmokingTrainLoaderExample: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 2; // Slower, more realistic loading
      });
    }, 150);

    return () => clearInterval(interval);
  }, []);

  const resetProgress = () => {
    setProgress(0);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <h3 className="text-lg font-semibold">Smoking Train Loader</h3>

      <div className="flex flex-wrap items-end gap-8">
        <div className="text-center">
          <SmokingTrainLoader progress={progress} width={300} height={120} showPercent />
          <p className="text-xs mt-2 text-gray-600 dark:text-gray-400">Width: 300px</p>
        </div>

        <div className="text-center">
          <SmokingTrainLoader progress={progress} width={400} height={160} showPercent />
          <p className="text-xs mt-2 text-gray-600 dark:text-gray-400">Default size</p>
        </div>

        <div className="text-center">
          <SmokingTrainLoader progress={progress} width={500} height={200} showPercent />
          <p className="text-xs mt-2 text-gray-600 dark:text-gray-400">Large size</p>
        </div>
      </div>

      <button
        onClick={resetProgress}
        className="btn btn-primary btn-sm"
      >
        Reset Animation
      </button>
    </div>
  );
};

export default SmokingTrainLoader;