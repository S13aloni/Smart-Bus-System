// Enhanced Data Service with Multiple Data Sources and Real-time Simulation
export interface BusData {
  bus_id: number;
  license_plate: string;
  route_id: number;
  route: {
    source: string;
    destination: string;
    stops: string[];
    distance: number;
  };
  capacity: number;
  status: 'on_time' | 'delayed' | 'cancelled' | 'breakdown' | 'maintenance';
  current_position: {
    latitude: number;
    longitude: number;
    speed: number;
    direction: number;
    timestamp: string;
  };
  occupancy: number;
  occupancy_percentage: number;
  schedule: {
    planned_departure: string;
    planned_arrival: string;
    actual_departure?: string;
    actual_arrival?: string;
    delay_minutes: number;
  };
  weather_impact: 'normal' | 'rain' | 'heavy_rain' | 'fog' | 'storm';
  traffic_condition: 'normal' | 'heavy' | 'jam' | 'clear';
  breakdown_reason?: string;
  is_operational: boolean;
  last_stop: string;
  next_stop: string;
  estimated_arrival: string;
}

export interface TicketSale {
  ticket_id: number;
  bus_id: number;
  route_id: number;
  passenger_count: number;
  timestamp: string;
  price: number;
  stop_boarding: string;
  stop_alighting: string;
}

export interface GPSLog {
  log_id: number;
  bus_id: number;
  latitude: number;
  longitude: number;
  speed: number;
  timestamp: string;
  direction: number;
  stop_id?: string;
}

export interface Alert {
  id: string;
  type: 'delay' | 'cancellation' | 'reschedule' | 'congestion' | 'maintenance' | 'breakdown' | 'weather' | 'traffic';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  route_id: number;
  bus_id?: number;
  timestamp: string;
  resolved: boolean;
  weather_condition?: string;
  breakdown_reason?: string;
  affected_stops?: string[];
}

export interface PredictionData {
  route_id: number;
  hour: number;
  predicted_ridership: number;
  actual_ridership?: number;
  confidence: number;
  timestamp: string;
  factors: {
    weather: number;
    day_of_week: number;
    historical_average: number;
    events: number;
  };
}

