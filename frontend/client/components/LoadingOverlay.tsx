import React, { useEffect } from 'react';
import { SmokingTrainLoader } from './ui/smoking-train-loader';
import { useLoading } from '../contexts/LoadingContext';

interface LoadingOverlayProps {
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ className = '' }) => {
  const { loadingState } = useLoading();

  // Lock body scroll when loading is active and ensure overlay is visible
  useEffect(() => {
    if (loadingState.isLoading) {
      // Store original overflow style and scroll position
      const originalStyle = window.getComputedStyle(document.body).overflow;
      const originalScrollPosition = window.pageYOffset || document.documentElement.scrollTop;

      // Immediately scroll to top for loading visibility - multiple attempts for reliability
      window.scrollTo({ top: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      // Lock scroll immediately
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';

      // Prevent background scrolling on mobile with additional fixes
      // Store scroll position for restoration but don't fix body position
      // as it interferes with overlay centering
      document.body.style.width = '100%';

      // Additional mobile scroll prevention
      const preventDefault = (e: Event) => e.preventDefault();
      document.addEventListener('touchmove', preventDefault, { passive: false });
      document.addEventListener('wheel', preventDefault, { passive: false });

      // Cleanup function to restore scroll
      return () => {
        document.body.style.overflow = originalStyle;
        document.documentElement.style.overflow = '';
        document.body.style.width = '';

        // Remove event listeners
        document.removeEventListener('touchmove', preventDefault);
        document.removeEventListener('wheel', preventDefault);

        // Only restore scroll position if not navigating to a new page
        // Check if we're still on the same page by comparing loadingKey
        const isNavigating = loadingState.loadingKey?.startsWith('route-');
        if (!isNavigating) {
          window.scrollTo(0, originalScrollPosition);
        }
      };
    }
  }, [loadingState.isLoading, loadingState.loadingKey]);

  if (!loadingState.isLoading) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center loading-overlay-force-visible ${className}`}
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        position: 'fixed',
        top: '0px !important',
        left: '0px !important',
        right: '0px !important',
        bottom: '0px !important',
        width: '100vw',
        height: '100vh',
        maxWidth: '100vw',
        maxHeight: '100vh',
        overflow: 'hidden',
        zIndex: 99999,
        pointerEvents: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: 'translate3d(0, 0, 0)' // Force GPU acceleration for better positioning
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="loading-title"
      onWheel={(e) => e.preventDefault()}
      onTouchMove={(e) => e.preventDefault()}
      onScroll={(e) => e.preventDefault()}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="text-center flex flex-col items-center justify-center">
        <SmokingTrainLoader
          progress={loadingState.progress}
          width={300}
          height={140}
          showPercent={false}
        />

        {loadingState.message && (
          <div
            id="loading-title"
            className="mt-2 text-lg font-medium"
            style={{ color: 'var(--text-900)' }}
          >
            {loadingState.message}
          </div>
        )}

        <div
          className="mt-1 text-sm"
          style={{ color: 'var(--text-600)' }}
        >
          {Math.round(loadingState.progress)}% complete
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
