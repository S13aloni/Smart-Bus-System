import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GpsLog } from '../entities/gps-log.entity';
import { PassengerCount } from '../entities/passenger-count.entity';
import { Bus } from '../entities/bus.entity';

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
  ) {}

  async onModuleInit() {
    // Start simulation automatically when module initializes
    await this.startSimulation();
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

    // Default starting position if no GPS data exists
    return {
      latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
      longitude: -74.0060 + (Math.random() - 0.5) * 0.1,
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

    return {
      latitude: currentPosition.latitude + latChange + latVariation,
      longitude: currentPosition.longitude + lngChange + lngVariation,
      speed: Math.max(0, currentPosition.speed + speedVariation),
      direction: (currentPosition.direction + directionVariation) % 360,
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

