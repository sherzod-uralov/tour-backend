import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository, Like, MoreThanOrEqual, LessThanOrEqual, FindOptionsWhere } from 'typeorm';
import { Tour } from './entities/tour.entity';
import { TourComment } from './entities/tour-comment.entity';
import { Category } from './entities/category.entity';
import { Difficulty } from './entities/difficulty.entity';
import { CreateTourDto } from './dto/create-tour.dto';
import { UpdateTourDto } from './dto/update-tour.dto';
import { SearchToursDto } from './dto/search-tours.dto';
import { TourCategory } from './enums/tour-category.enum';
import { TourDifficulty } from './enums/tour-difficulty.enum';
import { LemonSqueezyService } from '../billing/lemon-squeezy.service';
import { CategoriesService } from './categories.service';
import { DifficultiesService } from './difficulties.service';
import { Booking } from '../bookings/entities/booking.entity';

@Injectable()
export class ToursService {
  constructor(
    @InjectRepository(Tour)
    private toursRepository: Repository<Tour>,
    @InjectRepository(TourComment)
    private tourCommentsRepository: Repository<TourComment>,
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
    @Inject(forwardRef(() => LemonSqueezyService))
    private lemonSqueezyService: LemonSqueezyService,
    private categoriesService: CategoriesService,
    private difficultiesService: DifficultiesService,
  ) {}

  async create(createTourDto: CreateTourDto): Promise<Tour> {
    // Check if Lemon Squeezy product and variant IDs are provided in the DTO
    if (!createTourDto.lemonSqueezyProductId || !createTourDto.lemonSqueezyVariantId) {
      throw new BadRequestException(
        'Lemon Squeezy product and variant IDs are required when creating a tour'
      );
    }

    const tour = this.toursRepository.create(createTourDto);

    // Handle category if provided
    if (createTourDto.categoryId) {
      const category = await this.categoriesService.findOne(createTourDto.categoryId);
      tour.categoryRelation = category;
      tour.categoryId = category.id;
    }

    // Handle difficulty if provided
    if (createTourDto.difficultyId) {
      const difficulty = await this.difficultiesService.findOne(createTourDto.difficultyId);
      tour.difficultyRelation = difficulty;
      tour.difficultyId = difficulty.id;
    }

    // Save the tour with the provided Lemon Squeezy IDs
    const savedTour = await this.toursRepository.save(tour);

    console.log(
      `Created tour with Lemon Squeezy Product ID: ${savedTour.lemonSqueezyProductId}, Variant ID: ${savedTour.lemonSqueezyVariantId}`
    );

    return savedTour;
  }

  async findAll(): Promise<(Tour & { averageRating?: number })[]> {
    const tours = await this.toursRepository.find({ where: { isActive: true } });
    return this.addAverageRatingsToTours(tours);
  }

  // Helper method to add average ratings to tours
  private async addAverageRatingsToTours(tours: Tour[]): Promise<(Tour & { averageRating?: number })[]> {
    if (tours.length === 0) {
      return [];
    }

    // Get average ratings for all tours in a single query
    const ratingsResult = await this.tourCommentsRepository
      .createQueryBuilder('comment')
      .select('comment.tourId', 'tourId')
      .addSelect('AVG(comment.rating)', 'averageRating')
      .groupBy('comment.tourId')
      .getRawMany();

    // Create a map of tourId to averageRating
    const ratingsMap = new Map<number, number>();
    ratingsResult.forEach(result => {
      ratingsMap.set(result.tourId, parseFloat(result.averageRating));
    });

    // Add average rating to each tour
    return tours.map(tour => ({
      ...tour,
      averageRating: ratingsMap.get(tour.id) || 0
    }));
  }

  async findAllAdmin(): Promise<(Tour & { averageRating?: number })[]> {
    const tours = await this.toursRepository.find();
    return this.addAverageRatingsToTours(tours);
  }

  async findOne(id: number): Promise<Tour & { comments?: TourComment[], averageRating?: number }> {
    const tour = await this.toursRepository.findOne({ where: { id } });
    if (!tour) {
      throw new NotFoundException(`Tour with ID ${id} not found`);
    }

    // Get comments for this tour
    const comments = await this.tourCommentsRepository.find({
      where: { tourId: id },
      order: { createdAt: 'DESC' },
    });

    // Calculate average rating
    let averageRating = 0;
    if (comments.length > 0) {
      const sum = comments.reduce((total, comment) => total + comment.rating, 0);
      averageRating = sum / comments.length;
    }

    // Add comments and average rating to the tour object
    return {
      ...tour,
      comments,
      averageRating,
    };
  }

  async update(id: number, updateTourDto: UpdateTourDto): Promise<Tour> {
    const tour = await this.findOne(id);

    // Update tour properties
    Object.assign(tour, updateTourDto);

    // Handle category if provided
    if (updateTourDto.categoryId) {
      const category = await this.categoriesService.findOne(updateTourDto.categoryId);
      tour.categoryRelation = category;
      tour.categoryId = category.id;
    }

    // Handle difficulty if provided
    if (updateTourDto.difficultyId) {
      const difficulty = await this.difficultiesService.findOne(updateTourDto.difficultyId);
      tour.difficultyRelation = difficulty;
      tour.difficultyId = difficulty.id;
    }

    return this.toursRepository.save(tour);
  }

  async remove(id: number): Promise<void> {
    const tour = await this.findOne(id);

    // Check if there are any bookings associated with this tour
    const bookingsCount = await this.bookingsRepository.count({ where: { tourId: id } });
    if (bookingsCount > 0) {
      throw new ConflictException(
        `Cannot delete tour with ID ${id} because it has ${bookingsCount} associated bookings. Please delete the bookings first.`
      );
    }

    // Check if there are any comments associated with this tour
    const commentsCount = await this.tourCommentsRepository.count({ where: { tourId: id } });
    if (commentsCount > 0) {
      throw new ConflictException(
        `Cannot delete tour with ID ${id} because it has ${commentsCount} associated comments. Please delete the comments first.`
      );
    }

    await this.toursRepository.remove(tour);
  }

