import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { PassengersService } from './passengers.service';

@ApiTags('passengers')
@Controller('passengers')
export class PassengersController {
  constructor(private readonly passengersService: PassengersService) {}

  @Get('counts')
  @ApiOperation({ summary: 'Get passenger count data' })
  @ApiQuery({ name: 'route_id', description: 'Route ID (optional)', required: false })
  @ApiQuery({ name: 'hours', description: 'Number of hours to look back', required: false })
  @ApiResponse({ 
    status: 200, 
    description: 'Passenger count data with bus and route information',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          count_id: { type: 'number' },
          bus_id: { type: 'number' },
          route_id: { type: 'number' },
          occupancy: { type: 'number' },
          timestamp: { type: 'string' },
          bus: { type: 'object' },
          route: { type: 'object' }
        }
      }
    }
  })
  async getPassengerCounts(
    @Query('route_id') routeId?: string,
    @Query('hours') hours?: string,
  ) {
    return this.passengersService.getPassengerCounts(
      routeId ? +routeId : undefined,
      hours ? +hours : 24,
    );
  }

  @Get('occupancy-stats')
  @ApiOperation({ summary: 'Get occupancy statistics' })
  @ApiQuery({ name: 'route_id', description: 'Route ID (optional)', required: false })
  @ApiQuery({ name: 'days', description: 'Number of days to analyze', required: false })
  @ApiResponse({ 
    status: 200, 
    description: 'Detailed occupancy statistics with percentiles and trends',
    schema: {
      type: 'object',
      properties: {
        period_days: { type: 'number' },
        route_stats: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              route_id: { type: 'number' },
              route: { type: 'object' },
              total_readings: { type: 'number' },
              total_occupancy: { type: 'number' },
              max_occupancy: { type: 'number' },
              min_occupancy: { type: 'number' },
              avg_occupancy: { type: 'number' },
              capacity: { type: 'number' },
              avg_occupancy_percentage: { type: 'number' },
              median_occupancy_percentage: { type: 'number' },
              p90_occupancy_percentage: { type: 'number' }
            }
          }
        },
        summary: {
          type: 'object',
          properties: {
            total_routes: { type: 'number' },
            total_readings: { type: 'number' },
            overall_avg_occupancy: { type: 'number' }
          }
        }
      }
    }
  })
  async getOccupancyStats(
    @Query('route_id') routeId?: string,
    @Query('days') days?: string,
  ) {
    return this.passengersService.getOccupancyStats(
      routeId ? +routeId : undefined,
      days ? +days : 7,
    );
  }

  @Get('current')
  @ApiOperation({ summary: 'Get current occupancy for all active buses' })
  @ApiResponse({ 
    status: 200, 
    description: 'Current occupancy data for all active buses',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          bus_id: { type: 'number' },
          license_plate: { type: 'string' },
          route_id: { type: 'number' },
          route: { type: 'object' },
          capacity: { type: 'number' },
          current_occupancy: { type: 'number' },
          occupancy_percentage: { type: 'number' },
          last_updated: { type: 'string' }
        }
      }
    }
  })
  async getCurrentOccupancy() {
    return this.passengersService.getCurrentOccupancy();
  }

  @Get('peak-hours')
  @ApiOperation({ summary: 'Get peak hours analysis' })
  @ApiQuery({ name: 'route_id', description: 'Route ID (optional)', required: false })
  @ApiQuery({ name: 'days', description: 'Number of days to analyze', required: false })
  @ApiResponse({ 
    status: 200, 
    description: 'Peak hours analysis with hourly occupancy data',
    schema: {
      type: 'object',
      properties: {
        route_id: { type: 'number' },
        period_days: { type: 'number' },
        peak_hours: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              hour: { type: 'number' },
              total_occupancy: { type: 'number' },
              count: { type: 'number' },
              avg_occupancy: { type: 'number' }
            }
          }
        },
        hourly_data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              hour: { type: 'number' },
              total_occupancy: { type: 'number' },
              count: { type: 'number' },
              avg_occupancy: { type: 'number' }
            }
          }
        }
      }
    }
  })
  async getPeakHours(
    @Query('route_id') routeId?: string,
    @Query('days') days?: string,
  ) {
    return this.passengersService.getPeakHours(
      routeId ? +routeId : undefined,
      days ? +days : 7,
    );
  }
}

