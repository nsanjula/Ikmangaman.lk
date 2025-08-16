import React, { useRef, useEffect, useState } from 'react';

// Helper component to generate compass sprite frames
// This would typically be used in development to create the sprite sheet
export const CompassSpriteGenerator: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [spriteDataUrl, setSpriteDataUrl] = useState<string>('');
  const [frameCount] = useState(5);
  const [frameSize] = useState(120);

  useEffect(() => {
    generateSpriteSheet();
  }, []);

  const generateSpriteSheet = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size for sprite sheet
    canvas.width = frameSize * frameCount;
    canvas.height = frameSize;

    // Clear canvas
    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Generate frames
    const angles = [-22, -11, 0, 11, 22]; // degrees for wobble effect
    
    angles.forEach((angle, index) => {
      const xOffset = index * frameSize;
      const centerX = xOffset + frameSize / 2;
      const centerY = frameSize / 2;
      const radius = frameSize * 0.35;
      
      // Save context for this frame
      ctx.save();
      
      // Draw compass base
      drawCompassBase(ctx, centerX, centerY, radius);
      
      // Draw needle with rotation
      drawNeedle(ctx, centerX, centerY, radius, angle);
      
      // Restore context
      ctx.restore();
    });

    // Convert to data URL
    setSpriteDataUrl(canvas.toDataURL('image/png'));
  };

  const drawCompassBase = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number) => {
    // Outer ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 8, 0, 2 * Math.PI);
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Inner dial
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fill();
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // North marker
    ctx.beginPath();
    ctx.arc(centerX, centerY - radius + 4, 3, 0, 2 * Math.PI);
    ctx.fillStyle = '#1196A0';
    ctx.fill();

    // Other direction markers
    ['E', 'S', 'W'].forEach((dir, index) => {
      const angle = (index + 1) * Math.PI / 2;
      const x = centerX + (radius - 4) * Math.cos(angle);
      const y = centerY + (radius - 4) * Math.sin(angle);
      
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, 2 * Math.PI);
      ctx.fillStyle = '#94A3B8';
      ctx.fill();
    });
  };

  const drawNeedle = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number, angle: number) => {
    const needleLength = radius * 0.8;
    
    // Convert angle to radians and adjust for coordinate system
    const angleRad = (angle - 90) * Math.PI / 180;
    
    // Calculate needle tip position
    const tipX = centerX + needleLength * Math.cos(angleRad);
    const tipY = centerY + needleLength * Math.sin(angleRad);
    
    // Draw needle
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(tipX, tipY);
    ctx.strokeStyle = '#1196A0';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Draw needle tip
    const tipSize = 8;
    const tipAngle1 = angleRad + Math.PI * 0.8;
    const tipAngle2 = angleRad - Math.PI * 0.8;
    
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(tipX + tipSize * Math.cos(tipAngle1), tipY + tipSize * Math.sin(tipAngle1));
    ctx.lineTo(tipX + tipSize * Math.cos(tipAngle2), tipY + tipSize * Math.sin(tipAngle2));
    ctx.closePath();
    ctx.fillStyle = '#1196A0';
    ctx.fill();

    // Center cap
    ctx.beginPath();
    ctx.arc(centerX, centerY, 6, 0, 2 * Math.PI);
    ctx.fillStyle = '#1196A0';
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, 2, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fill();
  };

  const downloadSprite = () => {
    if (!spriteDataUrl) return;
    
    const link = document.createElement('a');
    link.download = 'compass-sprite-sheet.png';
    link.href = spriteDataUrl;
    link.click();
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Compass Sprite Sheet Generator</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Generated Sprite Sheet:</h3>
        <canvas 
          ref={canvasRef}
          className="border border-gray-300 rounded"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={downloadSprite}
          className="btn btn-primary btn-md"
          disabled={!spriteDataUrl}
        >
          Download Sprite Sheet
        </button>
        <button
          onClick={generateSpriteSheet}
          className="btn btn-secondary btn-md"
        >
          Regenerate
        </button>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Using External Compass Graphics:</h3>
        
        <div className="space-y-4 text-sm">
          <div>
            <h4 className="font-semibold text-base mb-2">Option A: Manual Creation</h4>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Download a free compass SVG from <a href="https://www.vecteezy.com" className="text-blue-600 underline" target="_blank" rel="noopener">Vecteezy</a> or <a href="https://www.freepik.com" className="text-blue-600 underline" target="_blank" rel="noopener">Freepik</a></li>
              <li>Open in Figma/Illustrator and rotate the needle at: -22°, -11°, 0°, +11°, +22°</li>
              <li>Export each frame as PNG (120x120px recommended)</li>
              <li>Combine into a horizontal sprite sheet (600x120px total)</li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold text-base mb-2">Option B: ImageMagick Script</h4>
            <pre className="bg-gray-800 text-green-400 p-3 rounded text-xs overflow-x-auto">
{`# Rotate compass base image
for deg in -22 -11 0 11 22; do
  convert compass_base.png -background none -rotate $deg compass_${deg}.png
done

# Combine into sprite sheet
convert +append compass_*.png compass_spritesheet.png`}
            </pre>
          </div>

          <div>
            <h4 className="font-semibold text-base mb-2">CSS Implementation:</h4>
            <pre className="bg-gray-800 text-blue-400 p-3 rounded text-xs overflow-x-auto">
{`.compass-loader {
  width: 120px;
  height: 120px;
  background-image: url("compass_spritesheet.png");
  background-repeat: no-repeat;
  animation: wobble 1.8s steps(5) infinite;
}

@keyframes wobble {
  from { background-position: 0 0; }
  to { background-position: -600px 0; }
}`}
            </pre>
          </div>

          <div>
            <h4 className="font-semibold text-base mb-2">Usage in Component:</h4>
            <pre className="bg-gray-800 text-yellow-400 p-3 rounded text-xs overflow-x-auto">
{`<SpriteCompassLoader
  progress={loadingProgress}
  size={120}
  useSprite={true}
  spriteUrl="/assets/compass_spritesheet.png"
  frameCount={5}
  frameWidth={120}
  showPercent={true}
/>`}
            </pre>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">💡 Pro Tips:</h4>
        <ul className="text-blue-800 text-sm space-y-1">
          <li>• Use vector graphics (SVG) for crisp scaling at any size</li>
          <li>• Keep sprite frames consistent in size and alignment</li>
          <li>• Export at 2x resolution for retina displays</li>
          <li>• Optimize PNG files with tools like TinyPNG</li>
          <li>• Test animation timing to match your loading speed</li>
        </ul>
      </div>
    </div>
  );
};
