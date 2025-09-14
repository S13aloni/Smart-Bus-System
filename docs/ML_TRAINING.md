# 🤖 Machine Learning Model Training Guide

## Overview

This guide explains how to train and implement proper machine learning models for the Smart Bus Optimization System. Currently, the system uses simplified algorithms, but this guide shows how to implement advanced ML models for better predictions.

## 🎯 Current vs. Advanced ML Approach

### Current Implementation (Simplified)
- **Time Series Analysis**: Basic historical averages
- **Rule-based Logic**: Simple peak hour detection
- **Random Variation**: Basic noise addition
- **No Training**: Static algorithms

### Advanced ML Implementation
- **Supervised Learning**: Train on historical data
- **Feature Engineering**: Extract meaningful patterns
- **Model Validation**: Cross-validation and testing
- **Continuous Learning**: Retrain with new data

## 🏗️ ML Model Architecture

### 1. Demand Prediction Models

#### **Time Series Models**
- **ARIMA**: AutoRegressive Integrated Moving Average
- **LSTM**: Long Short-Term Memory networks
- **Prophet**: Facebook's forecasting tool
- **SARIMA**: Seasonal ARIMA

#### **Regression Models**
- **Random Forest**: Ensemble learning
- **XGBoost**: Gradient boosting
- **Linear Regression**: Baseline model
- **Support Vector Regression**: Non-linear patterns

### 2. Schedule Optimization Models

#### **Optimization Algorithms**
- **Genetic Algorithm**: Evolutionary optimization
- **Simulated Annealing**: Global optimization
- **Linear Programming**: Constraint optimization
- **Reinforcement Learning**: Dynamic optimization

## 📊 Training Data Preparation

### Data Sources

```python
# Historical data sources
training_data = {
    'ticket_sales': {
        'route_id': int,
        'passenger_count': int,
        'price': float,
        'timestamp': datetime,
        'stop_boarding': str,
        'stop_alighting': str
    },
    'passenger_counts': {
        'bus_id': int,
        'route_id': int,
        'occupancy': int,
        'timestamp': datetime
    },
    'gps_logs': {
        'bus_id': int,
        'latitude': float,
        'longitude': float,
        'speed': float,
        'direction': float,
        'timestamp': datetime
    },
    'external_factors': {
        'weather': str,
        'events': str,
        'holidays': bool,
        'day_of_week': int,
        'hour': int
    }
}
```

### Feature Engineering

```python
def create_features(df):
    """Create ML features from raw data"""
    
    # Time-based features
    df['hour'] = df['timestamp'].dt.hour
    df['day_of_week'] = df['timestamp'].dt.dayofweek
    df['month'] = df['timestamp'].dt.month
    df['is_weekend'] = df['day_of_week'].isin([5, 6])
    df['is_peak_hour'] = df['hour'].isin([7, 8, 17, 18])
    
    # Lag features
    df['passenger_count_lag_1'] = df['passenger_count'].shift(1)
    df['passenger_count_lag_24'] = df['passenger_count'].shift(24)
    
    # Rolling averages
    df['passenger_avg_7d'] = df['passenger_count'].rolling(168).mean()  # 7 days
    df['passenger_avg_24h'] = df['passenger_count'].rolling(24).mean()  # 24 hours
    
    # Weather features (if available)
    df['temperature'] = get_weather_data(df['timestamp'])
    df['precipitation'] = get_precipitation_data(df['timestamp'])
    
    # Event features
    df['is_holiday'] = df['timestamp'].apply(is_holiday)
    df['event_intensity'] = df['timestamp'].apply(get_event_intensity)
    
    return df
```

## 🚀 Implementation Guide

### 1. Enhanced ML Service Structure

Create the following files in `ml-service/`:

