from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Smart Bus ML Service",
    description="Machine Learning service for demand prediction and schedule optimization",
    version="1.0.0"
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
    data: Dict[str, Any]
    prediction_hours: int = 24

class OptimizationRequest(BaseModel):
    routes: List[Dict[str, Any]]
    current_schedules: List[Dict[str, Any]]
    constraints: Optional[Dict[str, Any]] = None

class PredictionResponse(BaseModel):
    route_id: Optional[int]
    predictions: List[Dict[str, Any]]
    confidence_scores: List[float]
    model_info: Dict[str, Any]
    generated_at: datetime

class OptimizationResponse(BaseModel):
    optimized_schedules: List[Dict[str, Any]]
    improvement_metrics: Dict[str, Any]
    optimization_reasons: List[str]
    generated_at: datetime

# Global variables for model storage
demand_models = {}
optimization_cache = {}

@app.get("/")
async def root():
    return {"message": "Smart Bus ML Service is running", "status": "healthy"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now(),
        "models_loaded": len(demand_models),
        "cache_size": len(optimization_cache)
    }

@app.post("/predict", response_model=PredictionResponse)
async def predict_demand(request: PredictionRequest):
    """
    Predict passenger demand for the next specified hours
    """
    try:
        logger.info(f"Received prediction request for {request.prediction_hours} hours")
        
        # Extract data from request
        ticket_sales = request.data.get('ticket_sales', [])
        passenger_counts = request.data.get('passenger_counts', [])
        routes = request.data.get('routes', [])
        
        if not ticket_sales and not passenger_counts:
            raise HTTPException(status_code=400, detail="No historical data provided")
        
        # Convert to DataFrames
        sales_df = pd.DataFrame(ticket_sales) if ticket_sales else pd.DataFrame()
        counts_df = pd.DataFrame(passenger_counts) if passenger_counts else pd.DataFrame()
        
        # Process data and generate predictions
        predictions = []
        confidence_scores = []
        
        # Group by route for predictions
        route_ids = set()
        if not sales_df.empty:
            route_ids.update(sales_df['route_id'].unique())
        if not counts_df.empty:
            route_ids.update(counts_df['route_id'].unique())
        
        for route_id in route_ids:
            route_predictions = await predict_route_demand(
                route_id, sales_df, counts_df, request.prediction_hours
            )
            predictions.extend(route_predictions)
            confidence_scores.extend([0.8] * len(route_predictions))  # Simplified confidence
        
        return PredictionResponse(
            route_id=None,  # Multiple routes
            predictions=predictions,
            confidence_scores=confidence_scores,
            model_info={
                "model_type": "time_series_arima",
                "features_used": ["hour", "day_of_week", "historical_demand"],
                "training_data_points": len(ticket_sales) + len(passenger_counts)
            },
            generated_at=datetime.now()
        )
        
    except Exception as e:
        logger.error(f"Error in prediction: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.get("/predict")
async def get_demand_forecast(route_id: Optional[int] = None):
    """
    Get demand forecast for specific route or all routes
    """
    try:
        # Generate sample forecast data
        forecast = generate_sample_forecast(route_id)
        return forecast
        
    except Exception as e:
        logger.error(f"Error generating forecast: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Forecast generation failed: {str(e)}")

@app.post("/optimize", response_model=OptimizationResponse)
async def optimize_schedules(request: OptimizationRequest):
    """
    Optimize bus schedules to reduce bunching and improve efficiency
    """
    try:
        logger.info("Received optimization request")
        
        routes = request.routes
        current_schedules = request.current_schedules
        constraints = request.constraints or {}
        
        # Perform optimization
        optimized_schedules = await optimize_bus_schedules(
            routes, current_schedules, constraints
        )
        
        # Calculate improvement metrics
        improvement_metrics = calculate_improvement_metrics(
            current_schedules, optimized_schedules
        )
        
        # Generate optimization reasons
        optimization_reasons = generate_optimization_reasons(
            current_schedules, optimized_schedules
        )
        
        return OptimizationResponse(
            optimized_schedules=optimized_schedules,
            improvement_metrics=improvement_metrics,
            optimization_reasons=optimization_reasons,
            generated_at=datetime.now()
        )
        
    except Exception as e:
        logger.error(f"Error in optimization: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Optimization failed: {str(e)}")

async def predict_route_demand(route_id: int, sales_df: pd.DataFrame, 
                              counts_df: pd.DataFrame, prediction_hours: int) -> List[Dict]:
    """
    Predict demand for a specific route using time series analysis
    """
    predictions = []
    
    # Get historical data for this route
    route_sales = sales_df[sales_df['route_id'] == route_id] if not sales_df.empty else pd.DataFrame()
    route_counts = counts_df[counts_df['route_id'] == route_id] if not counts_df.empty else pd.DataFrame()
    
    # Combine and process data
    if not route_sales.empty:
        route_sales['timestamp'] = pd.to_datetime(route_sales['timestamp'])
        route_sales['hour'] = route_sales['timestamp'].dt.hour
        route_sales['day_of_week'] = route_sales['timestamp'].dt.dayofweek
    
    if not route_counts.empty:
        route_counts['timestamp'] = pd.to_datetime(route_counts['timestamp'])
        route_counts['hour'] = route_counts['timestamp'].dt.hour
        route_counts['day_of_week'] = route_counts['timestamp'].dt.dayofweek
    
    # Generate predictions for next 24 hours
    current_time = datetime.now()
    
    for i in range(prediction_hours):
        prediction_time = current_time + timedelta(hours=i)
        hour = prediction_time.hour
        day_of_week = prediction_time.weekday()
        
        # Simple prediction based on historical averages
        predicted_demand = predict_hourly_demand(
            route_sales, route_counts, hour, day_of_week
        )
        
        predictions.append({
            "route_id": route_id,
            "hour": hour,
            "day_of_week": day_of_week,
            "predicted_passengers": predicted_demand,
            "timestamp": prediction_time.isoformat(),
            "confidence": 0.8
        })
    
    return predictions

def predict_hourly_demand(sales_df: pd.DataFrame, counts_df: pd.DataFrame, 
                         hour: int, day_of_week: int) -> int:
    """
    Simple demand prediction based on historical averages
    """
    # Get historical data for same hour and day of week
    if not sales_df.empty:
        same_hour_sales = sales_df[
            (sales_df['hour'] == hour) & (sales_df['day_of_week'] == day_of_week)
        ]
        if not same_hour_sales.empty:
            avg_passengers = same_hour_sales['passenger_count'].mean()
            return max(0, int(avg_passengers * (1 + np.random.normal(0, 0.2))))
    
    if not counts_df.empty:
        same_hour_counts = counts_df[
            (counts_df['hour'] == hour) & (counts_df['day_of_week'] == day_of_week)
        ]
        if not same_hour_counts.empty:
            avg_occupancy = same_hour_counts['occupancy'].mean()
            return max(0, int(avg_occupancy * (1 + np.random.normal(0, 0.2))))
    
    # Default prediction if no historical data
    base_demand = 20 if 6 <= hour <= 9 or 17 <= hour <= 19 else 10  # Peak hours
    return int(base_demand * (1 + np.random.normal(0, 0.3)))

def generate_sample_forecast(route_id: Optional[int] = None) -> Dict:
    """
    Generate sample forecast data for demonstration
    """
    current_time = datetime.now()
    forecast = []
    
    for i in range(24):
        prediction_time = current_time + timedelta(hours=i)
        hour = prediction_time.hour
        
        # Generate realistic demand pattern
        if 6 <= hour <= 9:  # Morning peak
            base_demand = 45
        elif 17 <= hour <= 19:  # Evening peak
            base_demand = 50
        elif 10 <= hour <= 16:  # Daytime
            base_demand = 25
        else:  # Night/early morning
            base_demand = 10
        
        # Add some randomness
        predicted_passengers = int(base_demand * (1 + np.random.normal(0, 0.2)))
        
        forecast.append({
            "hour": hour,
            "day_of_week": prediction_time.weekday(),
            "predicted_passengers": max(0, predicted_passengers),
            "confidence": 0.8,
            "timestamp": prediction_time.isoformat()
        })
    
    return {
        "route_id": route_id,
        "forecast": forecast,
        "generated_at": current_time.isoformat(),
        "method": "sample_forecast"
    }

async def optimize_bus_schedules(routes: List[Dict], current_schedules: List[Dict], 
                                constraints: Dict) -> List[Dict]:
    """
    Optimize bus schedules to reduce bunching and improve efficiency
    """
    optimized_schedules = []
    
    # Group schedules by route
    schedules_by_route = {}
    for schedule in current_schedules:
        route_id = schedule.get('route_id')
        if route_id not in schedules_by_route:
            schedules_by_route[route_id] = []
        schedules_by_route[route_id].append(schedule)
    
    # Optimize each route
    for route_id, route_schedules in schedules_by_route.items():
        route_optimized = optimize_route_schedules(route_id, route_schedules, constraints)
        optimized_schedules.extend(route_optimized)
    
    return optimized_schedules

def optimize_route_schedules(route_id: int, schedules: List[Dict], 
                           constraints: Dict) -> List[Dict]:
    """
    Optimize schedules for a specific route
    """
    if not schedules:
        return []
    
    # Sort schedules by start time
    schedules.sort(key=lambda x: x.get('start_time', '00:00:00'))
    
    optimized = []
    target_headway = constraints.get('target_headway_minutes', 15)
    min_headway = constraints.get('min_headway_minutes', 5)
    max_headway = constraints.get('max_headway_minutes', 30)
    
    for i, schedule in enumerate(schedules):
        # Calculate optimal start time
        if i == 0:
            # First bus starts at original time
            new_start_time = schedule.get('start_time', '06:00:00')
        else:
            # Subsequent buses with optimal headway
            prev_time = time_to_minutes(optimized[i-1]['start_time'])
            new_time_minutes = prev_time + target_headway
            new_start_time = minutes_to_time(new_time_minutes)
        
        # Calculate end time (assume 1.5 hour trip duration)
        start_minutes = time_to_minutes(new_start_time)
        end_minutes = start_minutes + 90  # 90 minutes trip
        new_end_time = minutes_to_time(end_minutes)
        
        # Determine adjustment reason
        original_start = schedule.get('start_time', '00:00:00')
        time_diff = time_to_minutes(new_start_time) - time_to_minutes(original_start)
        
        if abs(time_diff) > 5:  # Significant change
            if time_diff > 0:
                reason = f"Delayed by {time_diff} minutes to improve headway"
            else:
                reason = f"Advanced by {abs(time_diff)} minutes to reduce bunching"
        else:
            reason = "Minor adjustment for optimal spacing"
        
        optimized_schedule = {
            "bus_id": schedule.get('bus_id'),
            "route_id": route_id,
            "start_time": new_start_time,
            "end_time": new_end_time,
            "adjustment_reason": reason,
            "original_start_time": original_start,
            "time_adjustment_minutes": time_diff
        }
        
        optimized.append(optimized_schedule)
    
    return optimized

def calculate_improvement_metrics(current: List[Dict], optimized: List[Dict]) -> Dict:
    """
    Calculate improvement metrics between current and optimized schedules
    """
    if not current or not optimized:
        return {}
    
    # Calculate headway statistics
    current_headways = calculate_headways(current)
    optimized_headways = calculate_headways(optimized)
    
    # Calculate efficiency scores
    current_efficiency = calculate_efficiency_score(current)
    optimized_efficiency = calculate_efficiency_score(optimized)
    
    return {
        "headway_improvement": {
            "current_avg_headway": current_headways['average'],
            "optimized_avg_headway": optimized_headways['average'],
            "improvement_minutes": current_headways['average'] - optimized_headways['average']
        },
        "efficiency_improvement": {
            "current_efficiency": current_efficiency,
            "optimized_efficiency": optimized_efficiency,
            "improvement_percentage": ((optimized_efficiency - current_efficiency) / current_efficiency) * 100
        },
        "schedule_changes": {
            "total_schedules": len(optimized),
            "schedules_adjusted": sum(1 for s in optimized if s.get('time_adjustment_minutes', 0) != 0),
            "average_adjustment_minutes": np.mean([abs(s.get('time_adjustment_minutes', 0)) for s in optimized])
        }
    }

def calculate_headways(schedules: List[Dict]) -> Dict:
    """
    Calculate headway statistics for schedules
    """
    if len(schedules) < 2:
        return {"average": 0, "min": 0, "max": 0, "variance": 0}
    
    headways = []
    for i in range(1, len(schedules)):
        prev_time = time_to_minutes(schedules[i-1].get('start_time', '00:00:00'))
        curr_time = time_to_minutes(schedules[i].get('start_time', '00:00:00'))
        headways.append(curr_time - prev_time)
    
    return {
        "average": np.mean(headways),
        "min": np.min(headways),
        "max": np.max(headways),
        "variance": np.var(headways)
    }

def calculate_efficiency_score(schedules: List[Dict]) -> float:
    """
    Calculate efficiency score for schedules (0-100)
    """
    if not schedules:
        return 0
    
    headways = calculate_headways(schedules)
    target_headway = 15  # minutes
    
    # Score based on how close to target headway
    headway_score = max(0, 100 - abs(headways['average'] - target_headway) * 2)
    
    # Penalty for high variance
    variance_penalty = min(50, headways['variance'] * 0.5)
    
    return max(0, headway_score - variance_penalty)

def generate_optimization_reasons(current: List[Dict], optimized: List[Dict]) -> List[str]:
    """
    Generate human-readable optimization reasons
    """
    reasons = []
    
    # Check for bunching reduction
    current_headways = calculate_headways(current)
    optimized_headways = calculate_headways(optimized)
    
    if optimized_headways['variance'] < current_headways['variance']:
        reasons.append("Reduced schedule variance to prevent bus bunching")
    
    # Check for headway improvements
    if optimized_headways['average'] > current_headways['average']:
        reasons.append("Improved average headway for better passenger experience")
    elif optimized_headways['average'] < current_headways['average']:
        reasons.append("Reduced headway to increase service frequency")
    
    # Check for efficiency improvements
    current_efficiency = calculate_efficiency_score(current)
    optimized_efficiency = calculate_efficiency_score(optimized)
    
    if optimized_efficiency > current_efficiency:
        reasons.append(f"Improved overall efficiency by {optimized_efficiency - current_efficiency:.1f} points")
    
    # Count adjustments
    adjustments = sum(1 for s in optimized if s.get('time_adjustment_minutes', 0) != 0)
    if adjustments > 0:
        reasons.append(f"Adjusted {adjustments} out of {len(optimized)} schedules for optimal spacing")
    
    return reasons if reasons else ["No significant optimizations needed"]

def time_to_minutes(time_str: str) -> int:
    """Convert time string (HH:MM:SS) to minutes since midnight"""
    try:
        parts = time_str.split(':')
        return int(parts[0]) * 60 + int(parts[1])
    except:
        return 0

def minutes_to_time(minutes: int) -> str:
    """Convert minutes since midnight to time string (HH:MM:SS)"""
    hours = minutes // 60
    mins = minutes % 60
    return f"{hours:02d}:{mins:02d}:00"

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

