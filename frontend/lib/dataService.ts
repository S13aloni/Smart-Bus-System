// Data service for generating realistic bus tracking data
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
}

export interface RouteData {
  route_id: number;
  source: string;
  destination: string;
  stops: string[];
  distance: number;
}

// Sample routes with realistic coordinates
const routes: RouteData[] = [
  {
    route_id: 1,
    source: "Downtown Station",
    destination: "Airport Terminal",
    stops: ["Central Plaza", "University Campus", "Shopping Mall", "Airport Terminal"],
    distance: 25.5
  },
  {
    route_id: 2,
    source: "University Campus",
    destination: "Shopping District",
    stops: ["Student Center", "Library", "Shopping Mall", "Entertainment Center"],
    distance: 12.3
  },
  {
    route_id: 3,
    source: "Residential Area",
    destination: "Business District",
    stops: ["Housing Complex", "School", "Hospital", "Business Center"],
    distance: 18.7
  },
  {
    route_id: 4,
    source: "Airport Terminal",
    destination: "Hotel District",
    stops: ["Airport Terminal", "Convention Center", "Hotel Plaza", "Tourist Center"],
    distance: 8.9
  },
  {
    route_id: 5,
    source: "Suburb Station",
    destination: "City Center",
    stops: ["Suburb Mall", "Park", "City Hall", "Central Plaza"],
    distance: 22.1
  }
];

// Route paths with waypoints for realistic movement
const routePaths: { [key: number]: { lat: number; lng: number }[] } = {
  1: [
    { lat: 40.7128, lng: -74.0060 }, // Downtown
    { lat: 40.7589, lng: -73.9851 }, // Central Plaza
    { lat: 40.7505, lng: -73.9934 }, // University
    { lat: 40.7614, lng: -73.9776 }, // Shopping Mall
    { lat: 40.6413, lng: -73.7781 }  // Airport
  ],
  2: [
    { lat: 40.7505, lng: -73.9934 }, // University
    { lat: 40.7489, lng: -73.9857 }, // Student Center
    { lat: 40.7502, lng: -73.9876 }, // Library
    { lat: 40.7614, lng: -73.9776 }, // Shopping Mall
    { lat: 40.7630, lng: -73.9780 }  // Entertainment
  ],
  3: [
    { lat: 40.6782, lng: -73.9442 }, // Residential
    { lat: 40.6800, lng: -73.9400 }, // Housing Complex
    { lat: 40.6820, lng: -73.9380 }, // School
    { lat: 40.6850, lng: -73.9350 }, // Hospital
    { lat: 40.6890, lng: -73.9300 }  // Business Center
  ],
  4: [
    { lat: 40.6413, lng: -73.7781 }, // Airport
    { lat: 40.6500, lng: -73.7800 }, // Convention Center
    { lat: 40.6600, lng: -73.7900 }, // Hotel Plaza
    { lat: 40.6700, lng: -73.8000 }  // Tourist Center
  ],
  5: [
    { lat: 40.6000, lng: -73.9000 }, // Suburb
    { lat: 40.6200, lng: -73.9500 }, // Suburb Mall
    { lat: 40.6500, lng: -73.9800 }, // Park
    { lat: 40.6800, lng: -74.0000 }, // City Hall
    { lat: 40.7128, lng: -74.0060 }  // Central Plaza
  ]
};

class DataService {
  private buses: BusData[] = [];
  private routeProgress: { [busId: number]: number } = {};
  private lastUpdate: number = 0;

  constructor() {
    this.initializeBuses();
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
      const path = routePaths[config.routeId];
      const startPoint = path[0];
      
      this.routeProgress[config.id] = Math.random() * path.length;
      
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
        occupancy: Math.floor(Math.random() * config.capacity),
        occupancy_percentage: 0
      };
    });

    this.updateOccupancyPercentages();
  }

  private updateOccupancyPercentages() {
    this.buses.forEach(bus => {
      bus.occupancy_percentage = Math.round((bus.occupancy / bus.capacity) * 100);
    });
  }

  private interpolatePosition(progress: number, path: { lat: number; lng: number }[]): { lat: number; lng: number } {
    if (progress >= path.length - 1) {
      return path[path.length - 1];
    }

    const index = Math.floor(progress);
    const t = progress - index;
    const current = path[index];
    const next = path[index + 1];

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

  private updateBusPositions() {
    const now = Date.now();
    const deltaTime = (now - this.lastUpdate) / 1000; // seconds
    this.lastUpdate = now;

    this.buses.forEach(bus => {
      const path = routePaths[bus.route_id];
      if (!path) return;

      // Update progress along route
      const speed = bus.current_position.speed / 3600; // km/s
      const progressIncrement = (speed * deltaTime) / 50; // rough conversion to path units
      this.routeProgress[bus.bus_id] = (this.routeProgress[bus.bus_id] + progressIncrement) % path.length;

      // Get new position
      const newPos = this.interpolatePosition(this.routeProgress[bus.bus_id], path);
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

      // Simulate passenger changes
      if (Math.random() < 0.3) { // 30% chance of change
        const change = Math.floor(Math.random() * 6) - 3; // -3 to +3
        bus.occupancy = Math.max(0, Math.min(bus.capacity, bus.occupancy + change));
      }
    });

    this.updateOccupancyPercentages();
  }

  public getLiveBusData(): BusData[] {
    this.updateBusPositions();
    return [...this.buses];
  }

  public getRoutes(): RouteData[] {
    return [...routes];
  }

  public getBusById(id: number): BusData | undefined {
    return this.buses.find(bus => bus.bus_id === id);
  }

  public getDemandForecast() {
    const now = new Date();
    const forecast = [];

    for (let i = 0; i < 24; i++) {
      const hour = (now.getHours() + i) % 24;
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

      forecast.push({
        hour: hour,
        day_of_week: now.getDay(),
        predicted_passengers: Math.floor(baseDemand * (1 + Math.random() * 0.3)),
        confidence: 0.8 + Math.random() * 0.2,
        timestamp: new Date(now.getTime() + i * 60 * 60 * 1000).toISOString()
      });
    }

    return {
      route_id: null,
      forecast: forecast,
      generated_at: now.toISOString(),
      method: 'simulated_forecast'
    };
  }

  public getScheduleComparison() {
    const currentSchedules = this.buses.map(bus => ({
      bus_id: bus.bus_id,
      route_id: bus.route_id,
      start_time: this.generateRandomTime(),
      end_time: this.generateRandomTime(),
      status: 'current',
      adjustment_reason: 'Original schedule'
    }));

    const optimizedSchedules = currentSchedules.map(schedule => {
      const adjustment = Math.floor(Math.random() * 20) - 10; // -10 to +10 minutes
      const originalTime = this.timeToMinutes(schedule.start_time);
      const newTime = Math.max(0, originalTime + adjustment);
      
      return {
        ...schedule,
        start_time: this.minutesToTime(newTime),
        end_time: this.minutesToTime(newTime + 90), // 1.5 hour trip
        adjustment_reason: adjustment > 0 
          ? `Delayed by ${adjustment} minutes to improve headway`
          : `Advanced by ${Math.abs(adjustment)} minutes to reduce bunching`,
        original_start_time: schedule.start_time,
        time_adjustment_minutes: adjustment
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

  private generateRandomTime(): string {
    const hour = Math.floor(Math.random() * 12) + 6; // 6 AM to 6 PM
    const minute = Math.floor(Math.random() * 60);
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
  }

  private timeToMinutes(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`;
  }
}

// Export singleton instance
export const dataService = new DataService();
