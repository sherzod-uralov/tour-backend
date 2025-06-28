import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Role } from '../../common/enums/role.enum';
import { LsUserSubscription } from '../../billing/entities/ls-user-subscription.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude({ toPlainOnly: true }) // Exclude password from responses
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  phoneNumber: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.TOURIST,
  })
  role: string;

  @Column({ nullable: true })
  profilePicture: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  postalCode: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships will be added here as we develop other entities
  // For example:
  // @OneToMany(() => Booking, booking => booking.user)
  // bookings: Booking[];

  @OneToMany(() => LsUserSubscription, (subscription) => subscription.user)
  subscriptions: LsUserSubscription[];
}
