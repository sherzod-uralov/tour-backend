import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserPreferences } from './entities/user-preferences.entity';
import { FavoriteTour } from './entities/favorite-tour.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { FavoriteTourDto } from './dto/favorite-tour.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserPreferences)
    private preferencesRepository: Repository<UserPreferences>,
    @InjectRepository(FavoriteTour)
    private favoriteTourRepository: Repository<FavoriteTour>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    console.log(updateUserDto);
    Object.assign(user, updateUserDto);

    return this.usersRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findById(id);
    await this.usersRepository.remove(user);
  }

  async findTourists(): Promise<User[]> {
    return this.usersRepository.find({ where: { role: 'tourist' } });
  }

  async findAdmins(): Promise<User[]> {
    return this.usersRepository.find({ where: { role: 'admin' } });
  }

  async getUserPreferences(userId: number): Promise<UserPreferences> {
    // Try to find existing preferences
    let preferences = await this.preferencesRepository.findOne({
      where: { userId },
    });

    // If preferences don't exist, create them
    if (!preferences) {
      preferences = this.preferencesRepository.create({
        userId,
      });
      await this.preferencesRepository.save(preferences);
    }

    return preferences;
  }

  async updateUserPreferences(
    userId: number,
    updatePreferencesDto: UpdatePreferencesDto,
  ): Promise<UserPreferences> {
    // Get existing preferences or create new ones
    const preferences = await this.getUserPreferences(userId);

    // Update preferences
    Object.assign(preferences, updatePreferencesDto);

    // Save updated preferences
    return this.preferencesRepository.save(preferences);
  }

  async getRecommendedTours(userId: number): Promise<any> {
    // Get user preferences
    const preferences = await this.getUserPreferences(userId);

    // This is a placeholder for a more sophisticated recommendation algorithm
    // In a real application, you would use the preferences to query tours
    // that match the user's preferences, possibly with some machine learning
    // to improve recommendations over time.

    // For now, we'll just return a simple message
    return {
      message: 'Recommended tours based on user preferences',
      preferences,
    };
  }

  async addFavoriteTour(userId: number, favoriteTourDto: FavoriteTourDto): Promise<FavoriteTour> {
    // Check if the user already has this tour as a favorite
    const existingFavorite = await this.favoriteTourRepository.findOne({
      where: {
        userId,
        tourId: favoriteTourDto.tourId,
      },
    });

    if (existingFavorite) {
      throw new ConflictException('This tour is already in your favorites');
    }

    // Create a new favorite tour entry
    const favoriteTour = this.favoriteTourRepository.create({
      userId,
      tourId: favoriteTourDto.tourId,
    });

    return this.favoriteTourRepository.save(favoriteTour);
  }

  async removeFavoriteTour(userId: number, tourId: number): Promise<void> {
    const favoriteTour = await this.favoriteTourRepository.findOne({
      where: {
        userId,
        tourId,
      },
    });

    if (!favoriteTour) {
      throw new NotFoundException('Favorite tour not found');
    }

    await this.favoriteTourRepository.remove(favoriteTour);
  }

  async getFavoriteTours(userId: number): Promise<FavoriteTour[]> {
    return this.favoriteTourRepository.find({
      where: { userId },
      relations: ['tour'],
    });
  }
}
