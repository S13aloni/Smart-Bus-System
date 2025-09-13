import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { RoutesService } from './routes.service';

@ApiTags('routes')
@Controller('routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all routes' })
  @ApiResponse({ status: 200, description: 'List of all routes' })
  async findAll() {
    return this.routesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get route by ID' })
  @ApiParam({ name: 'id', description: 'Route ID' })
  @ApiResponse({ status: 200, description: 'Route details' })
  async findOne(@Param('id') id: string) {
    return this.routesService.findOne(+id);
  }

  @Get(':id/demand')
  @ApiOperation({ summary: 'Get route demand analysis' })
  @ApiParam({ name: 'id', description: 'Route ID' })
  @ApiQuery({ name: 'days', description: 'Number of days to analyze', required: false })
  @ApiResponse({ 
    status: 200, 
    description: 'Route demand analysis with hourly breakdown',
    schema: {
      type: 'object',
      properties: {
        route_id: { type: 'number' },
        period_days: { type: 'number' },
        hourly_demand: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              hour: { type: 'number' },
              total_passengers: { type: 'number' },
              total_tickets: { type: 'number' },
              avg_passengers_per_ticket: { type: 'number' }
            }
          }
        },
        total_passengers: { type: 'number' },
        total_tickets: { type: 'number' }
      }
    }
  })
  async getRouteDemand(
    @Param('id') id: string,
    @Query('days') days?: string,
  ) {
    return this.routesService.getRouteDemand(+id, days ? +days : 7);
  }

  @Get(':id/performance')
  @ApiOperation({ summary: 'Get route performance metrics' })
  @ApiParam({ name: 'id', description: 'Route ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Route performance data including revenue and passenger metrics',
    schema: {
      type: 'object',
      properties: {
        route_id: { type: 'number' },
        route: { type: 'object' },
        last_24h: {
          type: 'object',
          properties: {
            total_revenue: { type: 'number' },
            total_passengers: { type: 'number' },
            total_tickets: { type: 'number' },
            avg_passengers_per_ticket: { type: 'number' }
          }
        }
      }
    }
  })
  async getRoutePerformance(@Param('id') id: string) {
    return this.routesService.getRoutePerformance(+id);
  }
}

