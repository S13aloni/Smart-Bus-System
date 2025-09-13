import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TicketSale } from '../entities/ticket-sale.entity';
import { PassengerCount } from '../entities/passenger-count.entity';
import { Route } from '../entities/route.entity';
import axios from 'axios';

@Injectable()
export class DemandService {
  private readonly mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8001';

  constructor(
    @InjectRepository(TicketSale)
    private ticketSaleRepository: Repository<TicketSale>,
    @InjectRepository(PassengerCount)
    private passengerCountRepository: Repository<PassengerCount>,
    @InjectRepository(Route)
    private routeRepository: Repository<Route>,
  ) {}

  async triggerDemandPrediction(): Promise<any> {
    try {
      // Get historical data for ML service
      const historicalData = await this.getHistoricalData();
      
      // Call ML service for prediction
      const response = await axios.post(`${this.mlServiceUrl}/predict`, {
        data: historicalData,
        prediction_hours: 24, // Predict next 24 hours
      });

      return {
        success: true,
        predictions: response.data,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('Error calling ML service:', error.message);
      throw new HttpException(
        'Failed to get demand prediction from ML service',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async getDemandForecast(routeId?: number): Promise<any> {
    try {
      const response = await axios.get(`${this.mlServiceUrl}/predict`, {
        params: { route_id: routeId },
      });

      return response.data;
    } catch (error) {
      console.error('Error getting demand forecast:', error.message);
      // Fallback to local calculation if ML service is unavailable
      return this.getLocalDemandForecast(routeId);
    }
  }

  private async getHistoricalData(): Promise<any> {
    // Get last 30 days of data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const ticketSales = await this.ticketSaleRepository
      .createQueryBuilder('ts')
      .leftJoinAndSelect('ts.route', 'route')
      .where('ts.timestamp >= :startDate', { startDate: thirtyDaysAgo })
      .orderBy('ts.timestamp', 'ASC')
      .getMany();

    const passengerCounts = await this.passengerCountRepository
      .createQueryBuilder('pc')
      .leftJoinAndSelect('pc.route', 'route')
      .where('pc.timestamp >= :startDate', { startDate: thirtyDaysAgo })
      .orderBy('pc.timestamp', 'ASC')
      .getMany();

    return {
      ticket_sales: ticketSales.map(sale => ({
        route_id: sale.route_id,
        passenger_count: sale.passenger_count,
        timestamp: sale.timestamp,
        price: sale.price,
      })),
      passenger_counts: passengerCounts.map(count => ({
        route_id: count.route_id,
        occupancy: count.occupancy,
        timestamp: count.timestamp,
      })),
      routes: await this.routeRepository.find(),
    };
  }

  private async getLocalDemandForecast(routeId?: number): Promise<any> {
    // Simple local demand forecasting based on historical averages
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    let query = this.ticketSaleRepository
      .createQueryBuilder('ts')
      .where('ts.timestamp >= :startDate', { startDate: sevenDaysAgo });

    if (routeId) {
      query = query.andWhere('ts.route_id = :routeId', { routeId });
    }

    const recentSales = await query.getMany();

    // Group by hour and day of week
    const hourlyDemand = {};
    recentSales.forEach(sale => {
      const date = new Date(sale.timestamp);
      const hour = date.getHours();
      const dayOfWeek = date.getDay();
      const key = `${dayOfWeek}-${hour}`;

      if (!hourlyDemand[key]) {
        hourlyDemand[key] = {
          day_of_week: dayOfWeek,
          hour: hour,
          total_passengers: 0,
          count: 0,
        };
      }

      hourlyDemand[key].total_passengers += sale.passenger_count;
      hourlyDemand[key].count += 1;
    });

    // Calculate averages
    Object.values(hourlyDemand).forEach((demand: any) => {
      demand.avg_passengers = demand.total_passengers / demand.count;
    });

    // Generate forecast for next 24 hours
    const forecast = [];
    const now = new Date();
    const currentDay = now.getDay();
    const currentHour = now.getHours();

    for (let i = 0; i < 24; i++) {
      const forecastHour = (currentHour + i) % 24;
      const forecastDay = (currentDay + Math.floor((currentHour + i) / 24)) % 7;
      const key = `${forecastDay}-${forecastHour}`;
      
      const historicalDemand = hourlyDemand[key];
      const avgPassengers = historicalDemand ? historicalDemand.avg_passengers : 0;

      forecast.push({
        hour: forecastHour,
        day_of_week: forecastDay,
        predicted_passengers: Math.round(avgPassengers * (1 + Math.random() * 0.2 - 0.1)), // Add some variance
        confidence: historicalDemand ? 0.8 : 0.3,
      });
    }

    return {
      route_id: routeId,
      forecast: forecast,
      generated_at: new Date(),
      method: 'local_average',
    };
  }

  async getDemandTrends(routeId?: number, days: number = 7): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let query = this.ticketSaleRepository
      .createQueryBuilder('ts')
      .leftJoinAndSelect('ts.route', 'route')
      .where('ts.timestamp >= :startDate', { startDate });

    if (routeId) {
      query = query.andWhere('ts.route_id = :routeId', { routeId });
    }

    const sales = await query
      .orderBy('ts.timestamp', 'ASC')
      .getMany();

    // Group by date and hour
    const dailyTrends = {};
    sales.forEach(sale => {
      const date = new Date(sale.timestamp);
      const dateKey = date.toISOString().split('T')[0];
      const hour = date.getHours();

      if (!dailyTrends[dateKey]) {
        dailyTrends[dateKey] = {
          date: dateKey,
          hourly_data: {},
          total_passengers: 0,
        };
      }

      if (!dailyTrends[dateKey].hourly_data[hour]) {
        dailyTrends[dateKey].hourly_data[hour] = 0;
      }

      dailyTrends[dateKey].hourly_data[hour] += sale.passenger_count;
      dailyTrends[dateKey].total_passengers += sale.passenger_count;
    });

    return {
      route_id: routeId,
      period_days: days,
      daily_trends: Object.values(dailyTrends),
      summary: {
        total_passengers: sales.reduce((sum, sale) => sum + sale.passenger_count, 0),
        total_tickets: sales.length,
        avg_passengers_per_ticket: sales.length > 0 
          ? sales.reduce((sum, sale) => sum + sale.passenger_count, 0) / sales.length 
          : 0,
      },
    };
  }
}

