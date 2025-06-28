import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { DifficultiesService } from './difficulties.service';
import { CreateDifficultyDto } from './dto/create-difficulty.dto';
import { UpdateDifficultyDto } from './dto/update-difficulty.dto';
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

@ApiTags('Difficulties')
@Controller('difficulties')
export class DifficultiesController {
  constructor(private readonly difficultiesService: DifficultiesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new difficulty (Admin only)' })
  @ApiResponse({ status: 201, description: 'Difficulty successfully created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  create(@Body() createDifficultyDto: CreateDifficultyDto) {
    return this.difficultiesService.create(createDifficultyDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all difficulties' })
  @ApiResponse({ status: 200, description: 'Return all difficulties' })
  findAll() {
    return this.difficultiesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get difficulty by ID' })
  @ApiResponse({ status: 200, description: 'Return the difficulty' })
  @ApiResponse({ status: 404, description: 'Difficulty not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.difficultiesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update difficulty by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Difficulty successfully updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Difficulty not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDifficultyDto: UpdateDifficultyDto,
  ) {
    return this.difficultiesService.update(id, updateDifficultyDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete difficulty by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Difficulty successfully deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Difficulty not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.difficultiesService.remove(id);
  }
}
