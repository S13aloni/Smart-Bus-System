import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Bus } from './bus.entity';
import { Route } from './route.entity';

@Entity('passenger_counts')
export class PassengerCount {
  @PrimaryGeneratedColumn()
  count_id: number;

  @Column()
  bus_id: number;

  @Column()
  route_id: number;

  @Column()
  occupancy: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;

  @ManyToOne(() => Bus, bus => bus.passenger_counts)
  @JoinColumn({ name: 'bus_id' })
  bus: Bus;

  @ManyToOne(() => Route, route => route.passenger_counts)
  @JoinColumn({ name: 'route_id' })
  route: Route;
}

