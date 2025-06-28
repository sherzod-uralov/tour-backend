import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tour } from './entities/tour.entity';
import { TourComment } from './entities/tour-comment.entity';
import { Category } from './entities/category.entity';
import { Difficulty } from './entities/difficulty.entity';
import { ToursService } from './tours.service';
import { ToursController } from './tours.controller';
import { TourCommentsService } from './tour-comments.service';
import { TourCommentsController } from './tour-comments.controller';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { DifficultiesService } from './difficulties.service';
import { DifficultiesController } from './difficulties.controller';
import { BillingModule } from '../billing/billing.module';
import { Booking } from '../bookings/entities/booking.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tour, TourComment, Category, Difficulty, Booking]),
    forwardRef(() => BillingModule),
  ],
  providers: [ToursService, TourCommentsService, CategoriesService, DifficultiesService],
  controllers: [ToursController, TourCommentsController, CategoriesController, DifficultiesController],
  exports: [ToursService, TourCommentsService, CategoriesService, DifficultiesService],
})
export class ToursModule {}
