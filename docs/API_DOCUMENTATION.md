# Smart Bus Optimization System - API Documentation

## Overview

The Smart Bus Optimization System consists of three main services:

1. **Frontend (Next.js)** - React-based dashboard on port 3000
2. **Backend (NestJS)** - REST API on port 3001
3. **ML Service (Python FastAPI)** - Machine learning service on port 8001

## Backend API Endpoints

### Base URL: `http://localhost:3001`

### Buses

#### `GET /buses`
Get all buses with route information.

**Response:**
```json
[
  {
    "bus_id": 1,
    "route_id": 1,
    "capacity": 50,
    "status": "active",
    "license_plate": "BUS-001",
    "created_at": "2024-01-01T00:00:00.000Z",
    "route": {
      "route_id": 1,
      "source": "Downtown Station",
      "destination": "Airport Terminal",
      "stops": ["Central Plaza", "University Campus", "Shopping Mall", "Airport Terminal"],
      "distance": 25.5
    }
  }
]
```

#### `GET /buses/live`
Get real-time bus tracking data with current positions and occupancy.

**Response:**
```json
[
  {
    "bus_id": 1,
    "license_plate": "BUS-001",
    "route_id": 1,
    "route": { /* route object */ },
    "capacity": 50,
    "status": "active",
    "current_position": {
      "latitude": 40.7128,
      "longitude": -74.0060,
      "speed": 35.5,
      "direction": 45.0,
      "timestamp": "2024-01-01T12:00:00.000Z"
    },
    "occupancy": 45,
    "occupancy_percentage": 90
  }
]
```

#### `GET /buses/:id`
Get specific bus details.

#### `GET /buses/:id/history?hours=24`
Get GPS tracking history for a bus.

#### `GET /buses/:id/occupancy?hours=24`
Get occupancy history for a bus.

### Routes

#### `GET /routes`
Get all bus routes.

#### `GET /routes/:id`
Get specific route details.

#### `GET /routes/:id/demand?days=7`
Get demand analysis for a route.

#### `GET /routes/:id/performance`
Get route performance metrics.

### Schedules

#### `GET /schedule/optimized`
Get all optimized schedules.

#### `GET /schedule/optimized/route/:routeId`
Get optimized schedules for a specific route.

#### `GET /schedule/comparison`
Get comparison between current and optimized schedules.

### Demand Prediction

#### `POST /demand/predict`
Trigger demand prediction using ML service.

#### `GET /demand/forecast?route_id=1`
Get demand forecast for routes.

#### `GET /demand/trends?route_id=1&days=7`
Get demand trends analysis.

### Passengers

#### `GET /passengers/counts?route_id=1&hours=24`
Get passenger count data.

#### `GET /passengers/occupancy-stats?route_id=1&days=7`
Get occupancy statistics.

#### `GET /passengers/current`
Get current occupancy for all active buses.

#### `GET /passengers/peak-hours?route_id=1&days=7`
Get peak hours analysis.

### Simulation

#### `GET /simulation/status`
Get simulation status.

#### `POST /simulation/start`
Start bus simulation.

#### `POST /simulation/stop`
Stop bus simulation.

#### `DELETE /simulation/reset`
Reset simulation data and restart.

## ML Service API Endpoints

### Base URL: `http://localhost:8001`

#### `GET /`
Health check endpoint.

#### `GET /health`
Detailed health status.

#### `POST /predict`
Predict passenger demand.

**Request:**
```json
{
  "data": {
    "ticket_sales": [/* historical ticket sales */],
    "passenger_counts": [/* historical passenger counts */],
    "routes": [/* route information */]
  },
  "prediction_hours": 24
}
```

**Response:**
```json
{
  "route_id": null,
  "predictions": [
    {
      "route_id": 1,
      "hour": 8,
      "day_of_week": 1,
      "predicted_passengers": 45,
      "timestamp": "2024-01-01T08:00:00.000Z",
      "confidence": 0.8
    }
  ],
  "confidence_scores": [0.8],
  "model_info": {
    "model_type": "time_series_arima",
    "features_used": ["hour", "day_of_week", "historical_demand"],
    "training_data_points": 1000
  },
  "generated_at": "2024-01-01T12:00:00.000Z"
}
```

#### `GET /predict?route_id=1`
Get demand forecast for specific route.

#### `POST /optimize`
Optimize bus schedules.

**Request:**
```json
{
  "routes": [/* route information */],
  "current_schedules": [/* current schedule data */],
  "constraints": {
    "target_headway_minutes": 15,
    "min_headway_minutes": 5,
    "max_headway_minutes": 30
  }
}
```

