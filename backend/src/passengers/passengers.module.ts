import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassengersController } from './passengers.controller';
import { PassengersService } from './passengers.service';
import { PassengerCount } from '../entities/passenger-count.entity';
import { Bus } from '../entities/bus.entity';
import { Route } from '../entities/route.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PassengerCount, Bus, Route])],
  controllers: [PassengersController],
  providers: [PassengersService],
  exports: [PassengersService],
})
export class PassengersModule {}

