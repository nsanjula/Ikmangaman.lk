import React from 'react';
import { SmokingTrainLoader } from './ui/smoking-train-loader';
import { useLoading } from '../contexts/LoadingContext';

interface LoadingOverlayProps {
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ className = '' }) => {
  const { loadingState } = useLoading();

  if (!loadingState.isLoading) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${className}`}
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="loading-title"
    >
      <div className="text-center">
        <SmokingTrainLoader
          progress={loadingState.progress}
          width={300}
          height={120}
          showPercent={false}
        />
        
        {loadingState.message && (
          <div
            id="loading-title"
            className="mt-4 text-lg font-medium"
            style={{ color: 'var(--text-900)' }}
          >
            {loadingState.message}
          </div>
        )}
        
        <div
          className="mt-2 text-sm"
          style={{ color: 'var(--text-600)' }}
        >
          {Math.round(loadingState.progress)}% complete
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
