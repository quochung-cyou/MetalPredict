export async function fetchLSTMPredictionData(startDate: string, endDate: string) {
  const response = await fetch(`http://localhost:8000/predict/lstm?start_date=${startDate}&end_date=${endDate}`);
  if (!response.ok) {
    throw new Error('Failed to fetch LSTM prediction data');
  }
  return response.json();
}

export async function fetchProphetPredictionData(startDate: string, endDate: string) {
  //end date lower 1 day
  let date = new Date(endDate);
  date.setDate(date.getDate() - 1);
  endDate = date.toISOString().split('T')[0];
  const response = await fetch(`http://localhost:8000/predict/prophet?start_date=${startDate}&end_date=${endDate}`);
  if (!response.ok) {
    throw new Error('Failed to fetch Prophet prediction data');
  }
  return response.json();
}

export const DATE_RANGES = {
  '1M': { label: '1 Month', days: 30 },
  '6M': { label: '6 Months', days: 180 },
  '1Y': { label: '1 Year', days: 365 },
  '2Y': { label: '2 Years', days: 728 },
} as const;

export const ALLOWED_DATE_RANGE = {
  start: new Date('2021-01-01'),
  end: new Date('2022-12-31')
};

export async function fetchScatterData() {
  const response = await fetch('http://localhost:8000/api/scatter');
  if (!response.ok) {
    throw new Error('Failed to fetch scatter data');
  }
  return response.json();
}

export async function fetchHistogramData() {
  const response = await fetch('http://localhost:8000/api/histogram');
  if (!response.ok) {
    throw new Error('Failed to fetch histogram data');
  }
  return response.json();
}

export async function fetchHeatmapData() {
  const response = await fetch('http://localhost:8000/api/heatmap');
  if (!response.ok) {
    throw new Error('Failed to fetch heatmap data');
  }
  return response.json();
}
