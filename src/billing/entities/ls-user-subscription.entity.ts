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
import { LsSubscriptionPlan } from './ls-subscription-plan.entity';

@Entity('ls_user_subscriptions')
export class LsUserSubscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ unique: true })
  lemonSqueezyId: string;

  @Column()
  orderId: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  status: string;

  @Column()
  statusFormatted: string;

  @Column({ nullable: true })
  renewsAt: string;

  @Column({ nullable: true })
  endsAt: string;

  @Column({ nullable: true })
  trialEndsAt: string;

  @Column()
  price: string;

  @Column({ default: false })
  isUsageBased: boolean;

  @Column({ default: false })
  isPaused: boolean;

  @Column({ nullable: true })
  subscriptionItemId: string;

  @ManyToOne(() => User, user => user.subscriptions)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => LsSubscriptionPlan, plan => plan.subscriptions)
  @JoinColumn({ name: 'planId' })
  subscriptionPlan: LsSubscriptionPlan;

  @Column()
  planId: string;
}