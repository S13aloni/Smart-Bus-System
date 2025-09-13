-- Smart Bus Optimization System Seed Data
-- Sample data for testing and demonstration

\c smart_bus_db;

-- Insert sample routes
INSERT INTO routes (source, destination, stops, distance) VALUES
('Downtown Station', 'Airport Terminal', '["Central Plaza", "University Campus", "Shopping Mall", "Airport Terminal"]', 25.5),
('University Campus', 'Shopping District', '["Student Center", "Library", "Shopping Mall", "Entertainment Center"]', 12.3),
('Residential Area', 'Business District', '["Housing Complex", "School", "Hospital", "Business Center"]', 18.7),
('Airport Terminal', 'Hotel District', '["Airport Terminal", "Convention Center", "Hotel Plaza", "Tourist Center"]', 8.9),
('Suburb Station', 'City Center', '["Suburb Mall", "Park", "City Hall", "Central Plaza"]', 22.1);

-- Insert sample buses
INSERT INTO buses (route_id, capacity, status, license_plate) VALUES
(1, 50, 'active', 'BUS-001'),
(1, 50, 'active', 'BUS-002'),
(2, 40, 'active', 'BUS-003'),
(2, 40, 'active', 'BUS-004'),
(3, 45, 'active', 'BUS-005'),
(3, 45, 'active', 'BUS-006'),
(4, 35, 'active', 'BUS-007'),
(4, 35, 'active', 'BUS-008'),
(5, 55, 'active', 'BUS-009'),
(5, 55, 'active', 'BUS-010');

-- Insert sample ticket sales (last 30 days)
INSERT INTO ticket_sales (bus_id, route_id, passenger_count, timestamp, price) VALUES
-- Route 1 (Downtown to Airport) - High demand route
(1, 1, 3, NOW() - INTERVAL '1 hour', 2.50),
(1, 1, 2, NOW() - INTERVAL '2 hours', 2.50),
(2, 1, 4, NOW() - INTERVAL '3 hours', 2.50),
(1, 1, 1, NOW() - INTERVAL '4 hours', 2.50),
(2, 1, 3, NOW() - INTERVAL '5 hours', 2.50),

-- Route 2 (University to Shopping) - Peak hours
(3, 2, 5, NOW() - INTERVAL '1 hour', 1.75),
(4, 2, 3, NOW() - INTERVAL '2 hours', 1.75),
(3, 2, 4, NOW() - INTERVAL '3 hours', 1.75),
(4, 2, 2, NOW() - INTERVAL '4 hours', 1.75),

-- Route 3 (Residential to Business) - Commuter route
(5, 3, 6, NOW() - INTERVAL '1 hour', 2.00),
(6, 3, 4, NOW() - INTERVAL '2 hours', 2.00),
(5, 3, 5, NOW() - INTERVAL '3 hours', 2.00),
(6, 3, 3, NOW() - INTERVAL '4 hours', 2.00),

-- Route 4 (Airport to Hotel) - Tourist route
(7, 4, 2, NOW() - INTERVAL '1 hour', 3.00),
(8, 4, 1, NOW() - INTERVAL '2 hours', 3.00),
(7, 4, 3, NOW() - INTERVAL '3 hours', 3.00),

-- Route 5 (Suburb to City Center) - Long distance
(9, 5, 4, NOW() - INTERVAL '1 hour', 3.50),
(10, 5, 2, NOW() - INTERVAL '2 hours', 3.50),
(9, 5, 5, NOW() - INTERVAL '3 hours', 3.50),
(10, 5, 3, NOW() - INTERVAL '4 hours', 3.50);

-- Insert sample GPS logs (simulated real-time positions)
INSERT INTO gps_logs (bus_id, latitude, longitude, speed, timestamp, direction) VALUES
-- Bus 1 (Route 1) - Moving towards airport
(1, 40.7128, -74.0060, 35.5, NOW() - INTERVAL '5 minutes', 45.0),
(1, 40.7135, -74.0055, 38.2, NOW() - INTERVAL '4 minutes', 47.0),
(1, 40.7142, -74.0050, 32.1, NOW() - INTERVAL '3 minutes', 50.0),
(1, 40.7149, -74.0045, 36.8, NOW() - INTERVAL '2 minutes', 52.0),
(1, 40.7156, -74.0040, 34.3, NOW() - INTERVAL '1 minute', 48.0),

-- Bus 2 (Route 1) - Behind bus 1
(2, 40.7120, -74.0065, 33.2, NOW() - INTERVAL '5 minutes', 45.0),
(2, 40.7127, -74.0060, 35.8, NOW() - INTERVAL '4 minutes', 47.0),
(2, 40.7134, -74.0055, 31.5, NOW() - INTERVAL '3 minutes', 50.0),
(2, 40.7141, -74.0050, 37.1, NOW() - INTERVAL '2 minutes', 52.0),
(2, 40.7148, -74.0045, 35.6, NOW() - INTERVAL '1 minute', 48.0),

-- Bus 3 (Route 2) - University to Shopping
(3, 40.7589, -73.9851, 28.4, NOW() - INTERVAL '5 minutes', 90.0),
(3, 40.7595, -73.9845, 31.2, NOW() - INTERVAL '4 minutes', 92.0),
(3, 40.7601, -73.9839, 29.7, NOW() - INTERVAL '3 minutes', 88.0),
(3, 40.7607, -73.9833, 33.1, NOW() - INTERVAL '2 minutes', 85.0),
(3, 40.7613, -73.9827, 30.8, NOW() - INTERVAL '1 minute', 87.0),

