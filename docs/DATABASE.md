# 🗄️ Database Schema Documentation

## Overview

The Smart Bus Optimization System uses PostgreSQL as its primary database, storing all operational data including routes, buses, GPS tracking, passenger counts, and ticket sales. This document provides a comprehensive overview of the database structure and relationships.

## 🏗️ Database Architecture

### Database: `smart_bus_system`

The database contains the following main entities:
- **Routes**: Bus route definitions and stops
- **Buses**: Fleet vehicles and their specifications
- **GPS Logs**: Real-time location tracking data
- **Passenger Counts**: Occupancy and capacity data
- **Ticket Sales**: Revenue and passenger transaction data
- **Optimized Schedules**: AI-generated schedule recommendations

## 📊 Entity Relationship Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Routes      │    │      Buses      │    │   GPS Logs      │
│                 │    │                 │    │                 │
│ route_id (PK)   │◄───┤ route_id (FK)   │◄───┤ bus_id (FK)     │
│ source          │    │ bus_id (PK)     │    │ log_id (PK)     │
│ destination     │    │ capacity        │    │ latitude        │
│ stops           │    │ status          │    │ longitude       │
│ distance        │    │ license_plate   │    │ speed           │
│ created_at      │    │ created_at      │    │ direction       │
└─────────────────┘    └─────────────────┘    │ timestamp       │
         │                       │            └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Passenger Counts│    │  Ticket Sales   │    │ Optimized       │
│                 │    │                 │    │ Schedules       │
│ count_id (PK)   │    │ ticket_id (PK)  │    │                 │
│ bus_id (FK)     │    │ bus_id (FK)     │    │ schedule_id (PK)│
│ route_id (FK)   │    │ route_id (FK)   │    │ route_id (FK)   │
│ occupancy       │    │ passenger_count │    │ old_schedule    │
│ timestamp       │    │ price           │    │ new_schedule    │
└─────────────────┘    │ timestamp       │    │ improvements    │
                       └─────────────────┘    │ created_at      │
                                              └─────────────────┘
