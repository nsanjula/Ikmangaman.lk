import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

interface LoadingState {
  isLoading: boolean;
  progress: number;
  loadingKey: string | null;
  message?: string;
}

interface LoadingContextType {
  loadingState: LoadingState;
  startLoading: (key: string, message?: string) => void;
  setProgress: (progress: number) => void;
  finishLoading: (key: string) => void;
  isLoadingKey: (key: string) => boolean;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

interface LoadingProviderProps {
  children: React.ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    progress: 0,
    loadingKey: null,
    message: undefined
  });

  const progressRef = useRef(0);
  const progressIntervalRef = useRef<NodeJS.Timeout>();

  // Auto-increment progress for smoother experience
  const startProgressIncrement = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    progressRef.current = 0;
    setLoadingState(prev => ({ ...prev, progress: 0 }));

    progressIntervalRef.current = setInterval(() => {
      progressRef.current = Math.min(progressRef.current + Math.random() * 2, 85);
      setLoadingState(prev => ({ 
        ...prev, 
        progress: progressRef.current 
      }));
    }, 100);
  }, []);

  const startLoading = useCallback((key: string, message?: string) => {
    console.log('🚀 startLoading called with key:', key, 'message:', message);
    setLoadingState({
      isLoading: true,
      progress: 0,
      loadingKey: key,
      message
    });
    startProgressIncrement();
  }, [startProgressIncrement]);

  const setProgress = useCallback((progress: number) => {
    console.log('📊 setProgress called with:', progress, 'current ref:', progressRef.current);

    // Stop auto-increment when manual progress exceeds 85%
    if (progress > 85 && progressIntervalRef.current) {
      console.log('🛑 Stopping auto-increment at progress:', progress);
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = undefined;
    }

    progressRef.current = Math.max(progressRef.current, progress);
    const newProgress = Math.min(Math.max(progress, progressRef.current), 100);

    setLoadingState(prev => ({
      ...prev,
      progress: newProgress
    }));

    // Failsafe: If progress reaches 100%, auto-finish loading after a short delay
    if (newProgress >= 100) {
      console.log('🎯 Progress reached 100%, auto-finishing in 500ms');
      setTimeout(() => {
        setLoadingState(currentState => {
          if (currentState.isLoading && currentState.progress >= 100) {
            console.log('🚀 Auto-finishing loading due to 100% progress');
            if (progressIntervalRef.current) {
              clearInterval(progressIntervalRef.current);
            }
            progressRef.current = 0;
            return {
              isLoading: false,
              progress: 0,
              loadingKey: null,
              message: undefined
            };
          }
          return currentState;
        });
      }, 500);
    }
  }, []);

  const finishLoading = useCallback((key: string) => {
    console.log('🏁 finishLoading called with key:', key, 'current key:', loadingState.loadingKey);
    if (loadingState.loadingKey === key) {
      // Quickly finish progress to 100%
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }

      console.log('✅ Finishing loading - setting progress to 100%');
      setLoadingState(prev => ({ ...prev, progress: 100 }));

      // Wait for animation to complete before hiding
      setTimeout(() => {
        console.log('🚀 Hiding loading overlay');
        setLoadingState({
          isLoading: false,
          progress: 0,
          loadingKey: null,
          message: undefined
        });
        progressRef.current = 0;
      }, 300); // Match the needle stabilization animation
    } else {
      console.log('⚠️ finishLoading key mismatch - not finishing');
    }
  }, [loadingState.loadingKey]);

  const isLoadingKey = useCallback((key: string) => {
    return loadingState.isLoading && loadingState.loadingKey === key;
  }, [loadingState.isLoading, loadingState.loadingKey]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  const contextValue: LoadingContextType = {
    loadingState,
    startLoading,
    setProgress,
    finishLoading,
    isLoadingKey
  };

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
    </LoadingContext.Provider>
  );
};

// Hook for API calls with automatic loading management
export const useApiWithLoading = () => {
  const { startLoading, setProgress, finishLoading } = useLoading();

  const callWithLoading = useCallback(async <T,>(
    apiCall: () => Promise<T>,
    loadingKey: string,
    message?: string
  ): Promise<T> => {
    try {
      console.log('🔄 callWithLoading starting for key:', loadingKey);
      startLoading(loadingKey, message);
      setProgress(20); // Initial progress

      const result = await apiCall();
      console.log('✅ API call completed for key:', loadingKey);

      setProgress(95); // Near completion
      await new Promise(resolve => setTimeout(resolve, 200)); // Brief pause for UX

      setProgress(100); // Complete
      await new Promise(resolve => setTimeout(resolve, 100)); // Let progress reach 100%

      return result;
    } finally {
      console.log('🏁 callWithLoading finishing for key:', loadingKey);
      finishLoading(loadingKey);
    }
  }, [startLoading, setProgress, finishLoading]);

  return { callWithLoading };
};

// Route transition hook
export const useRouteLoading = () => {
  const { startLoading, setProgress, finishLoading } = useLoading();

  const startRouteTransition = useCallback((routeName: string) => {
    startLoading(`route-${routeName}`, `Loading ${routeName}...`);
  }, [startLoading]);

  const finishRouteTransition = useCallback((routeName: string) => {
    setProgress(100);
    finishLoading(`route-${routeName}`);
  }, [setProgress, finishLoading]);

  return { startRouteTransition, finishRouteTransition };
};