-- Bus 4 (Route 2) - Following bus 3
(4, 40.7585, -73.9855, 26.9, NOW() - INTERVAL '5 minutes', 90.0),
(4, 40.7591, -73.9849, 29.3, NOW() - INTERVAL '4 minutes', 92.0),
(4, 40.7597, -73.9843, 27.8, NOW() - INTERVAL '3 minutes', 88.0),
(4, 40.7603, -73.9837, 31.5, NOW() - INTERVAL '2 minutes', 85.0),
(4, 40.7609, -73.9831, 29.2, NOW() - INTERVAL '1 minute', 87.0);

-- Insert sample passenger counts
INSERT INTO passenger_counts (bus_id, route_id, occupancy, timestamp) VALUES
(1, 1, 45, NOW() - INTERVAL '5 minutes'),
(1, 1, 47, NOW() - INTERVAL '4 minutes'),
(1, 1, 42, NOW() - INTERVAL '3 minutes'),
(1, 1, 48, NOW() - INTERVAL '2 minutes'),
(1, 1, 44, NOW() - INTERVAL '1 minute'),

(2, 1, 38, NOW() - INTERVAL '5 minutes'),
(2, 1, 41, NOW() - INTERVAL '4 minutes'),
(2, 1, 35, NOW() - INTERVAL '3 minutes'),
(2, 1, 43, NOW() - INTERVAL '2 minutes'),
(2, 1, 39, NOW() - INTERVAL '1 minute'),

(3, 2, 32, NOW() - INTERVAL '5 minutes'),
(3, 2, 35, NOW() - INTERVAL '4 minutes'),
(3, 2, 28, NOW() - INTERVAL '3 minutes'),
(3, 2, 37, NOW() - INTERVAL '2 minutes'),
(3, 2, 33, NOW() - INTERVAL '1 minute'),

(4, 2, 25, NOW() - INTERVAL '5 minutes'),
(4, 2, 28, NOW() - INTERVAL '4 minutes'),
(4, 2, 22, NOW() - INTERVAL '3 minutes'),
(4, 2, 30, NOW() - INTERVAL '2 minutes'),
(4, 2, 26, NOW() - INTERVAL '1 minute');

-- Insert sample optimized schedules
INSERT INTO optimized_schedule (bus_id, route_id, start_time, end_time, adjustment_reason) VALUES
(1, 1, '06:00:00', '07:30:00', 'Peak morning demand - added early departure'),
(2, 1, '06:15:00', '07:45:00', 'Reduced gap between buses to prevent bunching'),
(3, 2, '07:00:00', '08:15:00', 'University rush hour optimization'),
(4, 2, '07:20:00', '08:35:00', 'Staggered departure to reduce congestion'),
(5, 3, '08:00:00', '09:30:00', 'Business district commuter optimization'),
(6, 3, '08:15:00', '09:45:00', 'Balanced headway for residential route'),
(7, 4, '09:00:00', '10:00:00', 'Airport shuttle frequency increase'),
(8, 4, '09:30:00', '10:30:00', 'Tourist peak time adjustment'),
(9, 5, '10:00:00', '11:45:00', 'Suburb to city center long route optimization'),
(10, 5, '10:30:00', '12:15:00', 'Reduced frequency during off-peak hours');

-- Generate more historical data for better ML training
-- Insert more ticket sales for the past 30 days
INSERT INTO ticket_sales (bus_id, route_id, passenger_count, timestamp, price)
SELECT 
    (random() * 10 + 1)::int as bus_id,
    (random() * 5 + 1)::int as route_id,
    (random() * 6 + 1)::int as passenger_count,
    NOW() - (random() * INTERVAL '30 days') as timestamp,
    CASE 
        WHEN (random() * 5 + 1)::int = 1 THEN 2.50
        WHEN (random() * 5 + 1)::int = 2 THEN 1.75
        WHEN (random() * 5 + 1)::int = 3 THEN 2.00
        WHEN (random() * 5 + 1)::int = 4 THEN 3.00
        ELSE 3.50
    END as price
FROM generate_series(1, 1000);

-- Insert more passenger counts for historical data
INSERT INTO passenger_counts (bus_id, route_id, occupancy, timestamp)
SELECT 
    (random() * 10 + 1)::int as bus_id,
    (random() * 5 + 1)::int as route_id,
    (random() * 50 + 1)::int as occupancy,
    NOW() - (random() * INTERVAL '30 days') as timestamp
FROM generate_series(1, 2000);

-- Insert more GPS logs for historical tracking
INSERT INTO gps_logs (bus_id, latitude, longitude, speed, timestamp, direction)
SELECT 
    (random() * 10 + 1)::int as bus_id,
    40.7 + (random() - 0.5) * 0.1 as latitude,
    -74.0 + (random() - 0.5) * 0.1 as longitude,
    (random() * 50 + 10)::decimal(5,2) as speed,
    NOW() - (random() * INTERVAL '30 days') as timestamp,
    (random() * 360)::decimal(5,2) as direction
FROM generate_series(1, 5000);

