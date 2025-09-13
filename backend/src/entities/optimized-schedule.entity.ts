import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Bus } from './bus.entity';
import { Route } from './route.entity';

@Entity('optimized_schedule')
export class OptimizedSchedule {
  @PrimaryGeneratedColumn()
  schedule_id: number;

  @Column()
  bus_id: number;

  @Column()
  route_id: number;

  @Column({ type: 'time' })
  start_time: string;

  @Column({ type: 'time' })
  end_time: string;

  @Column({ nullable: true })
  adjustment_reason: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @ManyToOne(() => Bus, bus => bus.optimized_schedules)
  @JoinColumn({ name: 'bus_id' })
  bus: Bus;

  @ManyToOne(() => Route, route => route.optimized_schedules)
  @JoinColumn({ name: 'route_id' })
  route: Route;
}

