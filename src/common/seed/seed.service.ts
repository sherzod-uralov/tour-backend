import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Tour } from '../../tours/entities/tour.entity';
import { Role } from '../../common/enums/role.enum';
import { TourCategory } from '../../tours/enums/tour-category.enum';
import { TourDifficulty } from '../../tours/enums/tour-difficulty.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Tour)
    private toursRepository: Repository<Tour>,
  ) {}

  async onModuleInit() {
    await this.seedAdmin();
    await this.seedTours();
  }

  private async seedAdmin() {
    const adminCount = await this.usersRepository.count({
      where: { role: Role.ADMIN },
    });

    if (adminCount === 0) {
      const hashedPassword = await bcrypt.hash('Admin123', 10);

      const admin = this.usersRepository.create({
        email: 'admin@example.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        phoneNumber: '+1234567890',
        role: Role.ADMIN,
      });

      await this.usersRepository.save(admin);
      console.log('Admin user seeded successfully');
    }
  }

  private async seedTours() {
    const tourCount = await this.toursRepository.count();

    if (tourCount === 0) {
      const tours = [
        {
          title: 'Historical Tour of Samarkand',
          description:
            'Explore the ancient city of Samarkand with its rich history and architecture.',
          images: [
            'https://example.com/samarkand1.jpg',
            'https://example.com/samarkand2.jpg',
          ],
          location: 'Samarkand, Uzbekistan',
          price: 299.99,
          startDate: new Date('2023-07-15'),
          endDate: new Date('2023-07-22'),
          availableSeats: 20,
          category: TourCategory.HISTORICAL,
          duration: 7,
          difficulty: TourDifficulty.MODERATE,
          includedServices:
            'Hotel accommodation, Breakfast, Guided tours, Transportation',
          excludedServices: 'Flights, Lunch and Dinner, Personal expenses',
          itinerary:
            'Day 1: Arrival and city tour. Day 2: Visit to Registan Square...',
          meetingPoint: 'Tashkent International Airport',
          endPoint: 'Tashkent International Airport',
        },
        {
          title: 'Cultural Experience in Bukhara',
          description:
            'Immerse yourself in the rich cultural heritage of Bukhara.',
          images: [
            'https://example.com/bukhara1.jpg',
            'https://example.com/bukhara2.jpg',
          ],
          location: 'Bukhara, Uzbekistan',
          price: 349.99,
          startDate: new Date('2023-08-10'),
          endDate: new Date('2023-08-17'),
          availableSeats: 15,
          category: TourCategory.CULTURAL,
          duration: 7,
          difficulty: TourDifficulty.EASY,
          includedServices:
            'Hotel accommodation, Breakfast, Guided tours, Transportation, Cultural activities',
          excludedServices: 'Flights, Lunch and Dinner, Personal expenses',
          itinerary:
            'Day 1: Arrival and welcome dinner. Day 2: Visit to Poi Kalon Complex...',
          meetingPoint: 'Bukhara International Airport',
          endPoint: 'Bukhara International Airport',
        },
        {
          title: 'Adventure in the Tian Shan Mountains',
          description:
            'Experience the thrill of hiking and camping in the beautiful Tian Shan Mountains.',
          images: [
            'https://example.com/tianshan1.jpg',
            'https://example.com/tianshan2.jpg',
          ],
          location: 'Tian Shan Mountains, Uzbekistan',
          price: 499.99,
          startDate: new Date('2023-09-05'),
          endDate: new Date('2023-09-12'),
          availableSeats: 10,
          category: TourCategory.ADVENTURE,
          duration: 7,
          difficulty: TourDifficulty.CHALLENGING,
          includedServices:
            'Camping equipment, Meals, Guided tours, Transportation, Adventure activities',
          excludedServices: 'Flights, Personal expenses, Travel insurance',
          itinerary:
            'Day 1: Arrival and preparation. Day 2: Begin trek to base camp...',
          meetingPoint: 'Tashkent International Airport',
          endPoint: 'Tashkent International Airport',
        },
      ];

      for (const tourData of tours) {
        const tour = this.toursRepository.create(tourData);
        await this.toursRepository.save(tour);
      }

      console.log('Sample tours seeded successfully');
    }
  }
}
