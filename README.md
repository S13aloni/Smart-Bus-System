# 🚌 Smart Bus Optimization System

A comprehensive full-stack hackathon project featuring real-time bus tracking, AI-powered demand prediction, and schedule optimization.

## ✨ Features

### 🗺️ **Live Bus Tracking**
- **Real-time GPS positions** on interactive maps
- **Live bus movement simulation** with realistic routes
- **Occupancy monitoring** with color-coded indicators
- **Auto-updating data** every 5 seconds
- **Interactive bus selection** with detailed popups

### 📊 **Demand Prediction**
- **AI-powered forecasting** for next 24 hours
- **Peak hours analysis** with visual indicators
- **Route-specific predictions** with confidence scores
- **Interactive charts** showing demand patterns
- **Real-time prediction updates**

### ⚡ **Schedule Optimization**
- **Before vs After comparison** with detailed metrics
- **Headway optimization** to reduce bus bunching
- **Efficiency scoring** with visual improvements
- **Adjustment reasoning** for each schedule change
- **Performance metrics** and improvement tracking

### 🎨 **Modern UI/UX**
- **Responsive design** with Tailwind CSS
- **Real-time indicators** and live data badges
- **Interactive charts** with Chart.js/Recharts
- **Professional dashboard** with enhanced cards
- **Smooth animations** and transitions

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 + TailwindCSS + React Leaflet + Recharts
- **Backend**: NestJS (TypeScript) + PostgreSQL + TypeORM
- **ML Service**: Python FastAPI + scikit-learn + pandas
- **Maps**: OpenStreetMap via React Leaflet
- **Charts**: Recharts for data visualization
- **Styling**: TailwindCSS with custom components

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.8+
- PostgreSQL 12+

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smart-bus-optimization
   ```

2. **Install dependencies**
   ```bash
   # Install all dependencies
   npm run install:all
   
   # Or install individually
   npm install                    # Root dependencies
   cd frontend && npm install    # Frontend dependencies
   cd ../backend && npm install  # Backend dependencies
   cd ../ml-service && pip install -r requirements.txt  # ML service
   ```

3. **Setup database**
   ```bash
   # Create database
   createdb smart_bus_db
   
   # Run schema
   psql -d smart_bus_db -f database/schema.sql
   
   # Seed with sample data
   psql -d smart_bus_db -f database/seed_data.sql
   ```

4. **Start the application**
   ```bash
   # Start all services
   npm run dev
   
   # Or start individually
   npm run dev:frontend  # http://localhost:3000
   npm run dev:backend   # http://localhost:3001
   npm run dev:ml        # http://localhost:8001
   ```

## 🌐 Access Points

- **Frontend Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api
- **ML Service**: http://localhost:8001
- **ML Service Docs**: http://localhost:8001/docs

## 📱 Application Features

### Live Tracking Tab
- **Interactive Map**: Real-time bus positions with custom markers
- **Bus List**: Live occupancy and status information
- **Route Information**: Detailed route data and stops
- **Live Updates**: Auto-refreshing every 5 seconds
- **Bus Selection**: Click buses for detailed information

### Demand Prediction Tab
- **24-Hour Forecast**: AI-powered demand predictions
- **Peak Hours**: Top 5 busiest hours identified
- **Route Analysis**: Individual route demand patterns
- **Confidence Scores**: Prediction reliability indicators
- **Interactive Charts**: Bar charts and pie charts

### Before vs After Tab
- **Schedule Comparison**: Current vs optimized schedules
- **Performance Metrics**: Headway and efficiency improvements
- **Adjustment Details**: Reasons for each schedule change
- **Visual Charts**: Before/after comparison charts
- **Improvement Tracking**: Quantified optimization results

## 🗄️ Database Schema

The system includes a comprehensive PostgreSQL schema:

- **buses** - Bus fleet information and capacity
- **routes** - Route definitions with stops and distances
- **ticket_sales** - Historical sales data for demand analysis
- **gps_logs** - Real-time GPS tracking data
- **passenger_counts** - Live occupancy monitoring
- **optimized_schedule** - ML-optimized schedule data

## 🔧 Configuration

### Environment Variables

**Backend** (`backend/.env`):
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

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_ML_SERVICE_URL=http://localhost:8001
NEXT_PUBLIC_MAP_CENTER_LAT=40.7128
NEXT_PUBLIC_MAP_CENTER_LNG=-74.0060
NEXT_PUBLIC_MAP_ZOOM=12
```

## 📊 Real-time Data Simulation

The application includes a sophisticated data simulation system:

- **Realistic Bus Movement**: Buses follow predefined routes with realistic speeds
- **Passenger Simulation**: Dynamic occupancy changes based on time and location
- **GPS Tracking**: Continuous position updates with direction and speed
- **Route Paths**: Multiple routes with waypoints for realistic movement
- **Live Updates**: Data refreshes every 5 seconds for real-time feel

## 🎯 Key Components

### Data Service (`frontend/lib/dataService.ts`)
- Centralized data management
- Realistic bus movement simulation
- Route path calculations
- Demand forecasting algorithms
- Schedule optimization logic

### Bus Map (`frontend/components/BusMap.tsx`)
- Interactive Leaflet map integration
- Custom bus markers with occupancy colors
- Real-time position updates
- Detailed bus information popups
- Map controls and legend

### Live Tracking (`frontend/components/LiveTracking.tsx`)
- Real-time bus monitoring
- Occupancy visualization
- Live data indicators
- Bus selection and details
- Auto-refresh functionality

## 🚦 Performance Features

- **Optimized Rendering**: Efficient React components with proper state management
- **Real-time Updates**: 5-second refresh intervals for live data
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Smooth Animations**: CSS transitions and loading states
- **Error Handling**: Graceful error states and fallbacks

## 🔒 Security & Best Practices

- **CORS Configuration**: Proper cross-origin resource sharing
- **Input Validation**: Type-safe data handling
- **Environment Variables**: Secure configuration management
- **Error Boundaries**: Graceful error handling
- **TypeScript**: Type safety throughout the application

## 📈 Future Enhancements

- **Real API Integration**: Connect to actual bus tracking APIs
- **Machine Learning**: Advanced demand prediction models
- **Mobile App**: React Native mobile application
- **Notifications**: Real-time alerts and updates
- **Analytics**: Advanced reporting and insights

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - Built for hackathon demonstration purposes.

---

**Built with ❤️ for the Smart Bus Optimization System**

*Real-time tracking • AI predictions • Schedule optimization*