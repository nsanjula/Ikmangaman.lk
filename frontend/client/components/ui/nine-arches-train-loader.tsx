import React, { useEffect, useRef, useState } from 'react';

interface NineArchesTrainLoaderProps {
  progress?: number; // 0-100
  width?: number;
  height?: number;
  className?: string;
  showPercent?: boolean;
}

export const NineArchesTrainLoader: React.FC<NineArchesTrainLoaderProps> = ({
  progress = 0,
  width = 400,
  height = 160,
  className = '',
  showPercent = false,
}) => {
  const trainRef = useRef<SVGGElement>(null);
  const smokeRef = useRef<SVGGElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

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
    const endX = width - 110; // Train front stops at bridge edge at 100%
    const bridgeLength = endX - startX;

    const newX = startX + (bridgeLength * clampedProgress) / 100;

    // Apply smooth transform to both train and smoke
    const transform = `translateX(${newX}px)`;
    trainRef.current.style.transform = transform;

    // Make smoke follow the train by applying the same transform
    if (smokeRef.current) {
      smokeRef.current.style.transform = transform;
      const smokeOpacity = clampedProgress > 0 && clampedProgress < 100 ? 1.0 : 0.8;
      smokeRef.current.style.opacity = smokeOpacity.toString();
    }
  }, [progress, isVisible, width]);

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
        style={{ overflow: 'visible', background: 'transparent' }} // Allow smoke to be visible above
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Clip path for train visibility bounds only - not smoke */}
          <clipPath id="bridgeClip">
            <rect x="0" y="0" width={width} height={height + 120} />
          </clipPath>

          {/* Gradients for depth and shading - Very dark colors with detail */}
          <linearGradient id="bridgeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2D3748" />
            <stop offset="50%" stopColor="#1A202C" />
            <stop offset="100%" stopColor="#0F1419" />
          </linearGradient>

          <linearGradient id="archShadow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0F1419" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.9" />
          </linearGradient>

          <linearGradient id="trainGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2D3748" />
            <stop offset="50%" stopColor="#1A202C" />
            <stop offset="100%" stopColor="#000000" />
          </linearGradient>

          {/* Smoke gradients for dramatic effect */}
          <radialGradient id="smokeGradient" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#4A5568" stopOpacity="0.9" />
            <stop offset="70%" stopColor="#2D3748" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#1A202C" stopOpacity="0.3" />
          </radialGradient>
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

        {/* Bridge Deck Shadow */}
        <rect
          x="2"
          y={height - 66}
          width={width}
          height="3"
          fill="#000000"
          opacity="0.4"
          stroke="white"
          strokeWidth="0.5"
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
          {/* Accurate Steam Locomotive Replica - Updated colors */}
          <g ref={trainRef} id="train" style={{ transform: 'translateX(-120px)' }}>
            {/* Coal Tender Car (Left side) */}
            <g>
              {/* Tender Body */}
              <rect
                x="-80"
                y={height - 100}
                width="50"
                height="20"
                fill="#1A202C"
                stroke="white"
                strokeWidth="1"
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
                strokeWidth="0.5"
              />

              {/* Tender Wheels */}
              <circle cx="-65" cy={height - 82} r="6" fill="#000000" stroke="white" strokeWidth="1" />
              <circle cx="-45" cy={height - 82} r="6" fill="#000000" stroke="white" strokeWidth="1" />

              {/* Tender Wheel Spokes */}
              <g stroke="white" strokeWidth="1">
                <line x1="-65" y1={height - 88} x2="-65" y2={height - 76} />
                <line x1="-71" y1={height - 82} x2="-59" y2={height - 82} />
                <line x1="-45" y1={height - 88} x2="-45" y2={height - 76} />
                <line x1="-51" y1={height - 82} x2="-39" y2={height - 82} />
              </g>

              {/* Tender Coupling */}
              <rect x="-30" y={height - 95} width="8" height="4" fill="#2D3748" stroke="white" strokeWidth="0.5" />
            </g>

            {/* Main Locomotive Body */}
            <g>
              {/* Locomotive Boiler - rectangular with rounded corners */}
              <rect
                x="5"
                y={height - 102}
                width="70"
                height="16"
                fill="#1A202C"
                stroke="white"
                strokeWidth="1"
                rx="8"
              />

              {/* Firebox - rectangular */}
              <rect
                x="-5"
                y={height - 108}
                width="30"
                height="22"
                fill="#1A202C"
                stroke="white"
                strokeWidth="1"
                rx="2"
              />

              {/* Steam Dome - rectangular with rounded top */}
              <rect
                x="16"
                y={height - 115}
                width="12"
                height="12"
                fill="#1A202C"
                stroke="white"
                strokeWidth="1"
                rx="6"
              />

              {/* Sand Dome - small rectangular */}
              <rect
                x="37"
                y={height - 110}
                width="8"
                height="8"
                fill="#1A202C"
                stroke="white"
                strokeWidth="1"
                rx="2"
              />

              {/* Bell - rectangular with rounded top */}
              <rect
                x="53"
                y={height - 112}
                width="6"
                height="8"
                fill="#1A202C"
                stroke="white"
                strokeWidth="1"
                rx="3"
              />

              {/* Smokebox - rectangular front */}
              <rect
                x="65"
                y={height - 105}
                width="20"
                height="18"
                fill="#1A202C"
                stroke="white"
                strokeWidth="1"
                rx="9"
              />

              {/* Smokestack/Chimney - rectangular */}
              <rect
                x="72"
                y={height - 128}
                width="10"
                height="20"
                fill="#1A202C"
                stroke="white"
                strokeWidth="1"
                rx="1"
              />

              {/* Chimney Flare - rectangular */}
              <rect
                x="70"
                y={height - 131}
                width="14"
                height="5"
                fill="#1A202C"
                stroke="white"
                strokeWidth="1"
                rx="1"
              />

              {/* Steam Pipes - rectangular */}
              <rect x="76" y={height - 114} width="4" height="4" fill="#2D3748" stroke="white" strokeWidth="0.5" rx="1" />
              <rect x="68" y={height - 114} width="4" height="4" fill="#2D3748" stroke="white" strokeWidth="0.5" rx="1" />

              {/* Boiler bands - rectangular strips */}
              <rect x="8" y={height - 98} width="65" height="1" fill="white" opacity="0.8" />
              <rect x="8" y={height - 92} width="65" height="1" fill="white" opacity="0.8" />
              <rect x="8" y={height - 90} width="65" height="1" fill="white" opacity="0.8" />
            </g>

            {/* Cab Structure */}
            <g>
              {/* Cab Body */}
              <rect
                x="-15"
                y={height - 115}
                width="20"
                height="20"
                fill="#1A202C"
                stroke="white"
                strokeWidth="1"
              />

              {/* Cab Roof */}
              <path
                d={`M -17 ${height - 115}
                    L 7 ${height - 115}
                    L 5 ${height - 118}
                    L -15 ${height - 118}
                    Z`}
                fill="#1A202C"
                stroke="white"
                strokeWidth="1"
              />

              {/* Cab Windows */}
              <rect x="-12" y={height - 112} width="6" height="8" fill="#4A5568" stroke="white" strokeWidth="0.5" />
              <rect x="-4" y={height - 112} width="6" height="8" fill="#4A5568" stroke="white" strokeWidth="0.5" />

              {/* Window Frames */}
              <rect x="-12" y={height - 112} width="6" height="8" fill="none" stroke="white" strokeWidth="0.5" />
              <rect x="-4" y={height - 112} width="6" height="8" fill="none" stroke="white" strokeWidth="0.5" />
            </g>

            {/* Drive Wheels and Running Gear */}
            <g>
              {/* Large Drive Wheels */}
              <circle cx="10" cy={height - 82} r="8" fill="#000000" stroke="white" strokeWidth="1" />
              <circle cx="35" cy={height - 82} r="8" fill="#000000" stroke="white" strokeWidth="1" />
              <circle cx="60" cy={height - 82} r="8" fill="#000000" stroke="white" strokeWidth="1" />

              {/* Leading Truck Wheels */}
              <circle cx="80" cy={height - 82} r="5" fill="#000000" stroke="white" strokeWidth="1" />

              {/* Drive Wheel Spokes - Detailed */}
              {[10, 35, 60].map((x, i) => (
                <g key={`drive-spokes-${i}`}>
                  <line x1={x} y1={height - 90} x2={x} y2={height - 74} stroke="white" strokeWidth="1" />
                  <line x1={x - 8} y1={height - 82} x2={x + 8} y2={height - 82} stroke="white" strokeWidth="1" />
                  <line x1={x - 6} y1={height - 88} x2={x + 6} y2={height - 76} stroke="white" strokeWidth="1" />
                  <line x1={x - 6} y1={height - 76} x2={x + 6} y2={height - 88} stroke="white" strokeWidth="1" />
                  <circle cx={x} cy={height - 82} r="2" fill="#4A5568" stroke="white" strokeWidth="0.5" />
                </g>
              ))}

              {/* Connecting Rods */}
              <line x1="10" y1={height - 82} x2="35" y2={height - 82} stroke="white" strokeWidth="2" />
              <line x1="35" y1={height - 82} x2="60" y2={height - 82} stroke="white" strokeWidth="2" />

              {/* Side Rods */}
              <line x1="12" y1={height - 85} x2="58" y2={height - 85} stroke="white" strokeWidth="1" />

              {/* Pistons and Cylinders */}
              <rect x="65" y={height - 98} width="15" height="6" fill="#1A202C" stroke="white" strokeWidth="1" rx="3" />
              <rect x="67" y={height - 95} width="3" height="8" fill="#2D3748" stroke="white" strokeWidth="0.5" />
              <rect x="75" y={height - 95} width="3" height="8" fill="#2D3748" stroke="white" strokeWidth="0.5" />
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
                fill="#1A202C"
                stroke="white"
                strokeWidth="1"
              />

              {/* Headlight */}
              <circle cx="88" cy={height - 100} r="4" fill="#4A5568" stroke="white" strokeWidth="1" />
              <circle cx="88" cy={height - 100} r="2" fill="#718096" stroke="white" strokeWidth="0.5" />

              {/* Front Buffer */}
              <circle cx="90" cy={height - 88} r="3" fill="#2D3748" stroke="white" strokeWidth="1" />
            </g>

            {/* Train Shadow */}
            <g transform="translate(3, 3)" opacity="0.4">
              <ellipse cx="0" cy={height - 82} rx="90" ry="8" fill="#000000" />
            </g>
          </g>
        </g>

        {/* Realistic Smoke Effects - Following Train Movement - OUTSIDE CLIPPING */}
        <g ref={smokeRef} style={{ opacity: 1.0 }}>
          {/* Natural smoke plumes with irregular shapes */}
          {Array.from({ length: 6 }, (_, i) => (
            <g key={`smoke-plume-${i}`}>
              {/* Main irregular smoke cloud using path */}
              <path
                d={`M ${77 - i * 12} ${height - 130 - i * 8}
                    C ${73 - i * 12} ${height - 135 - i * 8}, ${81 - i * 12} ${height - 138 - i * 8}, ${79 - i * 12} ${height - 142 - i * 8}
                    C ${75 - i * 12} ${height - 146 - i * 8}, ${83 - i * 12} ${height - 148 - i * 8}, ${77 - i * 12} ${height - 152 - i * 8}
                    C ${81 - i * 12} ${height - 148 - i * 8}, ${73 - i * 12} ${height - 146 - i * 8}, ${77 - i * 12} ${height - 142 - i * 8}
                    C ${79 - i * 12} ${height - 138 - i * 8}, ${75 - i * 12} ${height - 135 - i * 8}, ${77 - i * 12} ${height - 130 - i * 8} Z`}
                fill="#1A202C"
                opacity={0.8 - i * 0.12}
              >
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values={`0,0; ${-i * 8 - 20},${-i * 4 - 5}; ${-i * 16 - 35},${-i * 8 - 8}`}
                  dur={`${4 + i * 0.5}s`}
                  repeatCount="indefinite"
                  begin={`${i * 0.4}s`}
                />
                <animate
                  attributeName="opacity"
                  values={`${0.8 - i * 0.12};${0.5 - i * 0.06};0.1;0`}
                  dur={`${4 + i * 0.5}s`}
                  repeatCount="indefinite"
                  begin={`${i * 0.4}s`}
                />
                {/* Morphing effect for realistic smoke */}
                <animateTransform
                  attributeName="transform"
                  type="scale"
                  values={`1; ${1 + i * 0.3}; ${1 + i * 0.5}`}
                  dur={`${4 + i * 0.5}s`}
                  repeatCount="indefinite"
                  begin={`${i * 0.4}s`}
                  additive="sum"
                />
              </path>

              {/* Wispy tendrils */}
              <ellipse
                cx={75 - i * 10}
                cy={height - 128 - i * 6}
                rx={3 + i * 0.8}
                ry={8 + i * 2}
                fill="#2D3748"
                opacity={0.6 - i * 0.08}
                transform={`rotate(${15 + i * 10} ${75 - i * 10} ${height - 128 - i * 6})`}
              >
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values={`0,0; ${-i * 6 - 15},${-i * 3 - 3}; ${-i * 12 - 25},${-i * 6 - 5}`}
                  dur={`${3 + i * 0.3}s`}
                  repeatCount="indefinite"
                  begin={`${i * 0.3}s`}
                />
                <animate
                  attributeName="opacity"
                  values={`${0.6 - i * 0.08};${0.3 - i * 0.04};0`}
                  dur={`${3 + i * 0.3}s`}
                  repeatCount="indefinite"
                  begin={`${i * 0.3}s`}
                />
              </ellipse>
            </g>
          ))}

          {/* Swirling smoke details */}
          {Array.from({ length: 4 }, (_, i) => (
            <path
              key={`smoke-swirl-${i}`}
              d={`M ${76 - i * 8} ${height - 130 - i * 5}
                  Q ${72 - i * 8} ${height - 135 - i * 5}, ${78 - i * 8} ${height - 140 - i * 5}
                  Q ${74 - i * 8} ${height - 145 - i * 5}, ${80 - i * 8} ${height - 148 - i * 5}`}
              fill="none"
              stroke="#1A202C"
              strokeWidth={2 + i * 0.5}
              opacity={0.7 - i * 0.15}
            >
              <animateTransform
                attributeName="transform"
                type="translate"
                values={`0,0; ${-i * 6 - 12},${-i * 2 - 2}; ${-i * 12 - 20},${-i * 4 - 3}`}
                dur={`${2.5 + i * 0.2}s`}
                repeatCount="indefinite"
                begin={`${i * 0.25}s`}
              />
              <animate
                attributeName="opacity"
                values={`${0.7 - i * 0.15};${0.4 - i * 0.08};0`}
                dur={`${2.5 + i * 0.2}s`}
                repeatCount="indefinite"
                begin={`${i * 0.25}s`}
              />
            </path>
          ))}

          {/* Dense smoke from chimney base */}
          <ellipse
            cx="77"
            cy={height - 128}
            rx="4"
            ry="8"
            fill="#1A202C"
            opacity="0.9"
          >
            <animate
              attributeName="cy"
              values={`${height - 128};${height - 135};${height - 140}`}
              dur="1.8s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="ry"
              values="8;12;6"
              dur="1.8s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.9;0.6;0.2"
              dur="1.8s"
              repeatCount="indefinite"
            />
            {/* Backward motion */}
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; -8,-2; -15,-4"
              dur="1.8s"
              repeatCount="indefinite"
            />
          </ellipse>
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
export const NineArchesTrainLoaderExample: React.FC = () => {
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
      <h3 className="text-lg font-semibold">Nine Arches Bridge Train Loader</h3>
      
      <div className="flex flex-wrap items-end gap-8">
        <div className="text-center">
          <NineArchesTrainLoader progress={progress} width={300} height={120} showPercent />
          <p className="text-xs mt-2 text-gray-600">Width: 300px</p>
        </div>
        
        <div className="text-center">
          <NineArchesTrainLoader progress={progress} width={400} height={160} showPercent />
          <p className="text-xs mt-2 text-gray-600">Default size</p>
        </div>
        
        <div className="text-center">
          <NineArchesTrainLoader progress={progress} width={500} height={200} showPercent />
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

export default NineArchesTrainLoader;
