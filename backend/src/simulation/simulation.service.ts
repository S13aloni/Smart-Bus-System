import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GpsLog } from '../entities/gps-log.entity';
import { PassengerCount } from '../entities/passenger-count.entity';
import { Bus } from '../entities/bus.entity';
import { Route } from '../entities/route.entity';

@Injectable()
export class SimulationService implements OnModuleInit {
  private simulationInterval: NodeJS.Timeout;
  private isSimulationRunning = false;

  constructor(
    @InjectRepository(GpsLog)
    private gpsLogRepository: Repository<GpsLog>,
    @InjectRepository(PassengerCount)
    private passengerCountRepository: Repository<PassengerCount>,
    @InjectRepository(Bus)
    private busRepository: Repository<Bus>,
    @InjectRepository(Route)
    private routeRepository: Repository<Route>,
  ) {}

  async onModuleInit() {
    // Check if database has data, if not, seed it
    await this.ensureDatabaseHasData();
    
    // Start simulation automatically when module initializes
    await this.startSimulation();
  }

  private async ensureDatabaseHasData(): Promise<void> {
    try {
      const routeCount = await this.routeRepository.count();
      const busCount = await this.busRepository.count();

      // Check if we have old data (non-Ahmedabad routes)
      const existingRoutes = await this.routeRepository.find();
      const hasOldData = existingRoutes.some(route => 
        route.source.includes('Downtown') || 
        route.source.includes('Airport') || 
        route.source.includes('North Station') ||
        route.source.includes('South Station')
      );

      if (routeCount === 0 || busCount === 0 || hasOldData) {
        if (hasOldData) {
          console.log('🔄 Detected old data, clearing and reseeding with Ahmedabad routes...');
          await this.clearOldData();
        } else {
          console.log('🌱 Database is empty, seeding initial data...');
        }
        await this.seedInitialData();
      } else {
        console.log('✅ Database already contains valid data');
      }
    } catch (error) {
      console.error('Error ensuring database has data:', error);
      throw error;
    }
  }

  
  private async clearOldData(): Promise<void> {
    try {
      // Clear all related data in correct order using query builder
      await this.gpsLogRepository.createQueryBuilder().delete().execute();
      await this.passengerCountRepository.createQueryBuilder().delete().execute();
      await this.busRepository.createQueryBuilder().delete().execute();
      await this.routeRepository.createQueryBuilder().delete().execute();
      console.log('✅ Old data cleared');
    } catch (error) {
      console.error('Error clearing old data:', error);
      throw error;
    }
  }

  private async seedInitialData(): Promise<void> {
    // Seed Routes - Ahmedabad based routes
    const routes = [
      {
        source: 'Ahmedabad Railway Station',
        destination: 'Sardar Vallabhbhai Patel International Airport',
        stops: [
          'Ahmedabad Railway Station',
          'Kalupur',
          'Maninagar',
          'Vastrapur',
          'Bodakdev',
          'Sardar Vallabhbhai Patel International Airport'
        ],
        distance: 12.8
      },
      {
        source: 'Sardar Vallabhbhai Patel International Airport',
        destination: 'Ahmedabad Railway Station',
        stops: [
          'Sardar Vallabhbhai Patel International Airport',
          'Bodakdev',
          'Vastrapur',
          'Maninagar',
          'Kalupur',
          'Ahmedabad Railway Station'
        ],
        distance: 12.8
      },
      {
        source: 'Gandhinagar Bus Stand',
        destination: 'Ahmedabad Central Bus Station',
        stops: [
          'Gandhinagar Bus Stand',
          'Sector 21',
          'Infocity',
          'Chandkheda',
          'Naroda',
          'Ahmedabad Central Bus Station'
        ],
        distance: 15.2
      },
      {
        source: 'Ahmedabad Central Bus Station',
        destination: 'Gandhinagar Bus Stand',
        stops: [
          'Ahmedabad Central Bus Station',
          'Naroda',
          'Chandkheda',
          'Infocity',
          'Sector 21',
          'Gandhinagar Bus Stand'
        ],
        distance: 15.2
      },
      {
        source: 'Sabarmati Riverfront',
        destination: 'Science City',
        stops: [
          'Sabarmati Riverfront',
          'Ellis Bridge',
          'Law Garden',
          'Navrangpura',
          'Paldi',
          'Science City'
        ],
        distance: 8.5
      },
      {
        source: 'Science City',
        destination: 'Sabarmati Riverfront',
        stops: [
          'Science City',
          'Paldi',
          'Navrangpura',
          'Law Garden',
          'Ellis Bridge',
          'Sabarmati Riverfront'
        ],
        distance: 8.5
      }
    ];

    for (const routeData of routes) {
      const route = this.routeRepository.create(routeData);
      await this.routeRepository.save(route);
    }

    // Seed Buses
    const allRoutes = await this.routeRepository.find();
    for (const route of allRoutes) {
      for (let i = 0; i < 2; i++) {
        const bus = this.busRepository.create({
          route_id: route.route_id,
          capacity: 50 + Math.floor(Math.random() * 20),
          status: 'active',
          license_plate: this.generateLicensePlate(),
        });
        await this.busRepository.save(bus);
      }
    }

    console.log('✅ Database seeded with initial data');
  }

