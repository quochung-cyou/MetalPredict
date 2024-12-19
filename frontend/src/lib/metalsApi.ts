import axios from 'axios';

const METALS_API_KEY = '';
const BASE_URL = 'https://metals-api.com/api';

export interface MetalPrice {
  price: number;
  change: number;
  change_pct: number;
}

export interface MetalsData {
  success: boolean;
  rates: {
    XAU: number; // Gold
    XAG: number; // Silver
    XPT: number; // Platinum
    XPD: number; // Palladium
  };
}

export const fetchMetalsPrices = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/latest?access_key=${METALS_API_KEY}&base=USD&symbols=XAU,XAG,XPT,XPD`);
    return response.data;
  } catch (error) {
    console.error('Error fetching metals prices:', error);
    throw error;
  }
};

export const fetchMetalsTimeseries = async (startDate: string, endDate: string) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/timeseries?access_key=${METALS_API_KEY}&start_date=${startDate}&end_date=${endDate}&base=USD&symbols=XAU,XAG`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching metals timeseries:', error);
    throw error;
  }
};