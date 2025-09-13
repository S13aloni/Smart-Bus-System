import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Bus } from './bus.entity';
import { TicketSale } from './ticket-sale.entity';
import { PassengerCount } from './passenger-count.entity';
import { OptimizedSchedule } from './optimized-schedule.entity';

@Entity('routes')
export class Route {
  @PrimaryGeneratedColumn()
  route_id: number;

  @Column()
  source: string;

  @Column()
  destination: string;

  @Column('jsonb')
  stops: string[];

  @Column('decimal', { precision: 8, scale: 2 })
  distance: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @OneToMany(() => Bus, bus => bus.route)
  buses: Bus[];

  @OneToMany(() => TicketSale, ticketSale => ticketSale.route)
  ticket_sales: TicketSale[];

  @OneToMany(() => PassengerCount, passengerCount => passengerCount.route)
  passenger_counts: PassengerCount[];

  @OneToMany(() => OptimizedSchedule, schedule => schedule.route)
  optimized_schedules: OptimizedSchedule[];
}

