# Smart Bus Optimization System - Installation Guide

## 🚌 Project Overview

A comprehensive full-stack hackathon project featuring:

- **Real-time bus tracking** with GPS simulation
- **AI-powered demand prediction** using time-series analysis
- **Schedule optimization** to reduce bus bunching
- **Interactive dashboards** with maps and charts
- **Live data updates** and real-time monitoring

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 + TailwindCSS + React Leaflet + Chart.js
- **Backend**: NestJS (TypeScript) + PostgreSQL + TypeORM
- **ML Service**: Python FastAPI + scikit-learn + pandas
- **Database**: PostgreSQL with comprehensive schema
- **Maps**: OpenStreetMap via React Leaflet
- **Charts**: Chart.js with React integration

## 📋 Prerequisites

Before installing, ensure you have:

1. **Node.js 18+** - [Download here](https://nodejs.org/)
2. **Python 3.8+** - [Download here](https://python.org/)
3. **PostgreSQL 12+** - [Download here](https://postgresql.org/)
4. **Git** - [Download here](https://git-scm.com/)

## 🚀 Quick Start (Windows)

### Option 1: Automated Setup
```bash
# Run the setup script
setup.bat
```

### Option 2: Manual Setup

1. **Clone and Install Dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install backend dependencies
   cd backend && npm install && cd ..
   
   # Install frontend dependencies
   cd frontend && npm install && cd ..
   
   # Install ML service dependencies
   cd ml-service && pip install -r requirements.txt && cd ..
   ```

2. **Setup Environment Files**
   ```bash
   # Copy environment templates
   copy backend\env.example backend\.env
   copy frontend\env.example frontend\.env.local
   ```

3. **Setup Database**
   ```bash
   # Create database
   createdb smart_bus_db
   
   # Run schema
   psql -d smart_bus_db -f database\schema.sql
   
   # Seed with sample data
   psql -d smart_bus_db -f database\seed_data.sql
   ```

4. **Start All Services**
   ```bash
   npm run dev
   ```

## 🐧 Linux/macOS Setup

### Option 1: Automated Setup
```bash
# Make script executable
chmod +x setup.sh

# Run setup
./setup.sh
```

### Option 2: Manual Setup

1. **Install Dependencies**
   ```bash
   npm run install:all
   ```

2. **Setup Environment**
   ```bash
   cp backend/env.example backend/.env
   cp frontend/env.example frontend/.env.local
   ```

3. **Setup Database**
   ```bash
   createdb smart_bus_db
   psql -d smart_bus_db -f database/schema.sql
   psql -d smart_bus_db -f database/seed_data.sql
   ```

4. **Start Services**
   ```bash
   npm run dev
   ```

## 🌐 Access Points

Once running, access the application at:

- **Frontend Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api
- **ML Service**: http://localhost:8001
- **ML Service Docs**: http://localhost:8001/docs

## 📊 Features

### Live Bus Tracking
- Real-time GPS positions on interactive map
- Bus occupancy and status monitoring
- Route information and passenger counts
- Auto-updating every 30 seconds

### Demand Prediction
- AI-powered passenger demand forecasting
- 24-hour prediction charts
- Peak hours analysis
- Route-specific demand trends

### Schedule Optimization
- Before vs After comparison
- Headway optimization
- Efficiency scoring
- Adjustment reasoning

### Real-time Simulation
- Automated bus movement simulation
- GPS log generation
- Passenger count updates
- Realistic traffic patterns

## 🗄️ Database Schema

The system includes a comprehensive PostgreSQL schema with:

- **buses** - Bus fleet information
- **routes** - Route definitions and stops
- **ticket_sales** - Historical sales data
- **gps_logs** - Real-time tracking data
- **passenger_counts** - Occupancy data
- **optimized_schedule** - ML-optimized schedules

## 🔧 Configuration

### Backend Configuration (backend/.env)
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=smart_bus_db
PORT=3001
NODE_ENV=development
ML_SERVICE_URL=http://localhost:8001
```

### Frontend Configuration (frontend/.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_ML_SERVICE_URL=http://localhost:8001
NEXT_PUBLIC_MAP_CENTER_LAT=40.7128
NEXT_PUBLIC_MAP_CENTER_LNG=-74.0060
NEXT_PUBLIC_MAP_ZOOM=12
```

## 🚦 Running Individual Services

```bash
# Frontend only
npm run dev:frontend

# Backend only
npm run dev:backend

# ML Service only
npm run dev:ml

# All services
npm run dev
```

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Kill processes on ports
   netstat -ano | findstr :3000
   netstat -ano | findstr :3001
   netstat -ano | findstr :8001
   ```

2. **Database Connection Error**
   - Ensure PostgreSQL is running
   - Check credentials in .env file
   - Verify database exists

3. **Python Dependencies Error**
   ```bash
   # Reinstall ML service dependencies
   cd ml-service
   pip install -r requirements.txt --force-reinstall
   ```

4. **Frontend Build Error**
   ```bash
   # Clear Next.js cache
   cd frontend
   rm -rf .next
   npm run build
   ```

### Logs and Debugging

- **Backend logs**: Check terminal output
- **Frontend logs**: Check browser console
- **ML Service logs**: Check terminal output
- **Database logs**: Check PostgreSQL logs

## 📈 Performance

The system is optimized for:

- **Real-time updates** every 30 seconds
- **Efficient database queries** with proper indexing
- **Responsive UI** with Tailwind CSS
- **Scalable architecture** with microservices

## 🔒 Security

- CORS properly configured
- Input validation with class-validator
- SQL injection protection with TypeORM
- Environment variables for sensitive data

## 📝 API Documentation

Comprehensive API documentation is available at:
- **Backend**: http://localhost:3001/api
- **ML Service**: http://localhost:8001/docs

## 🎯 Next Steps

After installation:

1. **Explore the Dashboard** - Navigate through different tabs
2. **Monitor Live Data** - Watch real-time bus movements
3. **Analyze Predictions** - Review demand forecasting
4. **Compare Schedules** - See optimization improvements
5. **Customize Settings** - Modify simulation parameters

## 🤝 Support

For issues or questions:

1. Check the troubleshooting section
2. Review API documentation
3. Check console logs for errors
4. Verify all services are running

## 📄 License

MIT License - Built for hackathon demonstration purposes.

---

**Happy Coding! 🚌✨**

