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
  ParseIntPipe,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
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

@ApiTags('Bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiResponse({ status: 201, description: 'Booking successfully created' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error or not enough seats',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Request() req, @Body() createBookingDto: CreateBookingDto) {
    return this.bookingsService.create(req.user.id, createBookingDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all bookings (Admin only)' })
  @ApiResponse({ status: 200, description: 'Return all bookings' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  findAll() {
    return this.bookingsService.findAll();
  }

  @Get('my-bookings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user bookings' })
  @ApiResponse({ status: 200, description: 'Return user bookings' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findMyBookings(@Request() req) {
    return this.bookingsService.findByUser(req.user.id);
  }

  @Get('tour/:tourId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get bookings by tour ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Return bookings for the tour' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  findByTour(@Param('tourId', ParseIntPipe) tourId: number) {
    return this.bookingsService.findByTour(tourId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get booking by ID' })
  @ApiResponse({ status: 200, description: 'Return the booking' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async findOne(@Request() req, @Param('id', ParseIntPipe) id: number) {
    const booking = await this.bookingsService.findOne(id);

    // Check if the user is the owner of the booking or an admin
    if (booking.userId !== req.user.id && req.user.role !== Role.ADMIN) {
      throw new Error('You do not have permission to access this booking');
    }

    return booking;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update booking by ID' })
  @ApiResponse({ status: 200, description: 'Booking successfully updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBookingDto: UpdateBookingDto,
  ) {
    const booking = await this.bookingsService.findOne(id);

    // Check if the user is the owner of the booking or an admin
    if (booking.userId !== req.user.id && req.user.role !== Role.ADMIN) {
      throw new Error('You do not have permission to update this booking');
    }

    // Regular users can only update certain fields
    if (req.user.role !== Role.ADMIN) {
      const allowedFields = ['specialRequests', 'contactPhone', 'contactEmail'];
      const updateFields = Object.keys(updateBookingDto);

      for (const field of updateFields) {
        if (!allowedFields.includes(field)) {
          throw new Error(
            `You do not have permission to update the ${field} field`,
          );
        }
      }
    }

    return this.bookingsService.update(id, updateBookingDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete booking by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Booking successfully deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.bookingsService.remove(id);
  }

  @Post(':id/confirm-payment')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confirm payment for booking (Admin only)' })
  @ApiResponse({ status: 200, description: 'Payment successfully confirmed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  confirmPayment(
    @Param('id', ParseIntPipe) id: number,
    @Body('paymentId') paymentId: string,
  ) {
    return this.bookingsService.confirmPayment(id, paymentId);
  }

  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel booking' })
  @ApiResponse({ status: 200, description: 'Booking successfully cancelled' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async cancelBooking(@Request() req, @Param('id', ParseIntPipe) id: number) {
    const booking = await this.bookingsService.findOne(id);

    // Check if the user is the owner of the booking or an admin
    if (booking.userId !== req.user.id && req.user.role !== Role.ADMIN) {
      throw new Error('You do not have permission to cancel this booking');
    }

    return this.bookingsService.cancelBooking(id);
  }

  @Post(':id/complete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark booking as completed (Admin only)' })
  @ApiResponse({ status: 200, description: 'Booking successfully completed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  completeBooking(@Param('id', ParseIntPipe) id: number) {
    return this.bookingsService.completeBooking(id);
  }
}
