import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Rent } from './rent.entity';

@Entity({ name: 'rent_events' })
export class RentEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  rentId: number;

  @Column({ length: 80 })
  type: string;

  @Column({ type: 'jsonb', nullable: true })
  payload: Record<string, unknown> | null;

  @ManyToOne(() => Rent, (rent) => rent.events, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rentId' })
  rent: Rent;

  @CreateDateColumn()
  createdAt: Date;
}