```
ml-service/
├── main.py                 # FastAPI application
├── models/                 # ML model implementations
│   ├── __init__.py
│   ├── demand_predictor.py
│   ├── schedule_optimizer.py
│   └── base_model.py
├── training/               # Model training scripts
│   ├── __init__.py
│   ├── train_demand.py
│   ├── train_optimizer.py
│   └── data_preprocessor.py
├── utils/                  # Utility functions
│   ├── __init__.py
│   ├── feature_engineering.py
│   ├── model_evaluator.py
│   └── data_loader.py
├── config/                 # Configuration files
│   ├── model_config.yaml
│   └── training_config.yaml
└── requirements.txt        # Dependencies
```

### 2. Demand Prediction Model

#### **LSTM Model Implementation**

```python
# ml-service/models/demand_predictor.py
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.optimizers import Adam
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error

class DemandPredictor:
    def __init__(self, sequence_length=24, features=10):
        self.sequence_length = sequence_length
        self.features = features
        self.scaler = MinMaxScaler()
        self.model = None
        
    def build_model(self):
        """Build LSTM model for demand prediction"""
        model = Sequential([
            LSTM(50, return_sequences=True, input_shape=(self.sequence_length, self.features)),
            Dropout(0.2),
            LSTM(50, return_sequences=True),
            Dropout(0.2),
            LSTM(50),
            Dropout(0.2),
            Dense(25),
            Dense(1)
        ])
        
        model.compile(
            optimizer=Adam(learning_rate=0.001),
            loss='mse',
            metrics=['mae']
        )
        
        self.model = model
        return model
    
    def prepare_data(self, df):
        """Prepare data for LSTM training"""
        # Select features
        feature_columns = [
            'hour', 'day_of_week', 'month', 'is_weekend', 'is_peak_hour',
            'passenger_count_lag_1', 'passenger_count_lag_24',
            'passenger_avg_7d', 'passenger_avg_24h', 'temperature'
        ]
        
        # Scale features
        scaled_data = self.scaler.fit_transform(df[feature_columns])
        
        # Create sequences
        X, y = [], []
        for i in range(self.sequence_length, len(scaled_data)):
            X.append(scaled_data[i-self.sequence_length:i])
            y.append(scaled_data[i, 0])  # passenger_count is first feature
        
        return np.array(X), np.array(y)
    
    def train(self, X_train, y_train, X_val, y_val, epochs=100):
        """Train the LSTM model"""
        if self.model is None:
            self.build_model()
        
        history = self.model.fit(
            X_train, y_train,
            validation_data=(X_val, y_val),
            epochs=epochs,
            batch_size=32,
            verbose=1
        )
        
        return history
    
    def predict(self, X):
        """Make predictions"""
        if self.model is None:
            raise ValueError("Model not trained yet")
        
        predictions = self.model.predict(X)
        return self.scaler.inverse_transform(predictions)
    
    def evaluate(self, X_test, y_test):
        """Evaluate model performance"""
        predictions = self.predict(X_test)
        
        mae = mean_absolute_error(y_test, predictions)
        mse = mean_squared_error(y_test, predictions)
        rmse = np.sqrt(mse)
        
        return {
            'mae': mae,
            'mse': mse,
            'rmse': rmse,
            'accuracy': 1 - (mae / np.mean(y_test))
        }
```

#### **XGBoost Model Implementation**

```python
# ml-service/models/demand_predictor.py (continued)
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score

class XGBoostDemandPredictor:
    def __init__(self):
        self.model = xgb.XGBRegressor(
            n_estimators=100,
            max_depth=6,
            learning_rate=0.1,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42
        )
        self.feature_importance = None
    
    def train(self, X, y):
        """Train XGBoost model"""
        X_train, X_val, y_train, y_val = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        self.model.fit(
            X_train, y_train,
            eval_set=[(X_val, y_val)],
            early_stopping_rounds=10,
            verbose=False
        )
        
        self.feature_importance = self.model.feature_importances_
        return self.model
    
    def predict(self, X):
        """Make predictions"""
        return self.model.predict(X)
    
    def get_feature_importance(self):
        """Get feature importance scores"""
        return self.feature_importance
```

