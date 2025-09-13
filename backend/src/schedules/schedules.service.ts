import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OptimizedSchedule } from '../entities/optimized-schedule.entity';
import { Bus } from '../entities/bus.entity';
import { Route } from '../entities/route.entity';

@Injectable()
export class SchedulesService {
  constructor(
    @InjectRepository(OptimizedSchedule)
    private scheduleRepository: Repository<OptimizedSchedule>,
    @InjectRepository(Bus)
    private busRepository: Repository<Bus>,
    @InjectRepository(Route)
    private routeRepository: Repository<Route>,
  ) {}

  async getOptimizedSchedules(): Promise<OptimizedSchedule[]> {
    return this.scheduleRepository.find({
      relations: ['bus', 'route'],
      order: { created_at: 'DESC' },
    });
  }

  async getOptimizedScheduleByRoute(routeId: number): Promise<OptimizedSchedule[]> {
    return this.scheduleRepository.find({
      where: { route_id: routeId },
      relations: ['bus', 'route'],
      order: { start_time: 'ASC' },
    });
  }

  async getScheduleComparison(): Promise<any> {
    // Get current schedules (simulated) vs optimized schedules
    const optimizedSchedules = await this.getOptimizedSchedules();
    
    // Simulate current schedules for comparison
    const currentSchedules = await this.generateCurrentSchedules();

    return {
      current_schedules: currentSchedules,
      optimized_schedules: optimizedSchedules,
      comparison_metrics: this.calculateComparisonMetrics(currentSchedules, optimizedSchedules),
    };
  }

  private async generateCurrentSchedules(): Promise<any[]> {
    // This would typically come from a current_schedules table
    // For demo purposes, we'll generate some sample current schedules
    const buses = await this.busRepository.find({ relations: ['route'] });
    
    return buses.map(bus => ({
      bus_id: bus.bus_id,
      route_id: bus.route_id,
      route: bus.route,
      start_time: this.generateRandomTime(),
      end_time: this.generateRandomTime(),
      status: 'current',
      adjustment_reason: 'Original schedule',
    }));
  }

  private generateRandomTime(): string {
    const hour = Math.floor(Math.random() * 12) + 6; // 6 AM to 6 PM
    const minute = Math.floor(Math.random() * 60);
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
  }

  private calculateComparisonMetrics(current: any[], optimized: any[]): any {
    // Calculate various metrics for comparison
    const currentTotalBuses = current.length;
    const optimizedTotalBuses = optimized.length;
    
    // Calculate average headway (time between buses)
    const currentHeadways = this.calculateHeadways(current);
    const optimizedHeadways = this.calculateHeadways(optimized);
    
    return {
      total_buses: {
        current: currentTotalBuses,
        optimized: optimizedTotalBuses,
        change: optimizedTotalBuses - currentTotalBuses,
      },
      average_headway_minutes: {
        current: currentHeadways.average,
        optimized: optimizedHeadways.average,
        improvement: currentHeadways.average - optimizedHeadways.average,
      },
      efficiency_score: {
        current: this.calculateEfficiencyScore(current),
        optimized: this.calculateEfficiencyScore(optimized),
      },
    };
  }

  private calculateHeadways(schedules: any[]): { average: number, min: number, max: number } {
    if (schedules.length < 2) return { average: 0, min: 0, max: 0 };
    
    const headways = [];
    for (let i = 1; i < schedules.length; i++) {
      const prevTime = this.timeToMinutes(schedules[i-1].start_time);
      const currTime = this.timeToMinutes(schedules[i].start_time);
      headways.push(currTime - prevTime);
    }
    
    return {
      average: headways.reduce((a, b) => a + b, 0) / headways.length,
      min: Math.min(...headways),
      max: Math.max(...headways),
    };
  }

  private timeToMinutes(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private calculateEfficiencyScore(schedules: any[]): number {
    // Simple efficiency score based on schedule distribution
    // Higher score = better distribution
    const headways = this.calculateHeadways(schedules);
    const variance = this.calculateVariance(schedules);
    return Math.max(0, 100 - variance - Math.abs(headways.average - 15)); // Target 15-min headway
  }

  private calculateVariance(schedules: any[]): number {
    if (schedules.length < 2) return 0;
    
    const headways = [];
    for (let i = 1; i < schedules.length; i++) {
      const prevTime = this.timeToMinutes(schedules[i-1].start_time);
      const currTime = this.timeToMinutes(schedules[i].start_time);
      headways.push(currTime - prevTime);
    }
    
    const mean = headways.reduce((a, b) => a + b, 0) / headways.length;
    const variance = headways.reduce((sum, headway) => sum + Math.pow(headway - mean, 2), 0) / headways.length;
    return Math.sqrt(variance);
  }
}

