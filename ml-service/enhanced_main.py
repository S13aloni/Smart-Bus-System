#!/usr/bin/env python3
"""
Enhanced Smart Bus ML Service with Trained Models
This service uses machine learning models for demand prediction and schedule optimization.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json
import logging
import joblib
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Enhanced Smart Bus ML Service",
    description="Machine Learning service with trained models for demand prediction and schedule optimization",
    version="2.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class PredictionRequest(BaseModel):
    route_id: int
    prediction_hours: int = 24
    historical_data: Optional[Dict[str, Any]] = None

class OptimizationRequest(BaseModel):
    route_id: int
    current_schedule: Dict[str, Any]
    constraints: Dict[str, Any]
    demand_forecast: Optional[List[Dict]] = None

class PredictionResponse(BaseModel):
    route_id: int
    predictions: List[Dict[str, Any]]
    model_info: Dict[str, Any]
    generated_at: datetime

class OptimizationResponse(BaseModel):
    route_id: int
    optimized_schedule: Dict[str, Any]
    improvements: Dict[str, Any]
    model_info: Dict[str, Any]
    generated_at: datetime

# Global variables for models
demand_model = None
model_metadata = None
feature_names = None

@app.on_event("startup")
async def load_models():
    """Load trained models on startup"""
    global demand_model, model_metadata, feature_names
    
    try:
        # Load demand prediction model
        model_path = Path("models/demand_model.pkl")
        metadata_path = Path("models/demand_model_metadata.json")
        
        if model_path.exists() and metadata_path.exists():
            demand_model = joblib.load(model_path)
            
            with open(metadata_path, 'r') as f:
                model_metadata = json.load(f)
            
            feature_names = model_metadata.get('feature_names', [])
            
            logger.info("Trained models loaded successfully")
            logger.info(f"Model accuracy: {model_metadata['metrics']['accuracy']:.2%}")
        else:
            logger.warning("Trained models not found, using fallback algorithms")
            
    except Exception as e:
        logger.error(f"Error loading models: {str(e)}")
        logger.warning("Falling back to simple algorithms")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "2.0.0",
        "model_loaded": demand_model is not None,
        "model_accuracy": model_metadata['metrics']['accuracy'] if model_metadata else None
    }

@app.post("/predict", response_model=PredictionResponse)
async def predict_demand(request: PredictionRequest):
    """
    Predict passenger demand using trained ML model
    """
    try:
        logger.info(f"Predicting demand for route {request.route_id}")
        
        if demand_model is None:
            # Fallback to simple prediction
            predictions = await simple_demand_prediction(request)
        else:
            # Use trained model
            predictions = await ml_demand_prediction(request)
        
        return PredictionResponse(
            route_id=request.route_id,
            predictions=predictions,
            model_info={
                "model_type": "trained_ml_model" if demand_model else "simple_algorithm",
                "accuracy": model_metadata['metrics']['accuracy'] if model_metadata else 0.7,
                "features_used": feature_names if feature_names else [],
                "training_date": model_metadata.get('training_date') if model_metadata else None
            },
            generated_at=datetime.now()
        )
        
    except Exception as e:
        logger.error(f"Error in prediction: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

async def ml_demand_prediction(request: PredictionRequest) -> List[Dict[str, Any]]:
    """Predict demand using trained ML model"""
    predictions = []
    current_time = datetime.now()
    
    for i in range(request.prediction_hours):
        prediction_time = current_time + timedelta(hours=i)
        
        # Prepare features for prediction
        features = prepare_prediction_features(
            prediction_time, 
            request.route_id,
            request.historical_data
        )
        
        # Make prediction
        if demand_model and len(features) == len(feature_names):
            predicted_demand = demand_model.predict([features])[0]
            confidence = 0.85  # High confidence for trained model
        else:
            # Fallback prediction
            predicted_demand = simple_hourly_demand(prediction_time)
            confidence = 0.6
        
        predictions.append({
            "hour": prediction_time.hour,
            "day_of_week": prediction_time.weekday(),
            "predicted_passengers": max(0, int(predicted_demand)),
            "confidence": confidence,
            "timestamp": prediction_time.isoformat()
        })
    
    return predictions

async def simple_demand_prediction(request: PredictionRequest) -> List[Dict[str, Any]]:
    """Simple demand prediction fallback"""
    predictions = []
    current_time = datetime.now()
    
    for i in range(request.prediction_hours):
        prediction_time = current_time + timedelta(hours=i)
        predicted_demand = simple_hourly_demand(prediction_time)
        
        predictions.append({
            "hour": prediction_time.hour,
            "day_of_week": prediction_time.weekday(),
            "predicted_passengers": predicted_demand,
            "confidence": 0.6,
            "timestamp": prediction_time.isoformat()
        })
    
    return predictions

def prepare_prediction_features(prediction_time: datetime, route_id: int, 
                              historical_data: Optional[Dict] = None) -> List[float]:
    """Prepare features for ML model prediction"""
    features = []
    
    # Time features
    features.append(prediction_time.hour)
    features.append(prediction_time.weekday())
    features.append(prediction_time.month)
    features.append(1 if prediction_time.weekday() >= 5 else 0)  # is_weekend
    features.append(1 if prediction_time.hour in [7, 8, 17, 18] else 0)  # is_peak_hour
    
    # Holiday feature (simplified)
    holidays = [(1, 1), (8, 15), (10, 2), (12, 25)]
    is_holiday = (prediction_time.month, prediction_time.day) in holidays
    features.append(1 if is_holiday else 0)
    
    # Weather features (simplified)
    features.append(generate_temperature(prediction_time.hour, prediction_time.month))
    features.append(generate_precipitation(prediction_time.month))
    
    # Lag features (simplified - would need historical data)
    features.append(20)  # passenger_count_lag_1 (placeholder)
    features.append(18)  # passenger_count_lag_24 (placeholder)
    features.append(22)  # passenger_count_lag_168 (placeholder)
    
    # Rolling averages (simplified)
    features.append(20)  # passenger_avg_24h (placeholder)
    features.append(19)  # passenger_avg_7d (placeholder)
    features.append(3)   # passenger_std_24h (placeholder)
    
    return features

def simple_hourly_demand(prediction_time: datetime) -> int:
    """Simple demand prediction based on time patterns"""
    hour = prediction_time.hour
    day_of_week = prediction_time.weekday()
    
    # Base demand by hour
    if hour in [7, 8, 17, 18]:  # Peak hours
        base_demand = 35
    elif hour in [6, 9, 16, 19]:  # Moderate hours
        base_demand = 25
    elif 6 <= hour <= 22:  # Regular hours
        base_demand = 15
    else:  # Night hours
        base_demand = 5
    
    # Weekend adjustment
    if day_of_week >= 5:
        base_demand = int(base_demand * 0.7)
    
    # Add some randomness
    noise = np.random.normal(0, base_demand * 0.1)
    return max(0, int(base_demand + noise))

def generate_temperature(hour: int, month: int) -> float:
    """Generate temperature based on hour and month"""
    monthly_temp = {
        1: 20, 2: 22, 3: 28, 4: 32, 5: 35, 6: 33,
        7: 30, 8: 29, 9: 30, 10: 28, 11: 24, 12: 21
    }
    
    base_temp = monthly_temp.get(month, 25)
    daily_variation = 8 * np.sin((hour - 6) * np.pi / 12)
    noise = np.random.normal(0, 2)
    
    return base_temp + daily_variation + noise

def generate_precipitation(month: int) -> float:
    """Generate precipitation based on month"""
    if month in [6, 7, 8, 9]:  # Monsoon
        return np.random.exponential(2.0)
    else:
        return np.random.exponential(0.5)

@app.post("/optimize", response_model=OptimizationResponse)
async def optimize_schedule(request: OptimizationRequest):
    """
    Optimize bus schedule using AI algorithms
    """
    try:
        logger.info(f"Optimizing schedule for route {request.route_id}")
        
        # Generate optimized schedule
        optimized_schedule = await generate_optimized_schedule(request)
        
        # Calculate improvements
        improvements = calculate_improvements(
            request.current_schedule, 
            optimized_schedule
        )
        
        return OptimizationResponse(
            route_id=request.route_id,
            optimized_schedule=optimized_schedule,
            improvements=improvements,
            model_info={
                "optimization_method": "constraint_based_optimization",
                "constraints_applied": list(request.constraints.keys()),
                "demand_model_used": "trained_ml_model" if demand_model else "simple_algorithm"
            },
            generated_at=datetime.now()
        )
        
    except Exception as e:
        logger.error(f"Error in optimization: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Optimization failed: {str(e)}")

async def generate_optimized_schedule(request: OptimizationRequest) -> Dict[str, Any]:
    """Generate optimized schedule using AI algorithms"""
    
    # Get current schedule
    current = request.current_schedule
    constraints = request.constraints
    
    # Calculate optimal headway based on demand
    if request.demand_forecast:
        avg_demand = np.mean([p['predicted_passengers'] for p in request.demand_forecast])
        optimal_headway = calculate_optimal_headway(avg_demand, constraints)
    else:
        optimal_headway = current.get('headway_minutes', 15)
    
    # Apply constraints
    min_headway = constraints.get('min_headway', 5)
    max_headway = constraints.get('max_headway', 30)
    optimal_headway = max(min_headway, min(optimal_headway, max_headway))
    
    # Calculate new schedule
    start_time = current.get('start_time', '06:00')
    end_time = current.get('end_time', '22:00')
    
    # Parse times
    start_hour, start_min = map(int, start_time.split(':'))
    end_hour, end_min = map(int, end_time.split(':'))
    
    start_minutes = start_hour * 60 + start_min
    end_minutes = end_hour * 60 + end_min
    
    # Calculate total trips
    total_minutes = end_minutes - start_minutes
    total_trips = int(total_minutes / optimal_headway)
    
    # Generate trip times
    trip_times = []
    for i in range(total_trips):
        trip_minutes = start_minutes + (i * optimal_headway)
        trip_hour = trip_minutes // 60
        trip_min = trip_minutes % 60
        trip_times.append(f"{trip_hour:02d}:{trip_min:02d}")
    
    return {
        "start_time": start_time,
        "end_time": end_time,
        "headway_minutes": optimal_headway,
        "total_trips": total_trips,
        "trip_times": trip_times,
        "optimization_reason": f"Optimized for {optimal_headway}-minute headway based on demand"
    }

def calculate_optimal_headway(avg_demand: float, constraints: Dict) -> int:
    """Calculate optimal headway based on demand"""
    # Simple optimization: adjust headway based on demand
    if avg_demand > 30:
        return 8  # High demand - frequent service
    elif avg_demand > 20:
        return 12  # Medium demand
    elif avg_demand > 10:
        return 15  # Low demand
    else:
        return 20  # Very low demand

def calculate_improvements(current: Dict, optimized: Dict) -> Dict[str, Any]:
    """Calculate improvements from optimization"""
    current_headway = current.get('headway_minutes', 15)
    optimized_headway = optimized.get('headway_minutes', 15)
    
    current_trips = current.get('total_trips', 0)
    optimized_trips = optimized.get('total_trips', 0)
    
    headway_improvement = current_headway - optimized_headway
    trip_change = optimized_trips - current_trips
    
    # Calculate efficiency improvement
    if current_headway > 0:
        efficiency_gain = headway_improvement / current_headway
    else:
        efficiency_gain = 0
    
    return {
        "headway_reduction": max(0, headway_improvement),
        "additional_trips": max(0, trip_change),
        "efficiency_improvement": efficiency_gain,
        "estimated_passenger_wait_time_reduction": headway_improvement / 2,
        "service_frequency_improvement": f"{headway_improvement} minutes faster"
    }

@app.get("/model/info")
async def get_model_info():
    """Get information about loaded models"""
    if model_metadata:
        return {
            "model_loaded": True,
            "model_type": "Random Forest Regressor",
            "training_date": model_metadata.get('training_date'),
            "accuracy": model_metadata['metrics']['accuracy'],
            "mae": model_metadata['metrics']['mae'],
            "rmse": model_metadata['metrics']['rmse'],
            "r2_score": model_metadata['metrics']['r2_score'],
            "feature_count": len(feature_names) if feature_names else 0,
            "features": feature_names if feature_names else []
        }
    else:
        return {
            "model_loaded": False,
            "message": "No trained model loaded, using fallback algorithms"
        }

@app.get("/model/features")
async def get_feature_importance():
    """Get feature importance from trained model"""
    if model_metadata and 'feature_importance' in model_metadata:
        return {
            "feature_importance": model_metadata['feature_importance'],
            "top_features": sorted(
                model_metadata['feature_importance'].items(),
                key=lambda x: x[1],
                reverse=True
            )[:10]
        }
    else:
        return {"message": "Feature importance not available"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
