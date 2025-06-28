import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { LemonSqueezyService } from './lemon-squeezy.service';
import { LemonSqueezyController } from './lemon-squeezy.controller';
import { BookingsModule } from '../bookings/bookings.module';
import { ToursModule } from '../tours/tours.module';
import { LsSubscriptionPlan } from './entities/ls-subscription-plan.entity';
import { LsUserSubscription } from './entities/ls-user-subscription.entity';
import { LsWebhookEvent } from './entities/ls-webhook-event.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LsSubscriptionPlan,
      LsUserSubscription,
      LsWebhookEvent,
    ]),
    forwardRef(() => BookingsModule),
    forwardRef(() => ToursModule),
  ],
  providers: [PaymentService, LemonSqueezyService],
  controllers: [LemonSqueezyController],
  exports: [PaymentService, LemonSqueezyService],
})
export class BillingModule {}
