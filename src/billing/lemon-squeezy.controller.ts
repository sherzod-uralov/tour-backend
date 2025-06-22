import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
  ForbiddenException,
} from '@nestjs/common';
import { LemonSqueezyService } from './lemon-squeezy.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Role } from '../common/enums/role.enum';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { BookingsService } from '../bookings/bookings.service';

@ApiTags('Lemon Squeezy Payments')
@Controller('lemon-squeezy')
export class LemonSqueezyController {
  constructor(
    private readonly lemonSqueezyService: LemonSqueezyService,
    private readonly bookingsService: BookingsService,
  ) {}

  @Post('create-checkout/:bookingId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a Lemon Squeezy checkout for a booking' })
  @ApiParam({
    name: 'bookingId',
    type: Number,
    description: 'The ID of the booking',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        successUrl: { type: 'string', example: 'https://example.com/success' },
        cancelUrl: { type: 'string', example: 'https://example.com/cancel' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Return the checkout URL' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async createCheckout(
    @Request() req,
    @Param('bookingId', ParseIntPipe) bookingId: number,
    @Body('successUrl') successUrl: string,
    @Body('cancelUrl') cancelUrl: string,
  ) {
    const booking = await this.bookingsService.findOne(bookingId);

    // Check if the user is the owner of the booking or an admin
    if (booking.userId !== req.user.id && req.user.role !== Role.ADMIN) {
      throw new ForbiddenException(
        'You do not have permission to create a checkout for this booking',
      );
    }

    return this.lemonSqueezyService.createCheckout(
      bookingId,
      successUrl,
      cancelUrl,
    );
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Handle Lemon Squeezy webhook events' })
  @ApiResponse({
    status: 200,
    description: 'Webhook event processed successfully',
  })
  async handleWebhook(@Body() payload: any) {
    return this.lemonSqueezyService.handleWebhook(payload);
  }

  @Post('verify-payment/:bookingId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify a Lemon Squeezy payment for a booking' })
  @ApiParam({
    name: 'bookingId',
    type: Number,
    description: 'The ID of the booking',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        orderId: { type: 'string', example: 'order_123456' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Payment successfully verified' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async verifyPayment(
    @Request() req,
    @Param('bookingId', ParseIntPipe) bookingId: number,
    @Body('orderId') orderId: string,
  ) {
    const booking = await this.bookingsService.findOne(bookingId);

    if (booking.userId !== req.user.id && req.user.role !== Role.ADMIN) {
      throw new ForbiddenException(
        'You do not have permission to verify payment for this booking',
      );
    }

    return this.lemonSqueezyService.verifyPayment(bookingId, orderId);
  }
}