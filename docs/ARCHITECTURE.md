# 🏗️ System Architecture

## Overview

The Smart Bus Optimization System is a microservices-based architecture designed for real-time bus fleet management with AI-powered analytics. The system consists of three main components working together to provide comprehensive bus tracking, demand prediction, and schedule optimization.

## 🎯 Architecture Principles

- **Microservices**: Loosely coupled, independently deployable services
- **Real-time Processing**: Live data updates and instant responses
- **AI Integration**: Machine learning for predictions and optimization
- **Scalability**: Horizontal scaling capabilities
- **Fault Tolerance**: Resilient to component failures
- **Data Consistency**: Eventual consistency with real-time updates

## 🏛️ System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Smart Bus System                        │
├─────────────────────────────────────────────────────────────────┤
│  Frontend Layer (React/Next.js)                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Dashboard     │  │   Live Map      │  │   Analytics     │ │
│  │   Components    │  │   Components    │  │   Components    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Notifications │  │   Sidebar       │  │   Mobile UI     │ │
│  │   System        │  │   Navigation    │  │   Components    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API Gateway Layer                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   REST APIs     │  │   WebSocket     │  │   GraphQL       │ │
│  │   (NestJS)      │  │   Connections   │  │   (Future)      │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Service Layer                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Backend       │  │   ML Service    │  │   Notification  │ │
│  │   Service       │  │   (FastAPI)     │  │   Service       │ │
│  │   (NestJS)      │  │   Port: 8001    │  │   (Future)      │ │
│  │   Port: 3001    │  │                 │  │                 │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Data Layer                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   PostgreSQL    │  │   Redis Cache   │  │   File Storage  │ │
│  │   Database      │  │   (Future)      │  │   (Future)      │ │
│  │   Port: 5432    │  │                 │  │                 │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 🔧 Component Architecture

### 1. Frontend Layer (React/Next.js)

#### Technology Stack
- **Framework**: Next.js 13+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Maps**: Leaflet with React Leaflet
- **State Management**: React Hooks (useState, useEffect)
- **HTTP Client**: Fetch API

#### Key Components

```
frontend/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Main page
│   └── globals.css        # Global styles
├── components/            # React Components
│   ├── Sidebar.tsx        # Navigation sidebar
│   ├── Dashboard.tsx      # Main dashboard
│   ├── LiveTracking.tsx   # Real-time tracking
│   ├── BusMap.tsx         # Interactive map
│   ├── StatsOverview.tsx  # Statistics display
│   └── NotificationsPage.tsx # Alerts system
├── lib/                   # Utility functions
│   ├── dataService.ts     # API communication
│   └── enhancedDataService.ts # Data simulation
└── services/              # Business logic
    └── notificationService.ts # Notification management
```

#### Component Hierarchy
```
App
├── Sidebar
│   ├── Navigation Items
│   └── Notification Badge
├── Dashboard
│   ├── StatsOverview
│   ├── LiveTracking
│   │   └── BusMap
│   ├── DemandPrediction
│   ├── SchedulingEngine
│   └── NotificationsPage
└── Mobile Header (responsive)
```

### 2. Backend Service (NestJS)

#### Technology Stack
- **Framework**: NestJS (Node.js)
- **Language**: TypeScript
- **ORM**: TypeORM
- **Database**: PostgreSQL
- **Validation**: Class-validator
- **Documentation**: Swagger/OpenAPI

#### Service Architecture

```
backend/src/
├── entities/              # Database entities
│   ├── route.entity.ts
│   ├── bus.entity.ts
│   ├── gps-log.entity.ts
│   ├── passenger-count.entity.ts
│   └── ticket-sale.entity.ts
├── routes/               # Route management
│   ├── routes.service.ts
│   ├── routes.controller.ts
│   └── routes.module.ts
├── buses/                # Bus management
│   ├── buses.service.ts
│   ├── buses.controller.ts
│   └── buses.module.ts
├── passengers/           # Passenger analytics
│   ├── passengers.service.ts
│   ├── passengers.controller.ts
│   └── passengers.module.ts
├── demand/               # Demand prediction
│   ├── demand.service.ts
│   ├── demand.controller.ts
│   └── demand.module.ts
├── simulation/           # Data simulation
│   ├── simulation.service.ts
│   └── simulation.module.ts
└── seed/                 # Database seeding
    ├── seed.service.ts
    ├── seed.controller.ts
    └── seed.module.ts
```

