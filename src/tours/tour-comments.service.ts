import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TourComment } from './entities/tour-comment.entity';
import { CreateTourCommentDto } from './dto/create-tour-comment.dto';
import { ToursService } from './tours.service';

@Injectable()
export class TourCommentsService {
  constructor(
    @InjectRepository(TourComment)
    private tourCommentsRepository: Repository<TourComment>,
    private toursService: ToursService,
  ) {}

  async create(userId: number, createTourCommentDto: CreateTourCommentDto): Promise<TourComment> {
    // Verify that the tour exists
    await this.toursService.findOne(createTourCommentDto.tourId);

    const comment = this.tourCommentsRepository.create({
      ...createTourCommentDto,
      userId,
    });

    return this.tourCommentsRepository.save(comment);
  }

  async findAllForTour(tourId: number): Promise<TourComment[]> {
    return this.tourCommentsRepository.find({
      where: { tourId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<TourComment> {
    const comment = await this.tourCommentsRepository.findOne({ where: { id } });
    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }
    return comment;
  }

  async update(id: number, userId: number, updateData: Partial<CreateTourCommentDto>): Promise<TourComment> {
    const comment = await this.findOne(id);

    // Check if the user is the owner of the comment
    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only update your own comments');
    }

    // Update the comment
    Object.assign(comment, updateData);

    return this.tourCommentsRepository.save(comment);
  }

  async remove(id: number, userId: number): Promise<void> {
    const comment = await this.findOne(id);

    // Check if the user is the owner of the comment
    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.tourCommentsRepository.remove(comment);
  }

  async getAverageRatingForTour(tourId: number): Promise<number> {
    const result = await this.tourCommentsRepository
      .createQueryBuilder('comment')
      .select('AVG(comment.rating)', 'averageRating')
      .where('comment.tourId = :tourId', { tourId })
      .getRawOne();

    return result.averageRating ? parseFloat(result.averageRating) : 0;
  }
}