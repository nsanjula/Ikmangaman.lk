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
  forceStopLoading: () => void;
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

    // Force finish loading regardless of key mismatch to prevent stuck states
    if (loadingState.isLoading && (loadingState.loadingKey === key || key === 'force')) {
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
    } else if (!loadingState.isLoading) {
      console.log('⚠️ finishLoading called but loading is already finished');
    } else {
      console.log('⚠️ finishLoading key mismatch - forcing finish immediately to prevent stuck states');
      // Force finish immediately for auth/timeout errors to prevent 85% stuck issue
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      setLoadingState({
        isLoading: false,
        progress: 0,
        loadingKey: null,
        message: undefined
      });
      progressRef.current = 0;
    }
  }, [loadingState.loadingKey, loadingState.isLoading]);

  const isLoadingKey = useCallback((key: string) => {
    return loadingState.isLoading && loadingState.loadingKey === key;
  }, [loadingState.isLoading, loadingState.loadingKey]);

  const forceStopLoading = useCallback(() => {
    console.log('🛑 Force stopping loading - emergency reset');
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    setLoadingState({
      isLoading: false,
      progress: 0,
      loadingKey: null,
      message: undefined
    });
    progressRef.current = 0;
  }, []);

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
    isLoadingKey,
    forceStopLoading
  };

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
    </LoadingContext.Provider>
  );
};

// Hook for API calls with automatic loading management
export const useApiWithLoading = () => {
  const { startLoading, setProgress, finishLoading, forceStopLoading } = useLoading();

  const callWithLoading = useCallback(async <T,>(
    apiCall: () => Promise<T>,
    loadingKey: string,
    message?: string,
    timeoutMs: number = 30000 // 30 second default timeout
  ): Promise<T> => {
    let timeoutId: NodeJS.Timeout;

    try {
      console.log('🔄 callWithLoading starting for key:', loadingKey);
      startLoading(loadingKey, message);
      setProgress(20); // Initial progress

      // Set up timeout handler
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          console.log('⏰ API call timeout for key:', loadingKey);
          reject(new Error('Request timeout - please check your connection and try again'));
        }, timeoutMs);
      });

      // Race between API call and timeout
      const result = await Promise.race([
        apiCall(),
        timeoutPromise
      ]);

      console.log('✅ API call completed for key:', loadingKey);
      clearTimeout(timeoutId);

      setProgress(95); // Near completion
      await new Promise(resolve => setTimeout(resolve, 200)); // Brief pause for UX

      setProgress(100); // Complete
      await new Promise(resolve => setTimeout(resolve, 100)); // Let progress reach 100%

      return result as T;
    } catch (error) {
      console.error('❌ API call failed for key:', loadingKey, error);
      if (timeoutId) clearTimeout(timeoutId);

      // Check if it's an authentication error, timeout, or no results error
      if (error instanceof Error &&
          (error.message.includes('Authentication required') ||
           error.message.includes('Please log in again') ||
           error.message.includes('401') ||
           error.message.includes('timeout') ||
           error.message.includes('Request timeout') ||
           error.message.includes('404') ||
           error.message.includes('No destinations found') ||
           error.message.includes('No matching destinations'))) {
        console.log('🔐 Auth/timeout/no-results error detected, stopping loading');
        forceStopLoading();
      }

      throw error;
    } finally {
      console.log('🏁 callWithLoading finishing for key:', loadingKey);
      if (timeoutId) clearTimeout(timeoutId);
      finishLoading(loadingKey);
    }
  }, [startLoading, setProgress, finishLoading, forceStopLoading]);

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
