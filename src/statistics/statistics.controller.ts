import {
  Controller,
  Get,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { StatisticsService } from './statistics.service';
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

@ApiTags('Statistics')
@Controller('statistics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('payments/summary')
  @ApiOperation({ summary: 'Get overall payment statistics' })
  @ApiResponse({
    status: 200,
    description: 'Return overall payment statistics',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  getPaymentSummary() {
    return this.statisticsService.getPaymentSummary();
  }

  @Get('payments/daily')
  @ApiOperation({ summary: 'Get daily payment statistics' })
  @ApiQuery({
    name: 'days',
    required: false,
    type: Number,
    description: 'Number of days to include (default: 7)',
  })
  @ApiResponse({
    status: 200,
    description: 'Return daily payment statistics',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  getDailyPaymentStats(
    @Query('days', new ParseIntPipe({ optional: true })) days?: number,
  ) {
    return this.statisticsService.getDailyPaymentStats(days);
  }

  @Get('payments/weekly')
  @ApiOperation({ summary: 'Get weekly payment statistics' })
  @ApiQuery({
    name: 'weeks',
    required: false,
    type: Number,
    description: 'Number of weeks to include (default: 4)',
  })
  @ApiResponse({
    status: 200,
    description: 'Return weekly payment statistics',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  getWeeklyPaymentStats(
    @Query('weeks', new ParseIntPipe({ optional: true })) weeks?: number,
  ) {
    return this.statisticsService.getWeeklyPaymentStats(weeks);
  }

  @Get('payments/monthly')
  @ApiOperation({ summary: 'Get monthly payment statistics' })
  @ApiQuery({
    name: 'months',
    required: false,
    type: Number,
    description: 'Number of months to include (default: 6)',
  })
  @ApiResponse({
    status: 200,
    description: 'Return monthly payment statistics',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  getMonthlyPaymentStats(
    @Query('months', new ParseIntPipe({ optional: true })) months?: number,
  ) {
    return this.statisticsService.getMonthlyPaymentStats(months);
  }

  @Get('payments/period')
  @ApiOperation({ summary: 'Get payment statistics for a specific period' })
  @ApiQuery({
    name: 'startDate',
    required: true,
    type: String,
    description: 'Start date in ISO format (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: true,
    type: String,
    description: 'End date in ISO format (YYYY-MM-DD)',
  })
  @ApiResponse({
    status: 200,
    description: 'Return payment statistics for the specified period',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  getPaymentStatsByPeriod(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.statisticsService.getPaymentStatsByPeriod(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('payments/users')
  @ApiOperation({ summary: 'Get user payment statistics' })
  @ApiResponse({
    status: 200,
    description: 'Return user payment statistics',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  getUserPaymentStats() {
    return this.statisticsService.getUserPaymentStats();
  }

  @Get('bookings/tours')
  @ApiOperation({ summary: 'Get tour booking statistics' })
  @ApiResponse({
    status: 200,
    description: 'Return tour booking statistics',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  getTourBookingStats() {
    return this.statisticsService.getTourBookingStats();
  }
}
