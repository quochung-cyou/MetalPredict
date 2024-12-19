import os
import numpy as np
import pandas as pd
import joblib
from typing import List, Dict, Optional
from datetime import datetime, timedelta

import uvicorn
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import tensorflow as tf
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_percentage_error
from prophet import Prophet
from fastapi.responses import JSONResponse
import logging


# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('metal_analysis.log'),
        logging.StreamHandler()
    ]
)

# Suppress TensorFlow logging
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
tf.get_logger().setLevel('ERROR')

class PricePrediction(BaseModel):
    date: str
    actual_price: Optional[float] = None
    predicted_price: float
    predicted_price_low: Optional[float] = None
    predicted_price_high: Optional[float] = None

class GoldPricePredictor:
    def __init__(self, 
                 data_path='data.csv', 
                 model_path='gold_price_model.joblib', 
                 scaler_path='gold_price_scaler.joblib',
                 predictions_path='gold_predictions.joblib'):
        self.data_path = data_path
        self.model_path = model_path
        self.scaler_path = scaler_path
        self.predictions_path = predictions_path
        self.window_size = 356 * 2
        self.model = None
        self.scaler = None
        self.df = None
        
    def _preprocess_data(self):
        # Load and preprocess data
        df = pd.read_csv(self.data_path)
        df.drop(['Vol.', 'Change %'], axis=1, inplace=True)
        df['Date'] = pd.to_datetime(df['Date'])
        df.sort_values(by='Date', ascending=True, inplace=True)
        df.reset_index(drop=True, inplace=True)
        
        # Convert price columns
        num_cols = df.columns.drop(['Date'])
        df[num_cols] = df[num_cols].replace({',': ''}, regex=True).astype('float64')
        
        return df
    
    def _prepare_data(self, df, test_ratio=0.2):
        # Scale the data
        scaler = MinMaxScaler()
        scaled_prices = scaler.fit_transform(df.Price.values.reshape(-1, 1))
        
        # Prepare data with sliding window
        X, y = [], []
        for i in range(self.window_size, len(scaled_prices)):
            X.append(scaled_prices[i-self.window_size:i, 0])
            y.append(scaled_prices[i, 0])

        # Convert to numpy arrays and reshape
        X = np.array(X).reshape(-1, self.window_size, 1)
        y = np.array(y).reshape(-1, 1)
        
        return X, y, scaler
    
    def _create_model(self):
        # Deterministic for reproducibility
        tf.random.set_seed(42)
        np.random.seed(42)
        
        input1 = tf.keras.layers.Input(shape=(self.window_size, 1))
        x = tf.keras.layers.LSTM(64, return_sequences=True)(input1)
        x = tf.keras.layers.Dropout(0.2)(x)
        x = tf.keras.layers.LSTM(64, return_sequences=True)(x)
        x = tf.keras.layers.Dropout(0.2)(x)
        x = tf.keras.layers.LSTM(64)(x)
        x = tf.keras.layers.Dropout(0.2)(x)
        x = tf.keras.layers.Dense(32, activation='relu')(x)
        output = tf.keras.layers.Dense(1)(x)

        model = tf.keras.Model(inputs=input1, outputs=output)
        model.compile(loss='mean_squared_error', optimizer='Nadam')
        return model
    
    def train(self, force_retrain=False):
        # Check if model already exists and training is not forced
        if not force_retrain and os.path.exists(self.model_path) and os.path.exists(self.scaler_path):
            print("Existing model found. Skipping training.")
            return
        
        # Load and preprocess data
        self.df = self._preprocess_data()
        
        # Prepare data
        X, y, scaler = self._prepare_data(self.df)
        
        # Create and train model
        self.model = self._create_model()
        history = self.model.fit(
            X, y, 
            epochs=150, 
            batch_size=32, 
            validation_split=0.1, 
            verbose=0
        )
        
        # Save model and scaler
        joblib.dump(self.model, self.model_path)
        joblib.dump(scaler, self.scaler_path)
        
        return history
    
    def predict(self, 
                start_date: Optional[str] = None, 
                end_date: Optional[str] = None, 
                regenerate: bool = False):
        """
        Predict prices for a specific date range
        Args:
            start_date: Start date for predictions (optional)
            end_date: End date for predictions (optional)
            regenerate: Force regeneration of predictions
        """
        # Check if predictions exist and regeneration is not forced
        if not regenerate and os.path.exists(self.predictions_path):
            all_predictions = joblib.load(self.predictions_path)
            
            # Filter predictions by date range if specified
            if start_date or end_date:
                filtered_predictions = []
                for pred in all_predictions:
                    pred_date = datetime.strptime(pred['date'], '%Y-%m-%d')
                    
                    # Apply start date filter
                    if start_date:
                        start = datetime.strptime(start_date, '%Y-%m-%d')
                        if pred_date < start:
                            continue

                    
                    # Apply end date filter
                    if end_date:
                        end = datetime.strptime(end_date, '%Y-%m-%d')
                        if pred_date > end:
                            continue
                    
                    filtered_predictions.append(pred)
                
                return filtered_predictions
            
            return all_predictions
        
        # Load model and scaler
        if not os.path.exists(self.model_path) or not os.path.exists(self.scaler_path):
            raise ValueError("Model not trained. Please train first.")
        
        self.model = joblib.load(self.model_path)
        scaler = joblib.load(self.scaler_path)
        
        # Preprocess data if not already done
        if self.df is None:
            self.df = self._preprocess_data()
        
        # Prepare full data
        X, y, _ = self._prepare_data(self.df)
        
        # Predict for entire dataset
        y_pred = self.model.predict(X)
        
        # Inverse transform
        y_true = scaler.inverse_transform(y)
        y_pred_orig = scaler.inverse_transform(y_pred)
        
        # Create prediction results
        predictions = []
        for i in range(len(y_true)):
            # Calculate a confidence interval (simple approach)
            std_dev = np.std(y_pred_orig)
            low_price = y_pred_orig[i][0] - (std_dev * 0.5)
            high_price = y_pred_orig[i][0] + (std_dev * 0.5)
            
            predictions.append({
                'date': self.df['Date'].iloc[self.window_size+i].strftime('%Y-%m-%d'),
                'actual_price': float(y_true[i][0]),
                'predicted_price': float(y_pred_orig[i][0]),
                'predicted_price_low': float(low_price),
                'predicted_price_high': float(high_price)
            })
        
        # Cache predictions
        joblib.dump(predictions, self.predictions_path)
        
        # Apply date filtering if specified
        if start_date or end_date:
            filtered_predictions = []
            for pred in predictions:
                pred_date = datetime.strptime(pred['date'], '%Y-%m-%d')
                
                # Apply start date filter
                if start_date:
                    start = datetime.strptime(start_date, '%Y-%m-%d')
                    if pred_date < start:
                        continue
                
                # Apply end date filter
                if end_date:
                    end = datetime.strptime(end_date, '%Y-%m-%d')
                    if pred_date > end:
                        continue
                
                filtered_predictions.append(pred)
            
            return filtered_predictions
        
        return predictions

