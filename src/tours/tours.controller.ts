import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ToursService } from './tours.service';
import { CreateTourDto } from './dto/create-tour.dto';
import { UpdateTourDto } from './dto/update-tour.dto';
import { SearchToursDto } from './dto/search-tours.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { TourCategory } from './enums/tour-category.enum';

@ApiTags('Tours')
@Controller('tours')
export class ToursController {
  constructor(private readonly toursService: ToursService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new tour (Admin only)' })
  @ApiResponse({ status: 201, description: 'Tour successfully created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  create(@Body() createTourDto: CreateTourDto) {
    return this.toursService.create(createTourDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all active tours' })
  @ApiResponse({ status: 200, description: 'Return all active tours' })
  findAll() {
    return this.toursService.findAll();
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all tours including inactive ones (Admin only)',
  })
  @ApiResponse({ status: 200, description: 'Return all tours' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  findAllAdmin() {
    return this.toursService.findAllAdmin();
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Get tours by category' })
  @ApiResponse({ status: 200, description: 'Return tours by category' })
  findByCategory(@Param('category') category: TourCategory) {
    return this.toursService.findByCategory(category);
  }

  @Get('available')
  @ApiOperation({ summary: 'Get tours with available seats' })
  @ApiResponse({
    status: 200,
    description: 'Return tours with available seats',
  })
  findAvailable() {
    return this.toursService.findAvailable();
  }

  @Get('date-range')
  @ApiOperation({ summary: 'Get tours within a date range' })
  @ApiQuery({
    name: 'startDate',
    required: true,
    type: String,
    example: '2023-07-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: true,
    type: String,
    example: '2023-07-31',
  })
  @ApiResponse({ status: 200, description: 'Return tours within date range' })
  findByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.toursService.findByDateRange(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tour by ID' })
  @ApiResponse({ status: 200, description: 'Return the tour' })
  @ApiResponse({ status: 404, description: 'Tour not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.toursService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update tour by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Tour successfully updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Tour not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTourDto: UpdateTourDto,
  ) {
    return this.toursService.update(id, updateTourDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete tour by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Tour successfully deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Tour not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.toursService.remove(id);
  }

  @Get('search/tours')
  @ApiOperation({ summary: 'Search tours with various filters and pagination' })
  @ApiResponse({ status: 200, description: 'Return filtered tours' })
  search(@Query() searchDto: SearchToursDto) {
    return this.toursService.searchTours(searchDto);
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured tours' })
  @ApiResponse({ status: 200, description: 'Return featured tours' })
  getFeaturedTours() {
    return this.toursService.getFeaturedTours();
  }

  @Get('popular')
  @ApiOperation({ summary: 'Get popular tours' })
  @ApiResponse({ status: 200, description: 'Return popular tours' })
  getPopularTours() {
    return this.toursService.getPopularTours();
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming tours' })
  @ApiResponse({ status: 200, description: 'Return upcoming tours' })
  getUpcomingTours() {
    return this.toursService.getUpcomingTours();
  }
}
