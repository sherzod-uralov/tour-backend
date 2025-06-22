import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Tour } from '../../tours/entities/tour.entity';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  tourId: number;

  @ManyToOne(() => Tour, { eager: true })
  @JoinColumn({ name: 'tourId' })
  tour: Tour;

  @Column()
  numberOfPeople: number;

  @Column('decimal', { precision: 10, scale: 2 })
  totalPrice: number;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;

  @Column({ nullable: true })
  paymentId: string;

  @Column({ default: false })
  isPaid: boolean;

  @Column({ nullable: true })
  specialRequests: string;

  @Column({ nullable: true })
  contactPhone: string;

  @Column({ nullable: true })
  contactEmail: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
