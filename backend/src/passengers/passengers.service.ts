import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PassengerCount } from '../entities/passenger-count.entity';
import { Bus } from '../entities/bus.entity';
import { Route } from '../entities/route.entity';

@Injectable()
export class PassengersService {
  constructor(
    @InjectRepository(PassengerCount)
    private passengerCountRepository: Repository<PassengerCount>,
    @InjectRepository(Bus)
    private busRepository: Repository<Bus>,
    @InjectRepository(Route)
    private routeRepository: Repository<Route>,
  ) {}

  async getPassengerCounts(routeId?: number, hours: number = 24): Promise<PassengerCount[]> {
    const startTime = new Date();
    startTime.setHours(startTime.getHours() - hours);

    let query = this.passengerCountRepository
      .createQueryBuilder('pc')
      .leftJoinAndSelect('pc.bus', 'bus')
      .leftJoinAndSelect('pc.route', 'route')
      .where('pc.timestamp >= :startTime', { startTime });

    if (routeId) {
      query = query.andWhere('pc.route_id = :routeId', { routeId });
    }

    return query
      .orderBy('pc.timestamp', 'DESC')
      .getMany();
  }

  async getOccupancyStats(routeId?: number, days: number = 7): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let query = this.passengerCountRepository
      .createQueryBuilder('pc')
      .leftJoinAndSelect('pc.bus', 'bus')
      .leftJoinAndSelect('pc.route', 'route')
      .where('pc.timestamp >= :startDate', { startDate });

    if (routeId) {
      query = query.andWhere('pc.route_id = :routeId', { routeId });
    }

    const counts = await query.getMany();

    // Calculate occupancy statistics
    const occupancyStats = {};
    counts.forEach(count => {
      const routeId = count.route_id;
      if (!occupancyStats[routeId]) {
        occupancyStats[routeId] = {
          route_id: routeId,
          route: count.route,
          total_readings: 0,
          total_occupancy: 0,
          max_occupancy: 0,
          min_occupancy: Infinity,
          avg_occupancy: 0,
          capacity: count.bus.capacity,
          occupancy_percentages: [],
        };
      }

      const stats = occupancyStats[routeId];
      stats.total_readings += 1;
      stats.total_occupancy += count.occupancy;
      stats.max_occupancy = Math.max(stats.max_occupancy, count.occupancy);
      stats.min_occupancy = Math.min(stats.min_occupancy, count.occupancy);
      stats.occupancy_percentages.push((count.occupancy / count.bus.capacity) * 100);
    });

    // Calculate averages and percentiles
    Object.values(occupancyStats).forEach((stats: any) => {
      stats.avg_occupancy = stats.total_occupancy / stats.total_readings;
      stats.avg_occupancy_percentage = stats.occupancy_percentages.reduce((a, b) => a + b, 0) / stats.occupancy_percentages.length;
      
      // Calculate percentiles
      stats.occupancy_percentages.sort((a, b) => a - b);
      const p50Index = Math.floor(stats.occupancy_percentages.length * 0.5);
      const p90Index = Math.floor(stats.occupancy_percentages.length * 0.9);
      
      stats.median_occupancy_percentage = stats.occupancy_percentages[p50Index] || 0;
      stats.p90_occupancy_percentage = stats.occupancy_percentages[p90Index] || 0;
    });

    return {
      period_days: days,
      route_stats: Object.values(occupancyStats),
      summary: {
        total_routes: Object.keys(occupancyStats).length,
        total_readings: counts.length,
        overall_avg_occupancy: counts.reduce((sum, count) => sum + count.occupancy, 0) / counts.length,
      },
    };
  }

  async getCurrentOccupancy(): Promise<any[]> {
    // Get latest occupancy for each active bus
    const buses = await this.busRepository
      .createQueryBuilder('bus')
      .leftJoinAndSelect('bus.route', 'route')
      .where('bus.status = :status', { status: 'active' })
      .getMany();

    const currentOccupancy = [];

    for (const bus of buses) {
      const latestCount = await this.passengerCountRepository
        .createQueryBuilder('pc')
        .where('pc.bus_id = :busId', { busId: bus.bus_id })
        .orderBy('pc.timestamp', 'DESC')
        .limit(1)
        .getOne();

      if (latestCount) {
        currentOccupancy.push({
          bus_id: bus.bus_id,
          license_plate: bus.license_plate,
          route_id: bus.route_id,
          route: bus.route,
          capacity: bus.capacity,
          current_occupancy: latestCount.occupancy,
          occupancy_percentage: Math.round((latestCount.occupancy / bus.capacity) * 100),
          last_updated: latestCount.timestamp,
        });
      }
    }

    return currentOccupancy;
  }

  async getPeakHours(routeId?: number, days: number = 7): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let query = this.passengerCountRepository
      .createQueryBuilder('pc')
      .leftJoinAndSelect('pc.route', 'route')
      .where('pc.timestamp >= :startDate', { startDate });

    if (routeId) {
      query = query.andWhere('pc.route_id = :routeId', { routeId });
    }

    const counts = await query.getMany();

    // Group by hour
    const hourlyData = {};
    counts.forEach(count => {
      const hour = new Date(count.timestamp).getHours();
      if (!hourlyData[hour]) {
        hourlyData[hour] = {
          hour: hour,
          total_occupancy: 0,
          count: 0,
          avg_occupancy: 0,
        };
      }
      hourlyData[hour].total_occupancy += count.occupancy;
      hourlyData[hour].count += 1;
    });

    // Calculate averages
    Object.values(hourlyData).forEach((data: any) => {
      data.avg_occupancy = data.total_occupancy / data.count;
    });

    // Sort by average occupancy to find peak hours
    const sortedHours = Object.values(hourlyData)
      .sort((a: any, b: any) => b.avg_occupancy - a.avg_occupancy);

    return {
      route_id: routeId,
      period_days: days,
      peak_hours: sortedHours.slice(0, 5), // Top 5 peak hours
      hourly_data: Object.values(hourlyData).sort((a: any, b: any) => a.hour - b.hour),
    };
  }
}

