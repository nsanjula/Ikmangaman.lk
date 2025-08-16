import React, { useEffect, useRef, useState } from 'react';

interface CompassLoaderProps {
  progress?: number; // 0-100
  size?: number; // px
  colorPrimary?: string; // hex
  showPercent?: boolean;
  className?: string;
}

export const CompassLoader: React.FC<CompassLoaderProps> = ({
  progress = 0,
  size = 120,
  colorPrimary = '#1196A0',
  showPercent = false,
  className = ''
}) => {
  const needleRef = useRef<SVGGElement>(null);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>();
  const [isVisible, setIsVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check for prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
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

  // Animation loop with enhanced smoothness
  useEffect(() => {
    if (prefersReducedMotion || !isVisible || progress >= 100) {
      // Set static position for reduced motion or completed loading - pointing North (0 degrees)
      if (needleRef.current) {
        needleRef.current.style.transform = `rotate(0deg)`;
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const animate = (currentTime: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = currentTime;
      }

      const elapsed = (currentTime - startTimeRef.current) / 1000; // seconds

      // Progressive rotation limits based on loading progress
      const progressRatio = progress / 100;
      let maxRotationLimit = 35; // Default for 0%

      // Progressive limits: 0%(35) -> 20%(30) -> 40%(25) -> 60%(20) -> 70%(15) -> 80%(10) -> 90%(5) -> 100%(0)
      if (progress >= 90) {
        maxRotationLimit = 5;
      } else if (progress >= 80) {
        maxRotationLimit = 10;
      } else if (progress >= 70) {
        maxRotationLimit = 15;
      } else if (progress >= 60) {
        maxRotationLimit = 20;
      } else if (progress >= 40) {
        maxRotationLimit = 25;
      } else if (progress >= 20) {
        maxRotationLimit = 30;
      }

      // Smooth interpolation between limits for more frames
      let interpolatedLimit;
      if (progress < 20) {
        interpolatedLimit = 35 - (progress / 20) * 5; // 35 to 30
      } else if (progress < 40) {
        interpolatedLimit = 30 - ((progress - 20) / 20) * 5; // 30 to 25
      } else if (progress < 60) {
        interpolatedLimit = 25 - ((progress - 40) / 20) * 5; // 25 to 20
      } else if (progress < 70) {
        interpolatedLimit = 20 - ((progress - 60) / 10) * 5; // 20 to 15
      } else if (progress < 80) {
        interpolatedLimit = 15 - ((progress - 70) / 10) * 5; // 15 to 10
      } else if (progress < 90) {
        interpolatedLimit = 10 - ((progress - 80) / 10) * 5; // 10 to 5
      } else {
        interpolatedLimit = 5 - ((progress - 90) / 10) * 5; // 5 to 0
      }

      const amplitude = Math.max(0, interpolatedLimit);

      // Enhanced wave frequencies for smoother animation with more frames
      const primarySpeed = 2.8; // Main oscillation
      const secondarySpeed = 4.2; // Secondary harmonic for complexity
      const tertiarySpeed = 1.8; // Slower variation for organic feel
      const quaternarySpeed = 5.6; // Additional high-frequency detail
      const quinternarySpeed = 0.9; // Very slow drift for natural feel

      // Combine multiple sine waves for ultra-smooth natural fluctuation
      const primaryWave = Math.sin(elapsed * primarySpeed) * 0.6;
      const secondaryWave = Math.sin(elapsed * secondarySpeed) * 0.15;
      const tertiaryWave = Math.sin(elapsed * tertiarySpeed) * 0.1;
      const quaternaryWave = Math.sin(elapsed * quaternarySpeed) * 0.05;
      const quinternaryWave = Math.sin(elapsed * quinternarySpeed) * 0.1;

      const combinedOscillation = primaryWave + secondaryWave + tertiaryWave + quaternaryWave + quinternaryWave;
      const oscillation = amplitude * combinedOscillation;

      // Apply rotation limits symmetrically around North (0 degrees)
      const baseAngle = 0; // North
      const limitedOscillation = Math.max(-interpolatedLimit, Math.min(interpolatedLimit, oscillation));
      const angle = baseAngle + limitedOscillation;

      if (needleRef.current) {
        needleRef.current.style.transform = `rotate(${angle}deg)`;
      }

      if (progress < 100) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [progress, isVisible, prefersReducedMotion]);

  // Reset start time when progress changes significantly
  useEffect(() => {
    startTimeRef.current = undefined;
  }, [Math.floor(progress / 10)]); // Reset every 10% change

  const tickColor = '#475569';
  const textColor = '#475569';
  const center = size / 2;
  const radius = size * 0.35;
  const needleLength = radius * 0.8;

  return (
    <div
      ref={containerRef}
      className={`inline-flex flex-col items-center justify-center ${className}`}
      style={{
        '--compass-size': `${size}px`,
        '--compass-primary': colorPrimary,
        '--compass-tick': tickColor,
        '--compass-text': textColor,
      } as React.CSSProperties}
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Loading ${Math.round(progress)}% complete`}
      aria-live="polite"
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ overflow: 'visible' }}
      >
        <defs>
          <radialGradient id={`centerGradient-${size}`} cx="50%" cy="30%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.8)" />
            <stop offset="100%" stopColor={colorPrimary} />
          </radialGradient>
        </defs>

        {/* Outer compass ring - dark */}
        <circle
          cx={center}
          cy={center}
          r={radius + 8}
          fill="none"
          stroke="#1F2937"
          strokeWidth="3"
          opacity="0.8"
        />

        {/* Middle white separation line */}
        <circle
          cx={center}
          cy={center}
          r={radius + 6}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="1"
          opacity="0.9"
        />

        {/* Inner compass dial */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="rgba(255, 255, 255, 0.9)"
          stroke="#CBD5E1"
          strokeWidth="1.5"
        />

        {/* Compass markings - major directions */}
        {/* North */}
        <g>
          <circle cx={center} cy={center - radius + 4} r="3" fill={colorPrimary} />
          <text
            x={center}
            y={center - radius + 18}
            textAnchor="middle"
            className="text-xs font-bold"
            fill="#374151"
            fontSize="10"
          >
            N
          </text>
        </g>

        {/* East */}
        <g>
          <circle cx={center + radius - 4} cy={center} r="2" fill="#94A3B8" />
          <text
            x={center + radius - 16}
            y={center + 4}
            textAnchor="middle"
            className="text-xs"
            fill="#6B7280"
            fontSize="8"
          >
            E
          </text>
        </g>

        {/* South */}
        <g>
          <circle cx={center} cy={center + radius - 4} r="2" fill="#94A3B8" />
          <text
            x={center}
            y={center + radius - 10}
            textAnchor="middle"
            className="text-xs"
            fill="#6B7280"
            fontSize="8"
          >
            S
          </text>
        </g>

        {/* West */}
        <g>
          <circle cx={center - radius + 4} cy={center} r="2" fill="#94A3B8" />
          <text
            x={center - radius + 16}
            y={center + 4}
            textAnchor="middle"
            className="text-xs"
            fill="#6B7280"
            fontSize="8"
          >
            W
          </text>
        </g>

        {/* Minor tick marks */}
        {[45, 135, 225, 315].map((angle, index) => {
          const radian = (angle * Math.PI) / 180;
          const x1 = center + (radius - 10) * Math.cos(radian);
          const y1 = center + (radius - 10) * Math.sin(radian);
          const x2 = center + (radius - 5) * Math.cos(radian);
          const y2 = center + (radius - 5) * Math.sin(radian);

          return (
            <line
              key={`tick-${index}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#CBD5E1"
              strokeWidth="1"
            />
          );
        })}

        {/* Needle group */}
        <g
          ref={needleRef}
          id="needle"
          style={{
            transformOrigin: `${center}px ${center}px`,
            transform: 'rotate(-90deg)',
            transition: progress >= 100 ? 'transform 0.3s ease-out' : 'none'
          }}
        >
          {/* Needle shadow */}
          <line
            x1={center + 1}
            y1={center + 1}
            x2={center + 1}
            y2={center - needleLength + 1}
            stroke="rgba(0, 0, 0, 0.2)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Needle line */}
          <line
            x1={center}
            y1={center}
            x2={center}
            y2={center - needleLength}
            stroke={colorPrimary}
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Needle tip */}
          <polygon
            points={`${center},${center - needleLength - 8} ${center - 4},${center - needleLength + 3} ${center + 4},${center - needleLength + 3}`}
            fill={colorPrimary}
          />

          {/* Needle tail */}
          <line
            x1={center}
            y1={center}
            x2={center}
            y2={center + needleLength * 0.3}
            stroke="#94A3B8"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </g>

        {/* Center cap with gradient */}
        <circle
          cx={center}
          cy={center}
          r="6"
          fill={`url(#centerGradient-${size})`}
          stroke="rgba(0, 0, 0, 0.1)"
          strokeWidth="1"
        />
        <circle
          cx={center}
          cy={center}
          r="2"
          fill="rgba(255, 255, 255, 0.9)"
        />
      </svg>

      {/* Percentage text */}
      {showPercent && (
        <div
          className="mt-2 text-sm font-medium"
          style={{ 
            color: textColor,
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            fontSize: '14px'
          }}
        >
          {Math.round(progress)}%
        </div>
      )}

      {/* Screen reader announcement */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Loading {Math.round(progress)} percent complete
      </div>
    </div>
  );
};

// Usage example component for Builder preview
export const CompassLoaderExample: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 3; // Random increment for realistic feel
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const resetProgress = () => {
    setProgress(0);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <h3 className="text-lg font-semibold">CompassLoader Examples</h3>
      
      {/* Different sizes and configurations */}
      <div className="flex flex-wrap items-end gap-8">
        <div className="text-center">
          <CompassLoader progress={progress} size={80} showPercent />
          <p className="text-xs mt-2 text-gray-600">Size: 80px</p>
        </div>
        
        <div className="text-center">
          <CompassLoader progress={progress} size={120} showPercent />
          <p className="text-xs mt-2 text-gray-600">Default size</p>
        </div>
        
        <div className="text-center">
          <CompassLoader 
            progress={progress} 
            size={160} 
            colorPrimary="#FF7A59" 
            showPercent 
          />
          <p className="text-xs mt-2 text-gray-600">Custom color</p>
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

export default CompassLoader;
