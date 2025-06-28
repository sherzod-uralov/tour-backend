import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { TourCategory } from '../../tours/enums/tour-category.enum';
import { TourDifficulty } from '../../tours/enums/tour-difficulty.enum';

@Entity('user_preferences')
export class UserPreferences {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column('simple-array', { nullable: true })
  preferredCategories: TourCategory[];

  @Column('simple-array', { nullable: true })
  preferredDifficulties: TourDifficulty[];

  @Column({ nullable: true })
  preferredMinPrice: number;

  @Column({ nullable: true })
  preferredMaxPrice: number;

  @Column('simple-array', { nullable: true })
  preferredLocations: string[];

  @Column({ nullable: true })
  preferredMinDuration: number;

  @Column({ nullable: true })
  preferredMaxDuration: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}