// Real Ahmedabad City Bus Routes with actual locations
const routes = [
  {
    route_id: 1,
    source: "Ahmedabad Railway Station",
    destination: "Sardar Vallabhbhai Patel International Airport",
    stops: ["Gandhi Ashram", "Sabarmati Riverfront", "Science City", "Vastrapur Lake", "Iskon Temple", "Airport"],
    distance: 25.3,
    color: "#3B82F6",
    frequency_minutes: 15,
    peak_hours: ["07:00-09:00", "17:00-19:00"],
    off_peak_hours: ["10:00-16:00", "20:00-22:00"],
    stops_coordinates: [
      { lat: 23.0225, lng: 72.5714, name: "Ahmedabad Railway Station", type: "major" },
      { lat: 23.0300, lng: 72.5800, name: "Gandhi Ashram", type: "intermediate" },
      { lat: 23.0350, lng: 72.5850, name: "Sabarmati Riverfront", type: "intermediate" },
      { lat: 23.0400, lng: 72.5900, name: "Science City", type: "intermediate" },
      { lat: 23.0450, lng: 72.5950, name: "Vastrapur Lake", type: "intermediate" },
      { lat: 23.0500, lng: 72.6000, name: "Iskon Temple", type: "intermediate" },
      { lat: 23.0550, lng: 72.6050, name: "Airport", type: "major" }
    ]
  },
  {
    route_id: 2,
    source: "Maninagar",
    destination: "Bodakdev",
    stops: ["Lal Darwaja", "Bhadra Fort", "Law Garden", "Navrangpura", "Vastrapur", "Bodakdev"],
    distance: 18.7,
    color: "#10B981",
    frequency_minutes: 12,
    peak_hours: ["08:00-10:00", "18:00-20:00"],
    off_peak_hours: ["11:00-17:00", "21:00-23:00"],
    stops_coordinates: [
      { lat: 23.0000, lng: 72.6000, name: "Maninagar", type: "major" },
      { lat: 23.0050, lng: 72.6050, name: "Lal Darwaja", type: "intermediate" },
      { lat: 23.0100, lng: 72.6100, name: "Bhadra Fort", type: "intermediate" },
      { lat: 23.0150, lng: 72.6150, name: "Law Garden", type: "intermediate" },
      { lat: 23.0200, lng: 72.6200, name: "Navrangpura", type: "intermediate" },
      { lat: 23.0250, lng: 72.6250, name: "Vastrapur", type: "intermediate" },
      { lat: 23.0300, lng: 72.6300, name: "Bodakdev", type: "major" }
    ]
  },
  {
    route_id: 3,
    source: "Gandhinagar",
    destination: "Ahmedabad City",
    stops: ["Sector 21", "Akshardham Temple", "Gandhinagar Bus Stand", "Sarkhej", "Juhapura", "Ahmedabad City"],
    distance: 22.1,
    color: "#F59E0B",
    frequency_minutes: 20,
    peak_hours: ["07:30-09:30", "17:30-19:30"],
    off_peak_hours: ["10:30-16:30", "20:30-22:30"],
    stops_coordinates: [
      { lat: 23.2150, lng: 72.6500, name: "Gandhinagar", type: "major" },
      { lat: 23.2100, lng: 72.6450, name: "Sector 21", type: "intermediate" },
      { lat: 23.2050, lng: 72.6400, name: "Akshardham Temple", type: "intermediate" },
      { lat: 23.2000, lng: 72.6350, name: "Gandhinagar Bus Stand", type: "intermediate" },
      { lat: 23.1950, lng: 72.6300, name: "Sarkhej", type: "intermediate" },
      { lat: 23.1900, lng: 72.6250, name: "Juhapura", type: "intermediate" },
      { lat: 23.1850, lng: 72.6200, name: "Ahmedabad City", type: "major" }
    ]
  },
  {
    route_id: 4,
    source: "Sabarmati",
    destination: "Naroda",
    stops: ["Sabarmati Ashram", "Sabarmati Riverfront", "Ellisbridge", "C.G. Road", "Naroda Industrial Area", "Naroda"],
    distance: 16.8,
    color: "#EF4444",
    frequency_minutes: 18,
    peak_hours: ["08:30-10:30", "18:30-20:30"],
    off_peak_hours: ["11:30-17:30", "21:30-23:30"],
    stops_coordinates: [
      { lat: 23.0400, lng: 72.5800, name: "Sabarmati", type: "major" },
      { lat: 23.0350, lng: 72.5850, name: "Sabarmati Ashram", type: "intermediate" },
      { lat: 23.0300, lng: 72.5900, name: "Sabarmati Riverfront", type: "intermediate" },
      { lat: 23.0250, lng: 72.5950, name: "Ellisbridge", type: "intermediate" },
      { lat: 23.0200, lng: 72.6000, name: "C.G. Road", type: "intermediate" },
      { lat: 23.0150, lng: 72.6050, name: "Naroda Industrial Area", type: "intermediate" },
      { lat: 23.0100, lng: 72.6100, name: "Naroda", type: "major" }
    ]
  },
  {
    route_id: 5,
    source: "Thaltej",
    destination: "Chandkheda",
    stops: ["Thaltej Gam", "Thaltej Lake", "Bodakdev", "Vastrapur", "Gandhinagar Highway", "Chandkheda"],
    distance: 19.5,
    color: "#8B5CF6",
    frequency_minutes: 14,
    peak_hours: ["09:00-11:00", "19:00-21:00"],
    off_peak_hours: ["12:00-18:00", "22:00-24:00"],
    stops_coordinates: [
      { lat: 23.0500, lng: 72.5500, name: "Thaltej", type: "major" },
      { lat: 23.0450, lng: 72.5550, name: "Thaltej Gam", type: "intermediate" },
      { lat: 23.0400, lng: 72.5600, name: "Thaltej Lake", type: "intermediate" },
      { lat: 23.0350, lng: 72.5650, name: "Bodakdev", type: "intermediate" },
      { lat: 23.0300, lng: 72.5700, name: "Vastrapur", type: "intermediate" },
      { lat: 23.0250, lng: 72.5750, name: "Gandhinagar Highway", type: "intermediate" },
      { lat: 23.0200, lng: 72.5800, name: "Chandkheda", type: "major" }
    ]
  },
  {
    route_id: 6,
    source: "Kalupur",
    destination: "Vastrapur",
    stops: ["Kalupur Market", "Dhalgarwad", "Kankaria Lake", "Lal Darwaja", "Ellisbridge", "Vastrapur"],
    distance: 14.2,
    color: "#06B6D4",
    frequency_minutes: 10,
    peak_hours: ["07:30-09:30", "18:00-20:00"],
    off_peak_hours: ["10:00-17:00", "20:30-23:00"],
    stops_coordinates: [
      { lat: 23.0250, lng: 72.5900, name: "Kalupur", type: "major" },
      { lat: 23.0270, lng: 72.5920, name: "Kalupur Market", type: "intermediate" },
      { lat: 23.0290, lng: 72.5940, name: "Dhalgarwad", type: "intermediate" },
      { lat: 23.0310, lng: 72.5960, name: "Kankaria Lake", type: "intermediate" },
      { lat: 23.0330, lng: 72.5980, name: "Lal Darwaja", type: "intermediate" },
      { lat: 23.0350, lng: 72.6000, name: "Ellisbridge", type: "intermediate" },
      { lat: 23.0370, lng: 72.6020, name: "Vastrapur", type: "major" }
    ]
  },
  {
    route_id: 7,
    source: "Bapunagar",
    destination: "Paldi",
    stops: ["Bapunagar Market", "Naroda Road", "Shahpur", "Raipur Darwaja", "Paldi Gam", "Paldi"],
    distance: 11.8,
    color: "#84CC16",
    frequency_minutes: 16,
    peak_hours: ["08:00-10:00", "19:00-21:00"],
    off_peak_hours: ["11:00-18:00", "21:30-23:30"],
    stops_coordinates: [
      { lat: 23.0150, lng: 72.6200, name: "Bapunagar", type: "major" },
      { lat: 23.0120, lng: 72.6180, name: "Bapunagar Market", type: "intermediate" },
      { lat: 23.0090, lng: 72.6160, name: "Naroda Road", type: "intermediate" },
      { lat: 23.0060, lng: 72.6140, name: "Shahpur", type: "intermediate" },
      { lat: 23.0030, lng: 72.6120, name: "Raipur Darwaja", type: "intermediate" },
      { lat: 23.0000, lng: 72.6100, name: "Paldi Gam", type: "intermediate" },
      { lat: 22.9970, lng: 72.6080, name: "Paldi", type: "major" }
    ]
  },
  {
    route_id: 8,
    source: "Naranpura",
    destination: "Satellite",
    stops: ["Naranpura Gam", "Gujarat University", "Navrangpura", "Ellisbridge", "Satellite Circle", "Satellite"],
    distance: 13.5,
    color: "#F97316",
    frequency_minutes: 13,
    peak_hours: ["07:45-09:45", "17:45-19:45"],
    off_peak_hours: ["10:15-16:45", "20:15-22:45"],
    stops_coordinates: [
      { lat: 23.0400, lng: 72.6100, name: "Naranpura", type: "major" },
      { lat: 23.0380, lng: 72.6120, name: "Naranpura Gam", type: "intermediate" },
      { lat: 23.0360, lng: 72.6140, name: "Gujarat University", type: "intermediate" },
      { lat: 23.0340, lng: 72.6160, name: "Navrangpura", type: "intermediate" },
      { lat: 23.0320, lng: 72.6180, name: "Ellisbridge", type: "intermediate" },
      { lat: 23.0300, lng: 72.6200, name: "Satellite Circle", type: "intermediate" },
      { lat: 23.0280, lng: 72.6220, name: "Satellite", type: "major" }
    ]
  }
];

