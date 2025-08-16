import React, { useEffect, useRef, useState } from 'react';

interface SpriteCompassLoaderProps {
  progress?: number; // 0-100
  size?: number; // px
  colorPrimary?: string; // hex
  showPercent?: boolean;
  className?: string;
  useSprite?: boolean; // Use sprite sheet vs SVG
  spriteUrl?: string; // URL to sprite sheet
  frameCount?: number; // Number of frames in sprite
  frameWidth?: number; // Width of each frame
}

export const SpriteCompassLoader: React.FC<SpriteCompassLoaderProps> = ({
  progress = 0,
  size = 120,
  colorPrimary = '#1196A0',
  showPercent = false,
  className = '',
  useSprite = false,
  spriteUrl = '',
  frameCount = 5,
  frameWidth = 120
}) => {
  const needleRef = useRef<HTMLDivElement>(null);
  const spriteRef = useRef<HTMLDivElement>(null);
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

  // Animation loop for SVG needle
  useEffect(() => {
    if (useSprite || prefersReducedMotion || !isVisible || progress >= 100) {
      // Set static position for reduced motion or completed loading
      if (needleRef.current) {
        needleRef.current.style.transform = `rotate(-90deg)`;
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
      const amplitude = 22 * (1 - progress / 100); // degrees
      const speed = 2.6; // radians/sec
      const oscillation = amplitude * Math.sin(elapsed * speed);
      const angle = -90 + oscillation; // degrees

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
  }, [progress, isVisible, prefersReducedMotion, useSprite]);

  // Sprite animation
  useEffect(() => {
    if (!useSprite || !spriteRef.current || prefersReducedMotion) return;

    const amplitude = 22 * (1 - progress / 100); // degrees
    let currentFrame = 0;
    const centerFrame = Math.floor(frameCount / 2);
    
    const animateSprite = (currentTime: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = currentTime;
      }

      const elapsed = (currentTime - startTimeRef.current) / 1000;
      const speed = 2.6;
      const oscillation = amplitude * Math.sin(elapsed * speed);
      
      // Map oscillation to frame index
      const normalizedOscillation = oscillation / 22; // -1 to 1
      const frameOffset = Math.round(normalizedOscillation * (frameCount - 1) / 2);
      currentFrame = Math.max(0, Math.min(frameCount - 1, centerFrame + frameOffset));
      
      if (spriteRef.current) {
        const xPosition = -currentFrame * frameWidth;
        spriteRef.current.style.backgroundPosition = `${xPosition}px 0`;
      }

      if (progress < 100) {
        animationRef.current = requestAnimationFrame(animateSprite);
      }
    };

    if (amplitude > 0) {
      animationRef.current = requestAnimationFrame(animateSprite);
    } else {
      // Set to center frame when completed
      if (spriteRef.current) {
        const xPosition = -centerFrame * frameWidth;
        spriteRef.current.style.backgroundPosition = `${xPosition}px 0`;
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [progress, isVisible, prefersReducedMotion, useSprite, frameCount, frameWidth]);

  // Reset start time when progress changes significantly
  useEffect(() => {
    startTimeRef.current = undefined;
  }, [Math.floor(progress / 10)]);

  const center = size / 2;
  const radius = size * 0.35;
  const needleLength = radius * 0.8;

  if (useSprite && spriteUrl) {
    return (
      <div
        ref={containerRef}
        className={`inline-flex flex-col items-center justify-center ${className}`}
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Loading ${Math.round(progress)}% complete`}
        aria-live="polite"
      >
        <div
          ref={spriteRef}
          className="compass-sprite"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            backgroundImage: `url(${spriteUrl})`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: '0 0',
            backgroundSize: `${frameCount * frameWidth}px ${size}px`,
          }}
        />
        
        {showPercent && (
          <div
            className="mt-2 text-sm font-medium"
            style={{ 
              color: '#475569',
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
              fontSize: '14px'
            }}
          >
            {Math.round(progress)}%
          </div>
        )}
      </div>
    );
  }

  // Enhanced SVG version with more realistic compass design
  return (
    <div
      ref={containerRef}
      className={`inline-flex flex-col items-center justify-center ${className}`}
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
        {/* Outer compass ring */}
        <circle
          cx={center}
          cy={center}
          r={radius + 8}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth="3"
          opacity="0.4"
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
              key={index}
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
        <defs>
          <radialGradient id="centerGradient" cx="50%" cy="30%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.8)" />
            <stop offset="100%" stopColor={colorPrimary} />
          </radialGradient>
        </defs>
        
        <circle
          cx={center}
          cy={center}
          r="6"
          fill="url(#centerGradient)"
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

      {showPercent && (
        <div
          className="mt-2 text-sm font-medium"
          style={{ 
            color: '#475569',
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

export default SpriteCompassLoader;
