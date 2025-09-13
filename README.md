# Smart Bus Optimization System

A full-stack hackathon project that optimizes bus routes and schedules using machine learning for demand prediction and real-time tracking.

## Tech Stack

- **Frontend**: Next.js + TailwindCSS + React Leaflet + Chart.js
- **Backend**: NestJS (TypeScript) + PostgreSQL
- **ML Service**: Python FastAPI + scikit-learn + pandas
- **Database**: PostgreSQL with pgAdmin

## Project Structure

```
smart-bus-optimization/
├── frontend/          # Next.js frontend application
├── backend/           # NestJS backend API
├── ml-service/        # Python FastAPI ML service
├── database/          # PostgreSQL schema and seed data
└── docs/             # Documentation and API specs
```

## Features

- 🚌 Real-time bus tracking with GPS simulation
- 📊 Demand prediction using time-series analysis
- 🎯 Schedule optimization to reduce bus bunching
- 📈 Interactive dashboards with charts and maps
- 🔄 Live data updates and real-time monitoring

## Quick Start

1. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

2. **Set up PostgreSQL database:**
   - Install PostgreSQL and pgAdmin
   - Create database `smart_bus_db`
   - Run the schema and seed scripts from `database/` folder

3. **Start all services:**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - ML Service: http://localhost:8001
   - API Documentation: http://localhost:3001/api

## API Endpoints

### Backend (NestJS)
- `GET /buses/live` - Live bus tracking data
- `GET /schedule/optimized` - Optimized schedules
- `POST /demand/predict` - Trigger demand prediction
- `GET /routes` - Bus routes information
- `GET /passenger-counts` - Passenger occupancy data

### ML Service (Python FastAPI)
- `POST /predict` - Demand prediction per route/hour
- `POST /optimize` - Schedule optimization
- `GET /health` - Service health check

## Database Schema

- `buses` - Bus information and capacity
- `routes` - Route details and stops
- `ticket_sales` - Historical ticket sales data
- `gps_logs` - Real-time GPS tracking
- `passenger_counts` - Occupancy data
- `optimized_schedule` - ML-optimized schedules

## Development

Each service can be run independently:

```bash
# Frontend only
npm run dev:frontend

# Backend only
npm run dev:backend

# ML Service only
npm run dev:ml
```

## License

MIT License - Built for hackathon demonstration purposes.

