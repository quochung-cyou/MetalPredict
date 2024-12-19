const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

export async function fetchCryptoData() {
  const response = await fetch(`${COINGECKO_BASE_URL}/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_vol=true&include_24hr_change=true&include_market_cap=true`);
  if (!response.ok) throw new Error('Failed to fetch crypto data');
  return response.json();
}

export async function fetchCryptoHistory(coinId: string, days: number) {
  const response = await fetch(`${COINGECKO_BASE_URL}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`);
  if (!response.ok) throw new Error('Failed to fetch crypto history');
  return response.json();
}

export async function fetchTopCryptos() {
  const response = await fetch(`${COINGECKO_BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=3&page=1&sparkline=true`);
  if (!response.ok) throw new Error('Failed to fetch top cryptos');
  return response.json();
}