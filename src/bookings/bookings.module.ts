import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { ToursModule } from '../tours/tours.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking]),
    forwardRef(() => ToursModule), // Use forwardRef to avoid circular dependency
  ],
  providers: [BookingsService],
  controllers: [BookingsController],
  exports: [BookingsService],
})
export class BookingsModule {}
