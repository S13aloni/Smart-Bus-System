#!/usr/bin/env python3
"""
Smart Bus System - Demand Prediction Model Training
This script trains machine learning models for passenger demand prediction.
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import joblib
import json
import logging
from pathlib import Path
from typing import Dict, List, Tuple, Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DemandModelTrainer:
    """Train demand prediction models for the Smart Bus System"""
    
    def __init__(self):
        self.models_dir = Path("models")
        self.models_dir.mkdir(exist_ok=True)
        
        # Model configurations
        self.config = {
            'sequence_length': 24,  # Hours of historical data
            'prediction_hours': 24,  # Hours to predict ahead
            'test_size': 0.2,
            'validation_size': 0.1,
            'random_state': 42
        }
    
    def generate_training_data(self, days: int = 90) -> pd.DataFrame:
        """Generate synthetic training data for demonstration"""
        logger.info(f"Generating {days} days of training data...")
        
        # Generate timestamps
        start_date = datetime.now() - timedelta(days=days)
        timestamps = pd.date_range(start=start_date, periods=days*24, freq='H')
        
        data = []
        
        for i, timestamp in enumerate(timestamps):
            hour = timestamp.hour
            day_of_week = timestamp.weekday()
            month = timestamp.month
            
            # Generate realistic passenger demand patterns
            base_demand = self._calculate_base_demand(hour, day_of_week, month)
            
            # Add some randomness
            noise = np.random.normal(0, base_demand * 0.1)
            passenger_count = max(0, int(base_demand + noise))
            
            # Generate features
            features = {
                'timestamp': timestamp,
                'hour': hour,
                'day_of_week': day_of_week,
                'month': month,
                'is_weekend': day_of_week >= 5,
                'is_peak_hour': hour in [7, 8, 17, 18],
                'is_holiday': self._is_holiday(timestamp),
                'temperature': self._generate_temperature(hour, month),
                'precipitation': self._generate_precipitation(month),
                'passenger_count': passenger_count,
                'route_id': np.random.choice([1, 2, 3, 4, 5, 6])  # 6 routes
            }
            
            data.append(features)
        
        df = pd.DataFrame(data)
        
        # Add lag features
        df = self._add_lag_features(df)
        
        # Add rolling averages
        df = self._add_rolling_features(df)
        
        logger.info(f"Generated {len(df)} training samples")
        return df
    
    def _calculate_base_demand(self, hour: int, day_of_week: int, month: int) -> int:
        """Calculate base demand based on time patterns"""
        # Peak hours (7-9 AM, 5-7 PM)
        if hour in [7, 8, 17, 18]:
            base = 35
        # Moderate hours (6-7 AM, 9-10 AM, 4-5 PM, 7-8 PM)
        elif hour in [6, 9, 16, 19]:
            base = 25
        # Off-peak hours
        elif 6 <= hour <= 22:
            base = 15
        # Night hours
        else:
            base = 5
        
        # Weekend adjustment
        if day_of_week >= 5:  # Weekend
            base = int(base * 0.7)
        
        # Seasonal adjustment
        if month in [12, 1, 2]:  # Winter
            base = int(base * 1.1)
        elif month in [6, 7, 8]:  # Summer
            base = int(base * 0.9)
        
        return base
    
    def _is_holiday(self, timestamp: datetime) -> bool:
        """Check if date is a holiday (simplified)"""
        # Simple holiday logic - you can expand this
        holidays = [
            (1, 1),   # New Year
            (8, 15),  # Independence Day
            (10, 2),  # Gandhi Jayanti
            (12, 25), # Christmas
        ]
        return (timestamp.month, timestamp.day) in holidays
    
    def _generate_temperature(self, hour: int, month: int) -> float:
        """Generate realistic temperature based on hour and month"""
        # Base temperature by month (Ahmedabad climate)
        monthly_temp = {
            1: 20, 2: 22, 3: 28, 4: 32, 5: 35, 6: 33,
            7: 30, 8: 29, 9: 30, 10: 28, 11: 24, 12: 21
        }
        
        base_temp = monthly_temp.get(month, 25)
        
        # Daily variation (cooler at night, warmer during day)
        daily_variation = 8 * np.sin((hour - 6) * np.pi / 12)
        
        # Add some randomness
        noise = np.random.normal(0, 2)
        
        return base_temp + daily_variation + noise
    
    def _generate_precipitation(self, month: int) -> float:
        """Generate precipitation based on month (monsoon season)"""
        # Monsoon months (June-September)
        if month in [6, 7, 8, 9]:
            return np.random.exponential(2.0)  # Higher chance of rain
        else:
            return np.random.exponential(0.5)  # Lower chance of rain
    
    def _add_lag_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Add lag features for time series prediction"""
        # Lag 1 hour
        df['passenger_count_lag_1'] = df['passenger_count'].shift(1)
        
        # Lag 24 hours (same time yesterday)
        df['passenger_count_lag_24'] = df['passenger_count'].shift(24)
        
        # Lag 168 hours (same time last week)
        df['passenger_count_lag_168'] = df['passenger_count'].shift(168)
        
        return df
    
    def _add_rolling_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Add rolling average features"""
        # 24-hour rolling average
        df['passenger_avg_24h'] = df['passenger_count'].rolling(24).mean()
        
        # 7-day rolling average
        df['passenger_avg_7d'] = df['passenger_count'].rolling(168).mean()
        
        # 24-hour rolling standard deviation
        df['passenger_std_24h'] = df['passenger_count'].rolling(24).std()
        
        return df
    
    def prepare_training_data(self, df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """Prepare data for model training"""
        logger.info("Preparing training data...")
        
        # Select features
        feature_columns = [
            'hour', 'day_of_week', 'month', 'is_weekend', 'is_peak_hour',
            'is_holiday', 'temperature', 'precipitation',
            'passenger_count_lag_1', 'passenger_count_lag_24', 'passenger_count_lag_168',
            'passenger_avg_24h', 'passenger_avg_7d', 'passenger_std_24h'
        ]
        
        # Remove rows with NaN values (from lag features)
        df_clean = df.dropna()
        
        X = df_clean[feature_columns].values
        y = df_clean['passenger_count'].values
        
        logger.info(f"Prepared {len(X)} samples with {len(feature_columns)} features")
        return X, y
    
    def train_simple_model(self, X: np.ndarray, y: np.ndarray) -> Dict:
        """Train a simple linear regression model"""
        from sklearn.linear_model import LinearRegression
        from sklearn.model_selection import train_test_split
        from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
        
        logger.info("Training simple linear regression model...")
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=self.config['test_size'], 
            random_state=self.config['random_state']
        )
        
        # Train model
        model = LinearRegression()
        model.fit(X_train, y_train)
        
        # Make predictions
        y_pred = model.predict(X_test)
        
        # Calculate metrics
        mae = mean_absolute_error(y_test, y_pred)
        mse = mean_squared_error(y_test, y_pred)
        rmse = np.sqrt(mse)
        r2 = r2_score(y_test, y_pred)
        
        metrics = {
            'mae': mae,
            'mse': mse,
            'rmse': rmse,
            'r2_score': r2,
            'accuracy': 1 - (mae / np.mean(y_test))
        }
        
        logger.info(f"Model metrics: MAE={mae:.2f}, RMSE={rmse:.2f}, R²={r2:.2f}")
        
        return {
            'model': model,
            'metrics': metrics,
            'feature_names': [
                'hour', 'day_of_week', 'month', 'is_weekend', 'is_peak_hour',
                'is_holiday', 'temperature', 'precipitation',
                'passenger_count_lag_1', 'passenger_count_lag_24', 'passenger_count_lag_168',
                'passenger_avg_24h', 'passenger_avg_7d', 'passenger_std_24h'
            ]
        }
    
    def train_advanced_model(self, X: np.ndarray, y: np.ndarray) -> Dict:
        """Train an advanced Random Forest model"""
        try:
            from sklearn.ensemble import RandomForestRegressor
            from sklearn.model_selection import train_test_split, cross_val_score
            from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
            
            logger.info("Training Random Forest model...")
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=self.config['test_size'], 
                random_state=self.config['random_state']
            )
            
            # Train model
            model = RandomForestRegressor(
                n_estimators=100,
                max_depth=10,
                min_samples_split=5,
                min_samples_leaf=2,
                random_state=self.config['random_state']
            )
            model.fit(X_train, y_train)
            
            # Make predictions
            y_pred = model.predict(X_test)
            
            # Calculate metrics
            mae = mean_absolute_error(y_test, y_pred)
            mse = mean_squared_error(y_test, y_pred)
            rmse = np.sqrt(mse)
            r2 = r2_score(y_test, y_pred)
            
            # Cross-validation
            cv_scores = cross_val_score(model, X, y, cv=5, scoring='neg_mean_absolute_error')
            cv_mae = -cv_scores.mean()
            
            metrics = {
                'mae': mae,
                'mse': mse,
                'rmse': rmse,
                'r2_score': r2,
                'cv_mae': cv_mae,
                'accuracy': 1 - (mae / np.mean(y_test))
            }
            
            logger.info(f"Model metrics: MAE={mae:.2f}, RMSE={rmse:.2f}, R²={r2:.2f}, CV MAE={cv_mae:.2f}")
            
            # Feature importance
            feature_importance = model.feature_importances_
            feature_names = [
                'hour', 'day_of_week', 'month', 'is_weekend', 'is_peak_hour',
                'is_holiday', 'temperature', 'precipitation',
                'passenger_count_lag_1', 'passenger_count_lag_24', 'passenger_count_lag_168',
                'passenger_avg_24h', 'passenger_avg_7d', 'passenger_std_24h'
            ]
            
            importance_dict = dict(zip(feature_names, feature_importance))
            
            return {
                'model': model,
                'metrics': metrics,
                'feature_importance': importance_dict,
                'feature_names': feature_names
            }
            
        except ImportError:
            logger.warning("scikit-learn not available, falling back to simple model")
            return self.train_simple_model(X, y)
    
    def save_model(self, model_data: Dict, model_name: str = "demand_model"):
        """Save trained model and metadata"""
        logger.info(f"Saving model as {model_name}...")
        
        # Save model
        model_path = self.models_dir / f"{model_name}.pkl"
        joblib.dump(model_data['model'], model_path)
        
        # Save metadata
        metadata = {
            'model_name': model_name,
            'training_date': datetime.now().isoformat(),
            'metrics': model_data['metrics'],
            'feature_names': model_data['feature_names'],
            'config': self.config
        }
        
        if 'feature_importance' in model_data:
            metadata['feature_importance'] = model_data['feature_importance']
        
        metadata_path = self.models_dir / f"{model_name}_metadata.json"
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        logger.info(f"Model saved to {model_path}")
        logger.info(f"Metadata saved to {metadata_path}")
    
    def run_training(self, days: int = 90, use_advanced: bool = True):
        """Run complete training pipeline"""
        logger.info("Starting demand prediction model training...")
        
        # Generate training data
        df = self.generate_training_data(days)
        
        # Prepare data
        X, y = self.prepare_training_data(df)
        
        # Train model
        if use_advanced:
            model_data = self.train_advanced_model(X, y)
        else:
            model_data = self.train_simple_model(X, y)
        
        # Save model
        self.save_model(model_data)
        
        logger.info("Training completed successfully!")
        return model_data

def main():
    """Main training function"""
    trainer = DemandModelTrainer()
    
    # Train with 90 days of data
    model_data = trainer.run_training(days=90, use_advanced=True)
    
    print("\n" + "="*50)
    print("TRAINING COMPLETED SUCCESSFULLY!")
    print("="*50)
    print(f"Model Accuracy: {model_data['metrics']['accuracy']:.2%}")
    print(f"MAE: {model_data['metrics']['mae']:.2f}")
    print(f"RMSE: {model_data['metrics']['rmse']:.2f}")
    print(f"R² Score: {model_data['metrics']['r2_score']:.2f}")
    
    if 'feature_importance' in model_data:
        print("\nTop 5 Most Important Features:")
        sorted_features = sorted(
            model_data['feature_importance'].items(), 
            key=lambda x: x[1], 
            reverse=True
        )
        for feature, importance in sorted_features[:5]:
            print(f"  {feature}: {importance:.3f}")

if __name__ == "__main__":
    main()
