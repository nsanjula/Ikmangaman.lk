import { useState, useEffect, useCallback, useRef } from 'react';

interface ImageCache {
  [key: string]: {
    url: string;
    timestamp: number;
  };
}

interface PlaceImage {
  placeName: string;
  imageUrl: string | null;
  isLoading: boolean;
  error?: string;
  placeholder?: string;
}

interface UseOptimizedImageLoadingProps {
  places: string[];
  destinationName: string;
  isGoogleMapsAvailable: () => boolean;
  waitForGoogleMaps: () => Promise<void>;
}

// Cache duration: 24 hours
const CACHE_DURATION = 24 * 60 * 60 * 1000;

// Generate placeholder patterns for consistent design
const generatePlaceholderPattern = (placeName: string): string => {
  const colors = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  ];
  
  // Use place name hash to consistently select same color
  const hash = placeName.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  return colors[Math.abs(hash) % colors.length];
};

const useOptimizedImageLoading = ({
  places,
  destinationName,
  isGoogleMapsAvailable,
  waitForGoogleMaps
}: UseOptimizedImageLoadingProps) => {
  const [placeImages, setPlaceImages] = useState<Map<string, PlaceImage>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);
  const loadedImagesRef = useRef<Set<string>>(new Set());

  // Get cache key for a place
  const getCacheKey = useCallback((placeName: string) => {
    return `place_image_${destinationName}_${placeName}`.replace(/\s+/g, '_').toLowerCase();
  }, [destinationName]);

  // Load cached images from localStorage
  const loadFromCache = useCallback((): ImageCache => {
    try {
      const cached = localStorage.getItem('place_images_cache');
      if (cached) {
        const cache: ImageCache = JSON.parse(cached);
        const now = Date.now();
        
        // Filter out expired entries
        const validCache: ImageCache = {};
        Object.entries(cache).forEach(([key, value]) => {
          if (now - value.timestamp < CACHE_DURATION) {
            validCache[key] = value;
          }
        });
        
        // Save cleaned cache
        localStorage.setItem('place_images_cache', JSON.stringify(validCache));
        return validCache;
      }
    } catch (error) {
      console.warn('Error loading image cache:', error);
    }
    return {};
  }, []);

  // Save image to cache
  const saveToCache = useCallback((placeName: string, imageUrl: string) => {
    try {
      const cache = loadFromCache();
      const cacheKey = getCacheKey(placeName);
      
      cache[cacheKey] = {
        url: imageUrl,
        timestamp: Date.now()
      };
      
      localStorage.setItem('place_images_cache', JSON.stringify(cache));
    } catch (error) {
      console.warn('Error saving to cache:', error);
    }
  }, [getCacheKey, loadFromCache]);

  // Fetch place image from Google Places API with improved error handling
  const fetchPlaceImage = useCallback(async (
    placeName: string,
    destinationName: string,
    signal?: AbortSignal
  ): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!isGoogleMapsAvailable()) {
        resolve(null);
        return;
      }

      try {
        const service = new window.google.maps.places.PlacesService(
          document.createElement("div")
        );

        const request = {
          query: `${placeName} ${destinationName} Sri Lanka`,
          fields: ["place_id", "name", "photos"],
        };

        const timeout = setTimeout(() => {
          resolve(null);
        }, 8000); // 8 second timeout

        service.textSearch(request, (results, status) => {
          clearTimeout(timeout);
          
          if (signal?.aborted) {
            resolve(null);
            return;
          }

          try {
            if (
              status === window.google.maps.places.PlacesServiceStatus.OK &&
              results &&
              results[0] &&
              results[0].photos &&
              results[0].photos.length > 0
            ) {
              const photoUrl = results[0].photos[0].getUrl({
                maxWidth: 400,
                maxHeight: 300,
              });
              resolve(photoUrl);
            } else {
              resolve(null);
            }
          } catch (error) {
            resolve(null);
          }
        });
      } catch (error) {
        resolve(null);
      }
    });
  }, [isGoogleMapsAvailable]);

  // Load images with batching and prioritization
  const loadPlaceImages = useCallback(async () => {
    if (!places.length) return;

    // Cancel any previous requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const cache = loadFromCache();
    
    // Initialize all places with placeholders
    const initialImageMap = new Map<string, PlaceImage>();
    places.forEach((place) => {
      const cacheKey = getCacheKey(place);
      const cachedImage = cache[cacheKey];
      
      initialImageMap.set(place, {
        placeName: place,
        imageUrl: cachedImage?.url || null,
        isLoading: !cachedImage,
        placeholder: generatePlaceholderPattern(place)
      });
    });
    setPlaceImages(initialImageMap);

    try {
      await waitForGoogleMaps();
    } catch (error) {
      console.warn("Google Maps not available, using placeholders");
      return;
    }

    // Load images for places that aren't cached
    const placesToLoad = places.filter(place => {
      const cacheKey = getCacheKey(place);
      return !cache[cacheKey] && !loadedImagesRef.current.has(place);
    });

    // Load images in parallel with concurrency limit
    const concurrency = 3; // Load max 3 images at once
    for (let i = 0; i < placesToLoad.length; i += concurrency) {
      const batch = placesToLoad.slice(i, i + concurrency);
      
      const promises = batch.map(async (place) => {
        if (abortControllerRef.current?.signal.aborted) return;
        
        try {
          const imageUrl = await fetchPlaceImage(
            place, 
            destinationName, 
            abortControllerRef.current?.signal
          );

          if (abortControllerRef.current?.signal.aborted) return;

          setPlaceImages((prevMap) => {
            const newMap = new Map(prevMap);
            const current = newMap.get(place);
            if (current) {
              newMap.set(place, {
                ...current,
                imageUrl,
                isLoading: false,
                error: imageUrl ? undefined : 'Failed to load image'
              });
            }
            return newMap;
          });

          if (imageUrl) {
            saveToCache(place, imageUrl);
            loadedImagesRef.current.add(place);
          }
        } catch (error) {
          console.warn(`Failed to load image for ${place}:`, error);
          
          setPlaceImages((prevMap) => {
            const newMap = new Map(prevMap);
            const current = newMap.get(place);
            if (current) {
              newMap.set(place, {
                ...current,
                imageUrl: null,
                isLoading: false,
                error: 'Failed to load image'
              });
            }
            return newMap;
          });
        }
      });

      await Promise.allSettled(promises);
      
      // Add delay between batches to avoid rate limiting
      if (i + concurrency < placesToLoad.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
  }, [
    places, 
    destinationName, 
    fetchPlaceImage, 
    getCacheKey, 
    loadFromCache, 
    saveToCache, 
    waitForGoogleMaps
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    placeImages,
    loadPlaceImages,
    isLoading: Array.from(placeImages.values()).some(img => img.isLoading)
  };
};

export default useOptimizedImageLoading;
