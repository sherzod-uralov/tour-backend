import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { LsUserSubscription } from './ls-user-subscription.entity';

@Entity('ls_subscription_plans')
export class LsSubscriptionPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  productId: number;

  @Column()
  productName: string;

  @Column({ unique: true })
  variantId: number;

  @Column()
  name: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column()
  price: string;

  @Column({ default: false })
  isUsageBased: boolean;

  @Column({ nullable: true })
  interval: string;

  @Column({ nullable: true })
  intervalCount: number;

  @Column({ nullable: true })
  trialInterval: string;

  @Column({ nullable: true })
  trialIntervalCount: number;

  @Column({ nullable: true })
  sort: number;

  @OneToMany(() => LsUserSubscription, subscription => subscription.subscriptionPlan)
  subscriptions: LsUserSubscription[];
}