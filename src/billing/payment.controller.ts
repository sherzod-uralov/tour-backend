import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
  Headers,
  RawBodyRequest,
  Req,
  Get,
  Query,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
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
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { BookingsService } from '../bookings/bookings.service';

@ApiTags('Payments')
@Controller('payments')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly bookingsService: BookingsService,
  ) {}

  @Post('create-payment-intent/:bookingId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a payment intent for a booking' })
  @ApiParam({
    name: 'bookingId',
    type: Number,
    description: 'The ID of the booking',
  })
  @ApiResponse({
    status: 200,
    description: 'Return the payment intent client secret',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async createPaymentIntent(
    @Request() req,
    @Param('bookingId', ParseIntPipe) bookingId: number,
  ) {
    const booking = await this.bookingsService.findOne(bookingId);

    // Check if the user is the owner of the booking or an admin
    if (booking.userId !== req.user.id && req.user.role !== Role.ADMIN) {
      throw new ForbiddenException(
        'You do not have permission to create a payment for this booking',
      );
    }

    return this.paymentService.createPaymentIntent(bookingId);
  }

  @Post('confirm-payment/:bookingId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confirm payment for a booking' })
  @ApiParam({
    name: 'bookingId',
    type: Number,
    description: 'The ID of the booking',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        paymentIntentId: { type: 'string', example: 'pi_123456789' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Payment successfully confirmed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async confirmPayment(
    @Request() req,
    @Param('bookingId', ParseIntPipe) bookingId: number,
    @Body('paymentIntentId') paymentIntentId: string,
  ) {
    const booking = await this.bookingsService.findOne(bookingId);

    // Check if the user is the owner of the booking or an admin
    if (booking.userId !== req.user.id && req.user.role !== Role.ADMIN) {
      throw new ForbiddenException(
        'You do not have permission to confirm payment for this booking',
      );
    }

    return this.paymentService.confirmPayment(bookingId, paymentIntentId);
  }

  @Post('create-checkout-session/:bookingId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a checkout session for a booking' })
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
  @ApiResponse({ status: 200, description: 'Return the checkout session URL' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async createCheckoutSession(
    @Request() req,
    @Param('bookingId', ParseIntPipe) bookingId: number,
    @Body('successUrl') successUrl: string,
    @Body('cancelUrl') cancelUrl: string,
  ) {
    const booking = await this.bookingsService.findOne(bookingId);

    // Check if the user is the owner of the booking or an admin
    if (booking.userId !== req.user.id && req.user.role !== Role.ADMIN) {
      throw new ForbiddenException(
        'You do not have permission to create a checkout session for this booking',
      );
    }

    return this.paymentService.createCheckoutSession(
      bookingId,
      successUrl,
      cancelUrl,
    );
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Handle Stripe webhook events' })
  @ApiResponse({
    status: 200,
    description: 'Webhook event processed successfully',
  })
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.paymentService.handleWebhook(req.rawBody, signature);
  }

  @Post('generate-invoice/:bookingId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate an invoice for a booking (Admin only)' })
  @ApiParam({
    name: 'bookingId',
    type: Number,
    description: 'The ID of the booking',
  })
  @ApiResponse({ status: 200, description: 'Return the invoice URL' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  generateInvoice(@Param('bookingId', ParseIntPipe) bookingId: number) {
    return this.paymentService.generateInvoice(bookingId);
  }
}
