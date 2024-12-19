import { MetalPrice } from './commoditiesApi';

interface CacheData {
  timestamp: number;
  data: MetalPrice[];
}

export const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const saveToCache = (key: string, data: MetalPrice[]) => {
  try {
    const cacheData: CacheData = {
      timestamp: Date.now(),
      data
    };
    localStorage.setItem(key, JSON.stringify(cacheData));
  } catch (error) {
    console.warn('Failed to save to cache:', error);
  }
};

export const getFromCache = (key: string): MetalPrice[] | null => {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const cacheData: CacheData = JSON.parse(cached);
    const isExpired = Date.now() - cacheData.timestamp > CACHE_DURATION;
    console.log('Found in cache:', key, isExpired ? 'expired' : 'valid');
    
    return isExpired ? null : cacheData.data;
  } catch (error) {
    console.warn('Failed to read from cache:', error);
    return null;
  }
};