class ProphetPricePredictor:
    def __init__(self, 
                 data_path='data.csv', 
                 model_path='prophet_model.joblib',
                 predictions_path='prophet_predictions.joblib'):
        self.data_path = data_path
        self.model_path = model_path
        self.predictions_path = predictions_path
        self.model = None
        self.df = None
        
    def _preprocess_data(self):
        # Load and preprocess data
        df = pd.read_csv(self.data_path)
        df.drop(['Vol.', 'Change %', 'Open', 'High', 'Low'], axis=1, inplace=True)
        df['Date'] = pd.to_datetime(df['Date'])
        df.sort_values(by='Date', ascending=True, inplace=True)
        df.reset_index(drop=True, inplace=True)
        
        # Rename columns for Prophet
        df = df.rename(columns={'Date': 'ds', 'Price': 'y'})
        df['y'] = df['y'].replace({',': ''}, regex=True).astype('float64')
        
        return df
    
    def train(self, force_retrain=False):
        # Check if model already exists and training is not forced
        if not force_retrain and os.path.exists(self.model_path):
            print("Existing Prophet model found. Skipping training.")
            return
        
        # Load and preprocess data
        self.df = self._preprocess_data()
        
        # Create and train model
        self.model = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=True,
            daily_seasonality=True,
            changepoint_prior_scale=0.05
        )
        self.model.fit(self.df)
        
        # Save model
        joblib.dump(self.model, self.model_path)
        
    def predict(self, 
                start_date: Optional[str] = None, 
                end_date: Optional[str] = None, 
                regenerate: bool = False):
        """
        Predict prices using Prophet model
        """
        # Check if predictions exist and regeneration is not forced
        if not regenerate and os.path.exists(self.predictions_path):
            all_predictions = joblib.load(self.predictions_path)
            
            # Filter predictions by date range if specified
            if start_date or end_date:
                filtered_predictions = []
                for pred in all_predictions:
                    pred_date = datetime.strptime(pred['date'], '%Y-%m-%d')
                    
                    if start_date and pred_date < datetime.strptime(start_date, '%Y-%m-%d'):
                        continue
                    if end_date and pred_date > datetime.strptime(end_date, '%Y-%m-%d'):
                        continue
                    
                    filtered_predictions.append(pred)
                
                return filtered_predictions
            
            return all_predictions
        
        # Load model
        if not os.path.exists(self.model_path):
            raise ValueError("Prophet model not trained. Please train first.")
        
        self.model = joblib.load(self.model_path)
        
        # Preprocess data if not already done
        if self.df is None:
            self.df = self._preprocess_data()
        
        # Create future dataframe
        future = self.model.make_future_dataframe(periods=365)
        forecast = self.model.predict(future)
        
        # Create prediction results
        predictions = []
        for i, row in forecast.iterrows():
            if i < len(self.df):  # For historical dates
                predictions.append({
                    'date': row['ds'].strftime('%Y-%m-%d'),
                    'actual_price': float(self.df.iloc[i]['y']),
                    'predicted_price': float(row['yhat']),
                    'predicted_price_low': float(row['yhat_lower']),
                    'predicted_price_high': float(row['yhat_upper'])
                })
            else:  # For future dates
                predictions.append({
                    'date': row['ds'].strftime('%Y-%m-%d'),
                    'actual_price': None,
                    'predicted_price': float(row['yhat']),
                    'predicted_price_low': float(row['yhat_lower']),
                    'predicted_price_high': float(row['yhat_upper'])
                })
        
        # Cache predictions
        joblib.dump(predictions, self.predictions_path)
        
        # Apply date filtering if specified
        if start_date or end_date:
            filtered_predictions = []
            for pred in predictions:
                pred_date = datetime.strptime(pred['date'], '%Y-%m-%d')
                
                if start_date and pred_date < datetime.strptime(start_date, '%Y-%m-%d'):
                    continue
                if end_date and pred_date > datetime.strptime(end_date, '%Y-%m-%d'):
                    continue
                
                filtered_predictions.append(pred)
            
            return filtered_predictions
        
        return predictions

