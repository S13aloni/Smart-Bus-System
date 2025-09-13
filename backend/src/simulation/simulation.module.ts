import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SimulationController } from './simulation.controller';
import { SimulationService } from './simulation.service';
import { GpsLog } from '../entities/gps-log.entity';
import { PassengerCount } from '../entities/passenger-count.entity';
import { Bus } from '../entities/bus.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GpsLog, PassengerCount, Bus])],
  controllers: [SimulationController],
  providers: [SimulationService],
  exports: [SimulationService],
})
export class SimulationModule {}

