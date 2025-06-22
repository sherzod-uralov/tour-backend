import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { FavoriteTourDto } from './dto/favorite-tour.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new user (Admin only)' })
  @ApiResponse({ status: 201, description: 'User successfully created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({ status: 200, description: 'Return all users' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get('tourists')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all tourists (Admin only)' })
  @ApiResponse({ status: 200, description: 'Return all tourists' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  findTourists() {
    return this.usersService.findTourists();
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Return the user profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(@Request() req) {
    return this.usersService.findById(req.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Return the user' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id') id: string) {
    return this.usersService.findById(+id);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile successfully updated',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(req.user.id, updateUserDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'User successfully updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete user by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'User successfully deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @Get('preferences')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user preferences' })
  @ApiResponse({ status: 200, description: 'Return user preferences' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getUserPreferences(@Request() req) {
    return this.usersService.getUserPreferences(req.user.id);
  }

  @Patch('preferences')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user preferences' })
  @ApiResponse({ status: 200, description: 'User preferences updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  updateUserPreferences(
    @Request() req,
    @Body() updatePreferencesDto: UpdatePreferencesDto,
  ) {
    return this.usersService.updateUserPreferences(req.user.id, updatePreferencesDto);
  }

  @Get('recommended-tours')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get tour recommendations based on user preferences' })
  @ApiResponse({ status: 200, description: 'Return recommended tours' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getRecommendedTours(@Request() req) {
    return this.usersService.getRecommendedTours(req.user.id);
  }

  @Post('favorites')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a tour to favorites' })
  @ApiResponse({ status: 201, description: 'Tour added to favorites successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Tour is already in favorites' })
  addFavoriteTour(@Request() req, @Body() favoriteTourDto: FavoriteTourDto) {
    return this.usersService.addFavoriteTour(req.user.id, favoriteTourDto);
  }

  @Delete('favorites/:tourId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove a tour from favorites' })
  @ApiResponse({ status: 200, description: 'Tour removed from favorites successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Favorite tour not found' })
  removeFavoriteTour(@Request() req, @Param('tourId') tourId: string) {
    return this.usersService.removeFavoriteTour(req.user.id, +tourId);
  }

  @Get('favorites')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all favorite tours for the current user' })
  @ApiResponse({ status: 200, description: 'Return all favorite tours' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getFavoriteTours(@Request() req) {
    return this.usersService.getFavoriteTours(req.user.id);
  }
}
