import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useRouteLoading } from '../contexts/LoadingContext';

interface RouteWithLoadingProps {
  children: React.ReactNode;
  routeName: string;
  minLoadingTime?: number; // Minimum loading time in ms for UX
}

export const RouteWithLoading: React.FC<RouteWithLoadingProps> = ({
  children,
  routeName,
  minLoadingTime = 500
}) => {
  const { startRouteTransition, finishRouteTransition } = useRouteLoading();
  const location = useLocation();
  const [isContentReady, setIsContentReady] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    // Start loading when route changes
    setIsContentReady(false);
    setStartTime(Date.now());
    startRouteTransition(routeName);

    // Simulate content loading (replace with actual data loading logic)
    const loadContent = async () => {
      // Wait for minimum loading time for better UX
      const elapsed = Date.now() - (startTime || Date.now());
      const remainingTime = Math.max(0, minLoadingTime - elapsed);
      
      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }

      setIsContentReady(true);
      finishRouteTransition(routeName);
    };

    // Use a small delay to ensure loading screen shows
    const timer = setTimeout(loadContent, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [location.pathname, routeName, startRouteTransition, finishRouteTransition, minLoadingTime, startTime]);

  // Return content once ready
  return <>{children}</>;
};

// Hook for components to signal when they're ready
export const useContentReady = () => {
  const { finishRouteTransition } = useRouteLoading();
  
  const signalReady = (routeName: string) => {
    finishRouteTransition(routeName);
  };

  return { signalReady };
};

export default RouteWithLoading;