  private generateLicensePlate(): string {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    
    let plate = '';
    
    // Add 2-3 random letters
    for (let i = 0; i < 2 + Math.floor(Math.random() * 2); i++) {
      plate += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    
    // Add 3-4 random numbers
    for (let i = 0; i < 3 + Math.floor(Math.random() * 2); i++) {
      plate += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    
    return plate;
  }

  async startSimulation(): Promise<void> {
    if (this.isSimulationRunning) {
      return;
    }

    this.isSimulationRunning = true;
    console.log('🚌 Starting bus simulation...');

    // Update GPS and passenger data every 30 seconds
    this.simulationInterval = setInterval(async () => {
      await this.updateBusPositions();
      await this.updatePassengerCounts();
    }, 30000);

    // Initial update
    await this.updateBusPositions();
    await this.updatePassengerCounts();
  }

  async stopSimulation(): Promise<void> {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.isSimulationRunning = false;
      console.log('🛑 Bus simulation stopped');
    }
  }

  private async updateBusPositions(): Promise<void> {
    try {
      const activeBuses = await this.busRepository.find({
        where: { status: 'active' },
        relations: ['route'],
      });

      for (const bus of activeBuses) {
        // Get current position
        const currentPosition = await this.getCurrentBusPosition(bus.bus_id);
        
        // Calculate next position based on route and speed
        const nextPosition = this.calculateNextPosition(currentPosition, bus);
        
        // Save new GPS log
        const gpsLog = this.gpsLogRepository.create({
          bus_id: bus.bus_id,
          latitude: nextPosition.latitude,
          longitude: nextPosition.longitude,
          speed: nextPosition.speed,
          direction: nextPosition.direction,
          timestamp: new Date(),
        });

        await this.gpsLogRepository.save(gpsLog);
      }
    } catch (error) {
      console.error('Error updating bus positions:', error);
    }
  }

  private async updatePassengerCounts(): Promise<void> {
    try {
      const activeBuses = await this.busRepository.find({
        where: { status: 'active' },
      });

      for (const bus of activeBuses) {
        // Get current passenger count
        const currentCount = await this.getCurrentPassengerCount(bus.bus_id);
        
        // Simulate passenger changes
        const newCount = this.simulatePassengerChanges(currentCount, bus);
        
        // Save new passenger count
        const passengerCount = this.passengerCountRepository.create({
          bus_id: bus.bus_id,
          route_id: bus.route_id,
          occupancy: newCount,
          timestamp: new Date(),
        });

        await this.passengerCountRepository.save(passengerCount);
      }
    } catch (error) {
      console.error('Error updating passenger counts:', error);
    }
  }

  private async getCurrentBusPosition(busId: number): Promise<any> {
    const latestGps = await this.gpsLogRepository
      .createQueryBuilder('gps')
      .where('gps.bus_id = :busId', { busId })
      .orderBy('gps.timestamp', 'DESC')
      .limit(1)
      .getOne();

    if (latestGps) {
      return {
        latitude: latestGps.latitude,
        longitude: latestGps.longitude,
        speed: latestGps.speed,
        direction: latestGps.direction,
      };
    }

    // Default starting position if no GPS data exists (Ahmedabad coordinates)
    return {
      latitude: 23.0225 + (Math.random() - 0.5) * 0.1,
      longitude: 72.5714 + (Math.random() - 0.5) * 0.1,
      speed: 25 + Math.random() * 15,
      direction: Math.random() * 360,
    };
  }

  private async getCurrentPassengerCount(busId: number): Promise<number> {
    const latestCount = await this.passengerCountRepository
      .createQueryBuilder('pc')
      .where('pc.bus_id = :busId', { busId })
      .orderBy('pc.timestamp', 'DESC')
      .limit(1)
      .getOne();

    return latestCount ? latestCount.occupancy : Math.floor(Math.random() * 20);
  }

  private calculateNextPosition(currentPosition: any, bus: Bus): any {
    // Simulate bus movement along route
    const speedKmh = currentPosition.speed;
    const speedMs = speedKmh / 3.6; // Convert to m/s
    const timeInterval = 30; // 30 seconds
    const distanceMoved = speedMs * timeInterval;

    // Convert distance to lat/lng changes (rough approximation)
    const latChange = (distanceMoved / 111000) * Math.cos(currentPosition.direction * Math.PI / 180);
    const lngChange = (distanceMoved / 111000) * Math.sin(currentPosition.direction * Math.PI / 180);

    // Add some randomness to simulate real-world conditions
    const latVariation = (Math.random() - 0.5) * 0.0001;
    const lngVariation = (Math.random() - 0.5) * 0.0001;
    const speedVariation = (Math.random() - 0.5) * 10;
    const directionVariation = (Math.random() - 0.5) * 20;

    // Ensure proper numeric values and handle potential string concatenation
    const latValue = typeof currentPosition.latitude === 'string' ? parseFloat(currentPosition.latitude) : currentPosition.latitude;
    const lngValue = typeof currentPosition.longitude === 'string' ? parseFloat(currentPosition.longitude) : currentPosition.longitude;
    const speedValue = typeof currentPosition.speed === 'string' ? parseFloat(currentPosition.speed) : currentPosition.speed;
    const directionValue = typeof currentPosition.direction === 'string' ? parseFloat(currentPosition.direction) : currentPosition.direction;
    
    const newLatitude = parseFloat((latValue + latChange + latVariation).toFixed(8));
    const newLongitude = parseFloat((lngValue + lngChange + lngVariation).toFixed(8));
    const newSpeed = Math.max(0, parseFloat((speedValue + speedVariation).toFixed(2)));
    const newDirection = parseFloat(((directionValue + directionVariation) % 360).toFixed(2));

    return {
      latitude: newLatitude,
      longitude: newLongitude,
      speed: newSpeed,
      direction: newDirection,
    };
  }

  private simulatePassengerChanges(currentCount: number, bus: Bus): number {
    // Simulate realistic passenger changes
    const maxCapacity = bus.capacity;
    const changeProbability = 0.3; // 30% chance of change
    
    if (Math.random() < changeProbability) {
      const change = Math.floor(Math.random() * 6) - 3; // -3 to +3 passengers
      const newCount = currentCount + change;
      
      // Ensure count stays within reasonable bounds
      return Math.max(0, Math.min(maxCapacity, newCount));
    }
    
    return currentCount;
  }

  async getSimulationStatus(): Promise<any> {
    return {
      is_running: this.isSimulationRunning,
      update_interval_seconds: 30,
      last_update: new Date(),
    };
  }

  async resetSimulation(): Promise<void> {
    await this.stopSimulation();
    
    // Clear recent simulation data (optional)
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    
    await this.gpsLogRepository
      .createQueryBuilder()
      .delete()
      .where('timestamp >= :oneHourAgo', { oneHourAgo })
      .execute();
    
    await this.passengerCountRepository
      .createQueryBuilder()
      .delete()
      .where('timestamp >= :oneHourAgo', { oneHourAgo })
      .execute();
    
    // Restart simulation
    await this.startSimulation();
  }
}

