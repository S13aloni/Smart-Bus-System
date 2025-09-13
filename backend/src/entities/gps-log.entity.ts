import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Bus } from './bus.entity';

@Entity('gps_logs')
export class GpsLog {
  @PrimaryGeneratedColumn()
  log_id: number;

  @Column()
  bus_id: number;

  @Column('decimal', { precision: 10, scale: 8 })
  latitude: number;

  @Column('decimal', { precision: 11, scale: 8 })
  longitude: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0.00 })
  speed: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;

  @Column('decimal', { precision: 5, scale: 2, default: 0.00 })
  direction: number;

  @ManyToOne(() => Bus, bus => bus.gps_logs)
  @JoinColumn({ name: 'bus_id' })
  bus: Bus;
}