```

## 📋 Table Definitions

### 1. Routes Table

```sql
CREATE TABLE routes (
    route_id SERIAL PRIMARY KEY,
    source VARCHAR(100) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    stops JSONB,
    distance DECIMAL(8,2),
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Purpose**: Stores bus route information including start/end points, stops, and distances.

**Columns**:
- `route_id`: Primary key, auto-incrementing
- `source`: Starting point of the route
- `destination`: Ending point of the route
- `stops`: JSON array of stop coordinates and names
- `distance`: Route distance in kilometers
- `created_at`: Timestamp of record creation

**Sample Data**:
```json
{
  "route_id": 1,
  "source": "Gandhinagar",
  "destination": "Ahmedabad",
  "stops": [
    {"name": "Gandhinagar Bus Stand", "lat": 23.2156, "lng": 72.6369},
    {"name": "Sector 21", "lat": 23.2000, "lng": 72.6500},
    {"name": "Ahmedabad Railway Station", "lat": 23.0225, "lng": 72.5714}
  ],
  "distance": 45.5,
  "created_at": "2024-01-01T00:00:00Z"
}
```

### 2. Buses Table

```sql
CREATE TABLE buses (
    bus_id SERIAL PRIMARY KEY,
    route_id INTEGER REFERENCES routes(route_id),
    capacity INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    license_plate VARCHAR(20) UNIQUE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Purpose**: Stores fleet vehicle information and their assigned routes.

**Columns**:
- `bus_id`: Primary key, auto-incrementing
- `route_id`: Foreign key to routes table
- `capacity`: Maximum passenger capacity
- `status`: Current status (active, maintenance, inactive)
- `license_plate`: Vehicle registration number
- `created_at`: Timestamp of record creation

**Status Values**:
- `active`: Bus is currently in service
- `maintenance`: Bus is under maintenance
- `inactive`: Bus is not in service

### 3. GPS Logs Table

```sql
CREATE TABLE gps_logs (
    log_id SERIAL PRIMARY KEY,
    bus_id INTEGER REFERENCES buses(bus_id),
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    speed DECIMAL(5,2),
    direction DECIMAL(5,2),
    timestamp TIMESTAMP DEFAULT NOW()
);
```

**Purpose**: Stores real-time GPS tracking data for all buses.

**Columns**:
- `log_id`: Primary key, auto-incrementing
- `bus_id`: Foreign key to buses table
- `latitude`: GPS latitude coordinate
- `longitude`: GPS longitude coordinate
- `speed`: Current speed in km/h
- `direction`: Compass direction in degrees
- `timestamp`: Time of GPS reading

**Indexes**:
```sql
CREATE INDEX idx_gps_logs_bus_timestamp ON gps_logs(bus_id, timestamp);
CREATE INDEX idx_gps_logs_timestamp ON gps_logs(timestamp);
```

### 4. Passenger Counts Table

```sql
CREATE TABLE passenger_counts (
    count_id SERIAL PRIMARY KEY,
    bus_id INTEGER REFERENCES buses(bus_id),
    route_id INTEGER REFERENCES routes(route_id),
    occupancy INTEGER NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW()
);
```

**Purpose**: Stores passenger occupancy data for capacity monitoring.

**Columns**:
- `count_id`: Primary key, auto-incrementing
- `bus_id`: Foreign key to buses table
- `route_id`: Foreign key to routes table
- `occupancy`: Current number of passengers
- `timestamp`: Time of occupancy reading

**Constraints**:
- `occupancy` must be >= 0
- `occupancy` should not exceed bus capacity

### 5. Ticket Sales Table

```sql
CREATE TABLE ticket_sales (
    ticket_id SERIAL PRIMARY KEY,
    bus_id INTEGER REFERENCES buses(bus_id),
    route_id INTEGER REFERENCES routes(route_id),
    passenger_count INTEGER NOT NULL,
    price DECIMAL(8,2) NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW()
);
```

**Purpose**: Stores ticket sales data for revenue tracking and demand analysis.

**Columns**:
- `ticket_id`: Primary key, auto-incrementing
- `bus_id`: Foreign key to buses table
- `route_id`: Foreign key to routes table
- `passenger_count`: Number of passengers in this transaction
- `price`: Ticket price in local currency
- `timestamp`: Time of ticket sale

**Business Rules**:
- `passenger_count` must be >= 1
- `price` must be > 0
- Price range: ₹2.50 - ₹4.50 per ticket

### 6. Optimized Schedules Table

```sql
CREATE TABLE optimized_schedules (
    schedule_id SERIAL PRIMARY KEY,
    route_id INTEGER REFERENCES routes(route_id),
    old_schedule JSONB,
    new_schedule JSONB,
    improvements JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Purpose**: Stores AI-generated schedule optimizations and their improvements.

**Columns**:
- `schedule_id`: Primary key, auto-incrementing
- `route_id`: Foreign key to routes table
- `old_schedule`: Original schedule data
- `new_schedule`: Optimized schedule data
- `improvements`: Calculated improvements and metrics
- `created_at`: Timestamp of optimization

## 🔍 Database Views

### 1. Bus Occupancy View

```sql
CREATE VIEW bus_occupancy AS
SELECT 
    b.bus_id,
    b.route_id,
    r.source,
    r.destination,
    pc.occupancy,
    b.capacity,
    ROUND((pc.occupancy::DECIMAL / b.capacity) * 100, 2) as occupancy_percentage,
    pc.timestamp
FROM buses b
JOIN routes r ON b.route_id = r.route_id
JOIN passenger_counts pc ON b.bus_id = pc.bus_id
ORDER BY pc.timestamp DESC;
```

**Purpose**: Provides real-time bus occupancy data with percentage calculations.

### 2. Route Demand View

```sql
CREATE VIEW route_demand AS
SELECT 
    r.route_id,
    r.source,
    r.destination,
    DATE(ts.timestamp) as date,
    EXTRACT(HOUR FROM ts.timestamp) as hour,
    COUNT(*) as total_tickets,
    SUM(ts.passenger_count) as total_passengers,
    AVG(ts.passenger_count) as avg_passengers_per_ticket
FROM routes r
JOIN ticket_sales ts ON r.route_id = ts.route_id
GROUP BY r.route_id, r.source, r.destination, DATE(ts.timestamp), EXTRACT(HOUR FROM ts.timestamp)
ORDER BY date DESC, hour DESC;
```

**Purpose**: Aggregates demand data by route, date, and hour for analysis.

## 📊 Indexes and Performance

### Primary Indexes

```sql
-- GPS logs performance
CREATE INDEX idx_gps_logs_bus_timestamp ON gps_logs(bus_id, timestamp);
CREATE INDEX idx_gps_logs_timestamp ON gps_logs(timestamp);

-- Ticket sales performance
CREATE INDEX idx_ticket_sales_timestamp ON ticket_sales(timestamp);
CREATE INDEX idx_ticket_sales_route_timestamp ON ticket_sales(route_id, timestamp);

-- Passenger counts performance
CREATE INDEX idx_passenger_counts_timestamp ON passenger_counts(timestamp);
CREATE INDEX idx_passenger_counts_bus_timestamp ON passenger_counts(bus_id, timestamp);

-- Optimized schedules
CREATE INDEX idx_optimized_schedule_route ON optimized_schedule(route_id);
```

### Composite Indexes

```sql
-- Multi-column indexes for complex queries
CREATE INDEX idx_gps_logs_bus_time ON gps_logs(bus_id, timestamp DESC);
CREATE INDEX idx_ticket_sales_route_time ON ticket_sales(route_id, timestamp DESC);
CREATE INDEX idx_passenger_counts_bus_time ON passenger_counts(bus_id, timestamp DESC);
```

## 🔄 Data Relationships

### Foreign Key Constraints

```sql
-- Buses to Routes
ALTER TABLE buses 
ADD CONSTRAINT fk_buses_route 
FOREIGN KEY (route_id) REFERENCES routes(route_id);

-- GPS Logs to Buses
ALTER TABLE gps_logs 
ADD CONSTRAINT fk_gps_logs_bus 
FOREIGN KEY (bus_id) REFERENCES buses(bus_id);

-- Passenger Counts to Buses and Routes
ALTER TABLE passenger_counts 
ADD CONSTRAINT fk_passenger_counts_bus 
FOREIGN KEY (bus_id) REFERENCES buses(bus_id);

ALTER TABLE passenger_counts 
ADD CONSTRAINT fk_passenger_counts_route 
FOREIGN KEY (route_id) REFERENCES routes(route_id);

-- Ticket Sales to Buses and Routes
ALTER TABLE ticket_sales 
ADD CONSTRAINT fk_ticket_sales_bus 
FOREIGN KEY (bus_id) REFERENCES buses(bus_id);

ALTER TABLE ticket_sales 
ADD CONSTRAINT fk_ticket_sales_route 
FOREIGN KEY (route_id) REFERENCES routes(route_id);

-- Optimized Schedules to Routes
ALTER TABLE optimized_schedules 
ADD CONSTRAINT fk_optimized_schedules_route 
FOREIGN KEY (route_id) REFERENCES routes(route_id);
```

## 📈 Data Volume Estimates

### Expected Data Growth

| Table | Records/Day | Records/Month | Records/Year |
|-------|-------------|---------------|--------------|
| GPS Logs | 17,280 | 518,400 | 6,220,800 |
| Passenger Counts | 1,440 | 43,200 | 518,400 |
| Ticket Sales | 720 | 21,600 | 259,200 |
| Routes | 6 | 6 | 6 |
| Buses | 12 | 12 | 12 |

### Storage Requirements

- **GPS Logs**: ~50MB per month
- **Passenger Counts**: ~5MB per month
- **Ticket Sales**: ~2MB per month
- **Total**: ~60MB per month per route

## 🔧 Database Maintenance

### Regular Maintenance Tasks

#### 1. Data Cleanup
```sql
-- Remove GPS logs older than 6 months
DELETE FROM gps_logs 
WHERE timestamp < NOW() - INTERVAL '6 months';

-- Archive old ticket sales
INSERT INTO ticket_sales_archive 
SELECT * FROM ticket_sales 
WHERE timestamp < NOW() - INTERVAL '1 year';

DELETE FROM ticket_sales 
WHERE timestamp < NOW() - INTERVAL '1 year';
```

#### 2. Index Maintenance
```sql
-- Reindex tables for performance
REINDEX TABLE gps_logs;
REINDEX TABLE passenger_counts;
REINDEX TABLE ticket_sales;
```

#### 3. Statistics Update
```sql
-- Update table statistics
ANALYZE gps_logs;
ANALYZE passenger_counts;
ANALYZE ticket_sales;
ANALYZE buses;
ANALYZE routes;
```

### Backup Strategy

#### 1. Full Backup
```bash
# Daily full backup
pg_dump -h localhost -U postgres -d smart_bus_system > backup_$(date +%Y%m%d).sql
```

#### 2. Incremental Backup
```bash
# WAL archiving for point-in-time recovery
archive_mode = on
archive_command = 'cp %p /backup/wal/%f'
```

#### 3. Backup Verification
```bash
# Test backup restoration
pg_restore -h localhost -U postgres -d test_db backup_file.sql
```

## 🚀 Performance Optimization

### Query Optimization

#### 1. Common Query Patterns
```sql
-- Get latest GPS data for all buses
SELECT DISTINCT ON (bus_id) 
    bus_id, latitude, longitude, speed, timestamp
FROM gps_logs 
ORDER BY bus_id, timestamp DESC;

-- Get passenger counts for last 24 hours
SELECT bus_id, AVG(occupancy) as avg_occupancy
FROM passenger_counts 
WHERE timestamp > NOW() - INTERVAL '24 hours'
GROUP BY bus_id;

-- Get revenue by route for last week
SELECT r.route_id, r.source, r.destination, 
       SUM(ts.price * ts.passenger_count) as total_revenue
FROM routes r
JOIN ticket_sales ts ON r.route_id = ts.route_id
WHERE ts.timestamp > NOW() - INTERVAL '7 days'
GROUP BY r.route_id, r.source, r.destination;
```

#### 2. Partitioning Strategy
```sql
-- Partition GPS logs by month
CREATE TABLE gps_logs_2024_01 PARTITION OF gps_logs
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- Partition ticket sales by month
CREATE TABLE ticket_sales_2024_01 PARTITION OF ticket_sales
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

## 🔒 Security and Access Control

### User Roles

```sql
-- Create application user
CREATE USER bus_app WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE smart_bus_system TO bus_app;
GRANT USAGE ON SCHEMA public TO bus_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO bus_app;

-- Create read-only user for analytics
CREATE USER bus_analytics WITH PASSWORD 'analytics_password';
GRANT CONNECT ON DATABASE smart_bus_system TO bus_analytics;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO bus_analytics;
```

### Data Encryption

```sql
-- Enable encryption at rest
ALTER SYSTEM SET ssl = on;
ALTER SYSTEM SET ssl_cert_file = '/path/to/server.crt';
ALTER SYSTEM SET ssl_key_file = '/path/to/server.key';
```

---

This database schema provides a robust foundation for the Smart Bus Optimization System, supporting real-time tracking, analytics, and AI-powered optimizations while maintaining data integrity and performance.
