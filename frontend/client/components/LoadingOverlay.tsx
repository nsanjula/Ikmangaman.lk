import React, { useEffect } from 'react';
import { SmokingTrainLoader } from './ui/smoking-train-loader';
import { useLoading } from '../contexts/LoadingContext';

interface LoadingOverlayProps {
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ className = '' }) => {
  const { loadingState } = useLoading();

  // Lock body scroll when loading is active and scroll to top
  useEffect(() => {
    if (loadingState.isLoading) {
      // Store original overflow style and scroll position
      const originalStyle = window.getComputedStyle(document.body).overflow;
      const originalScrollPosition = window.pageYOffset || document.documentElement.scrollTop;

      // Scroll to top immediately so loading overlay is visible
      window.scrollTo({ top: 0, behavior: 'instant' });

      // Lock scroll
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';

      // Cleanup function to restore scroll
      return () => {
        document.body.style.overflow = originalStyle;
        document.documentElement.style.overflow = '';
        // Note: We don't restore scroll position as user is navigating to a new page
      };
    }
  }, [loadingState.isLoading]);

  if (!loadingState.isLoading) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${className}`}
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        zIndex: 9999,
        pointerEvents: 'auto'
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="loading-title"
      onWheel={(e) => e.preventDefault()}
      onTouchMove={(e) => e.preventDefault()}
      onScroll={(e) => e.preventDefault()}
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
