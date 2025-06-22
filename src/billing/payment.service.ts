import {
  Injectable,
  BadRequestException,
  PayloadTooLargeException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { BookingsService } from '../bookings/bookings.service';

@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private bookingsService: BookingsService,
  ) {
    this.stripe = new Stripe(
      this.configService.getOrThrow('STRIPE_SECRET_KEY'),
      {
        apiVersion: '2023-10-16' as any,
      },
    );
  }

  async createPaymentIntent(
    bookingId: number,
  ): Promise<{ clientSecret: string }> {
    const booking = await this.bookingsService.findOne(bookingId);

    // Create a payment intent
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(booking.totalPrice * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        bookingId: booking.id.toString(),
        tourId: booking.tourId.toString(),
        userId: booking.userId.toString(),
      },
    });

    if (!paymentIntent.client_secret) {
      throw new BadRequestException(
        'Failed to create payment intent: client_secret is null',
      );
    }
    return { clientSecret: paymentIntent.client_secret };
  }

  async confirmPayment(
    bookingId: number,
    paymentIntentId: string,
  ): Promise<any> {
    // Retrieve the payment intent to verify its status
    const paymentIntent =
      await this.stripe.paymentIntents.retrieve(paymentIntentId);

    // Handle different payment statuses
    switch (paymentIntent.status) {
      case 'succeeded':
        // Payment is successful, update the booking
        return this.bookingsService.confirmPayment(bookingId, paymentIntentId);

      case 'processing':
        // Payment is still processing, provide a more informative message
        throw new UnprocessableEntityException(
          'Payment is still processing. Please check again later.',
        );

      case 'requires_payment_method':
        throw new BadRequestException(
          'Payment requires a payment method. Please provide payment details.',
        );

      case 'requires_confirmation':
        throw new BadRequestException(
          'Payment requires confirmation. Please confirm the payment.',
        );

      case 'requires_action':
      case 'requires_capture':
        throw new BadRequestException(
          'Payment requires additional action. Please complete the payment process.',
        );

      default:
        // For any other status, provide a more detailed error message
        throw new BadRequestException(
          `Payment is not complete. Current status: ${paymentIntent.status}`,
        );
    }
  }

  async createCheckoutSession(
    bookingId: number,
    successUrl: string,
    cancelUrl: string,
  ): Promise<{ url: string }> {
    const booking = await this.bookingsService.findOne(bookingId);
    const tour = booking.tour;

    // Create a checkout session
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: tour.title,
              description: `Booking for ${booking.numberOfPeople} people`,
              images: tour.images.slice(0, 1), // Use first image
            },
            unit_amount: Math.round(tour.price * 100), // Convert to cents
          },
          quantity: booking.numberOfPeople,
        },
      ],
      mode: 'payment',
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}&booking_id=${booking.id}`,
      cancel_url: `${cancelUrl}?booking_id=${booking.id}`,
      metadata: {
        bookingId: booking.id.toString(),
        tourId: booking.tourId.toString(),
        userId: booking.userId.toString(),
      },
    });

    if (!session.url) {
      throw new BadRequestException(
        'Failed to create checkout session: url is null',
      );
    }
    return { url: session.url };
  }

  async handleWebhook(payload: any, signature: string): Promise<void> {
    const webhookSecret = this.configService.getOrThrow(
      'STRIPE_WEBHOOK_SECRET',
    );

    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        if (!session.metadata) {
          throw new BadRequestException('Session metadata is null');
        }
        const bookingId = parseInt(session.metadata.bookingId);

        // Confirm the payment for the booking
        await this.bookingsService.confirmPayment(
          bookingId,
          session.payment_intent as string,
        );
      }
    } catch (error) {
      throw new BadRequestException(`Webhook error: ${error.message}`);
    }
  }

  async generateInvoice(bookingId: number): Promise<{ url: string }> {
    const booking = await this.bookingsService.findOne(bookingId);

    // Create an invoice item
    const invoiceItem = await this.stripe.invoiceItems.create({
      customer: await this.getOrCreateCustomer(
        booking.userId,
        booking.contactEmail,
      ),
      amount: Math.round(booking.totalPrice * 100), // Convert to cents
      currency: 'usd',
      description: `Booking #${booking.id} for ${booking.tour.title}`,
    });

    // Create an invoice
    const invoice = await this.stripe.invoices.create({
      customer: invoiceItem.customer as string,
      auto_advance: true, // Auto-finalize the invoice
      collection_method: 'send_invoice',
      days_until_due: 30,
    });

    if (!invoice.id) {
      throw new BadRequestException('Invoice ID is undefined');
    }

    // Finalize the invoice
    const finalizedInvoice = await this.stripe.invoices.finalizeInvoice(
      invoice.id,
    );

    if (!finalizedInvoice.id) {
      throw new BadRequestException('Finalized invoice ID is undefined');
    }

    // Send the invoice
    await this.stripe.invoices.sendInvoice(finalizedInvoice.id);

    if (!finalizedInvoice.hosted_invoice_url) {
      throw new BadRequestException('Finalized invoice URL is undefined');
    }

    return { url: finalizedInvoice.hosted_invoice_url };
  }

  private async getOrCreateCustomer(
    userId: number,
    email: string,
  ): Promise<string> {
    // In a real application, you would store the customer ID in your database
    // and retrieve it here if it exists. For simplicity, we'll create a new customer each time.
    const customer = await this.stripe.customers.create({
      email,
      metadata: {
        userId: userId.toString(),
      },
    });

    return customer.id;
  }
}
