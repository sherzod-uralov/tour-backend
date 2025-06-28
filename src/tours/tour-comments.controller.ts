import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  Put,
  ParseIntPipe,
} from '@nestjs/common';
import { TourCommentsService } from './tour-comments.service';
import { CreateTourCommentDto } from './dto/create-tour-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Tour Comments')
@Controller('tour-comments')
export class TourCommentsController {
  constructor(private readonly tourCommentsService: TourCommentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new comment for a tour' })
  @ApiResponse({ status: 201, description: 'Comment created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Request() req,
    @Body() createTourCommentDto: CreateTourCommentDto,
  ) {
    return this.tourCommentsService.create(req.user.id, createTourCommentDto);
  }

  @Get('tour/:tourId')
  @ApiOperation({ summary: 'Get all comments for a specific tour' })
  @ApiParam({ name: 'tourId', description: 'The ID of the tour' })
  @ApiResponse({
    status: 200,
    description: 'Returns all comments for the tour',
  })
  async findAllForTour(@Param('tourId', ParseIntPipe) tourId: number) {
    return this.tourCommentsService.findAllForTour(tourId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific comment by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the comment' })
  @ApiResponse({ status: 200, description: 'Returns the comment' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tourCommentsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a comment' })
  @ApiParam({ name: 'id', description: 'The ID of the comment' })
  @ApiResponse({ status: 200, description: 'Comment updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not your comment' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Body() updateTourCommentDto: Partial<CreateTourCommentDto>,
  ) {
    return this.tourCommentsService.update(
      id,
      req.user.id,
      updateTourCommentDto,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiParam({ name: 'id', description: 'The ID of the comment' })
  @ApiResponse({ status: 200, description: 'Comment deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not your comment' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.tourCommentsService.remove(id, req.user.id);
  }

  @Get('rating/:tourId')
  @ApiOperation({ summary: 'Get the average rating for a tour' })
  @ApiParam({ name: 'tourId', description: 'The ID of the tour' })
  @ApiResponse({ status: 200, description: 'Returns the average rating' })
  async getAverageRating(@Param('tourId', ParseIntPipe) tourId: number) {
    const averageRating =
      await this.tourCommentsService.getAverageRatingForTour(tourId);
    return { averageRating };
  }
}
