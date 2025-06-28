import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tour } from './tour.entity';
import { User } from '../../users/entities/user.entity';

@Entity('tour_comments')
export class TourComment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  comment: string;

  @Column({ type: 'int', default: 5 })
  rating: number;

  @Column()
  userId: number;

  @Column()
  tourId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Tour)
  @JoinColumn({ name: 'tourId' })
  tour: Tour;
}
