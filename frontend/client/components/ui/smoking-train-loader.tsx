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
    const endX = width - 110; // Train front stops at edge at 100%
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

  // Manage smoke puff frames - new puff every 0.5s
  useEffect(() => {
    if (!isVisible || progress === 0 || progress >= 100) {
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
    }, 500); // New puff every 0.5s

    return () => clearInterval(interval);
  }, [isVisible, progress]);

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
            <circle cx="0" cy="0" r="8" fill="#000000" stroke="white" strokeWidth="1.5" />
          </g>
        );
      } else if (phase < 0.4) {
        // Frame 2: Growing cloud
        return (
          <g>
            <circle cx="-2" cy="-3" r="10" fill="#000000" stroke="white" strokeWidth="1.5" />
            <circle cx="3" cy="2" r="8" fill="#000000" stroke="white" strokeWidth="1.5" />
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
        height={height + 120}
        viewBox={`0 0 ${width} ${height + 120}`}
        style={{ overflow: 'visible', background: 'transparent' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Clip path for train visibility bounds only - not smoke */}
          <clipPath id="bridgeClip">
            <rect x="0" y="0" width={width} height={height + 120} />
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

        {/* Ground/Foundation */}
        <rect
          x="0"
          y={height - 25}
          width={width}
          height="25"
          fill="#1A202C"
        />

        {/* Six Connected Bridge Sections */}
        {[0, 1, 2, 3, 4, 5].map((sectionIndex) => {
          const sectionWidth = width / 6;
          const sectionX = sectionIndex * sectionWidth;
          const bridgeHeight = 50;
          const bridgeY = height - 75;

          return (
            <g key={`bridge-section-${sectionIndex}`}>
              {/* Bridge Section Base */}
              <rect
                x={sectionX}
                y={bridgeY + bridgeHeight - 10}
                width={sectionWidth}
                height="10"
                fill="url(#bridgeGradient)"
                stroke="white"
                strokeWidth="1"
              />

              {/* Bridge Section Pillars */}
              <rect
                x={sectionX + 5}
                y={bridgeY}
                width="8"
                height={bridgeHeight}
                fill="#1A202C"
                stroke="white"
                strokeWidth="1"
              />
              <rect
                x={sectionX + sectionWidth - 13}
                y={bridgeY}
                width="8"
                height={bridgeHeight}
                fill="#1A202C"
                stroke="white"
                strokeWidth="1"
              />

              {/* Bridge Section Arch */}
              <path
                d={`M ${sectionX + 13} ${bridgeY + bridgeHeight - 10}
                    Q ${sectionX + sectionWidth/2} ${bridgeY + 15}
                    ${sectionX + sectionWidth - 13} ${bridgeY + bridgeHeight - 10}`}
                fill="none"
                stroke="white"
                strokeWidth="2"
              />

              {/* Arch Shadow/Interior */}
              <path
                d={`M ${sectionX + 13} ${bridgeY + bridgeHeight - 10}
                    Q ${sectionX + sectionWidth/2} ${bridgeY + 20}
                    ${sectionX + sectionWidth - 13} ${bridgeY + bridgeHeight - 10}`}
                fill="url(#archShadow)"
                stroke="white"
                strokeWidth="0.5"
              />

              {/* Bridge Deck Details */}
              <rect
                x={sectionX}
                y={bridgeY + bridgeHeight - 12}
                width={sectionWidth}
                height="2"
                fill="#000000"
                stroke="white"
                strokeWidth="0.5"
              />

              {/* Connecting Elements between sections */}
              {sectionIndex < 5 && (
                <rect
                  x={sectionX + sectionWidth - 2}
                  y={bridgeY + bridgeHeight - 15}
                  width="4"
                  height="15"
                  fill="#000000"
                  stroke="white"
                  strokeWidth="0.5"
                />
              )}
            </g>
          );
        })}

        {/* Main Bridge Deck */}
        <rect
          x="0"
          y={height - 78}
          width={width}
          height="12"
          fill="#1A202C"
          stroke="white"
          strokeWidth="1"
        />

        {/* Railway Tracks */}
        <g>
          {/* Left Rail */}
          <line
            x1="0"
            y1={height - 72}
            x2={width}
            y2={height - 72}
            stroke="#2D3748"
            strokeWidth="3"
          />
          {/* Right Rail */}
          <line
            x1="0"
            y1={height - 68}
            x2={width}
            y2={height - 68}
            stroke="#2D3748"
            strokeWidth="3"
          />

          {/* Railway Ties */}
          {Array.from({ length: Math.floor(width / 15) }, (_, i) => (
            <rect
              key={`tie-${i}`}
              x={i * 15}
              y={height - 75}
              width="10"
              height="6"
              fill="#1A202C"
              stroke="white"
              strokeWidth="0.5"
            />
          ))}
        </g>

        {/* Train with clipping */}
        <g clipPath="url(#bridgeClip)">
          {/* Steam Locomotive with black body and white outlines */}
          <g ref={trainRef} id="train" style={{ transform: 'translateX(-120px)' }}>
            {/* Coal Tender Car */}
            <g>
              {/* Tender Body */}
              <rect
                x="-80"
                y={height - 100}
                width="50"
                height="20"
                fill="#000000"
                stroke="white"
                strokeWidth="2"
                rx="2"
              />

              {/* Tender Coal Load */}
              <path
                d={`M -75 ${height - 100}
                    L -35 ${height - 100}
                    L -37 ${height - 105}
                    L -73 ${height - 105}
                    Z`}
                fill="#000000"
                stroke="white"
                strokeWidth="1.5"
              />

              {/* Tender Wheels */}
              <circle cx="-65" cy={height - 82} r="6" fill="#000000" stroke="white" strokeWidth="2" />
              <circle cx="-45" cy={height - 82} r="6" fill="#000000" stroke="white" strokeWidth="2" />

              {/* Tender Wheel Spokes */}
              <g stroke="white" strokeWidth="1.5">
                <line x1="-65" y1={height - 88} x2="-65" y2={height - 76} />
                <line x1="-71" y1={height - 82} x2="-59" y2={height - 82} />
                <line x1="-45" y1={height - 88} x2="-45" y2={height - 76} />
                <line x1="-51" y1={height - 82} x2="-39" y2={height - 82} />
              </g>

              {/* Tender Coupling */}
              <rect x="-30" y={height - 95} width="8" height="4" fill="#000000" stroke="white" strokeWidth="1.5" />
            </g>

            {/* Main Locomotive Body */}
            <g>
              {/* Locomotive Boiler */}
              <rect
                x="5"
                y={height - 102}
                width="70"
                height="16"
                fill="#000000"
                stroke="white"
                strokeWidth="2"
                rx="8"
              />

              {/* Firebox */}
              <rect
                x="-5"
                y={height - 108}
                width="30"
                height="22"
                fill="#000000"
                stroke="white"
                strokeWidth="2"
                rx="2"
              />

              {/* Steam Dome */}
              <rect
                x="16"
                y={height - 115}
                width="12"
                height="12"
                fill="#000000"
                stroke="white"
                strokeWidth="2"
                rx="6"
              />

              {/* Sand Dome */}
              <rect
                x="37"
                y={height - 110}
                width="8"
                height="8"
                fill="#000000"
                stroke="white"
                strokeWidth="1.5"
                rx="2"
              />

              {/* Bell */}
              <rect
                x="53"
                y={height - 112}
                width="6"
                height="8"
                fill="#000000"
                stroke="white"
                strokeWidth="1.5"
                rx="3"
              />

              {/* Smokebox */}
              <rect
                x="65"
                y={height - 105}
                width="20"
                height="18"
                fill="#000000"
                stroke="white"
                strokeWidth="2"
                rx="9"
              />

              {/* Smokestack/Chimney */}
              <rect
                x="72"
                y={height - 128}
                width="10"
                height="20"
                fill="#000000"
                stroke="white"
                strokeWidth="2"
                rx="1"
              />

              {/* Chimney Flare */}
              <rect
                x="70"
                y={height - 131}
                width="14"
                height="5"
                fill="#000000"
                stroke="white"
                strokeWidth="2"
                rx="1"
              />

              {/* Steam Pipes */}
              <rect x="76" y={height - 114} width="4" height="4" fill="#000000" stroke="white" strokeWidth="1.5" rx="1" />
              <rect x="68" y={height - 114} width="4" height="4" fill="#000000" stroke="white" strokeWidth="1.5" rx="1" />

              {/* Boiler bands */}
              <rect x="8" y={height - 98} width="65" height="1.5" fill="white" />
              <rect x="8" y={height - 92} width="65" height="1.5" fill="white" />
              <rect x="8" y={height - 90} width="65" height="1.5" fill="white" />
            </g>

            {/* Cab Structure */}
            <g>
              {/* Cab Body */}
              <rect
                x="-15"
                y={height - 115}
                width="20"
                height="20"
                fill="#000000"
                stroke="white"
                strokeWidth="2"
              />

              {/* Cab Roof */}
              <path
                d={`M -17 ${height - 115}
                    L 7 ${height - 115}
                    L 5 ${height - 118}
                    L -15 ${height - 118}
                    Z`}
                fill="#000000"
                stroke="white"
                strokeWidth="2"
              />

              {/* Cab Windows */}
              <rect x="-12" y={height - 112} width="6" height="8" fill="#000000" stroke="white" strokeWidth="1.5" />
              <rect x="-4" y={height - 112} width="6" height="8" fill="#000000" stroke="white" strokeWidth="1.5" />
            </g>

            {/* Drive Wheels and Running Gear */}
            <g>
              {/* Large Drive Wheels */}
              <circle cx="10" cy={height - 82} r="8" fill="#000000" stroke="white" strokeWidth="2" />
              <circle cx="35" cy={height - 82} r="8" fill="#000000" stroke="white" strokeWidth="2" />
              <circle cx="60" cy={height - 82} r="8" fill="#000000" stroke="white" strokeWidth="2" />

              {/* Leading Truck Wheels */}
              <circle cx="80" cy={height - 82} r="5" fill="#000000" stroke="white" strokeWidth="2" />

              {/* Drive Wheel Spokes */}
              {[10, 35, 60].map((x, i) => (
                <g key={`drive-spokes-${i}`}>
                  <line x1={x} y1={height - 90} x2={x} y2={height - 74} stroke="white" strokeWidth="1.5" />
                  <line x1={x - 8} y1={height - 82} x2={x + 8} y2={height - 82} stroke="white" strokeWidth="1.5" />
                  <line x1={x - 6} y1={height - 88} x2={x + 6} y2={height - 76} stroke="white" strokeWidth="1.5" />
                  <line x1={x - 6} y1={height - 76} x2={x + 6} y2={height - 88} stroke="white" strokeWidth="1.5" />
                  <circle cx={x} cy={height - 82} r="2" fill="#000000" stroke="white" strokeWidth="1" />
                </g>
              ))}

              {/* Connecting Rods */}
              <line x1="10" y1={height - 82} x2="35" y2={height - 82} stroke="white" strokeWidth="3" />
              <line x1="35" y1={height - 82} x2="60" y2={height - 82} stroke="white" strokeWidth="3" />

              {/* Side Rods */}
              <line x1="12" y1={height - 85} x2="58" y2={height - 85} stroke="white" strokeWidth="2" />

              {/* Pistons and Cylinders */}
              <rect x="65" y={height - 98} width="15" height="6" fill="#000000" stroke="white" strokeWidth="2" rx="3" />
              <rect x="67" y={height - 95} width="3" height="8" fill="#000000" stroke="white" strokeWidth="1.5" />
              <rect x="75" y={height - 95} width="3" height="8" fill="#000000" stroke="white" strokeWidth="1.5" />
            </g>

            {/* Front Details */}
            <g>
              {/* Cowcatcher */}
              <path
                d={`M 85 ${height - 88}
                    L 95 ${height - 82}
                    L 95 ${height - 78}
                    L 92 ${height - 75}
                    L 85 ${height - 75}
                    Z`}
                fill="#000000"
                stroke="white"
                strokeWidth="2"
              />

              {/* Headlight */}
              <circle cx="88" cy={height - 100} r="4" fill="#000000" stroke="white" strokeWidth="2" />
              <circle cx="88" cy={height - 100} r="2" fill="#000000" stroke="white" strokeWidth="1" />

              {/* Front Buffer */}
              <circle cx="90" cy={height - 88} r="3" fill="#000000" stroke="white" strokeWidth="2" />
            </g>

            {/* Train Shadow */}
            <g transform="translate(3, 3)" opacity="0.3">
              <ellipse cx="0" cy={height - 82} rx="90" ry="8" fill="#000000" />
            </g>
          </g>
        </g>

        {/* Animated Smoke Effects - OUTSIDE CLIPPING */}
        <g ref={smokeContainerRef} style={{ transform: 'translateX(-120px)' }}>
          {smokeFrames.map((timestamp, index) => (
            <g key={timestamp} transform={`translate(77, ${height - 135})`}>
              {generateSmokeFrames(timestamp, index)}
            </g>
          ))}
        </g>

        {/* Additional Bridge Support Details */}
        {[0, 1, 2, 3, 4, 5].map((sectionIndex) => {
          const sectionWidth = width / 6;
          const sectionX = sectionIndex * sectionWidth;

          return (
            <g key={`support-${sectionIndex}`}>
              {/* Decorative Bridge Railings */}
              <line
                x1={sectionX}
                y1={height - 80}
                x2={sectionX + sectionWidth}
                y2={height - 80}
                stroke="white"
                strokeWidth="1"
              />

              {/* Vertical Support Posts */}
              {Array.from({ length: 3 }, (_, i) => (
                <line
                  key={`post-${i}`}
                  x1={sectionX + (i + 1) * (sectionWidth / 4)}
                  y1={height - 80}
                  x2={sectionX + (i + 1) * (sectionWidth / 4)}
                  y2={height - 78}
                  stroke="white"
                  strokeWidth="0.5"
                />
              ))}
            </g>
          );
        })}
      </svg>

      {/* Percentage text */}
      {showPercent && (
        <div
          className="mt-2 text-sm font-medium text-gray-700"
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
          <p className="text-xs mt-2 text-gray-600">Width: 300px</p>
        </div>
        
        <div className="text-center">
          <SmokingTrainLoader progress={progress} width={400} height={160} showPercent />
          <p className="text-xs mt-2 text-gray-600">Default size</p>
        </div>
        
        <div className="text-center">
          <SmokingTrainLoader progress={progress} width={500} height={200} showPercent />
          <p className="text-xs mt-2 text-gray-600">Large size</p>
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
