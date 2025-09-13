import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Bus } from './bus.entity';
import { Route } from './route.entity';

@Entity('ticket_sales')
export class TicketSale {
  @PrimaryGeneratedColumn()
  ticket_id: number;

  @Column()
  bus_id: number;

  @Column()
  route_id: number;

  @Column()
  passenger_count: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;

  @Column('decimal', { precision: 8, scale: 2, default: 0.00 })
  price: number;

  @ManyToOne(() => Bus, bus => bus.ticket_sales)
  @JoinColumn({ name: 'bus_id' })
  bus: Bus;

  @ManyToOne(() => Route, route => route.ticket_sales)
  @JoinColumn({ name: 'route_id' })
  route: Route;
}

