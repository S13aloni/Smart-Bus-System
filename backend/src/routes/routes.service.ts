import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Route } from '../entities/route.entity';
import { TicketSale } from '../entities/ticket-sale.entity';

@Injectable()
export class RoutesService {
  constructor(
    @InjectRepository(Route)
    private routeRepository: Repository<Route>,
    @InjectRepository(TicketSale)
    private ticketSaleRepository: Repository<TicketSale>,
  ) {}

  async findAll(): Promise<Route[]> {
    return this.routeRepository.find();
  }

  async findOne(id: number): Promise<Route> {
    return this.routeRepository.findOne({
      where: { route_id: id },
    });
  }

  async getRouteDemand(routeId: number, days: number = 7): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const ticketSales = await this.ticketSaleRepository
      .createQueryBuilder('ts')
      .where('ts.route_id = :routeId', { routeId })
      .andWhere('ts.timestamp >= :startDate', { startDate })
      .orderBy('ts.timestamp', 'ASC')
      .getMany();

    // Group by hour for demand analysis
    const hourlyDemand = {};
    ticketSales.forEach(sale => {
      const hour = new Date(sale.timestamp).getHours();
      if (!hourlyDemand[hour]) {
        hourlyDemand[hour] = {
          hour,
          total_passengers: 0,
          total_tickets: 0,
          avg_passengers_per_ticket: 0,
        };
      }
      hourlyDemand[hour].total_passengers += sale.passenger_count;
      hourlyDemand[hour].total_tickets += 1;
    });

    // Calculate averages
    Object.values(hourlyDemand).forEach((demand: any) => {
      demand.avg_passengers_per_ticket = demand.total_passengers / demand.total_tickets;
    });

    return {
      route_id: routeId,
      period_days: days,
      hourly_demand: Object.values(hourlyDemand),
      total_passengers: ticketSales.reduce((sum, sale) => sum + sale.passenger_count, 0),
      total_tickets: ticketSales.length,
    };
  }

  async getRoutePerformance(routeId: number): Promise<any> {
    const route = await this.findOne(routeId);
    if (!route) {
      throw new Error('Route not found');
    }

    // Get recent ticket sales (last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const recentSales = await this.ticketSaleRepository
      .createQueryBuilder('ts')
      .where('ts.route_id = :routeId', { routeId })
      .andWhere('ts.timestamp >= :yesterday', { yesterday })
      .getMany();

    const totalRevenue = recentSales.reduce((sum, sale) => sum + (sale.price * sale.passenger_count), 0);
    const totalPassengers = recentSales.reduce((sum, sale) => sum + sale.passenger_count, 0);

    return {
      route_id: routeId,
      route: route,
      last_24h: {
        total_revenue: totalRevenue,
        total_passengers: totalPassengers,
        total_tickets: recentSales.length,
        avg_passengers_per_ticket: totalPassengers / (recentSales.length || 1),
      },
    };
  }
}

