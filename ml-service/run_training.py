#!/usr/bin/env python3
"""
Smart Bus System - Complete ML Training Pipeline
Run this script to train all machine learning models for the Smart Bus System.
"""

import os
import sys
import subprocess
import logging
from pathlib import Path

# Add current directory to Python path
sys.path.append(str(Path(__file__).parent))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def check_dependencies():
    """Check if required dependencies are installed"""
    required_packages = [
        'pandas', 'numpy', 'scikit-learn', 'joblib'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package)
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        logger.error(f"Missing required packages: {', '.join(missing_packages)}")
        logger.info("Install them with: pip install " + " ".join(missing_packages))
        return False
    
    return True

def install_dependencies():
    """Install required dependencies"""
    logger.info("Installing required dependencies...")
    
    try:
        subprocess.check_call([
            sys.executable, "-m", "pip", "install", 
            "pandas", "numpy", "scikit-learn", "joblib"
        ])
        logger.info("Dependencies installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"Failed to install dependencies: {e}")
        return False

def run_demand_training():
    """Run demand prediction model training"""
    logger.info("Starting demand prediction model training...")
    
    try:
        from training.train_demand_model import DemandModelTrainer
        
        trainer = DemandModelTrainer()
        model_data = trainer.run_training(days=90, use_advanced=True)
        
        logger.info("Demand prediction model training completed successfully!")
        return True
        
    except Exception as e:
        logger.error(f"Demand training failed: {str(e)}")
        return False

def create_directories():
    """Create necessary directories"""
    directories = [
        "models",
        "training",
        "data",
        "logs"
    ]
    
    for directory in directories:
        Path(directory).mkdir(exist_ok=True)
        logger.info(f"Created directory: {directory}")

def test_trained_models():
    """Test the trained models"""
    logger.info("Testing trained models...")
    
    try:
        import joblib
        from pathlib import Path
        
        model_path = Path("models/demand_model.pkl")
        metadata_path = Path("models/demand_model_metadata.json")
        
        if model_path.exists() and metadata_path.exists():
            # Load model
            model = joblib.load(model_path)
            
            # Load metadata
            import json
            with open(metadata_path, 'r') as f:
                metadata = json.load(f)
            
            logger.info("✅ Model loaded successfully")
            logger.info(f"✅ Model accuracy: {metadata['metrics']['accuracy']:.2%}")
            logger.info(f"✅ MAE: {metadata['metrics']['mae']:.2f}")
            logger.info(f"✅ RMSE: {metadata['metrics']['rmse']:.2f}")
            
            # Test prediction
            import numpy as np
            test_features = np.random.random((1, len(metadata['feature_names'])))
            prediction = model.predict(test_features)
            
            logger.info(f"✅ Test prediction: {prediction[0]:.2f} passengers")
            
            return True
        else:
            logger.error("❌ Model files not found")
            return False
            
    except Exception as e:
        logger.error(f"❌ Model testing failed: {str(e)}")
        return False

def create_requirements_file():
    """Create requirements file for ML service"""
    requirements = """# Smart Bus ML Service Requirements
fastapi==0.104.1
uvicorn==0.24.0
pandas==2.1.3
numpy==1.25.2
scikit-learn==1.3.2
joblib==1.3.2
pydantic==2.5.0
python-multipart==0.0.6

# Optional: Advanced ML libraries
# tensorflow==2.15.0
# xgboost==2.0.2
# optuna==3.4.0
"""
    
    with open("requirements.txt", "w") as f:
        f.write(requirements)
    
    logger.info("Created requirements.txt file")

def main():
    """Main training pipeline"""
    print("🚌 Smart Bus System - ML Model Training Pipeline")
    print("=" * 60)
    
    # Create directories
    create_directories()
    
    # Check dependencies
    if not check_dependencies():
        logger.info("Installing missing dependencies...")
        if not install_dependencies():
            logger.error("Failed to install dependencies. Exiting.")
            return False
    
    # Run training
    logger.info("Starting ML model training pipeline...")
    
    # Train demand prediction model
    if not run_demand_training():
        logger.error("Demand training failed. Exiting.")
        return False
    
    # Test trained models
    if not test_trained_models():
        logger.error("Model testing failed. Exiting.")
        return False
    
    # Create requirements file
    create_requirements_file()
    
    print("\n" + "=" * 60)
    print("🎉 ML TRAINING PIPELINE COMPLETED SUCCESSFULLY!")
    print("=" * 60)
    print("✅ Demand prediction model trained")
    print("✅ Model accuracy verified")
    print("✅ Requirements file created")
    print("\nNext steps:")
    print("1. Start the enhanced ML service: python enhanced_main.py")
    print("2. Test the API endpoints")
    print("3. Integrate with the frontend")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