# Create FastAPI app
app = FastAPI(
    title="Gold Price Prediction API",
    description="Advanced AI-powered gold price prediction service",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Global predictor instances
lstm_predictor = GoldPricePredictor()
prophet_predictor = ProphetPricePredictor()

@app.on_event("startup")
async def startup_event():
    """
    Check if models exist, train if not
    """
    lstm_predictor.train()
    prophet_predictor.train()

def clean_volume(vol_str):
    """Clean volume strings"""
    try:
        if isinstance(vol_str, str):
            if 'K' in vol_str:
                return float(vol_str.replace('K', '')) * 1000
            elif vol_str.strip() == '':
                return np.nan
        return float(vol_str)
    except:
        return np.nan

def load_and_clean_data(file_path):
    """Load and clean data from CSV file"""
    logging.info(f"Loading data from {file_path}")
    try:
        df = pd.read_csv(file_path)
        
        # Convert date
        df['Date'] = pd.to_datetime(df['Date'])
        
        # Rename Close/Last to Price
        df = df.rename(columns={'Close/Last': 'Price'})
        
        # Clean numeric columns
        for col in ['Price', 'Open', 'High', 'Low']:
            df[col] = df[col].apply(lambda x: float(str(x).replace(',', '')))
        
        # Clean volume
        df['Volume'] = df['Volume'].apply(clean_volume)
        
        # Calculate price change percentage
        df['Change %'] = ((df['Price'] - df['Open']) / df['Open'] * 100).round(2)
        
        logging.info(f"Successfully cleaned data from {file_path}")
        return df
        
    except Exception as e:
        logging.error(f"Error loading {file_path}: {str(e)}")
        raise

@app.get("/api/scatter")
async def get_scatter_data():
    """
    Get data for the gold and silver price scatter plot.
    """
    try:
        gold_df = load_and_clean_data('gold.csv')
        silver_df = load_and_clean_data('silver.csv')
        
        gold_df['Date'] = gold_df['Date'].dt.strftime('%Y-%m-%d')
        silver_df['Date'] = silver_df['Date'].dt.strftime('%Y-%m-%d')
        
        scatter_data = {
            "gold": gold_df[['Date', 'Price']].to_dict(orient='records'),
            "silver": silver_df[['Date', 'Price']].to_dict(orient='records')
        }
        return JSONResponse(content=scatter_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/histogram")
async def get_histogram_data():
    """
    Get data for the distribution of gold and silver daily returns histogram.
    """
    try:
        gold_df = load_and_clean_data('gold.csv')
        silver_df = load_and_clean_data('silver.csv')
        
        gold_returns = gold_df['Price'].pct_change().dropna() * 100
        silver_returns = silver_df['Price'].pct_change().dropna() * 100
        
        histogram_data = {
            "gold_returns": gold_returns.tolist(),
            "silver_returns": silver_returns.tolist()
        }
        return JSONResponse(content=histogram_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/heatmap")
async def get_heatmap_data():
    """
    Get correlation data for the heatmap.
    """
    try:
        gold_df = load_and_clean_data('gold.csv')
        silver_df = load_and_clean_data('silver.csv')
        
        metrics = ['Price', 'Open', 'High', 'Low', 'Change %']
        gold_data = gold_df[metrics].copy()
        silver_data = silver_df[metrics].copy()
        
        gold_data.columns = ['Gold_' + col for col in metrics]
        silver_data.columns = ['Silver_' + col for col in metrics]
        
        combined = pd.concat([gold_data, silver_data], axis=1)
        corr_matrix = combined.corr().to_dict()
        
        return JSONResponse(content=corr_matrix)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/predict/lstm", response_model=List[PricePrediction])
async def get_lstm_predictions(
    start_date: Optional[str] = Query(None, description="Start date in YYYY-MM-DD format"),
    end_date: Optional[str] = Query(None, description="End date in YYYY-MM-DD format"),
    regenerate: bool = Query(False, description="Force regeneration of predictions")
):
    """
    Get gold price predictions using LSTM model
    """
    try:
        predictions = lstm_predictor.predict(
            start_date=start_date, 
            end_date=end_date, 
            regenerate=regenerate
        )
        return predictions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/predict/prophet", response_model=List[PricePrediction])
async def get_prophet_predictions(
    start_date: Optional[str] = Query(None, description="Start date in YYYY-MM-DD format"),
    end_date: Optional[str] = Query(None, description="End date in YYYY-MM-DD format"),
    regenerate: bool = Query(False, description="Force regeneration of predictions")
):
    """
    Get gold price predictions using Prophet model
    """
    try:
        predictions = prophet_predictor.predict(
            start_date=start_date, 
            end_date=end_date, 
            regenerate=regenerate
        )
        return predictions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/retrain/lstm")
async def retrain_lstm_model(force: bool = False):
    """
    Manually trigger LSTM model retraining
    """
    try:
        lstm_predictor.train(force_retrain=force)
        if os.path.exists(lstm_predictor.predictions_path):
            os.remove(lstm_predictor.predictions_path)
        return {"status": "LSTM model retrained successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/retrain/prophet")
async def retrain_prophet_model(force: bool = False):
    """
    Manually trigger Prophet model retraining
    """
    try:
        prophet_predictor.train(force_retrain=force)
        if os.path.exists(prophet_predictor.predictions_path):
            os.remove(prophet_predictor.predictions_path)
        return {"status": "Prophet model retrained successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)