**Response:**
```json
{
  "optimized_schedules": [
    {
      "bus_id": 1,
      "route_id": 1,
      "start_time": "06:15:00",
      "end_time": "07:45:00",
      "adjustment_reason": "Reduced gap between buses to prevent bunching",
      "original_start_time": "06:00:00",
      "time_adjustment_minutes": 15
    }
  ],
  "improvement_metrics": {
    "headway_improvement": {
      "current_avg_headway": 20.5,
      "optimized_avg_headway": 15.2,
      "improvement_minutes": 5.3
    },
    "efficiency_improvement": {
      "current_efficiency": 65.2,
      "optimized_efficiency": 82.1,
      "improvement_percentage": 25.9
    }
  },
  "optimization_reasons": [
    "Reduced schedule variance to prevent bus bunching",
    "Improved average headway for better passenger experience"
  ],
  "generated_at": "2024-01-01T12:00:00.000Z"
}
```

## Database Schema

### Tables

#### `buses`
- `bus_id` (SERIAL PRIMARY KEY)
- `route_id` (INTEGER REFERENCES routes)
- `capacity` (INTEGER)
- `status` (VARCHAR)
- `license_plate` (VARCHAR UNIQUE)
- `created_at` (TIMESTAMP)

#### `routes`
- `route_id` (SERIAL PRIMARY KEY)
- `source` (VARCHAR)
- `destination` (VARCHAR)
- `stops` (JSONB)
- `distance` (DECIMAL)
- `created_at` (TIMESTAMP)

#### `ticket_sales`
- `ticket_id` (SERIAL PRIMARY KEY)
- `bus_id` (INTEGER REFERENCES buses)
- `route_id` (INTEGER REFERENCES routes)
- `passenger_count` (INTEGER)
- `timestamp` (TIMESTAMP)
- `price` (DECIMAL)

#### `gps_logs`
- `log_id` (SERIAL PRIMARY KEY)
- `bus_id` (INTEGER REFERENCES buses)
- `latitude` (DECIMAL)
- `longitude` (DECIMAL)
- `speed` (DECIMAL)
- `timestamp` (TIMESTAMP)
- `direction` (DECIMAL)

#### `passenger_counts`
- `count_id` (SERIAL PRIMARY KEY)
- `bus_id` (INTEGER REFERENCES buses)
- `route_id` (INTEGER REFERENCES routes)
- `occupancy` (INTEGER)
- `timestamp` (TIMESTAMP)

#### `optimized_schedule`
- `schedule_id` (SERIAL PRIMARY KEY)
- `bus_id` (INTEGER REFERENCES buses)
- `route_id` (INTEGER REFERENCES routes)
- `start_time` (TIME)
- `end_time` (TIME)
- `adjustment_reason` (TEXT)
- `created_at` (TIMESTAMP)

## Frontend Components

### Main Dashboard
- **Live Tracking**: Real-time bus map with GPS positions
- **Demand Prediction**: AI-powered demand forecasting charts
- **Before vs After**: Schedule optimization comparison

### Key Features
- Interactive maps with React Leaflet
- Real-time data updates every 30 seconds
- Responsive design with Tailwind CSS
- Chart visualizations with Chart.js
- Real-time bus simulation

## Getting Started

1. **Install Dependencies**
   ```bash
   npm run install:all
   ```

2. **Setup Database**
   - Install PostgreSQL
   - Create database: `smart_bus_db`
   - Run schema: `psql -d smart_bus_db -f database/schema.sql`
   - Seed data: `psql -d smart_bus_db -f database/seed_data.sql`

3. **Start Services**
   ```bash
   npm run dev
   ```

4. **Access Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - ML Service: http://localhost:8001
   - API Docs: http://localhost:3001/api

## Environment Variables

### Backend (.env)
```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=smart_bus_db
PORT=3001
NODE_ENV=development
ML_SERVICE_URL=http://localhost:8001
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_ML_SERVICE_URL=http://localhost:8001
NEXT_PUBLIC_MAP_CENTER_LAT=40.7128
NEXT_PUBLIC_MAP_CENTER_LNG=-74.0060
NEXT_PUBLIC_MAP_ZOOM=12
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure PostgreSQL is running
   - Check database credentials in .env file
   - Verify database exists

2. **ML Service Not Responding**
   - Check if Python dependencies are installed
   - Verify ML service is running on port 8001
   - Check ML service logs

3. **Frontend Not Loading Data**
   - Verify backend API is running
   - Check browser console for errors
   - Ensure CORS is properly configured

4. **Map Not Displaying**
   - Check if Leaflet CSS is loaded
   - Verify map center coordinates
   - Check for JavaScript errors

### Logs

- Backend logs: Check console output
- ML Service logs: Check terminal output
- Frontend logs: Check browser console
- Database logs: Check PostgreSQL logs

