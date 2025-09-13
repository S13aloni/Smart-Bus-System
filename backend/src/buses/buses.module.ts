import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusesController } from './buses.controller';
import { BusesService } from './buses.service';
import { Bus } from '../entities/bus.entity';
import { GpsLog } from '../entities/gps-log.entity';
import { PassengerCount } from '../entities/passenger-count.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bus, GpsLog, PassengerCount])],
  controllers: [BusesController],
  providers: [BusesService],
  exports: [BusesService],
})
export class BusesModule {}