### 3. Training Script

```python
# ml-service/training/train_demand.py
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import joblib
import yaml

from models.demand_predictor import DemandPredictor, XGBoostDemandPredictor
from utils.data_loader import DataLoader
from utils.feature_engineering import create_features
from utils.model_evaluator import ModelEvaluator

class DemandModelTrainer:
    def __init__(self, config_path='config/training_config.yaml'):
        with open(config_path, 'r') as file:
            self.config = yaml.safe_load(file)
        
        self.data_loader = DataLoader()
        self.evaluator = ModelEvaluator()
        
    def load_and_prepare_data(self):
        """Load and prepare training data"""
        print("Loading historical data...")
        
        # Load data from database
        ticket_sales = self.data_loader.load_ticket_sales()
        passenger_counts = self.data_loader.load_passenger_counts()
        gps_logs = self.data_loader.load_gps_logs()
        
        # Combine data
        df = self.combine_data(ticket_sales, passenger_counts, gps_logs)
        
        # Create features
        df = create_features(df)
        
        # Remove missing values
        df = df.dropna()
        
        print(f"Prepared dataset with {len(df)} records")
        return df
    
    def train_models(self, df):
        """Train multiple models and compare performance"""
        print("Training demand prediction models...")
        
        # Prepare features and target
        feature_columns = [
            'hour', 'day_of_week', 'month', 'is_weekend', 'is_peak_hour',
            'passenger_count_lag_1', 'passenger_count_lag_24',
            'passenger_avg_7d', 'passenger_avg_24h', 'temperature',
            'precipitation', 'is_holiday', 'event_intensity'
        ]
        
        X = df[feature_columns]
        y = df['passenger_count']
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Train LSTM model
        print("Training LSTM model...")
        lstm_predictor = DemandPredictor()
        X_train_lstm, y_train_lstm = lstm_predictor.prepare_data(
            pd.concat([X_train, y_train], axis=1)
        )
        X_test_lstm, y_test_lstm = lstm_predictor.prepare_data(
            pd.concat([X_test, y_test], axis=1)
        )
        
        lstm_predictor.train(X_train_lstm, y_train_lstm, X_test_lstm, y_test_lstm)
        lstm_metrics = lstm_predictor.evaluate(X_test_lstm, y_test_lstm)
        
        # Train XGBoost model
        print("Training XGBoost model...")
        xgb_predictor = XGBoostDemandPredictor()
        xgb_predictor.train(X_train, y_train)
        xgb_predictions = xgb_predictor.predict(X_test)
        xgb_metrics = self.evaluator.evaluate(y_test, xgb_predictions)
        
        # Compare models
        print("\nModel Performance Comparison:")
        print(f"LSTM - MAE: {lstm_metrics['mae']:.2f}, RMSE: {lstm_metrics['rmse']:.2f}")
        print(f"XGBoost - MAE: {xgb_metrics['mae']:.2f}, RMSE: {xgb_metrics['rmse']:.2f}")
        
        # Save best model
        if lstm_metrics['mae'] < xgb_metrics['mae']:
            print("LSTM model performs better, saving...")
            lstm_predictor.model.save('models/demand_lstm_model.h5')
            joblib.dump(lstm_predictor.scaler, 'models/demand_scaler.pkl')
            return lstm_predictor
        else:
            print("XGBoost model performs better, saving...")
            joblib.dump(xgb_predictor, 'models/demand_xgb_model.pkl')
            return xgb_predictor
    
    def run_training(self):
        """Run complete training pipeline"""
        print("Starting demand prediction model training...")
        
        # Load and prepare data
        df = self.load_and_prepare_data()
        
        # Train models
        best_model = self.train_models(df)
        
        print("Training completed successfully!")
        return best_model

if __name__ == "__main__":
    trainer = DemandModelTrainer()
    model = trainer.run_training()
```

### 4. Schedule Optimization Model

