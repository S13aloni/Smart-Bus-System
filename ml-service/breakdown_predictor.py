#!/usr/bin/env python3
"""
Smart Bus System - Breakdown Prediction Module
This module implements machine learning models to predict bus breakdowns.
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional
import joblib
import json
from pathlib import Path
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class BreakdownPredictor:
    """Machine learning model for predicting bus breakdowns"""
    
    def __init__(self):
        self.model = None
        self.scaler = None
        self.feature_names = [
            'bus_age_months', 'total_mileage', 'days_since_maintenance',
            'avg_daily_mileage', 'engine_temp_trend', 'oil_pressure',
            'brake_pad_wear', 'tire_condition', 'recent_repairs',
            'weather_exposure', 'driver_aggression_score', 'route_difficulty'
        ]
        self.risk_thresholds = {
            'LOW': 0.2,
            'MEDIUM': 0.4,
            'HIGH': 0.6,
            'CRITICAL': 0.8
        }
    
    def generate_training_data(self, num_buses: int = 100, days: int = 365) -> pd.DataFrame:
        """Generate synthetic training data for breakdown prediction"""
        logger.info(f"Generating training data for {num_buses} buses over {days} days")
        
        data = []
        
        for bus_id in range(1, num_buses + 1):
            # Generate bus characteristics
            bus_age = np.random.randint(6, 120)  # 6 months to 10 years
            total_mileage = np.random.randint(10000, 500000)
            
            # Generate daily data
            for day in range(days):
                date = datetime.now() - timedelta(days=days-day)
                
                # Calculate features
                days_since_maintenance = np.random.randint(0, 90)
                avg_daily_mileage = total_mileage / max(bus_age * 30, 1)
                
                # Engine health indicators
                engine_temp_trend = self._generate_engine_temp_trend(bus_age, days_since_maintenance)
                oil_pressure = self._generate_oil_pressure(bus_age, days_since_maintenance)
                
                # Mechanical wear
                brake_pad_wear = self._generate_brake_pad_wear(total_mileage, days_since_maintenance)
                tire_condition = self._generate_tire_condition(total_mileage, days_since_maintenance)
                
                # Operational factors
                recent_repairs = self._generate_recent_repairs(bus_age, total_mileage)
                weather_exposure = self._generate_weather_exposure(date)
                driver_aggression = np.random.normal(0.5, 0.2)
                route_difficulty = np.random.uniform(0.3, 0.9)
                
                # Calculate breakdown probability
                breakdown_prob = self._calculate_breakdown_probability(
                    bus_age, total_mileage, days_since_maintenance,
                    engine_temp_trend, oil_pressure, brake_pad_wear,
                    tire_condition, recent_repairs, weather_exposure,
                    driver_aggression, route_difficulty
                )
                
                # Determine if breakdown occurred
                breakdown_occurred = np.random.random() < breakdown_prob
                
                data.append({
                    'bus_id': bus_id,
                    'date': date,
                    'bus_age_months': bus_age,
                    'total_mileage': total_mileage,
                    'days_since_maintenance': days_since_maintenance,
                    'avg_daily_mileage': avg_daily_mileage,
                    'engine_temp_trend': engine_temp_trend,
                    'oil_pressure': oil_pressure,
                    'brake_pad_wear': brake_pad_wear,
                    'tire_condition': tire_condition,
                    'recent_repairs': recent_repairs,
                    'weather_exposure': weather_exposure,
                    'driver_aggression_score': driver_aggression,
                    'route_difficulty': route_difficulty,
                    'breakdown_occurred': breakdown_occurred,
                    'breakdown_probability': breakdown_prob
                })
        
        df = pd.DataFrame(data)
        logger.info(f"Generated {len(df)} training samples")
        return df
    
    def _generate_engine_temp_trend(self, bus_age: int, days_since_maintenance: int) -> float:
        """Generate engine temperature trend (0-1, higher is worse)"""
        base_temp = 0.3 + (bus_age / 120) * 0.4  # Age factor
        maintenance_factor = min(days_since_maintenance / 90, 1) * 0.3
        noise = np.random.normal(0, 0.1)
        return max(0, min(1, base_temp + maintenance_factor + noise))
    
    def _generate_oil_pressure(self, bus_age: int, days_since_maintenance: int) -> float:
        """Generate oil pressure (0-1, lower is worse)"""
        base_pressure = 0.8 - (bus_age / 120) * 0.3  # Age factor
        maintenance_factor = min(days_since_maintenance / 90, 1) * 0.2
        noise = np.random.normal(0, 0.05)
        return max(0, min(1, base_pressure - maintenance_factor + noise))
    
    def _generate_brake_pad_wear(self, total_mileage: int, days_since_maintenance: int) -> float:
        """Generate brake pad wear (0-1, higher is worse)"""
        mileage_factor = min(total_mileage / 200000, 1) * 0.6
        maintenance_factor = min(days_since_maintenance / 90, 1) * 0.4
        noise = np.random.normal(0, 0.1)
        return max(0, min(1, mileage_factor + maintenance_factor + noise))
    
    def _generate_tire_condition(self, total_mileage: int, days_since_maintenance: int) -> float:
        """Generate tire condition (0-1, higher is worse)"""
        mileage_factor = min(total_mileage / 100000, 1) * 0.5
        maintenance_factor = min(days_since_maintenance / 60, 1) * 0.5
        noise = np.random.normal(0, 0.1)
        return max(0, min(1, mileage_factor + maintenance_factor + noise))
    
    def _generate_recent_repairs(self, bus_age: int, total_mileage: int) -> int:
        """Generate number of recent repairs (last 30 days)"""
        base_repairs = (bus_age / 120) * 2 + (total_mileage / 200000) * 3
        return max(0, int(np.random.poisson(base_repairs)))
    
    def _generate_weather_exposure(self, date: datetime) -> float:
        """Generate weather exposure factor (0-1, higher is worse)"""
        month = date.month
        # Monsoon season (June-September) has higher exposure
        if month in [6, 7, 8, 9]:
            return np.random.uniform(0.6, 1.0)
        elif month in [12, 1, 2]:  # Winter
            return np.random.uniform(0.4, 0.8)
        else:
            return np.random.uniform(0.2, 0.6)
    
    def _calculate_breakdown_probability(self, bus_age: int, total_mileage: int,
                                       days_since_maintenance: int, engine_temp_trend: float,
                                       oil_pressure: float, brake_pad_wear: float,
                                       tire_condition: float, recent_repairs: int,
                                       weather_exposure: float, driver_aggression: float,
                                       route_difficulty: float) -> float:
        """Calculate breakdown probability based on all factors"""
        
        # Age factor (exponential increase with age)
        age_factor = (bus_age / 120) ** 2
        
        # Mileage factor
        mileage_factor = (total_mileage / 300000) ** 1.5
        
        # Maintenance factor
        maintenance_factor = (days_since_maintenance / 90) ** 1.2
        
        # Component health factors
        engine_health = (engine_temp_trend + (1 - oil_pressure)) / 2
        mechanical_health = (brake_pad_wear + tire_condition) / 2
        
        # Operational factors
        operational_stress = (weather_exposure + driver_aggression + route_difficulty) / 3
        
        # Recent repairs increase risk
        repair_factor = min(recent_repairs / 5, 1)
        
        # Combine all factors
        breakdown_prob = (
            age_factor * 0.3 +
            mileage_factor * 0.25 +
            maintenance_factor * 0.2 +
            engine_health * 0.15 +
            mechanical_health * 0.1 +
            operational_stress * 0.1 +
            repair_factor * 0.05
        )
        
        return min(breakdown_prob, 1.0)
    
    def train_model(self, df: pd.DataFrame) -> Dict:
        """Train breakdown prediction model"""
        try:
            from sklearn.ensemble import RandomForestClassifier
            from sklearn.model_selection import train_test_split
            from sklearn.preprocessing import StandardScaler
            from sklearn.metrics import classification_report, confusion_matrix
            
            logger.info("Training breakdown prediction model...")
            
            # Prepare features and target
            X = df[self.feature_names]
            y = df['breakdown_occurred'].astype(int)
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42, stratify=y
            )
            
            # Scale features
            self.scaler = StandardScaler()
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_test_scaled = self.scaler.transform(X_test)
            
            # Train model
            self.model = RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                min_samples_split=5,
                min_samples_leaf=2,
                random_state=42,
                class_weight='balanced'  # Handle imbalanced data
            )
            
            self.model.fit(X_train_scaled, y_train)
            
            # Evaluate model
            y_pred = self.model.predict(X_test_scaled)
            y_pred_proba = self.model.predict_proba(X_test_scaled)[:, 1]
            
            # Calculate metrics
            accuracy = self.model.score(X_test_scaled, y_test)
            
            # Feature importance
            feature_importance = dict(zip(self.feature_names, self.model.feature_importances_))
            
            metrics = {
                'accuracy': accuracy,
                'classification_report': classification_report(y_test, y_pred, output_dict=True),
                'confusion_matrix': confusion_matrix(y_test, y_pred).tolist(),
                'feature_importance': feature_importance
            }
            
            logger.info(f"Model trained successfully. Accuracy: {accuracy:.3f}")
            
            return metrics
            
        except ImportError:
            logger.error("scikit-learn not available. Install with: pip install scikit-learn")
            return {}
    
    def predict_breakdown_risk(self, bus_data: Dict) -> Dict:
        """Predict breakdown risk for a specific bus"""
        if self.model is None or self.scaler is None:
            return {
                'risk_score': 0.5,
                'risk_level': 'UNKNOWN',
                'message': 'Model not trained'
            }
        
        try:
            # Prepare features
            features = []
            for feature_name in self.feature_names:
                features.append(bus_data.get(feature_name, 0))
            
            # Scale features
            features_scaled = self.scaler.transform([features])
            
            # Predict
            risk_score = self.model.predict_proba(features_scaled)[0][1]
            
            # Determine risk level
            risk_level = self._categorize_risk(risk_score)
            
            # Get recommendations
            recommendations = self._get_recommendations(risk_score, bus_data)
            
            return {
                'risk_score': float(risk_score),
                'risk_level': risk_level,
                'recommendations': recommendations,
                'predicted_failure_time': self._predict_failure_time(risk_score),
                'confidence': self._calculate_confidence(risk_score)
            }
            
        except Exception as e:
            logger.error(f"Error in prediction: {str(e)}")
            return {
                'risk_score': 0.5,
                'risk_level': 'ERROR',
                'message': str(e)
            }
    
    def _categorize_risk(self, risk_score: float) -> str:
        """Categorize risk score into risk level"""
        if risk_score >= self.risk_thresholds['CRITICAL']:
            return 'CRITICAL'
        elif risk_score >= self.risk_thresholds['HIGH']:
            return 'HIGH'
        elif risk_score >= self.risk_thresholds['MEDIUM']:
            return 'MEDIUM'
        else:
            return 'LOW'
    
    def _get_recommendations(self, risk_score: float, bus_data: Dict) -> List[str]:
        """Get maintenance recommendations based on risk score and bus data"""
        recommendations = []
        
        if risk_score >= 0.8:
            recommendations.append("IMMEDIATE: Remove bus from service")
            recommendations.append("Schedule emergency maintenance")
        elif risk_score >= 0.6:
            recommendations.append("Schedule maintenance within 24 hours")
            recommendations.append("Monitor closely during operation")
        elif risk_score >= 0.4:
            recommendations.append("Schedule maintenance within 1 week")
            recommendations.append("Increase monitoring frequency")
        else:
            recommendations.append("Continue normal operation")
            recommendations.append("Schedule routine maintenance")
        
        # Specific recommendations based on bus data
        if bus_data.get('days_since_maintenance', 0) > 60:
            recommendations.append("Overdue for maintenance")
        
        if bus_data.get('recent_repairs', 0) > 3:
            recommendations.append("High repair frequency - investigate root cause")
        
        if bus_data.get('engine_temp_trend', 0) > 0.7:
            recommendations.append("Check engine cooling system")
        
        if bus_data.get('oil_pressure', 1) < 0.3:
            recommendations.append("Check oil system and pressure")
        
        return recommendations
    
    def _predict_failure_time(self, risk_score: float) -> str:
        """Predict when failure might occur"""
        if risk_score >= 0.8:
            return "Within 24 hours"
        elif risk_score >= 0.6:
            return "Within 1 week"
        elif risk_score >= 0.4:
            return "Within 1 month"
        else:
            return "Low risk - no immediate concern"
    
    def _calculate_confidence(self, risk_score: float) -> float:
        """Calculate prediction confidence"""
        # Higher confidence for extreme risk scores
        if risk_score >= 0.8 or risk_score <= 0.2:
            return 0.9
        elif risk_score >= 0.6 or risk_score <= 0.4:
            return 0.7
        else:
            return 0.5
    
    def save_model(self, model_path: str = "models/breakdown_predictor.pkl"):
        """Save trained model"""
        if self.model is None:
            logger.warning("No model to save")
            return
        
        # Create models directory
        Path("models").mkdir(exist_ok=True)
        
        # Save model and scaler
        joblib.dump({
            'model': self.model,
            'scaler': self.scaler,
            'feature_names': self.feature_names,
            'risk_thresholds': self.risk_thresholds
        }, model_path)
        
        logger.info(f"Model saved to {model_path}")
    
    def load_model(self, model_path: str = "models/breakdown_predictor.pkl"):
        """Load trained model"""
        try:
            model_data = joblib.load(model_path)
            self.model = model_data['model']
            self.scaler = model_data['scaler']
            self.feature_names = model_data['feature_names']
            self.risk_thresholds = model_data['risk_thresholds']
            
            logger.info(f"Model loaded from {model_path}")
            return True
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            return False

def main():
    """Main function to train breakdown prediction model"""
    logger.info("Starting breakdown prediction model training...")
    
    # Create predictor
    predictor = BreakdownPredictor()
    
    # Generate training data
    df = predictor.generate_training_data(num_buses=50, days=180)
    
    # Train model
    metrics = predictor.train_model(df)
    
    if metrics:
        logger.info("Training completed successfully!")
        logger.info(f"Accuracy: {metrics['accuracy']:.3f}")
        
        # Save model
        predictor.save_model()
        
        # Test prediction
        test_bus = {
            'bus_age_months': 36,
            'total_mileage': 150000,
            'days_since_maintenance': 30,
            'avg_daily_mileage': 200,
            'engine_temp_trend': 0.6,
            'oil_pressure': 0.7,
            'brake_pad_wear': 0.4,
            'tire_condition': 0.3,
            'recent_repairs': 1,
            'weather_exposure': 0.5,
            'driver_aggression_score': 0.6,
            'route_difficulty': 0.7
        }
        
        prediction = predictor.predict_breakdown_risk(test_bus)
        logger.info(f"Test prediction: {prediction}")
    else:
        logger.error("Training failed")

if __name__ == "__main__":
    main()
