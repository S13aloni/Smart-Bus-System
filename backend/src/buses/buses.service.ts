import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bus } from '../entities/bus.entity';
import { GpsLog } from '../entities/gps-log.entity';
import { PassengerCount } from '../entities/passenger-count.entity';

@Injectable()
export class BusesService {
  constructor(
    @InjectRepository(Bus)
    private busRepository: Repository<Bus>,
    @InjectRepository(GpsLog)
    private gpsLogRepository: Repository<GpsLog>,
    @InjectRepository(PassengerCount)
    private passengerCountRepository: Repository<PassengerCount>,
  ) {}

  async findAll(): Promise<Bus[]> {
    return this.busRepository.find({
      relations: ['route'],
    });
  }

  async findOne(id: number): Promise<Bus> {
    return this.busRepository.findOne({
      where: { bus_id: id },
      relations: ['route'],
    });
  }

  async getLiveBusData(): Promise<any[]> {
    // Get the latest GPS position for each active bus
    const buses = await this.busRepository
      .createQueryBuilder('bus')
      .leftJoinAndSelect('bus.route', 'route')
      .where('bus.status = :status', { status: 'active' })
      .getMany();

    const liveData = [];

    for (const bus of buses) {
      // Get latest GPS log
      const latestGps = await this.gpsLogRepository
        .createQueryBuilder('gps')
        .where('gps.bus_id = :busId', { busId: bus.bus_id })
        .orderBy('gps.timestamp', 'DESC')
        .limit(1)
        .getOne();

      // Get latest passenger count
      const latestPassengerCount = await this.passengerCountRepository
        .createQueryBuilder('pc')
        .where('pc.bus_id = :busId', { busId: bus.bus_id })
        .orderBy('pc.timestamp', 'DESC')
        .limit(1)
        .getOne();

      if (latestGps) {
        liveData.push({
          bus_id: bus.bus_id,
          license_plate: bus.license_plate,
          route_id: bus.route_id,
          route: bus.route,
          capacity: bus.capacity,
          status: bus.status,
          current_position: {
            latitude: latestGps.latitude,
            longitude: latestGps.longitude,
            speed: latestGps.speed,
            direction: latestGps.direction,
            timestamp: latestGps.timestamp,
          },
          occupancy: latestPassengerCount?.occupancy || 0,
          occupancy_percentage: latestPassengerCount 
            ? Math.round((latestPassengerCount.occupancy / bus.capacity) * 100)
            : 0,
        });
      }
    }

    return liveData;
  }

  async getBusHistory(busId: number, hours: number = 24): Promise<GpsLog[]> {
    const startTime = new Date();
    startTime.setHours(startTime.getHours() - hours);

    return this.gpsLogRepository
      .createQueryBuilder('gps')
      .where('gps.bus_id = :busId', { busId })
      .andWhere('gps.timestamp >= :startTime', { startTime })
      .orderBy('gps.timestamp', 'DESC')
      .getMany();
  }

  async getBusOccupancyHistory(busId: number, hours: number = 24): Promise<PassengerCount[]> {
    const startTime = new Date();
    startTime.setHours(startTime.getHours() - hours);

    return this.passengerCountRepository
      .createQueryBuilder('pc')
      .where('pc.bus_id = :busId', { busId })
      .andWhere('pc.timestamp >= :startTime', { startTime })
      .orderBy('pc.timestamp', 'DESC')
      .getMany();
  }

  async updateBusStatus(busId: number, status: string): Promise<Bus> {
    await this.busRepository.update(busId, { status });
    return this.findOne(busId);
  }
}