```python
# ml-service/models/schedule_optimizer.py
import numpy as np
from scipy.optimize import minimize
from sklearn.ensemble import RandomForestRegressor
import pandas as pd

class ScheduleOptimizer:
    def __init__(self):
        self.demand_model = None
        self.optimization_history = []
    
    def train_demand_model(self, historical_data):
        """Train demand prediction model for optimization"""
        # Prepare features for demand prediction
        features = self.prepare_optimization_features(historical_data)
        
        # Train Random Forest for demand prediction
        self.demand_model = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )
        
        X = features.drop('demand', axis=1)
        y = features['demand']
        
        self.demand_model.fit(X, y)
        return self.demand_model
    
    def optimize_schedule(self, route_data, constraints):
        """Optimize bus schedule using genetic algorithm"""
        def objective_function(schedule_params):
            """Objective function to minimize"""
            # Calculate total waiting time
            total_waiting_time = self.calculate_waiting_time(
                schedule_params, route_data
            )
            
            # Calculate operational cost
            operational_cost = self.calculate_operational_cost(
                schedule_params, route_data
            )
            
            # Weighted objective
            return total_waiting_time + 0.1 * operational_cost
        
        # Define constraints
        constraints_list = self.define_constraints(constraints)
        
        # Initial guess
        initial_schedule = self.generate_initial_schedule(route_data)
        
        # Optimize
        result = minimize(
            objective_function,
            initial_schedule,
            method='SLSQP',
            constraints=constraints_list,
            options={'maxiter': 1000}
        )
        
        return self.format_optimized_schedule(result.x, route_data)
    
    def calculate_waiting_time(self, schedule_params, route_data):
        """Calculate total passenger waiting time"""
        total_waiting_time = 0
        
        for hour in range(24):
            # Predict demand for this hour
            demand = self.predict_demand(hour, route_data)
            
            # Calculate headway
            headway = schedule_params[hour] if hour < len(schedule_params) else 15
            
            # Calculate waiting time (average wait is half of headway)
            waiting_time = demand * (headway / 2)
            total_waiting_time += waiting_time
        
        return total_waiting_time
    
    def calculate_operational_cost(self, schedule_params, route_data):
        """Calculate operational cost"""
        # Cost per bus trip
        cost_per_trip = 50  # Example cost
        
        # Total trips per day
        total_trips = sum(schedule_params)
        
        return total_trips * cost_per_trip
```

### 5. Training Configuration

```yaml
# ml-service/config/training_config.yaml
data:
  lookback_days: 90
  prediction_hours: 24
  sequence_length: 24
  test_size: 0.2
  validation_size: 0.1

models:
  demand_prediction:
    lstm:
      epochs: 100
      batch_size: 32
      learning_rate: 0.001
      dropout: 0.2
      units: [50, 50, 50]
    
    xgboost:
      n_estimators: 100
      max_depth: 6
      learning_rate: 0.1
      subsample: 0.8
      colsample_bytree: 0.8
  
  schedule_optimization:
    genetic_algorithm:
      population_size: 50
      generations: 100
      mutation_rate: 0.1
      crossover_rate: 0.8
    
    constraints:
      min_headway: 5
      max_headway: 30
      max_buses: 20
      min_efficiency: 0.7

features:
  time_features:
    - hour
    - day_of_week
    - month
    - is_weekend
    - is_peak_hour
  
  lag_features:
    - passenger_count_lag_1
    - passenger_count_lag_24
    - passenger_count_lag_168
  
  rolling_features:
    - passenger_avg_7d
    - passenger_avg_24h
    - passenger_std_7d
  
  external_features:
    - temperature
    - precipitation
    - is_holiday
    - event_intensity

evaluation:
  metrics:
    - mae
    - rmse
    - mape
    - r2_score
  
  cross_validation:
    folds: 5
    shuffle: true
    random_state: 42
```

### 6. Training Pipeline