class EnhancedDataService {
  private buses: BusData[] = [];
  private ticketSales: TicketSale[] = [];
  private gpsLogs: GPSLog[] = [];
  private alerts: Alert[] = [];
  private predictions: PredictionData[] = [];
  private routeProgress: { [busId: number]: number } = {};
  private lastUpdate: number = 0;
  private simulationSpeed: number = 1; // Speed multiplier for simulation

  constructor() {
    this.initializeBuses();
    this.generateHistoricalData();
    this.startRealTimeSimulation();
  }

  private initializeBuses() {
    const busConfigs = [
      { id: 1, plate: "BUS-001", routeId: 1, capacity: 50 },
      { id: 2, plate: "BUS-002", routeId: 1, capacity: 50 },
      { id: 3, plate: "BUS-003", routeId: 2, capacity: 40 },
      { id: 4, plate: "BUS-004", routeId: 2, capacity: 40 },
      { id: 5, plate: "BUS-005", routeId: 3, capacity: 45 },
      { id: 6, plate: "BUS-006", routeId: 3, capacity: 45 },
      { id: 7, plate: "BUS-007", routeId: 4, capacity: 35 },
      { id: 8, plate: "BUS-008", routeId: 4, capacity: 35 },
      { id: 9, plate: "BUS-009", routeId: 5, capacity: 55 },
      { id: 10, plate: "BUS-010", routeId: 5, capacity: 55 }
    ];

    this.buses = busConfigs.map(config => {
      const route = routes.find(r => r.route_id === config.routeId)!;
      const startPoint = route.stops_coordinates[0];
      
      this.routeProgress[config.id] = Math.random() * route.stops_coordinates.length;
      
      const now = new Date();
      const plannedDeparture = new Date(now.getTime() + Math.random() * 3600000); // Within next hour
      const plannedArrival = new Date(plannedDeparture.getTime() + route.distance * 60000); // Based on distance
      
      const currentStopIndex = Math.floor(this.routeProgress[config.id]);
      const nextStopIndex = (currentStopIndex + 1) % route.stops_coordinates.length;
      
      return {
        bus_id: config.id,
        license_plate: config.plate,
        route_id: config.routeId,
        route: route,
        capacity: config.capacity,
        status: 'on_time',
        current_position: {
          latitude: startPoint.lat + (Math.random() - 0.5) * 0.01,
          longitude: startPoint.lng + (Math.random() - 0.5) * 0.01,
          speed: 25 + Math.random() * 20,
          direction: Math.random() * 360,
          timestamp: new Date().toISOString()
        },
        occupancy: Math.floor(Math.random() * config.capacity * 0.8),
        occupancy_percentage: 0,
        schedule: {
          planned_departure: plannedDeparture.toISOString(),
          planned_arrival: plannedArrival.toISOString(),
          delay_minutes: Math.floor(Math.random() * 10) - 5 // -5 to +5 minutes
        },
        weather_impact: 'normal',
        traffic_condition: 'normal',
        is_operational: true,
        last_stop: route.stops_coordinates[currentStopIndex]?.name || route.stops_coordinates[0].name,
        next_stop: route.stops_coordinates[nextStopIndex]?.name || route.stops_coordinates[0].name,
        estimated_arrival: new Date(plannedArrival.getTime() + Math.floor(Math.random() * 10) * 60000).toISOString()
      };
    });

    this.updateOccupancyPercentages();
  }