#### API Design Patterns

**RESTful Endpoints:**
- `GET /routes` - List all routes
- `GET /routes/:id` - Get specific route
- `GET /buses/live` - Live bus locations
- `GET /passengers/current` - Current occupancy
- `GET /demand/forecast` - Demand predictions

**Response Format:**
```typescript
interface ApiResponse<T> {
  data: T;
  status: 'success' | 'error';
  message?: string;
  timestamp: string;
}
```

### 3. ML Service (FastAPI)

#### Technology Stack
- **Framework**: FastAPI (Python)
- **Language**: Python 3.8+
- **Data Processing**: Pandas, NumPy
- **Validation**: Pydantic
- **Documentation**: Auto-generated OpenAPI

#### Service Architecture

```
ml-service/
├── main.py               # FastAPI application
├── requirements.txt      # Python dependencies
├── models/              # ML models (future)
│   ├── demand_model.py
│   └── optimization_model.py
├── utils/               # Utility functions
│   ├── data_processor.py
│   └── metrics.py
└── tests/               # Unit tests
    ├── test_demand.py
    └── test_optimization.py
```

#### AI Algorithms

**Demand Prediction:**
```python
def predict_hourly_demand(route_id: int, hour: int, day_of_week: int) -> float:
    # Time series analysis
    # Historical data analysis
    # Seasonal pattern recognition
    # Random variation modeling
    return predicted_demand
```

**Schedule Optimization:**
```python
def optimize_route_schedules(route_data: dict) -> dict:
    # Constraint-based optimization
    # Headway calculation
    # Peak hour adjustments
    # Efficiency metrics
    return optimized_schedule
```

### 4. Database Layer (PostgreSQL)

#### Database Schema

```sql
-- Core Tables
CREATE TABLE routes (
    route_id SERIAL PRIMARY KEY,
    source VARCHAR(100) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    stops JSONB,
    distance DECIMAL(8,2),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE buses (
    bus_id SERIAL PRIMARY KEY,
    route_id INTEGER REFERENCES routes(route_id),
    capacity INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    license_plate VARCHAR(20) UNIQUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE gps_logs (
    log_id SERIAL PRIMARY KEY,
    bus_id INTEGER REFERENCES buses(bus_id),
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    speed DECIMAL(5,2),
    direction DECIMAL(5,2),
    timestamp TIMESTAMP DEFAULT NOW()
);

CREATE TABLE passenger_counts (
    count_id SERIAL PRIMARY KEY,
    bus_id INTEGER REFERENCES buses(bus_id),
    route_id INTEGER REFERENCES routes(route_id),
    occupancy INTEGER NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW()
);

CREATE TABLE ticket_sales (
    ticket_id SERIAL PRIMARY KEY,
    bus_id INTEGER REFERENCES buses(bus_id),
    route_id INTEGER REFERENCES routes(route_id),
    passenger_count INTEGER NOT NULL,
    price DECIMAL(8,2) NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW()
);
```

#### Indexes for Performance
```sql
-- Performance indexes
CREATE INDEX idx_gps_logs_bus_timestamp ON gps_logs(bus_id, timestamp);
CREATE INDEX idx_ticket_sales_timestamp ON ticket_sales(timestamp);
CREATE INDEX idx_passenger_counts_timestamp ON passenger_counts(timestamp);
CREATE INDEX idx_optimized_schedule_route ON optimized_schedule(route_id);
```

## 🔄 Data Flow Architecture

### 1. Real-time Data Flow

