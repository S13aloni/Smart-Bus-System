import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Route } from './route.entity';
import { TicketSale } from './ticket-sale.entity';
import { GpsLog } from './gps-log.entity';
import { PassengerCount } from './passenger-count.entity';
import { OptimizedSchedule } from './optimized-schedule.entity';

@Entity('buses')
export class Bus {
  @PrimaryGeneratedColumn()
  bus_id: number;

  @Column()
  route_id: number;

  @Column()
  capacity: number;

  @Column({ default: 'active' })
  status: string;

  @Column({ unique: true })
  license_plate: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @ManyToOne(() => Route, route => route.buses)
  @JoinColumn({ name: 'route_id' })
  route: Route;

  @OneToMany(() => TicketSale, ticketSale => ticketSale.bus)
  ticket_sales: TicketSale[];

  @OneToMany(() => GpsLog, gpsLog => gpsLog.bus)
  gps_logs: GpsLog[];

  @OneToMany(() => PassengerCount, passengerCount => passengerCount.bus)
  passenger_counts: PassengerCount[];

  @OneToMany(() => OptimizedSchedule, schedule => schedule.bus)
  optimized_schedules: OptimizedSchedule[];
}

