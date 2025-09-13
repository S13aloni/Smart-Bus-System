import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SchedulesService } from './schedules.service';

@ApiTags('schedules')
@Controller('schedule')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Get('optimized')
  @ApiOperation({ summary: 'Get all optimized schedules' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of optimized schedules with bus and route information',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          schedule_id: { type: 'number' },
          bus_id: { type: 'number' },
          route_id: { type: 'number' },
          start_time: { type: 'string' },
          end_time: { type: 'string' },
          adjustment_reason: { type: 'string' },
          created_at: { type: 'string' },
          bus: { type: 'object' },
          route: { type: 'object' }
        }
      }
    }
  })
  async getOptimizedSchedules() {
    return this.schedulesService.getOptimizedSchedules();
  }

  @Get('optimized/route/:routeId')
  @ApiOperation({ summary: 'Get optimized schedules for a specific route' })
  @ApiParam({ name: 'routeId', description: 'Route ID' })
  @ApiResponse({ status: 200, description: 'Optimized schedules for the specified route' })
  async getOptimizedScheduleByRoute(@Param('routeId') routeId: string) {
    return this.schedulesService.getOptimizedScheduleByRoute(+routeId);
  }

  @Get('comparison')
  @ApiOperation({ summary: 'Get current vs optimized schedule comparison' })
  @ApiResponse({ 
    status: 200, 
    description: 'Comparison between current and optimized schedules with performance metrics',
    schema: {
      type: 'object',
      properties: {
        current_schedules: { type: 'array' },
        optimized_schedules: { type: 'array' },
        comparison_metrics: {
          type: 'object',
          properties: {
            total_buses: {
              type: 'object',
              properties: {
                current: { type: 'number' },
                optimized: { type: 'number' },
                change: { type: 'number' }
              }
            },
            average_headway_minutes: {
              type: 'object',
              properties: {
                current: { type: 'number' },
                optimized: { type: 'number' },
                improvement: { type: 'number' }
              }
            },
            efficiency_score: {
              type: 'object',
              properties: {
                current: { type: 'number' },
                optimized: { type: 'number' }
              }
            }
          }
        }
      }
    }
  })
  async getScheduleComparison() {
    return this.schedulesService.getScheduleComparison();
  }
}

