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
  status: string;
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
  type: 'delay' | 'cancellation' | 'reschedule' | 'congestion' | 'maintenance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  route_id: number;
  bus_id?: number;
  timestamp: string;
  resolved: boolean;
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

// Enhanced route data with more realistic paths
const routes = [
  {
    route_id: 1,
    source: "Downtown Station",
    destination: "Airport Terminal",
    stops: ["Central Plaza", "University Campus", "Shopping Mall", "Airport Terminal"],
    distance: 25.5,
    stops_coordinates: [
      { lat: 40.7128, lng: -74.0060, name: "Downtown Station" },
      { lat: 40.7589, lng: -73.9851, name: "Central Plaza" },
      { lat: 40.7505, lng: -73.9934, name: "University Campus" },
      { lat: 40.7614, lng: -73.9776, name: "Shopping Mall" },
      { lat: 40.6413, lng: -73.7781, name: "Airport Terminal" }
    ]
  },
  {
    route_id: 2,
    source: "University Campus",
    destination: "Shopping District",
    stops: ["Student Center", "Library", "Shopping Mall", "Entertainment Center"],
    distance: 12.3,
    stops_coordinates: [
      { lat: 40.7505, lng: -73.9934, name: "University Campus" },
      { lat: 40.7489, lng: -73.9857, name: "Student Center" },
      { lat: 40.7502, lng: -73.9876, name: "Library" },
      { lat: 40.7614, lng: -73.9776, name: "Shopping Mall" },
      { lat: 40.7630, lng: -73.9780, name: "Entertainment Center" }
    ]
  },
  {
    route_id: 3,
    source: "Residential Area",
    destination: "Business District",
    stops: ["Housing Complex", "School", "Hospital", "Business Center"],
    distance: 18.7,
    stops_coordinates: [
      { lat: 40.6782, lng: -73.9442, name: "Residential Area" },
      { lat: 40.6800, lng: -73.9400, name: "Housing Complex" },
      { lat: 40.6820, lng: -73.9380, name: "School" },
      { lat: 40.6850, lng: -73.9350, name: "Hospital" },
      { lat: 40.6890, lng: -73.9300, name: "Business Center" }
    ]
  },
  {
    route_id: 4,
    source: "Airport Terminal",
    destination: "Hotel District",
    stops: ["Airport Terminal", "Convention Center", "Hotel Plaza", "Tourist Center"],
    distance: 8.9,
    stops_coordinates: [
      { lat: 40.6413, lng: -73.7781, name: "Airport Terminal" },
      { lat: 40.6500, lng: -73.7800, name: "Convention Center" },
      { lat: 40.6600, lng: -73.7900, name: "Hotel Plaza" },
      { lat: 40.6700, lng: -73.8000, name: "Tourist Center" }
    ]
  },
  {
    route_id: 5,
    source: "Suburb Station",
    destination: "City Center",
    stops: ["Suburb Mall", "Park", "City Hall", "Central Plaza"],
    distance: 22.1,
    stops_coordinates: [
      { lat: 40.6000, lng: -73.9000, name: "Suburb Station" },
      { lat: 40.6200, lng: -73.9500, name: "Suburb Mall" },
      { lat: 40.6500, lng: -73.9800, name: "Park" },
      { lat: 40.6800, lng: -74.0000, name: "City Hall" },
      { lat: 40.7128, lng: -74.0060, name: "Central Plaza" }
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
      
      return {
        bus_id: config.id,
        license_plate: config.plate,
        route_id: config.routeId,
        route: route,
        capacity: config.capacity,
        status: 'active',
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
        }
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
      const route = routes.find(r => r.route_id === bus.route_id)!;
      if (!route) return;

      // Update progress along route
      const speed = bus.current_position.speed / 3600; // km/s
      const progressIncrement = (speed * 5) / 50; // 5 seconds * speed
      this.routeProgress[bus.bus_id] = (this.routeProgress[bus.bus_id] + progressIncrement) % route.stops_coordinates.length;

      // Get new position
      const newPos = this.interpolatePosition(this.routeProgress[bus.bus_id], route.stops_coordinates);
      const oldPos = bus.current_position;

      // Calculate direction
      const direction = this.calculateDirection(oldPos, newPos);

      // Update bus position
      bus.current_position = {
        latitude: newPos.lat,
        longitude: newPos.lng,
        speed: 20 + Math.random() * 30, // 20-50 km/h
        direction: direction,
        timestamp: new Date().toISOString()
      };
    });
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
    // Generate alerts based on delays and issues
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
      stops_coordinates: route.stops_coordinates
    }));
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
