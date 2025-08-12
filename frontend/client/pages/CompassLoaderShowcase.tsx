import React, { useState, useEffect } from 'react';
import { CompassLoader, CompassLoaderExample } from '../components/ui/compass-loader';
import { SpriteCompassLoader } from '../components/ui/sprite-compass-loader';
import { CompassSpriteGenerator } from '../components/ui/compass-sprite-generator';
import { NineArchesTrainLoader, NineArchesTrainLoaderExample } from '../components/ui/nine-arches-train-loader';
import { SmokingTrainLoader, SmokingTrainLoaderExample } from '../components/ui/smoking-train-loader';
import Header from '../components/Header';
import Footer from '../components/Footer';

const CompassLoaderShowcase: React.FC = () => {
  const [progress1, setProgress1] = useState(0);
  const [progress2, setProgress2] = useState(50);
  const [progress3, setProgress3] = useState(100);
  const [isAutoMode, setIsAutoMode] = useState(false);

  // Auto-increment progress for demo
  useEffect(() => {
    if (!isAutoMode) return;

    const interval = setInterval(() => {
      setProgress1(prev => {
        if (prev >= 100) return 0;
        return prev + Math.random() * 3;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [isAutoMode]);

  useEffect(() => {
    document.title = "Loading Components Showcase | Ikmangaman.lk";
  }, []);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Header />
      
      <div className="container py-12">
        <div className="text-center mb-12">
          <h1 className="mb-4" style={{ color: 'var(--text-900)' }}>
            Loading Components Showcase
          </h1>
          <p className="text-lg" style={{ color: 'var(--text-600)' }}>
            Interactive loading animations featuring a compass with wobbling needle and an enhanced train with smoking animation crossing Sri Lanka's Nine Arches Bridge
          </p>
        </div>

        {/* Interactive Controls */}
        <div className="card p-6 mb-8 max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-900)' }}>
            Interactive Demo
          </h2>
          
          <div className="flex flex-col items-center gap-6">
            <CompassLoader 
              progress={progress1} 
              size={140} 
              showPercent={true}
              colorPrimary="var(--primary-600)"
            />
            
            <div className="w-full space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-900)' }}>
                  Progress: {Math.round(progress1)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress1}
                  onChange={(e) => setProgress1(Number(e.target.value))}
                  className="w-full slider"
                  disabled={isAutoMode}
                />
              </div>
              
              <button
                onClick={() => setIsAutoMode(!isAutoMode)}
                className={`btn ${isAutoMode ? 'btn-secondary' : 'btn-primary'} btn-md`}
              >
                {isAutoMode ? 'Stop Auto Mode' : 'Start Auto Mode'}
              </button>
            </div>
          </div>
        </div>

        {/* Size Variations */}
        <div className="card p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-900)' }}>
            Size Variations
          </h2>
          
          <div className="flex flex-wrap justify-center items-end gap-8">
            <div className="text-center">
              <CompassLoader progress={75} size={60} />
              <p className="text-sm mt-2" style={{ color: 'var(--text-600)' }}>60px</p>
            </div>
            
            <div className="text-center">
              <CompassLoader progress={75} size={80} />
              <p className="text-sm mt-2" style={{ color: 'var(--text-600)' }}>80px</p>
            </div>
            
            <div className="text-center">
              <CompassLoader progress={75} size={120} />
              <p className="text-sm mt-2" style={{ color: 'var(--text-600)' }}>120px (default)</p>
            </div>
            
            <div className="text-center">
              <CompassLoader progress={75} size={160} />
              <p className="text-sm mt-2" style={{ color: 'var(--text-600)' }}>160px</p>
            </div>
          </div>
        </div>

        {/* Color Variations */}
        <div className="card p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-900)' }}>
            Color Variations
          </h2>
          
          <div className="flex flex-wrap justify-center items-center gap-8">
            <div className="text-center">
              <CompassLoader 
                progress={progress2} 
                size={100} 
                colorPrimary="#1196A0" 
                showPercent 
              />
              <p className="text-sm mt-2" style={{ color: 'var(--text-600)' }}>Primary Teal</p>
            </div>
            
            <div className="text-center">
              <CompassLoader 
                progress={progress2} 
                size={100} 
                colorPrimary="#FF7A59" 
                showPercent 
              />
              <p className="text-sm mt-2" style={{ color: 'var(--text-600)' }}>Accent Orange</p>
            </div>
            
            <div className="text-center">
              <CompassLoader 
                progress={progress2} 
                size={100} 
                colorPrimary="#6366F1" 
                showPercent 
              />
              <p className="text-sm mt-2" style={{ color: 'var(--text-600)' }}>Indigo</p>
            </div>
            
            <div className="text-center">
              <CompassLoader 
                progress={progress2} 
                size={100} 
                colorPrimary="#22C55E" 
                showPercent 
              />
              <p className="text-sm mt-2" style={{ color: 'var(--text-600)' }}>Green</p>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-900)' }}>
              Progress for color demos: {Math.round(progress2)}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={progress2}
              onChange={(e) => setProgress2(Number(e.target.value))}
              className="w-full slider"
            />
          </div>
        </div>

        {/* Loading States */}
        <div className="card p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-900)' }}>
            Loading States
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <CompassLoader progress={0} size={100} showPercent />
              <p className="text-sm mt-2" style={{ color: 'var(--text-600)' }}>Starting (0%)</p>
              <p className="text-xs" style={{ color: 'var(--text-600)' }}>Maximum wobble</p>
            </div>
            
            <div className="text-center">
              <CompassLoader progress={50} size={100} showPercent />
              <p className="text-sm mt-2" style={{ color: 'var(--text-600)' }}>Mid-loading (50%)</p>
              <p className="text-xs" style={{ color: 'var(--text-600)' }}>Moderate wobble</p>
            </div>
            
            <div className="text-center">
              <CompassLoader progress={progress3} size={100} showPercent />
              <p className="text-sm mt-2" style={{ color: 'var(--text-600)' }}>Complete (100%)</p>
              <p className="text-xs" style={{ color: 'var(--text-600)' }}>Perfectly stable</p>
            </div>
          </div>
        </div>

        {/* Enhanced Realistic Compass */}
        <div className="card p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-900)' }}>
            Enhanced Realistic Design
          </h2>

          <div className="text-center mb-6">
            <p className="text-sm mb-4" style={{ color: 'var(--text-600)' }}>
              Updated with realistic compass markings, gradients, and shadows
            </p>
            <CompassLoader
              progress={progress1}
              size={160}
              showPercent={true}
              colorPrimary="var(--primary-600)"
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">New Features:</h3>
            <ul className="text-sm space-y-1" style={{ color: 'var(--text-600)' }}>
              <li>• Outer compass ring with realistic styling</li>
              <li>• Cardinal direction markers (N, E, S, W) with proper emphasis</li>
              <li>• Minor tick marks for intermediate directions</li>
              <li>• Needle shadow for depth</li>
              <li>• Gradient center cap with 3D effect</li>
              <li>• Needle tail for balanced design</li>
            </ul>
          </div>
        </div>

        {/* Sprite Sheet Compass */}
        <div className="card p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-900)' }}>
            Sprite-Based Compass (Ready for External Graphics)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
            <div className="text-center">
              <h3 className="font-semibold mb-4">SVG Version (Current)</h3>
              <SpriteCompassLoader
                progress={progress2}
                size={120}
                showPercent={true}
                useSprite={false}
                colorPrimary="var(--primary-600)"
              />
            </div>

            <div className="text-center">
              <h3 className="font-semibold mb-4">Sprite Ready (No Asset)</h3>
              <div className="bg-gray-100 rounded-lg p-4 text-sm" style={{ color: 'var(--text-600)' }}>
                Load your compass sprite sheet here
                <br />
                <code className="text-xs bg-white px-2 py-1 rounded mt-2 inline-block">
                  useSprite={'{true}'}
                </code>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">How to Use External Graphics:</h3>
            <div className="text-blue-800 text-sm space-y-2">
              <p>1. Download a free compass from Vecteezy, Freepik, or similar</p>
              <p>2. Create 5 frames with needle rotated: -22°, -11°, 0°, +11°, +22°</p>
              <p>3. Combine into horizontal sprite sheet (600x120px)</p>
              <p>4. Use SpriteCompassLoader with <code>useSprite={'{true}'}</code></p>
            </div>
          </div>
        </div>

        {/* Sprite Generator Tool */}
        <div className="mb-8">
          <CompassSpriteGenerator />
        </div>

        {/* Usage Example */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-900)' }}>
            Usage Examples
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold mb-2">Enhanced SVG Compass:</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-xs overflow-x-auto">
{`<CompassLoader
  progress={loadingProgress}
  size={120}
  colorPrimary="#1196A0"
  showPercent={true}
/>`}
                </pre>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Sprite-Based Compass:</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-xs overflow-x-auto">
{`<SpriteCompassLoader
  progress={loadingProgress}
  size={120}
  useSprite={true}
  spriteUrl="/compass.png"
  frameCount={5}
  frameWidth={120}
  showPercent={true}
/>`}
                </pre>
              </div>
            </div>
          </div>

          <CompassLoaderExample />
        </div>

        {/* Nine Arches Bridge Train Loader */}
        <div className="card p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-900)' }}>
            Nine Arches Bridge Train Loader
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-600)' }}>
            A stylized vector animation of a train crossing Sri Lanka's famous Nine Arches Bridge.
            The train's position reflects loading progress, moving smoothly from left to right.
          </p>

          <div className="mb-6">
            <NineArchesTrainLoaderExample />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Features:</h3>
            <ul className="text-sm space-y-1" style={{ color: 'var(--text-600)' }}>
              <li>• Black and white vector graphics with subtle shading</li>
              <li>• Responsive design with transparent background</li>
              <li>• Progress-controlled train movement (0% = left, 100% = right)</li>
              <li>• Animated smoke effects when train is moving</li>
              <li>• Nine authentic bridge arches with depth and shadows</li>
              <li>• No photo textures - pure SVG vectors</li>
              <li>• Loop-free animation - only moves forward with progress</li>
            </ul>
          </div>

          <div className="mt-4 bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Usage Example:</h3>
            <pre className="text-xs overflow-x-auto bg-gray-800 text-green-400 p-3 rounded">
{`<NineArchesTrainLoader
  progress={loadingProgress}
  width={400}
  height={160}
  showPercent={true}
/>`}
            </pre>
          </div>
        </div>

        {/* Smoking Train Loader */}
        <div className="card p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-900)' }}>
            Enhanced Smoking Train Loader
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-600)' }}>
            An enhanced version with animated smoke puffs that follow the cartoon style. Features solid black train with white outlines
            and sophisticated smoke animation with multiple frames.
          </p>

          <div className="mb-6">
            <SmokingTrainLoaderExample />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Enhanced Features:</h3>
            <ul className="text-sm space-y-1" style={{ color: 'var(--text-600)' }}>
              <li>• Solid black train body with crisp white outlines</li>
              <li>• Sprite-based smoke animation with 5-8 frames</li>
              <li>• Smoke lifecycle: small puff → expand → break apart → dissipate</li>
              <li>• New smoke puff every 0.5 seconds while moving</li>
              <li>• Smoke drifts diagonally upward and backward</li>
              <li>• Speed synchronized to train movement</li>
              <li>• Fade opacity animation for realistic smoke dispersal</li>
              <li>• Multiple smoke layers for depth and realism</li>
            </ul>
          </div>

          <div className="mt-4 bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Usage Example:</h3>
            <pre className="text-xs overflow-x-auto bg-gray-800 text-green-400 p-3 rounded">
{`<SmokingTrainLoader
  progress={loadingProgress}
  width={400}
  height={160}
  showPercent={true}
/>`}
            </pre>
          </div>
        </div>

        {/* Accessibility Info */}
        <div className="card p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-900)' }}>
            Accessibility Features
          </h2>
          
          <ul className="space-y-2 text-sm" style={{ color: 'var(--text-600)' }}>
            <li>• <strong>ARIA attributes:</strong> Proper progressbar role with valuenow, valuemin, valuemax</li>
            <li>• <strong>Screen reader support:</strong> Live announcements of progress changes</li>
            <li>• <strong>Reduced motion:</strong> Respects prefers-reduced-motion setting</li>
            <li>• <strong>Performance optimized:</strong> Pauses animation when not visible</li>
            <li>• <strong>Keyboard accessible:</strong> Can be focused and announced by screen readers</li>
          </ul>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CompassLoaderShowcase;
