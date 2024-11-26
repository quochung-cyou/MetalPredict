// API endpoints for future implementation
export const API_ENDPOINTS = {
  GOLD_PRICE: 'https://api.example.com/v1/gold-price', // Replace with actual API
  OIL_PRICE: 'https://api.example.com/v1/oil-price',   // Replace with actual API
  PREDICTIONS: 'https://api.example.com/v1/predictions' // Replace with ML model endpoint
};

// Recommended APIs for implementation:
// 1. Gold & Commodities: 
//    - Kitco API (https://www.kitco.com/api/)
//    - Gold API (https://goldapi.io/)
//    - Metals API (https://metals-api.com/)
// 2. Oil Prices:
//    - EIA API (https://www.eia.gov/opendata/)
//    - Oil Price API (https://oilpriceapi.com/)

export interface PriceData {
  timestamp: number;
  price: number;
  volume?: number;
}

export interface Prediction {
  timestamp: number;
  predictedPrice: number;
  confidence: number;
}

// Websocket connection for real-time updates
export const createWebSocketConnection = (onMessage: (data: any) => void) => {
  const ws = new WebSocket('wss://your-websocket-endpoint');
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessage(data);
  };
  
  return ws;
};