  private generateHistoricalData() {
    // Generate historical ticket sales
    for (let i = 0; i < 1000; i++) {
      const bus = this.buses[Math.floor(Math.random() * this.buses.length)];
      const route = routes.find(r => r.route_id === bus.route_id)!;
      const stopIndex = Math.floor(Math.random() * (route.stops_coordinates.length - 1));
      
      this.ticketSales.push({
        ticket_id: i + 1,
        bus_id: bus.bus_id,
        route_id: bus.route_id,
        passenger_count: Math.floor(Math.random() * 4) + 1,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        price: 2.50 + Math.random() * 2.00,
        stop_boarding: route.stops_coordinates[stopIndex].name,
        stop_alighting: route.stops_coordinates[stopIndex + 1]?.name || route.stops_coordinates[0].name
      });
    }

    // Generate historical GPS logs
    for (let i = 0; i < 5000; i++) {
      const bus = this.buses[Math.floor(Math.random() * this.buses.length)];
      const route = routes.find(r => r.route_id === bus.route_id)!;
      const progress = Math.random() * route.stops_coordinates.length;
      const position = this.interpolatePosition(progress, route.stops_coordinates);
      
      this.gpsLogs.push({
        log_id: i + 1,
        bus_id: bus.bus_id,
        latitude: position.lat,
        longitude: position.lng,
        speed: 20 + Math.random() * 30,
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        direction: Math.random() * 360,
        stop_id: Math.random() > 0.7 ? `stop_${Math.floor(Math.random() * 5)}` : undefined
      });
    }
  }

  private startRealTimeSimulation() {
    setInterval(() => {
      this.updateBusPositions();
      this.updatePassengerCounts();
      this.generateTicketSales();
      this.generateGPSLogs();
      this.updateSchedules();
      this.generateAlerts();
      this.updatePredictions();
    }, 5000 / this.simulationSpeed); // Update every 5 seconds
  }

