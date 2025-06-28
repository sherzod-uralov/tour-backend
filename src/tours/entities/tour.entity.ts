import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TourCategory } from '../enums/tour-category.enum';
import { TourDifficulty } from '../enums/tour-difficulty.enum';
import { Category } from './category.entity';
import { Difficulty } from './difficulty.entity';

@Entity('tours')
export class Tour {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column('simple-array')
  images: string[];

  @Column()
  location: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column()
  availableSeats: number;

  @Column({
    type: 'enum',
    enum: TourCategory,
    default: TourCategory.CULTURAL,
  })
  category: TourCategory;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  duration: number;

  @Column({
    type: 'enum',
    enum: TourDifficulty,
    default: TourDifficulty.MODERATE,
    nullable: true,
  })
  difficulty: TourDifficulty;

  @Column({ nullable: true, type: 'text' })
  includedServices: string;

  @Column({ nullable: true, type: 'text' })
  excludedServices: string;

  @Column({ nullable: true, type: 'text' })
  itinerary: string;

  @Column({ nullable: true })
  meetingPoint: string;

  @Column({ nullable: true })
  endPoint: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  lemonSqueezyProductId: string;

  @Column({ nullable: true })
  lemonSqueezyVariantId: string;

  // Relationships
  @ManyToOne(() => Category, category => category.tours, { nullable: true })
  @JoinColumn({ name: 'categoryId' })
  categoryRelation: Category;

  @Column({ nullable: true })
  categoryId: number;

  @ManyToOne(() => Difficulty, difficulty => difficulty.tours, { nullable: true })
  @JoinColumn({ name: 'difficultyId' })
  difficultyRelation: Difficulty;

  @Column({ nullable: true })
  difficultyId: number;

  // Other relationships
  // @OneToMany(() => Booking, booking => booking.tour)
  // bookings: Booking[];
}
