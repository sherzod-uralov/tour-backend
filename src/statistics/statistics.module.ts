import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { Booking } from '../bookings/entities/booking.entity';
import { User } from '../users/entities/user.entity';
import { Tour } from '../tours/entities/tour.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, User, Tour])],
  controllers: [StatisticsController],
  providers: [StatisticsService],
  exports: [StatisticsService],
})
export class StatisticsModule {}