  private updateBusPositions() {
    this.buses.forEach(bus => {
      // Skip if bus is not operational (breakdown, maintenance)
      if (!bus.is_operational) return;
      
      const route = routes.find(r => r.route_id === bus.route_id)!;
      if (!route) return;

      // Update progress along route with more realistic movement
      const speed = bus.current_position.speed / 3600; // km/s
      const progressIncrement = (speed * 5) / 50; // 5 seconds * speed
      this.routeProgress[bus.bus_id] = (this.routeProgress[bus.bus_id] + progressIncrement) % route.stops_coordinates.length;

      // Get new position
      const newPos = this.interpolatePosition(this.routeProgress[bus.bus_id], route.stops_coordinates);
      const oldPos = bus.current_position;

      // Calculate direction
      const direction = this.calculateDirection(oldPos, newPos);

      // Add realistic speed variation based on route segment and conditions
      const currentStopIndex = Math.floor(this.routeProgress[bus.bus_id]);
      const segmentProgress = this.routeProgress[bus.bus_id] - currentStopIndex;
      const speedVariation = Math.sin(segmentProgress * Math.PI) * 10; // Speed up/slow down at stops
      let baseSpeed = 25 + Math.random() * 15; // 25-40 km/h base speed
      
      // Adjust speed based on weather and traffic conditions
      if (bus.weather_impact === 'heavy_rain' || bus.weather_impact === 'storm') {
        baseSpeed *= 0.6; // 40% speed reduction
      } else if (bus.weather_impact === 'rain' || bus.weather_impact === 'fog') {
        baseSpeed *= 0.8; // 20% speed reduction
      }
      
      if (bus.traffic_condition === 'jam') {
        baseSpeed *= 0.3; // 70% speed reduction
      } else if (bus.traffic_condition === 'heavy') {
        baseSpeed *= 0.7; // 30% speed reduction
      }

      // Update bus position
      bus.current_position = {
        latitude: newPos.lat,
        longitude: newPos.lng,
        speed: Math.max(2, baseSpeed + speedVariation), // Minimum 2 km/h
        direction: direction,
        timestamp: new Date().toISOString()
      };

      // Update stop information
      const nextStopIndex = (currentStopIndex + 1) % route.stops_coordinates.length;
      bus.last_stop = route.stops_coordinates[currentStopIndex]?.name || route.stops_coordinates[0].name;
      bus.next_stop = route.stops_coordinates[nextStopIndex]?.name || route.stops_coordinates[0].name;
      
      // Update estimated arrival based on current conditions
      const estimatedTime = new Date();
      estimatedTime.setMinutes(estimatedTime.getMinutes() + Math.floor(Math.random() * 10) + 5);
      bus.estimated_arrival = estimatedTime.toISOString();

      // Update occupancy based on stops
      this.updateBusOccupancy(bus, currentStopIndex, segmentProgress);
    });
  }

  private updateBusOccupancy(bus: BusData, currentStopIndex: number, segmentProgress: number) {
    const route = routes.find(r => r.route_id === bus.route_id);
    if (!route) return;

    // Simulate passengers boarding/alighting at stops
    if (segmentProgress < 0.1) { // At the beginning of a stop
      const stopName = route.stops_coordinates[currentStopIndex].name;
      
      // Boarding passengers (more likely at popular stops)
      const boardingProbability = this.getBoardingProbability(stopName, currentStopIndex);
      if (Math.random() < boardingProbability) {
        const boardingCount = Math.floor(Math.random() * 8) + 1; // 1-8 passengers
        bus.occupancy = Math.min(bus.capacity, bus.occupancy + boardingCount);
      }
      
      // Alighting passengers (more likely at destination stops)
      const alightingProbability = this.getAlightingProbability(stopName, currentStopIndex);
      if (Math.random() < alightingProbability) {
        const alightingCount = Math.floor(Math.random() * 6) + 1; // 1-6 passengers
        bus.occupancy = Math.max(0, bus.occupancy - alightingCount);
      }
      
      this.updateOccupancyPercentages();
    }
  }

  private getBoardingProbability(stopName: string, stopIndex: number): number {
    // Higher probability at major stops
    const majorStops = ['Downtown Station', 'University Campus', 'Shopping Mall', 'Airport Terminal'];
    if (majorStops.includes(stopName)) return 0.7;
    if (stopIndex === 0) return 0.8; // First stop
    return 0.3; // Regular stops
  }

  private getAlightingProbability(stopName: string, stopIndex: number): number {
    // Higher probability at destination stops
    const destinationStops = ['Airport Terminal', 'Shopping Mall', 'University Campus', 'Business Center'];
    if (destinationStops.includes(stopName)) return 0.6;
    if (stopIndex === 0) return 0.1; // First stop
    return 0.4; // Regular stops
  }

  private updatePassengerCounts() {
    this.buses.forEach(bus => {
      // Simulate realistic passenger changes based on time and location
      const hour = new Date().getHours();
      const isPeakHour = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);
      const changeProbability = isPeakHour ? 0.4 : 0.2;
      
      if (Math.random() < changeProbability) {
        const change = Math.floor(Math.random() * 6) - 3; // -3 to +3
        bus.occupancy = Math.max(0, Math.min(bus.capacity, bus.occupancy + change));
      }
    });

