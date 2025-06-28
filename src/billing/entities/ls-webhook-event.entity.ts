import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('ls_webhook_events')
export class LsWebhookEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  eventName: string;

  @Column({ default: false })
  processed: boolean;

  @Column({ type: 'jsonb' })
  body: Record<string, any>;

  @Column({ nullable: true })
  processingError: string;
}
