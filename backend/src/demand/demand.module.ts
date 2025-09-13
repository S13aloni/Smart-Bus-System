import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DemandController } from './demand.controller';
import { DemandService } from './demand.service';
import { TicketSale } from '../entities/ticket-sale.entity';
import { PassengerCount } from '../entities/passenger-count.entity';
import { Route } from '../entities/route.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TicketSale, PassengerCount, Route])],
  controllers: [DemandController],
  providers: [DemandService],
  exports: [DemandService],
})
export class DemandModule {}