    this.updateOccupancyPercentages();
  }

  private generateTicketSales() {
    // Generate new ticket sales based on current time and demand
    const hour = new Date().getHours();
    const isPeakHour = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);
    const salesProbability = isPeakHour ? 0.3 : 0.1;

    if (Math.random() < salesProbability) {
      const bus = this.buses[Math.floor(Math.random() * this.buses.length)];
      const route = routes.find(r => r.route_id === bus.route_id)!;
      const stopIndex = Math.floor(Math.random() * (route.stops_coordinates.length - 1));
      
      this.ticketSales.push({
        ticket_id: this.ticketSales.length + 1,
        bus_id: bus.bus_id,
        route_id: bus.route_id,
        passenger_count: Math.floor(Math.random() * 3) + 1,
        timestamp: new Date().toISOString(),
        price: 2.50 + Math.random() * 2.00,
        stop_boarding: route.stops_coordinates[stopIndex].name,
        stop_alighting: route.stops_coordinates[stopIndex + 1]?.name || route.stops_coordinates[0].name
      });
    }
  }

  private generateGPSLogs() {
    this.buses.forEach(bus => {
      this.gpsLogs.push({
        log_id: this.gpsLogs.length + 1,
        bus_id: bus.bus_id,
        latitude: bus.current_position.latitude,
        longitude: bus.current_position.longitude,
        speed: bus.current_position.speed,
        timestamp: bus.current_position.timestamp,
        direction: bus.current_position.direction,
        stop_id: Math.random() > 0.8 ? `stop_${Math.floor(Math.random() * 5)}` : undefined
      });
    });
  }

  private updateSchedules() {
    this.buses.forEach(bus => {
      // Simulate schedule adjustments based on delays
      if (Math.random() < 0.1) { // 10% chance of schedule change
        const delayChange = Math.floor(Math.random() * 6) - 3; // -3 to +3 minutes
        bus.schedule.delay_minutes = Math.max(-10, Math.min(10, bus.schedule.delay_minutes + delayChange));
        
        // Update actual departure if delayed
        if (bus.schedule.delay_minutes > 0) {
          const plannedDeparture = new Date(bus.schedule.planned_departure);
          bus.schedule.actual_departure = new Date(plannedDeparture.getTime() + bus.schedule.delay_minutes * 60000).toISOString();
        }
      }
    });
  }

  private generateAlerts() {
    // Generate weather alerts
    this.generateWeatherAlerts();
    
    // Generate breakdown alerts
    this.generateBreakdownAlerts();
    
    // Generate traffic alerts
    this.generateTrafficAlerts();
    
    // Generate delay alerts
    this.buses.forEach(bus => {
      if (bus.schedule.delay_minutes > 5 && Math.random() < 0.3) {
        const alertId = `delay_${bus.bus_id}_${Date.now()}`;
        
        // Check if alert already exists
        if (!this.alerts.find(a => a.id === alertId)) {
          this.alerts.push({
            id: alertId,
            type: 'delay',
            severity: bus.schedule.delay_minutes > 15 ? 'high' : 'medium',
            title: `Route ${bus.route_id} Delayed`,
            message: `Bus ${bus.license_plate} is ${bus.schedule.delay_minutes} minutes behind schedule. Rescheduling now...`,
            route_id: bus.route_id,
            bus_id: bus.bus_id,
            timestamp: new Date().toISOString(),
            resolved: false
          });
        }
      }
    });

    // Auto-resolve old alerts
    this.alerts = this.alerts.filter(alert => {
      const alertTime = new Date(alert.timestamp);
      const isOld = Date.now() - alertTime.getTime() > 300000; // 5 minutes
      return !isOld || !alert.resolved;
    });
  }

  private generateWeatherAlerts() {
    // Simulate weather conditions affecting buses
    const weatherConditions = ['rain', 'heavy_rain', 'fog', 'storm'];
    const currentWeather = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
    
    if (currentWeather !== 'normal' && Math.random() < 0.1) { // 10% chance
      const affectedBuses = this.buses.filter(bus => Math.random() < 0.3); // 30% of buses affected
      
      affectedBuses.forEach(bus => {
        bus.weather_impact = currentWeather as any;
        bus.schedule.delay_minutes += Math.floor(Math.random() * 15) + 5; // 5-20 minutes delay
        
        const alertId = `weather_${bus.bus_id}_${Date.now()}`;
        if (!this.alerts.find(a => a.id === alertId)) {
          this.alerts.push({
            id: alertId,
            type: 'weather',
            severity: currentWeather === 'storm' ? 'critical' : 'high',
            title: `Weather Alert - Route ${bus.route_id}`,
            message: `Heavy ${currentWeather} affecting Route ${bus.route_id}. Expect delays of ${bus.schedule.delay_minutes} minutes.`,
            route_id: bus.route_id,
            bus_id: bus.bus_id,
            timestamp: new Date().toISOString(),
            resolved: false,
            weather_condition: currentWeather,
            affected_stops: bus.route.stops
          });
        }
      });
    }
  }

  private generateBreakdownAlerts() {
    // Simulate bus breakdowns
    if (Math.random() < 0.05) { // 5% chance per update cycle
      const bus = this.buses[Math.floor(Math.random() * this.buses.length)];
      const breakdownReasons = [
        'Engine failure',
        'Brake system issue',
        'Tire puncture',
        'Electrical problem',
        'Fuel system malfunction'
      ];
      
      const reason = breakdownReasons[Math.floor(Math.random() * breakdownReasons.length)];
      bus.status = 'breakdown';
      bus.is_operational = false;
      bus.breakdown_reason = reason;
      bus.schedule.delay_minutes = 999; // Indefinite delay
      
      const alertId = `breakdown_${bus.bus_id}_${Date.now()}`;
      if (!this.alerts.find(a => a.id === alertId)) {
        this.alerts.push({
          id: alertId,
          type: 'breakdown',
          severity: 'critical',
          title: `Bus Breakdown - Route ${bus.route_id}`,
          message: `Bus ${bus.license_plate} has broken down due to ${reason}. Route ${bus.route_id} is cancelled until replacement bus arrives.`,
          route_id: bus.route_id,
          bus_id: bus.bus_id,
          timestamp: new Date().toISOString(),
          resolved: false,
          breakdown_reason: reason,
          affected_stops: bus.route.stops
        });
      }
    }
  }

  private generateTrafficAlerts() {
    // Simulate traffic conditions
    const trafficConditions = ['heavy', 'jam', 'clear'];
    const currentTraffic = trafficConditions[Math.floor(Math.random() * trafficConditions.length)];
    
    if (currentTraffic !== 'normal' && Math.random() < 0.15) { // 15% chance
      const affectedBuses = this.buses.filter(bus => Math.random() < 0.4); // 40% of buses affected
      
      affectedBuses.forEach(bus => {
        bus.traffic_condition = currentTraffic as any;
        if (currentTraffic === 'jam') {
          bus.schedule.delay_minutes += Math.floor(Math.random() * 20) + 10; // 10-30 minutes delay
        } else if (currentTraffic === 'heavy') {
          bus.schedule.delay_minutes += Math.floor(Math.random() * 10) + 5; // 5-15 minutes delay
        }
        
        const alertId = `traffic_${bus.bus_id}_${Date.now()}`;
        if (!this.alerts.find(a => a.id === alertId)) {
          this.alerts.push({
            id: alertId,
            type: 'traffic',
            severity: currentTraffic === 'jam' ? 'high' : 'medium',
            title: `Traffic Alert - Route ${bus.route_id}`,
            message: `${currentTraffic.charAt(0).toUpperCase() + currentTraffic.slice(1)} traffic on Route ${bus.route_id}. Expect delays.`,
            route_id: bus.route_id,
            bus_id: bus.bus_id,
            timestamp: new Date().toISOString(),
            resolved: false,
            affected_stops: bus.route.stops
          });
        }
      });
    }
  }

  private updatePredictions() {
    const now = new Date();
    const currentHour = now.getHours();
    
    // Update predictions for next 6 hours
    for (let i = 0; i < 6; i++) {
      const hour = (currentHour + i) % 24;
      const routeId = Math.floor(Math.random() * 5) + 1;
      
      const existingPrediction = this.predictions.find(p => 
        p.route_id === routeId && p.hour === hour && 
        new Date(p.timestamp).getTime() > now.getTime() - 300000 // Within 5 minutes
      );
      
      if (!existingPrediction) {
        const baseDemand = this.calculateBaseDemand(hour, routeId);
        const predictedRidership = Math.floor(baseDemand * (1 + Math.random() * 0.3));
        
        this.predictions.push({
          route_id: routeId,
          hour: hour,
          predicted_ridership: predictedRidership,
          confidence: 0.7 + Math.random() * 0.3,
          timestamp: new Date(now.getTime() + i * 60 * 60 * 1000).toISOString(),
          factors: {
            weather: Math.random(),
            day_of_week: now.getDay(),
            historical_average: baseDemand,
            events: Math.random() > 0.9 ? 1.5 : 1.0
          }
        });
      }
    }
  }

  private calculateBaseDemand(hour: number, routeId: number): number {
    let baseDemand = 20;
    
    // Peak hours
    if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
      baseDemand = 60;
    } else if (hour >= 10 && hour <= 16) {
      baseDemand = 35;
    } else if (hour >= 20 && hour <= 22) {
      baseDemand = 25;
    } else {
      baseDemand = 10;
    }
    
    // Route-specific adjustments
    const routeMultipliers = { 1: 1.2, 2: 1.5, 3: 1.0, 4: 0.8, 5: 1.1 };
    baseDemand *= routeMultipliers[routeId as keyof typeof routeMultipliers] || 1.0;
    
    return baseDemand;
  }

  private interpolatePosition(progress: number, coordinates: any[]): { lat: number; lng: number } {
    if (progress >= coordinates.length - 1) {
      return coordinates[coordinates.length - 1];
    }

    const index = Math.floor(progress);
    const t = progress - index;
    const current = coordinates[index];
    const next = coordinates[index + 1];

    return {
      lat: current.lat + (next.lat - current.lat) * t,
      lng: current.lng + (next.lng - current.lng) * t
    };
  }

  private calculateDirection(from: { lat: number; lng: number }, to: { lat: number; lng: number }): number {
    const lat1 = from.lat * Math.PI / 180;
    const lat2 = to.lat * Math.PI / 180;
    const deltaLng = (to.lng - from.lng) * Math.PI / 180;

    const y = Math.sin(deltaLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);

    let bearing = Math.atan2(y, x) * 180 / Math.PI;
    return (bearing + 360) % 360;
  }

  private updateOccupancyPercentages() {
    this.buses.forEach(bus => {
      bus.occupancy_percentage = Math.round((bus.occupancy / bus.capacity) * 100);
    });
  }

  // Public API methods
  public getLiveBusData(): BusData[] {
    return [...this.buses];
  }

  public getTicketSales(hours: number = 24): TicketSale[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.ticketSales.filter(sale => new Date(sale.timestamp) >= cutoff);
  }

  public getGPSLogs(hours: number = 24): GPSLog[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.gpsLogs.filter(log => new Date(log.timestamp) >= cutoff);
  }

  public getAlerts(): Alert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  public getPredictions(): PredictionData[] {
    return [...this.predictions];
  }

  public getRoutes() {
    return routes.map(route => ({
      route_id: route.route_id,
      source: route.source,
      destination: route.destination,
      stops: route.stops,
      distance: route.distance,
      color: route.color,
      stops_coordinates: route.stops_coordinates
    }));
  }

  public getRouteProgress(busId: number): number {
    return this.routeProgress[busId] || 0;
  }

  public getScheduleComparison() {
    const currentSchedules = this.buses.map(bus => ({
      bus_id: bus.bus_id,
      route_id: bus.route_id,
      start_time: bus.schedule.planned_departure.substring(11, 16),
      end_time: bus.schedule.planned_arrival.substring(11, 16),
      status: 'current',
      adjustment_reason: 'Original schedule'
    }));

    const optimizedSchedules = this.buses.map(bus => {
      const delay = bus.schedule.delay_minutes;
      const plannedDeparture = new Date(bus.schedule.planned_departure);
      const optimizedDeparture = new Date(plannedDeparture.getTime() + delay * 60000);
      
      return {
        bus_id: bus.bus_id,
        route_id: bus.route_id,
        start_time: optimizedDeparture.toISOString().substring(11, 16),
        end_time: new Date(optimizedDeparture.getTime() + 90 * 60000).toISOString().substring(11, 16),
        adjustment_reason: delay > 0 
          ? `Delayed by ${delay} minutes due to traffic`
          : delay < 0 
          ? `Advanced by ${Math.abs(delay)} minutes for better headway`
          : 'No adjustment needed',
        original_start_time: bus.schedule.planned_departure.substring(11, 16),
        time_adjustment_minutes: delay
      };
    });

    return {
      current_schedules: currentSchedules,
      optimized_schedules: optimizedSchedules,
      comparison_metrics: {
        total_buses: {
          current: currentSchedules.length,
          optimized: optimizedSchedules.length,
          change: 0
        },
        average_headway_minutes: {
          current: 18.5,
          optimized: 15.2,
          improvement: 3.3
        },
        efficiency_score: {
          current: 68.5,
          optimized: 82.1
        }
      }
    };
  }

  public getRidershipComparison() {
    const now = new Date();
    const currentHour = now.getHours();
    
    return this.predictions
      .filter(p => p.hour === currentHour)
      .map(prediction => {
        const actualRidership = this.getActualRidership(prediction.route_id, currentHour);
        return {
          ...prediction,
          actual_ridership: actualRidership,
          accuracy: actualRidership > 0 ? Math.abs(prediction.predicted_ridership - actualRidership) / actualRidership : 0
        };
      });
  }

  private getActualRidership(routeId: number, hour: number): number {
    const hourStart = new Date();
    hourStart.setHours(hour, 0, 0, 0);
    const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);
    
    return this.ticketSales
      .filter(sale => 
        sale.route_id === routeId &&
        new Date(sale.timestamp) >= hourStart &&
        new Date(sale.timestamp) < hourEnd
      )
      .reduce((sum, sale) => sum + sale.passenger_count, 0);
  }

  public resolveAlert(alertId: string) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
    }
  }

  public setSimulationSpeed(speed: number) {
    this.simulationSpeed = Math.max(0.1, Math.min(5, speed));
  }
}

// Export singleton instance
export const enhancedDataService = new EnhancedDataService();
