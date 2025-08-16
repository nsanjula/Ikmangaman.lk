import React, { createContext, useContext, useState, useCallback } from 'react';
import { LoadScript } from '@react-google-maps/api';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const libraries: ("places" | "geometry")[] = ["places", "geometry"];

interface GoogleMapsContextData {
  isLoaded: boolean;
  loadError: boolean;
}

const GoogleMapsContext = createContext<GoogleMapsContextData | undefined>(undefined);

export const useGoogleMaps = () => {
  const context = useContext(GoogleMapsContext);
  if (!context) {
    throw new Error('useGoogleMaps must be used within a GoogleMapsProvider');
  }
  return context;
};

interface GoogleMapsProviderProps {
  children: React.ReactNode;
}

export const GoogleMapsProvider: React.FC<GoogleMapsProviderProps> = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    setLoadError(false);
  }, []);

  const handleError = useCallback((error: Error) => {
    console.warn('Google Maps failed to load:', error);
    setLoadError(true);
    setIsLoaded(false);
  }, []);

  // If no API key, render children without maps functionality
  if (!GOOGLE_MAPS_API_KEY) {
    console.warn('Google Maps API key not found');
    return (
      <GoogleMapsContext.Provider value={{ isLoaded: false, loadError: true }}>
        {children}
      </GoogleMapsContext.Provider>
    );
  }

  return (
    <LoadScript
      googleMapsApiKey={GOOGLE_MAPS_API_KEY}
      libraries={libraries}
      onLoad={handleLoad}
      onError={handleError}
      loadingElement={
        <GoogleMapsContext.Provider value={{ isLoaded: false, loadError: false }}>
          {children}
        </GoogleMapsContext.Provider>
      }
    >
      <GoogleMapsContext.Provider value={{ isLoaded, loadError }}>
        {children}
      </GoogleMapsContext.Provider>
    </LoadScript>
  );
};
