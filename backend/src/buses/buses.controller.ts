import { Controller, Get, Param, Query, Put, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { BusesService } from './buses.service';

@ApiTags('buses')
@Controller('buses')
export class BusesController {
  constructor(private readonly busesService: BusesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all buses' })
  @ApiResponse({ status: 200, description: 'List of all buses' })
  async findAll() {
    return this.busesService.findAll();
  }

  @Get('live')
  @ApiOperation({ summary: 'Get live bus tracking data' })
  @ApiResponse({ 
    status: 200, 
    description: 'Real-time bus positions and occupancy data',
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
          status: { type: 'string' },
          current_position: {
            type: 'object',
            properties: {
              latitude: { type: 'number' },
              longitude: { type: 'number' },
              speed: { type: 'number' },
              direction: { type: 'number' },
              timestamp: { type: 'string' }
            }
          },
          occupancy: { type: 'number' },
          occupancy_percentage: { type: 'number' }
        }
      }
    }
  })
  async getLiveBusData() {
    return this.busesService.getLiveBusData();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get bus by ID' })
  @ApiParam({ name: 'id', description: 'Bus ID' })
  @ApiResponse({ status: 200, description: 'Bus details' })
  async findOne(@Param('id') id: string) {
    return this.busesService.findOne(+id);
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get bus GPS history' })
  @ApiParam({ name: 'id', description: 'Bus ID' })
  @ApiQuery({ name: 'hours', description: 'Number of hours to look back', required: false })
  @ApiResponse({ status: 200, description: 'Bus GPS tracking history' })
  async getBusHistory(
    @Param('id') id: string,
    @Query('hours') hours?: string,
  ) {
    return this.busesService.getBusHistory(+id, hours ? +hours : 24);
  }

  @Get(':id/occupancy')
  @ApiOperation({ summary: 'Get bus occupancy history' })
  @ApiParam({ name: 'id', description: 'Bus ID' })
  @ApiQuery({ name: 'hours', description: 'Number of hours to look back', required: false })
  @ApiResponse({ status: 200, description: 'Bus occupancy history' })
  async getBusOccupancyHistory(
    @Param('id') id: string,
    @Query('hours') hours?: string,
  ) {
    return this.busesService.getBusOccupancyHistory(+id, hours ? +hours : 24);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update bus status' })
  @ApiParam({ name: 'id', description: 'Bus ID' })
  @ApiResponse({ status: 200, description: 'Bus status updated' })
  async updateBusStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.busesService.updateBusStatus(+id, status);
  }
}

