import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tour } from './entities/tour.entity';
import { TourComment } from './entities/tour-comment.entity';
import { ToursService } from './tours.service';
import { ToursController } from './tours.controller';
import { TourCommentsService } from './tour-comments.service';
import { TourCommentsController } from './tour-comments.controller';
import { BillingModule } from '../billing/billing.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tour, TourComment]),
    forwardRef(() => BillingModule),
  ],
  providers: [ToursService, TourCommentsService],
  controllers: [ToursController, TourCommentsController],
  exports: [ToursService, TourCommentsService],
})
export class ToursModule {}