```python
# ml-service/training/train_pipeline.py
import schedule
import time
from datetime import datetime
import logging

from train_demand import DemandModelTrainer
from train_optimizer import ScheduleOptimizerTrainer

class MLTrainingPipeline:
    def __init__(self):
        self.demand_trainer = DemandModelTrainer()
        self.optimizer_trainer = ScheduleOptimizerTrainer()
        self.logger = logging.getLogger(__name__)
    
    def run_daily_training(self):
        """Run daily model retraining"""
        self.logger.info("Starting daily model training...")
        
        try:
            # Train demand prediction model
            demand_model = self.demand_trainer.run_training()
            self.logger.info("Demand prediction model trained successfully")
            
            # Train schedule optimization model
            optimizer_model = self.optimizer_trainer.run_training()
            self.logger.info("Schedule optimization model trained successfully")
            
            # Save model metadata
            self.save_model_metadata(demand_model, optimizer_model)
            
        except Exception as e:
            self.logger.error(f"Training failed: {str(e)}")
    
    def schedule_training(self):
        """Schedule regular model training"""
        # Train daily at 2 AM
        schedule.every().day.at("02:00").do(self.run_daily_training)
        
        # Train weekly on Sunday at 3 AM
        schedule.every().sunday.at("03:00").do(self.run_weekly_training)
        
        while True:
            schedule.run_pending()
            time.sleep(60)  # Check every minute
    
    def run_weekly_training(self):
        """Run comprehensive weekly training"""
        self.logger.info("Starting weekly comprehensive training...")
        
        # Extended training with more data
        # Hyperparameter tuning
        # Model comparison and selection
        pass

if __name__ == "__main__":
    pipeline = MLTrainingPipeline()
    pipeline.schedule_training()
```

## 🚀 Deployment and Usage

### 1. Training the Models

```bash
# Install additional ML dependencies
cd ml-service
pip install tensorflow scikit-learn xgboost optuna

# Run training
python training/train_demand.py
python training/train_optimizer.py
```

### 2. Model Evaluation

```python
# Evaluate model performance
from utils.model_evaluator import ModelEvaluator

evaluator = ModelEvaluator()
metrics = evaluator.evaluate_model('models/demand_lstm_model.h5', test_data)
print(f"Model Accuracy: {metrics['accuracy']:.2%}")
```

### 3. Continuous Learning

```python
# Implement continuous learning
class ContinuousLearner:
    def __init__(self):
        self.model = self.load_latest_model()
        self.learning_rate = 0.01
    
    def update_model(self, new_data):
        """Update model with new data"""
        # Online learning approach
        self.model.partial_fit(new_data)
        
        # Save updated model
        self.save_model(self.model)
```

## 📊 Model Performance Monitoring

### 1. Performance Metrics

```python
# Track model performance over time
def track_model_performance():
    metrics = {
        'timestamp': datetime.now(),
        'mae': current_mae,
        'rmse': current_rmse,
        'accuracy': current_accuracy,
        'data_points': current_data_size
    }
    
    # Log to database or monitoring system
    log_metrics(metrics)
```

### 2. Model Drift Detection

```python
# Detect when model performance degrades
def detect_model_drift():
    current_performance = get_current_performance()
    baseline_performance = get_baseline_performance()
    
    if current_performance < baseline_performance * 0.9:
        trigger_model_retraining()
```

## 🎯 Best Practices

### 1. Data Quality
- **Clean Data**: Remove outliers and handle missing values
- **Feature Engineering**: Create meaningful features
- **Data Validation**: Ensure data consistency

### 2. Model Selection
- **Cross-Validation**: Use k-fold cross-validation
- **Hyperparameter Tuning**: Optimize model parameters
- **Ensemble Methods**: Combine multiple models

### 3. Production Deployment
- **Model Versioning**: Track model versions
- **A/B Testing**: Compare model performance
- **Monitoring**: Track model performance in production

---

This comprehensive guide shows how to implement proper machine learning models for your Smart Bus System, moving from simple algorithms to advanced ML techniques for better predictions and optimizations.