```
GPS Device → Backend API → Database → Frontend → Map Display
     │              │           │         │
     │              │           │         ▼
     │              │           │    WebSocket
     │              │           │         │
     │              │           │         ▼
     │              │           │    Real-time Updates
     │              │           │
     │              ▼           │
     │         Simulation       │
     │         Service          │
     │              │           │
     └──────────────┴───────────┘
```

### 2. AI Prediction Flow

```
Historical Data → ML Service → Prediction → Backend → Frontend
      │              │            │           │         │
      │              │            │           │         ▼
      │              │            │           │    Dashboard
      │              │            │           │
      │              ▼            │           │
      │         AI Algorithm      │           │
      │         Processing        │           │
      │              │            │           │
      └──────────────┴────────────┴───────────┘
```

### 3. User Interaction Flow

```
User Action → Frontend → Backend API → Database → Response
     │           │           │           │         │
     │           │           │           │         ▼
     │           │           │           │    UI Update
     │           │           │           │
     │           ▼           │           │
     │      State Update     │           │
     │           │           │           │
     │           │           ▼           │
     │           │      Business Logic   │
     │           │           │           │
     └───────────┴───────────┴───────────┘
```

## 🔐 Security Architecture

### Authentication & Authorization
- **JWT Tokens**: Stateless authentication
- **Role-based Access**: Different user permissions
- **API Rate Limiting**: Prevent abuse
- **CORS Configuration**: Cross-origin security

### Data Security
- **Input Validation**: All inputs validated
- **SQL Injection Prevention**: TypeORM protection
- **HTTPS Encryption**: Secure communication
- **Environment Variables**: Sensitive data protection

## 📊 Monitoring & Observability

### Logging Strategy
- **Structured Logging**: JSON format logs
- **Log Levels**: DEBUG, INFO, WARN, ERROR
- **Centralized Logging**: Future ELK stack integration
- **Performance Metrics**: Response times, throughput

### Health Checks
- **Service Health**: `/health` endpoints
- **Database Health**: Connection monitoring
- **Dependency Health**: External service checks
- **Uptime Monitoring**: Service availability

## 🚀 Scalability Architecture

### Horizontal Scaling
- **Load Balancers**: Distribute traffic
- **Database Replication**: Read replicas
- **Caching Layer**: Redis for performance
- **CDN Integration**: Static asset delivery

### Performance Optimization
- **Database Indexing**: Query optimization
- **Connection Pooling**: Database connections
- **Caching Strategy**: Frequently accessed data
- **Lazy Loading**: Frontend optimization

## 🔄 Deployment Architecture

### Development Environment
```
Local Machine
├── Frontend (localhost:3000)
├── Backend (localhost:3001)
├── ML Service (localhost:8001)
└── PostgreSQL (localhost:5432)
```

### Production Environment
```
Load Balancer (Nginx)
├── Frontend Servers (Multiple instances)
├── Backend Servers (Multiple instances)
├── ML Service Servers (Multiple instances)
└── Database Cluster (Primary + Replicas)
```

## 🧪 Testing Architecture

### Testing Strategy
- **Unit Tests**: Individual component testing
- **Integration Tests**: Service interaction testing
- **E2E Tests**: Complete user journey testing
- **Performance Tests**: Load and stress testing

### Test Coverage
- **Frontend**: Component and integration tests
- **Backend**: Service and API tests
- **ML Service**: Algorithm and prediction tests
- **Database**: Data integrity tests

## 🔮 Future Architecture Enhancements

### Planned Improvements
- **Microservices**: Split into smaller services
- **Event Streaming**: Apache Kafka integration
- **Container Orchestration**: Kubernetes deployment
- **AI/ML Pipeline**: Advanced ML models
- **Real-time Analytics**: Stream processing
- **Mobile Apps**: React Native applications

### Technology Upgrades
- **GraphQL**: Advanced query capabilities
- **WebRTC**: Real-time communication
- **Blockchain**: Data integrity and security
- **Edge Computing**: Reduced latency
- **IoT Integration**: Smart bus sensors

---

This architecture provides a solid foundation for the Smart Bus Optimization System while maintaining flexibility for future enhancements and scalability requirements.
