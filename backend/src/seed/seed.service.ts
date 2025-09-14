import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Route } from '../entities/route.entity';
import { Bus } from '../entities/bus.entity';
import { GpsLog } from '../entities/gps-log.entity';
import { PassengerCount } from '../entities/passenger-count.entity';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(Route)
    private routeRepository: Repository<Route>,
    @InjectRepository(Bus)
    private busRepository: Repository<Bus>,
    @InjectRepository(GpsLog)
    private gpsLogRepository: Repository<GpsLog>,
    @InjectRepository(PassengerCount)
    private passengerCountRepository: Repository<PassengerCount>,
  ) {}

  async seedDatabase(): Promise<void> {
    console.log('🌱 Starting database seeding...');

    // Check if data already exists
    const existingRoutes = await this.routeRepository.count();
    if (existingRoutes > 0) {
      console.log('📊 Database already has data, skipping seed...');
      return;
    }

    // Seed Routes
    await this.seedRoutes();
    
    // Seed Buses
    await this.seedBuses();

    console.log('✅ Database seeding completed!');
  }

  private async seedRoutes(): Promise<void> {
    console.log('🛣️  Seeding routes...');

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

    console.log(`✅ Created ${routes.length} routes`);
  }

  private async seedBuses(): Promise<void> {
    console.log('🚌 Seeding buses...');

    // Get all routes
    const routes = await this.routeRepository.find();
    if (routes.length === 0) {
      throw new Error('No routes found. Please seed routes first.');
    }

    const buses = [];
    let busId = 1;

    // Create 2 buses for each route
    for (const route of routes) {
      for (let i = 0; i < 2; i++) {
        buses.push({
          route_id: route.route_id,
          capacity: 50 + Math.floor(Math.random() * 20), // 50-70 capacity
          status: 'active',
          license_plate: this.generateLicensePlate(),
        });
        busId++;
      }
    }

    // Add some additional buses for popular routes (first 2 routes)
    for (let i = 0; i < 3; i++) {
      buses.push({
        route_id: routes[0].route_id, // Downtown-Airport route
        capacity: 50 + Math.floor(Math.random() * 20),
        status: 'active',
        license_plate: this.generateLicensePlate(),
      });
    }

    for (let i = 0; i < 2; i++) {
      buses.push({
        route_id: routes[1].route_id, // Airport-Downtown route
        capacity: 50 + Math.floor(Math.random() * 20),
        status: 'active',
        license_plate: this.generateLicensePlate(),
      });
    }

    // Add some buses with different statuses
    buses.push({
      route_id: routes[0].route_id,
      capacity: 60,
      status: 'maintenance',
      license_plate: this.generateLicensePlate(),
    });

    buses.push({
      route_id: routes[2].route_id,
      capacity: 55,
      status: 'breakdown',
      license_plate: this.generateLicensePlate(),
    });

    for (const busData of buses) {
      const bus = this.busRepository.create(busData);
      await this.busRepository.save(bus);
    }

    console.log(`✅ Created ${buses.length} buses`);
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

  async clearDatabase(): Promise<void> {
    console.log('🗑️  Clearing database...');
    
    // Clear all related data in correct order using query builder
    await this.gpsLogRepository.createQueryBuilder().delete().execute();
    await this.passengerCountRepository.createQueryBuilder().delete().execute();
    await this.busRepository.createQueryBuilder().delete().execute();
    await this.routeRepository.createQueryBuilder().delete().execute();
    
    console.log('✅ Database completely cleared');
  }
}
