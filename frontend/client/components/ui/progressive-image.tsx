import React, { useState, useRef, useEffect } from 'react';

interface ProgressiveImageProps {
  src: string | null;
  placeholder?: string;
  alt: string;
  className?: string;
  fallbackContent?: React.ReactNode;
  onLoad?: () => void;
  onError?: () => void;
  loading?: 'lazy' | 'eager';
}

const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  src,
  placeholder,
  alt,
  className = '',
  fallbackContent,
  onLoad,
  onError,
  loading = 'lazy'
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [inView, setInView] = useState(loading === 'eager');
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (loading === 'eager' || !containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px', // Start loading 50px before image comes into view
        threshold: 0.1
      }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [loading]);

  const handleImageLoad = () => {
    setImageLoaded(true);
    onLoad?.();
  };

  const handleImageError = () => {
    setImageError(true);
    onError?.();
  };

  const shouldShowImage = src && inView && !imageError;
  const shouldShowPlaceholder = placeholder && !imageLoaded && !imageError;
  const shouldShowFallback = (!src || imageError) && !imageLoaded;

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Placeholder with gradient background */}
      {shouldShowPlaceholder && (
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            background: placeholder,
            opacity: imageLoaded ? 0 : 1
          }}
        />
      )}

      {/* Actual image */}
      {shouldShowImage && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading={loading}
        />
      )}

      {/* Fallback content */}
      {shouldShowFallback && (
        <div className="absolute inset-0 flex items-center justify-center">
          {fallbackContent || (
            <div 
              className="w-full h-full flex flex-col items-center justify-center text-center p-4"
              style={{
                background: placeholder || 'linear-gradient(135deg, var(--primary-600), var(--accent))',
                color: 'white'
              }}
            >
              <div className="text-4xl mb-3">🏞️</div>
              <div className="text-sm font-medium">{alt}</div>
            </div>
          )}
        </div>
      )}

      {/* Loading indicator */}
      {inView && src && !imageLoaded && !imageError && (
        <div className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center bg-white/90 backdrop-blur-sm">
          <div 
            className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: 'var(--primary-600)' }}
          />
        </div>
      )}

      {/* Blur effect while loading (optional) */}
      {shouldShowImage && !imageLoaded && (
        <div 
          className="absolute inset-0 backdrop-blur-sm transition-opacity duration-300"
          style={{ opacity: imageLoaded ? 0 : 0.3 }}
        />
      )}
    </div>
  );
};

export default ProgressiveImage;
