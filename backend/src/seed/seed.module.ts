import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { Route } from '../entities/route.entity';
import { Bus } from '../entities/bus.entity';
import { GpsLog } from '../entities/gps-log.entity';
import { PassengerCount } from '../entities/passenger-count.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Route, Bus, GpsLog, PassengerCount]),
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
