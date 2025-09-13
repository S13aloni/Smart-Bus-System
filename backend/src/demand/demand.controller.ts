import { Controller, Get, Post, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { DemandService } from './demand.service';

@ApiTags('demand')
@Controller('demand')
export class DemandController {
  constructor(private readonly demandService: DemandService) {}

  @Post('predict')
  @ApiOperation({ summary: 'Trigger demand prediction using ML service' })
  @ApiResponse({ 
    status: 200, 
    description: 'Demand prediction results from ML service',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        predictions: { type: 'object' },
        timestamp: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 503, description: 'ML service unavailable' })
  async triggerDemandPrediction() {
    return this.demandService.triggerDemandPrediction();
  }

  @Get('forecast')
  @ApiOperation({ summary: 'Get demand forecast for routes' })
  @ApiQuery({ name: 'route_id', description: 'Route ID (optional)', required: false })
  @ApiResponse({ 
    status: 200, 
    description: 'Demand forecast with hourly predictions',
    schema: {
      type: 'object',
      properties: {
        route_id: { type: 'number' },
        forecast: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              hour: { type: 'number' },
              day_of_week: { type: 'number' },
              predicted_passengers: { type: 'number' },
              confidence: { type: 'number' }
            }
          }
        },
        generated_at: { type: 'string' },
        method: { type: 'string' }
      }
    }
  })
  async getDemandForecast(@Query('route_id') routeId?: string) {
    return this.demandService.getDemandForecast(routeId ? +routeId : undefined);
  }

  @Get('trends')
  @ApiOperation({ summary: 'Get demand trends analysis' })
  @ApiQuery({ name: 'route_id', description: 'Route ID (optional)', required: false })
  @ApiQuery({ name: 'days', description: 'Number of days to analyze', required: false })
  @ApiResponse({ 
    status: 200, 
    description: 'Demand trends with daily and hourly breakdown',
    schema: {
      type: 'object',
      properties: {
        route_id: { type: 'number' },
        period_days: { type: 'number' },
        daily_trends: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              date: { type: 'string' },
              hourly_data: { type: 'object' },
              total_passengers: { type: 'number' }
            }
          }
        },
        summary: {
          type: 'object',
          properties: {
            total_passengers: { type: 'number' },
            total_tickets: { type: 'number' },
            avg_passengers_per_ticket: { type: 'number' }
          }
        }
      }
    }
  })
  async getDemandTrends(
    @Query('route_id') routeId?: string,
    @Query('days') days?: string,
  ) {
    return this.demandService.getDemandTrends(
      routeId ? +routeId : undefined,
      days ? +days : 7,
    );
  }
}

