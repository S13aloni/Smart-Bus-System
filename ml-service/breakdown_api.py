#!/usr/bin/env python3
"""
Smart Bus System - Breakdown Prediction API
FastAPI endpoints for bus breakdown prediction and monitoring.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
from datetime import datetime
import logging

from breakdown_predictor import BreakdownPredictor

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Smart Bus Breakdown Prediction API",
    description="API for predicting bus breakdowns and maintenance needs",
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

# Global predictor instance
breakdown_predictor = BreakdownPredictor()

# Pydantic models
class BusSensorData(BaseModel):
    bus_id: int
    bus_age_months: int
    total_mileage: int
    days_since_maintenance: int
    avg_daily_mileage: float
    engine_temp_trend: float
    oil_pressure: float
    brake_pad_wear: float
    tire_condition: float
    recent_repairs: int
    weather_exposure: float
    driver_aggression_score: float
    route_difficulty: float
    timestamp: Optional[datetime] = None

class BreakdownPredictionResponse(BaseModel):
    bus_id: int
    risk_score: float
    risk_level: str
    recommendations: List[str]
    predicted_failure_time: str
    confidence: float
    timestamp: datetime

class MaintenanceRecommendation(BaseModel):
    bus_id: int
    priority: str
    recommended_actions: List[str]
    estimated_cost: Optional[float] = None
    estimated_downtime: Optional[str] = None
    parts_needed: Optional[List[str]] = None

class FleetHealthOverview(BaseModel):
    total_buses: int
    critical_risk: int
    high_risk: int
    medium_risk: int
    low_risk: int
    maintenance_due: int
    last_updated: datetime

@app.on_event("startup")
async def load_breakdown_model():
    """Load breakdown prediction model on startup"""
    try:
        if breakdown_predictor.load_model():
            logger.info("Breakdown prediction model loaded successfully")
        else:
            logger.warning("No trained model found, using fallback predictions")
    except Exception as e:
        logger.error(f"Error loading breakdown model: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "model_loaded": breakdown_predictor.model is not None,
        "service": "breakdown_prediction"
    }

@app.post("/predict-breakdown", response_model=BreakdownPredictionResponse)
async def predict_breakdown(sensor_data: BusSensorData):
    """
    Predict breakdown risk for a specific bus based on sensor data
    """
    try:
        logger.info(f"Predicting breakdown risk for bus {sensor_data.bus_id}")
        
        # Convert sensor data to dictionary
        bus_data = sensor_data.dict()
        
        # Predict breakdown risk
        prediction = breakdown_predictor.predict_breakdown_risk(bus_data)
        
        return BreakdownPredictionResponse(
            bus_id=sensor_data.bus_id,
            risk_score=prediction['risk_score'],
            risk_level=prediction['risk_level'],
            recommendations=prediction['recommendations'],
            predicted_failure_time=prediction['predicted_failure_time'],
            confidence=prediction['confidence'],
            timestamp=datetime.now()
        )
        
    except Exception as e:
        logger.error(f"Error in breakdown prediction: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.post("/predict-fleet-breakdowns")
async def predict_fleet_breakdowns(sensor_data_list: List[BusSensorData]):
    """
    Predict breakdown risk for multiple buses
    """
    try:
        logger.info(f"Predicting breakdown risk for {len(sensor_data_list)} buses")
        
        predictions = []
        
        for sensor_data in sensor_data_list:
            bus_data = sensor_data.dict()
            prediction = breakdown_predictor.predict_breakdown_risk(bus_data)
            
            predictions.append({
                'bus_id': sensor_data.bus_id,
                'risk_score': prediction['risk_score'],
                'risk_level': prediction['risk_level'],
                'recommendations': prediction['recommendations'],
                'predicted_failure_time': prediction['predicted_failure_time'],
                'confidence': prediction['confidence']
            })
        
        return {
            'predictions': predictions,
            'total_buses': len(predictions),
            'critical_risk_count': len([p for p in predictions if p['risk_level'] == 'CRITICAL']),
            'high_risk_count': len([p for p in predictions if p['risk_level'] == 'HIGH']),
            'timestamp': datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in fleet breakdown prediction: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Fleet prediction failed: {str(e)}")

@app.get("/fleet-health", response_model=FleetHealthOverview)
async def get_fleet_health():
    """
    Get overall fleet health overview
    """
    try:
        # This would typically fetch data from your database
        # For demo purposes, we'll return mock data
        return FleetHealthOverview(
            total_buses=12,
            critical_risk=1,
            high_risk=2,
            medium_risk=3,
            low_risk=6,
            maintenance_due=4,
            last_updated=datetime.now()
        )
        
    except Exception as e:
        logger.error(f"Error getting fleet health: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Fleet health check failed: {str(e)}")

@app.post("/maintenance-recommendations", response_model=List[MaintenanceRecommendation])
async def get_maintenance_recommendations(sensor_data_list: List[BusSensorData]):
    """
    Get maintenance recommendations for multiple buses
    """
    try:
        logger.info(f"Generating maintenance recommendations for {len(sensor_data_list)} buses")
        
        recommendations = []
        
        for sensor_data in sensor_data_list:
            bus_data = sensor_data.dict()
            prediction = breakdown_predictor.predict_breakdown_risk(bus_data)
            
            # Determine priority based on risk level
            priority_map = {
                'CRITICAL': 'IMMEDIATE',
                'HIGH': 'HIGH',
                'MEDIUM': 'MEDIUM',
                'LOW': 'LOW'
            }
            
            priority = priority_map.get(prediction['risk_level'], 'LOW')
            
            # Estimate cost and downtime based on risk level
            cost_estimates = {
                'CRITICAL': 50000,
                'HIGH': 25000,
                'MEDIUM': 10000,
                'LOW': 5000
            }
            
            downtime_estimates = {
                'CRITICAL': '2-3 days',
                'HIGH': '1-2 days',
                'MEDIUM': '4-8 hours',
                'LOW': '2-4 hours'
            }
            
            # Determine parts needed based on sensor data
            parts_needed = []
            if bus_data.get('brake_pad_wear', 0) > 0.7:
                parts_needed.append('Brake Pads')
            if bus_data.get('tire_condition', 0) > 0.6:
                parts_needed.append('Tires')
            if bus_data.get('oil_pressure', 1) < 0.3:
                parts_needed.append('Oil Filter')
            if bus_data.get('engine_temp_trend', 0) > 0.7:
                parts_needed.append('Coolant')
            
            recommendations.append(MaintenanceRecommendation(
                bus_id=sensor_data.bus_id,
                priority=priority,
                recommended_actions=prediction['recommendations'],
                estimated_cost=cost_estimates.get(prediction['risk_level'], 5000),
                estimated_downtime=downtime_estimates.get(prediction['risk_level'], '2-4 hours'),
                parts_needed=parts_needed
            ))
        
        return recommendations
        
    except Exception as e:
        logger.error(f"Error generating maintenance recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Recommendations failed: {str(e)}")

@app.get("/breakdown-alerts")
async def get_breakdown_alerts():
    """
    Get current breakdown alerts for high-risk buses
    """
    try:
        # This would typically fetch from your database
        # For demo purposes, we'll return mock alerts
        alerts = [
            {
                'bus_id': 5,
                'license_plate': 'GJ-01-AB-1234',
                'route_id': 2,
                'risk_level': 'CRITICAL',
                'risk_score': 0.85,
                'alert_message': 'Bus at critical breakdown risk - engine temperature rising',
                'recommended_action': 'Remove from service immediately',
                'timestamp': datetime.now().isoformat()
            },
            {
                'bus_id': 8,
                'license_plate': 'GJ-01-CD-5678',
                'route_id': 4,
                'risk_level': 'HIGH',
                'risk_score': 0.72,
                'alert_message': 'High breakdown risk - brake pads worn',
                'recommended_action': 'Schedule maintenance within 24 hours',
                'timestamp': datetime.now().isoformat()
            }
        ]
        
        return {
            'alerts': alerts,
            'total_alerts': len(alerts),
            'critical_alerts': len([a for a in alerts if a['risk_level'] == 'CRITICAL']),
            'timestamp': datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting breakdown alerts: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Alerts retrieval failed: {str(e)}")

@app.get("/model/info")
async def get_model_info():
    """Get information about the breakdown prediction model"""
    if breakdown_predictor.model is None:
        return {
            "model_loaded": False,
            "message": "No trained model loaded"
        }
    
    return {
        "model_loaded": True,
        "model_type": "Random Forest Classifier",
        "feature_count": len(breakdown_predictor.feature_names),
        "features": breakdown_predictor.feature_names,
        "risk_thresholds": breakdown_predictor.risk_thresholds,
        "last_updated": datetime.now().isoformat()
    }

@app.post("/train-model")
async def train_breakdown_model():
    """
    Train the breakdown prediction model (for development/testing)
    """
    try:
        logger.info("Starting breakdown model training...")
        
        # Generate training data
        df = breakdown_predictor.generate_training_data(num_buses=50, days=180)
        
        # Train model
        metrics = breakdown_predictor.train_model(df)
        
        if metrics:
            # Save model
            breakdown_predictor.save_model()
            
            return {
                "status": "success",
                "message": "Model trained successfully",
                "metrics": metrics,
                "timestamp": datetime.now().isoformat()
            }
        else:
            return {
                "status": "error",
                "message": "Model training failed",
                "timestamp": datetime.now().isoformat()
            }
            
    except Exception as e:
        logger.error(f"Error training model: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Model training failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
