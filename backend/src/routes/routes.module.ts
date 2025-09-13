import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoutesController } from './routes.controller';
import { RoutesService } from './routes.service';
import { Route } from '../entities/route.entity';
import { TicketSale } from '../entities/ticket-sale.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Route, TicketSale])],
  controllers: [RoutesController],
  providers: [RoutesService],
  exports: [RoutesService],
})
export class RoutesModule {}

