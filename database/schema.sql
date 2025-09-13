-- Smart Bus Optimization System Database Schema
-- PostgreSQL Database Setup

CREATE DATABASE smart_bus_db;

\c smart_bus_db;

-- Create tables
CREATE TABLE routes (
    route_id SERIAL PRIMARY KEY,
    source VARCHAR(100) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    stops JSONB NOT NULL,
    distance DECIMAL(8,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE buses (
    bus_id SERIAL PRIMARY KEY,
    route_id INTEGER REFERENCES routes(route_id),
    capacity INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    license_plate VARCHAR(20) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ticket_sales (
    ticket_id SERIAL PRIMARY KEY,
    bus_id INTEGER REFERENCES buses(bus_id),
    route_id INTEGER REFERENCES routes(route_id),
    passenger_count INTEGER NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    price DECIMAL(8,2) DEFAULT 0.00
);

CREATE TABLE gps_logs (
    log_id SERIAL PRIMARY KEY,
    bus_id INTEGER REFERENCES buses(bus_id),
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    speed DECIMAL(5, 2) DEFAULT 0.00,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    direction DECIMAL(5, 2) DEFAULT 0.00
);

CREATE TABLE passenger_counts (
    count_id SERIAL PRIMARY KEY,
    bus_id INTEGER REFERENCES buses(bus_id),
    route_id INTEGER REFERENCES routes(route_id),
    occupancy INTEGER NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE optimized_schedule (
    schedule_id SERIAL PRIMARY KEY,
    bus_id INTEGER REFERENCES buses(bus_id),
    route_id INTEGER REFERENCES routes(route_id),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    adjustment_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_gps_logs_bus_timestamp ON gps_logs(bus_id, timestamp);
CREATE INDEX idx_ticket_sales_timestamp ON ticket_sales(timestamp);
CREATE INDEX idx_passenger_counts_timestamp ON passenger_counts(timestamp);
CREATE INDEX idx_optimized_schedule_route ON optimized_schedule(route_id);

-- Create views for common queries
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