  async findByCategory(categoryId: number): Promise<(Tour & { averageRating?: number })[]> {
    const category = await this.categoriesService.findOne(categoryId);

    const tours = await this.toursRepository.find({
      where: {
        categoryId: category.id,
        isActive: true,
      },
      relations: ['categoryRelation'],
    });

    return this.addAverageRatingsToTours(tours);
  }

  async findByCategoryEnum(category: TourCategory): Promise<(Tour & { averageRating?: number })[]> {
    const tours = await this.toursRepository.find({
      where: {
        category,
        isActive: true,
      },
    });

    return this.addAverageRatingsToTours(tours);
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<(Tour & { averageRating?: number })[]> {
    const tours = await this.toursRepository.find({
      where: {
        startDate: Between(startDate, endDate),
        isActive: true,
      },
    });
    return this.addAverageRatingsToTours(tours);
  }

  async findAvailable(): Promise<(Tour & { averageRating?: number })[]> {
    const tours = await this.toursRepository.find({
      where: {
        availableSeats: Between(1, 100), // Assuming max seats is 100
        isActive: true,
      },
    });
    return this.addAverageRatingsToTours(tours);
  }

  async decreaseAvailableSeats(id: number, count: number = 1): Promise<Tour> {
    const tour = await this.findOne(id);

    if (tour.availableSeats < count) {
      throw new Error('Not enough available seats');
    }

    tour.availableSeats -= count;
    return this.toursRepository.save(tour);
  }

  async increaseAvailableSeats(id: number, count: number = 1): Promise<Tour> {
    const tour = await this.findOne(id);
    tour.availableSeats += count;
    return this.toursRepository.save(tour);
  }

  async searchTours(searchDto: SearchToursDto): Promise<{ tours: (Tour & { averageRating?: number })[], total: number, page: number, limit: number }> {
    const { 
      searchTerm, 
      location, 
      minPrice, 
      maxPrice, 
      startDate, 
      endDate, 
      minDuration, 
      maxDuration, 
      category, 
      difficulty, 
      minAvailableSeats,
      page = 1,
      limit = 10
    } = searchDto;

    // Build the where clause based on search parameters
    const where: FindOptionsWhere<Tour> = {
      isActive: true
    };

    // Search in title and description
    if (searchTerm) {
      where.title = Like(`%${searchTerm}%`);
      // Note: This is a simplification. For a real search in both title and description,
      // you would need to use a more complex query with OR conditions
    }

    // Filter by location
    if (location) {
      where.location = Like(`%${location}%`);
    }

    // Filter by price range
    if (minPrice !== undefined) {
      where.price = MoreThanOrEqual(minPrice);
    }
    if (maxPrice !== undefined) {
      where.price = LessThanOrEqual(maxPrice);
    }

    // Filter by date range
    if (startDate) {
      where.startDate = MoreThanOrEqual(startDate);
    }
    if (endDate) {
      where.endDate = LessThanOrEqual(endDate);
    }

    // Filter by duration
    if (minDuration !== undefined) {
      where.duration = MoreThanOrEqual(minDuration);
    }
    if (maxDuration !== undefined) {
      where.duration = LessThanOrEqual(maxDuration);
    }

    // Filter by category
    if (category) {
      if (typeof category === 'number') {
        // If category is a number, it's a categoryId
        where.categoryId = category;
      } else {
        // Otherwise, it's a TourCategory enum value
        where.category = category;
      }
    }

    // Filter by difficulty
    if (difficulty) {
      if (typeof difficulty === 'number') {
        // If difficulty is a number, it's a difficultyId
        where.difficultyId = difficulty;
      } else {
        // Otherwise, it's a TourDifficulty enum value
        where.difficulty = difficulty;
      }
    }

    // Filter by available seats
    if (minAvailableSeats !== undefined) {
      where.availableSeats = MoreThanOrEqual(minAvailableSeats);
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count
    const total = await this.toursRepository.count({ where });

    // Get paginated results
    const tours = await this.toursRepository.find({
      where,
      skip,
      take: limit,
      order: {
        startDate: 'ASC'
      }
    });

    // Add average ratings to tours
    const toursWithRatings = await this.addAverageRatingsToTours(tours);

    return {
      tours: toursWithRatings,
      total,
      page,
      limit
    };
  }

  async getFeaturedTours(): Promise<(Tour & { averageRating?: number })[]> {
    // This is a simplified implementation. In a real application, you might
    // determine featured tours based on ratings, popularity, or other criteria.
    const tours = await this.toursRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
      take: 5
    });
    return this.addAverageRatingsToTours(tours);
  }

  async getPopularTours(): Promise<(Tour & { averageRating?: number })[]> {
    // In a real application, you would determine popularity based on bookings,
    // views, or other metrics. This is a simplified implementation.
    const tours = await this.toursRepository.find({
      where: { isActive: true },
      order: { availableSeats: 'ASC' }, // Assuming tours with fewer available seats are more popular
      take: 5
    });
    return this.addAverageRatingsToTours(tours);
  }

  async getUpcomingTours(): Promise<(Tour & { averageRating?: number })[]> {
    const today = new Date();
    const tours = await this.toursRepository.find({
      where: {
        isActive: true,
        startDate: MoreThanOrEqual(today)
      },
      order: { startDate: 'ASC' },
      take: 5
    });
    return this.addAverageRatingsToTours(tours);
  }
}
