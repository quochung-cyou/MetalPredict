import axios from 'axios';
import { saveToCache, getFromCache } from './cache';

const API_KEY = ''; // Users need to get this from polygon.io
const BASE_URL = 'https://api.polygon.io/v2/aggs/ticker';

export interface MetalPrice {
  v: number;    // volume
  vw: number;   // volume weighted average price
  o: number;    // open price
  c: number;    // close price
  h: number;    // high price
  l: number;    // low price
  t: number;    // timestamp
  n: number;    // number of transactions
}

export const fetchGoldPrices = async () => {
  const cacheKey = 'gold-prices';
  const cachedData = getFromCache(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }

  const response = await axios.get(
    `${BASE_URL}/C:XAUUSD/range/1/day/2023-01-09/2024-02-10?adjusted=true&sort=asc&apiKey=${API_KEY}`
  );
  
  const data = response.data.results as MetalPrice[];
  saveToCache(cacheKey, data);
  
  return data;
};

export const fetchSilverPrices = async () => {
  const cacheKey = 'silver-prices';
  const cachedData = getFromCache(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }

  const response = await axios.get(
    `${BASE_URL}/C:XAGUSD/range/1/day/2023-01-09/2024-02-10?adjusted=true&sort=asc&apiKey=${API_KEY}`
  );
  
  const data = response.data.results as MetalPrice[];
  saveToCache(cacheKey, data);
  
  return data;
};