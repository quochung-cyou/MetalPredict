import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.figure import Figure
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
import tkinter as tk
from tkinter import ttk
from datetime import datetime
import logging
import seaborn as sns

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('metal_analysis.log'),
        logging.StreamHandler()
    ]
)

class PriceScatterWindow(tk.Toplevel):
    def __init__(self, gold_df, silver_df):
        super().__init__()
        logging.info("Initializing Price Scatter Window")
        
        self.title("Gold & Silver Price Analysis - Time Series Scatter Plot")
        self.geometry("800x600")
        
        fig = Figure(figsize=(12, 8), dpi=100)
        ax1 = fig.add_subplot(111)
        
        try:
            # Plot gold prices
            ax1.scatter(gold_df['Date'], gold_df['Price'], 
                       color='gold', alpha=0.6, s=30, label='Gold Price')
            ax1.set_ylabel('Gold Price (USD)', color='goldenrod')
            ax1.tick_params(axis='y', labelcolor='goldenrod')
            
            # Create second y-axis for silver
            ax2 = ax1.twinx()
            ax2.scatter(silver_df['Date'], silver_df['Price'],
                       color='silver', alpha=0.6, s=30, label='Silver Price')
            ax2.set_ylabel('Silver Price (USD)', color='gray')
            ax2.tick_params(axis='y', labelcolor='gray')

            ax1.set_title('Gold and Silver Prices (2013-2023)', pad=20)
            ax1.grid(True, alpha=0.3)
            ax1.set_xlabel('Date')
            
            fig.autofmt_xdate()
            
            lines1, labels1 = ax1.get_legend_handles_labels()
            lines2, labels2 = ax2.get_legend_handles_labels()
            ax1.legend(lines1 + lines2, labels1 + labels2, loc='upper left')
            
            fig.tight_layout()
            logging.info("Successfully created price scatter plot")
            
        except Exception as e:
            logging.error(f"Error in creating price scatter plot: {str(e)}")
            
        canvas = FigureCanvasTkAgg(fig, self)
        canvas.draw()
        canvas.get_tk_widget().pack(fill=tk.BOTH, expand=True)

class HistogramWindow(tk.Toplevel):
    def __init__(self, gold_df, silver_df):
        super().__init__()
        logging.info("Initializing Histogram Window")
        
        self.title("Gold & Silver Price Analysis - Return Distribution Histogram")
        self.geometry("800x600")
        
        fig = Figure(figsize=(12, 8), dpi=100)
        ax = fig.add_subplot(111)
        
        try:
            # Calculate returns
            gold_returns = gold_df['Price'].pct_change().dropna() * 100
            silver_returns = silver_df['Price'].pct_change().dropna() * 100
            
            # Create overlapping histograms
            ax.hist(gold_returns, bins=50, alpha=0.5, color='gold', 
                   label='Gold Daily Returns', density=True)
            ax.hist(silver_returns, bins=50, alpha=0.5, color='silver',
                   label='Silver Daily Returns', density=True)

            ax.set_title('Distribution of Daily Returns', pad=20)
            ax.set_xlabel('Daily Returns (%)')
            ax.set_ylabel('Density')
            ax.legend()
            ax.grid(True, alpha=0.3)
            
            fig.tight_layout()
            logging.info("Successfully created histogram plot")
            
        except Exception as e:
            logging.error(f"Error in creating histogram plot: {str(e)}")
        
        canvas = FigureCanvasTkAgg(fig, self)
        canvas.draw()
        canvas.get_tk_widget().pack(fill=tk.BOTH, expand=True)

class HeatmapWindow(tk.Toplevel):
    def __init__(self, gold_df, silver_df):
        super().__init__()
        logging.info("Initializing Heatmap Window")
        
        self.title("Gold & Silver Price Analysis - Correlation Heatmap")
        self.geometry("1000x800")
        
        fig = Figure(figsize=(12, 10), dpi=100)
        ax = fig.add_subplot(111)
        
        try:
            # Prepare data for correlation
            metrics = ['Price', 'Open', 'High', 'Low', 'Change %']
            gold_data = gold_df[metrics].copy()
            silver_data = silver_df[metrics].copy()
            
            # Rename columns
            gold_data.columns = ['Gold_' + col for col in metrics]
            silver_data.columns = ['Silver_' + col for col in metrics]
            
            # Combine and correlate
            combined = pd.concat([gold_data, silver_data], axis=1)
            corr_matrix = combined.corr()
            
            # Create heatmap using imshow
            im = ax.imshow(corr_matrix.values, cmap='RdYlBu', aspect='auto')
            
            # Add colorbar
            fig.colorbar(im)
            
            # Configure axes
            ax.set_xticks(np.arange(len(corr_matrix.columns)))
            ax.set_yticks(np.arange(len(corr_matrix.columns)))
            ax.set_xticklabels(corr_matrix.columns, rotation=45, ha='right')
            ax.set_yticklabels(corr_matrix.columns)
            
            # Add correlation values
            for i in range(len(corr_matrix.columns)):
                for j in range(len(corr_matrix.columns)):
                    text = ax.text(j, i, f'{corr_matrix.iloc[i, j]:.2f}',
                                 ha='center', va='center',
                                 color='black' if abs(corr_matrix.iloc[i, j]) < 0.7 else 'white')
            
            ax.set_title('Correlation Heatmap of Gold and Silver Metrics')
            fig.tight_layout()
            logging.info("Successfully created heatmap")
            
        except Exception as e:
            logging.error(f"Error in creating heatmap: {str(e)}")
        
        canvas = FigureCanvasTkAgg(fig, self)
        canvas.draw()
        canvas.get_tk_widget().pack(fill=tk.BOTH, expand=True)

def load_and_clean_data(file_path):
    """Load and clean data from CSV file"""
    logging.info(f"Loading data from {file_path}")
    try:
        df = pd.read_csv(file_path)
        
        # Convert date
        df['Date'] = pd.to_datetime(df['Date'], format='%m/%d/%Y')
        
        # Clean numeric columns
        for col in ['Price', 'Open', 'High', 'Low']:
            df[col] = df[col].apply(lambda x: float(str(x).replace(',', '')))
        
        # Clean volume
        df['Vol.'] = df['Vol.'].apply(clean_volume)
        
        # Clean percentage
        df['Change %'] = df['Change %'].apply(lambda x: float(str(x).replace('%', '')))
        
        logging.info(f"Successfully cleaned data from {file_path}")
        return df
        
    except Exception as e:
        logging.error(f"Error loading {file_path}: {str(e)}")
        raise

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

def main():
    logging.info("Starting application")
    try:
        # Load data
        gold_df = load_and_clean_data('gold.csv')
        silver_df = load_and_clean_data('silver.csv')
        
        # Create root window (hidden)
        root = tk.Tk()
        root.withdraw()
        
        # Create visualization windows
        scatter_window = PriceScatterWindow(gold_df, silver_df)
        histogram_window = HistogramWindow(gold_df, silver_df)
        heatmap_window = HeatmapWindow(gold_df, silver_df)
        
        logging.info("All windows created successfully")
        root.mainloop()
        
    except Exception as e:
        logging.error(f"Error in main application: {str(e)}")

if __name__ == "__main__":
    main()