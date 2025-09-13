import { Controller, Get, Post, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SimulationService } from './simulation.service';

@ApiTags('simulation')
@Controller('simulation')
export class SimulationController {
  constructor(private readonly simulationService: SimulationService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get simulation status' })
  @ApiResponse({ 
    status: 200, 
    description: 'Current simulation status and configuration',
    schema: {
      type: 'object',
      properties: {
        is_running: { type: 'boolean' },
        update_interval_seconds: { type: 'number' },
        last_update: { type: 'string' }
      }
    }
  })
  async getSimulationStatus() {
    return this.simulationService.getSimulationStatus();
  }

  @Post('start')
  @ApiOperation({ summary: 'Start bus simulation' })
  @ApiResponse({ status: 200, description: 'Simulation started successfully' })
  async startSimulation() {
    await this.simulationService.startSimulation();
    return { message: 'Simulation started successfully' };
  }

  @Post('stop')
  @ApiOperation({ summary: 'Stop bus simulation' })
  @ApiResponse({ status: 200, description: 'Simulation stopped successfully' })
  async stopSimulation() {
    await this.simulationService.stopSimulation();
    return { message: 'Simulation stopped successfully' };
  }

  @Delete('reset')
  @ApiOperation({ summary: 'Reset simulation data and restart' })
  @ApiResponse({ status: 200, description: 'Simulation reset and restarted successfully' })
  async resetSimulation() {
    await this.simulationService.resetSimulation();
    return { message: 'Simulation reset and restarted successfully' };
  }
}

