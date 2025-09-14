# 📡 API Documentation

## Overview

The Smart Bus System provides RESTful APIs for real-time bus tracking, demand prediction, and fleet management. The system consists of two main API services:

- **Backend API** (NestJS) - Port 3001
- **ML Service API** (FastAPI) - Port 8001

## 🔗 Base URLs

- **Backend API**: `http://localhost:3001`
- **ML Service API**: `http://localhost:8001`
- **API Documentation**: `http://localhost:8001/docs` (Swagger UI)

---

## 🚌 Backend API (NestJS)

### Routes Management

#### Get All Routes
```http
GET /routes
```

**Response:**
```json
{
  "routes": [
    {
      "route_id": 1,
      "source": "Gandhinagar",
      "destination": "Ahmedabad",
      "stops": ["Stop1", "Stop2", "Stop3"],
      "distance": 45.5,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Get Route by ID
```http
GET /routes/{routeId}
```

**Parameters:**
- `routeId` (number): Route identifier

#### Get Route Performance
```http
GET /routes/{routeId}/performance
```

**Response:**
```json
{
  "route_id": 1,
  "route": { /* route details */ },
  "last_24h": {
    "total_revenue": 1250.50,
    "total_passengers": 450,
    "total_tickets": 180,
    "avg_passengers_per_ticket": 2.5
  }
}
```

### Bus Management

#### Get All Buses
```http
GET /buses
```

**Response:**
```json
{
  "buses": [
    {
      "bus_id": 1,
      "route_id": 1,
      "capacity": 50,
      "status": "active",
      "license_plate": "GJ-01-AB-1234",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Get Live Bus Locations
```http
GET /buses/live
```

**Response:**
```json
{
  "buses": [
    {
      "bus_id": 1,
      "route_id": 1,
      "latitude": 23.0225,
      "longitude": 72.5714,
      "speed": 25.5,
      "direction": 45.0,
      "timestamp": "2024-01-01T12:00:00Z",
      "occupancy": 35,
      "capacity": 50
    }
  ]
}
```

### Passenger Analytics

#### Get Current Occupancy
```http
GET /passengers/current
```

**Query Parameters:**
- `route_id` (optional): Filter by route
- `hours` (optional): Hours to look back (default: 24)

**Response:**
```json
{
  "occupancy_data": [
    {
      "bus_id": 1,
      "route_id": 1,
      "occupancy": 35,
      "capacity": 50,
      "occupancy_percentage": 70.0,
      "timestamp": "2024-01-01T12:00:00Z"
    }
  ]
}
```

#### Get Occupancy Statistics
```http
GET /passengers/occupancy-stats
```

**Query Parameters:**
- `route_id` (optional): Filter by route
- `days` (optional): Number of days to analyze (default: 7)

**Response:**
```json
{
  "period_days": 7,
  "route_stats": [
    {
      "route_id": 1,
      "route": { /* route details */ },
      "total_readings": 1008,
      "total_occupancy": 25000,
      "max_occupancy": 50,
      "min_occupancy": 0,
      "avg_occupancy": 24.8,
      "capacity": 50,
      "avg_occupancy_percentage": 49.6,
      "median_occupancy_percentage": 45.0,
      "p90_occupancy_percentage": 85.0
    }
  ],
  "summary": {
    "total_routes": 6,
    "total_readings": 6048,
    "overall_avg_occupancy": 22.5
  }
}
```

### Demand Prediction

#### Get Demand Forecast
```http
GET /demand/forecast
```

**Query Parameters:**
- `route_id` (optional): Filter by route
- `hours` (optional): Forecast hours (default: 24)

**Response:**
```json
{
  "forecast": {
    "route_id": 1,
    "period_hours": 24,
    "hourly_predictions": [
      {
        "hour": 0,
        "predicted_demand": 15,
        "confidence": 0.85
      }
    ],
    "summary": {
      "total_predicted_passengers": 450,
      "peak_hour": 8,
      "peak_demand": 35,
      "avg_demand": 18.75
    },
    "generated_at": "2024-01-01T12:00:00Z",
    "method": "ml_prediction"
  }
}
```

#### Get Demand Trends
```http
GET /demand/trends
```

**Query Parameters:**
- `route_id` (optional): Filter by route
- `days` (optional): Number of days (default: 7)

**Response:**
```json
{
  "route_id": 1,
  "period_days": 7,
  "daily_trends": [
    {
      "date": "2024-01-01",
      "hourly_data": {
        "0": 15,
        "1": 12,
        "2": 8
      },
      "total_passengers": 450
    }
  ],
  "summary": {
    "total_passengers": 3150,
    "total_tickets": 1260,
    "avg_passengers_per_ticket": 2.5
  }
}
```

### Schedule Management

#### Get Schedule Comparison
```http
GET /schedule/comparison
```

**Response:**
```json
{
  "comparison": {
    "route_id": 1,
    "current_schedule": {
      "start_time": "06:00",
      "end_time": "22:00",
      "headway_minutes": 15,
      "total_trips": 64
    },
    "optimized_schedule": {
      "start_time": "06:15",
      "end_time": "22:15",
      "headway_minutes": 12,
      "total_trips": 80
    },
    "improvements": {
      "efficiency_gain": 0.25,
      "headway_reduction": 3,
      "additional_trips": 16,
      "estimated_savings": 150.75
    },
    "generated_at": "2024-01-01T12:00:00Z"
  }
}
```

---

## 🤖 ML Service API (FastAPI)

### Health Check

#### Service Status
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00Z",
  "version": "1.0.0"
}
```

### Demand Prediction

#### Predict Hourly Demand
```http
POST /predict
```

**Request Body:**
```json
{
  "route_id": 1,
  "hour": 8,
  "day_of_week": 1,
  "historical_data": {
    "ticket_sales": [120, 135, 110, 140],
    "passenger_counts": [45, 52, 38, 48]
  }
}
```

**Response:**
```json
{
  "predicted_demand": 25,
  "confidence": 0.87,
  "method": "time_series_analysis",
  "factors": {
    "historical_average": 22.5,
    "day_of_week_factor": 1.1,
    "hour_factor": 1.2,
    "random_variation": 0.1
  },
  "generated_at": "2024-01-01T12:00:00Z"
}
```

### Schedule Optimization

#### Optimize Route Schedules
```http
POST /optimize
```

**Request Body:**
```json
{
  "route_id": 1,
  "current_schedule": {
    "start_time": "06:00",
    "end_time": "22:00",
    "headway_minutes": 15
  },
  "constraints": {
    "min_headway": 5,
    "max_headway": 30,
    "driver_availability": "06:00-23:00"
  },
  "demand_data": {
    "peak_hours": [7, 8, 17, 18],
    "avg_demand": 20,
    "peak_demand": 35
  }
}
```

**Response:**
```json
{
  "optimized_schedule": {
    "start_time": "06:15",
    "end_time": "22:15",
    "headway_minutes": 12,
    "total_trips": 80
  },
  "adjustments": [
    {
      "time": "07:00",
      "old_headway": 15,
      "new_headway": 10,
      "reason": "peak_hour_optimization"
    }
  ],
  "metrics": {
    "efficiency_improvement": 0.25,
    "bunching_reduction": 0.15,
    "passenger_wait_time_reduction": 0.20
  },
  "generated_at": "2024-01-01T12:00:00Z"
}
```

---

## 🔧 Error Handling

### Standard Error Response
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid route ID provided",
    "details": {
      "field": "route_id",
      "value": "invalid",
      "constraint": "Must be a positive integer"
    },
    "timestamp": "2024-01-01T12:00:00Z"
  }
}
```

### HTTP Status Codes
- `200` - Success
- `400` - Bad Request
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

---

## 🔐 Authentication

Currently, the API does not require authentication for development purposes. In production, implement:

- JWT tokens
- API key authentication
- Rate limiting
- CORS configuration

---

## 📊 Rate Limits

- **Backend API**: 1000 requests/hour per IP
- **ML Service API**: 100 requests/hour per IP
- **Burst Limit**: 50 requests/minute

---

## 🧪 Testing

### Test Endpoints
```bash
# Test backend health
curl http://localhost:3001/health

# Test ML service health
curl http://localhost:8001/health

# Test demand prediction
curl -X POST http://localhost:8001/predict \
  -H "Content-Type: application/json" \
  -d '{"route_id": 1, "hour": 8, "day_of_week": 1}'
```

### Postman Collection
Import the provided Postman collection for easy API testing.

---

## 📈 Monitoring

### Health Endpoints
- Backend: `GET /health`
- ML Service: `GET /health`

### Metrics
- Response times
- Error rates
- Request counts
- Resource usage

---

## 🔄 WebSocket Support

Real-time updates are available via WebSocket connections:

```javascript
const ws = new WebSocket('ws://localhost:3001/ws');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Handle real-time updates
};
```

---

## 📝 Changelog

### Version 1.0.0
- Initial API release
- Basic CRUD operations
- Real-time tracking
- AI-powered predictions
- Schedule optimization

---

## 🤝 Support

For API support and questions:
- Check the Swagger documentation at `/docs`
- Review error messages and status codes
- Contact the development team
- Create an issue in the repository
