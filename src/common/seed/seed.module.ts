import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { User } from '../../users/entities/user.entity';
import { Tour } from '../../tours/entities/tour.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Tour])],
  providers: [SeedService],
})
export class SeedModule {}
