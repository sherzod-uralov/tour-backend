import {
  Injectable,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { BookingsService } from '../bookings/bookings.service';
import { LsWebhookEvent } from './entities/ls-webhook-event.entity';
import { LsSubscriptionPlan } from './entities/ls-subscription-plan.entity';
import { LsUserSubscription } from './entities/ls-user-subscription.entity';
import { webhookHasMeta, webhookHasData } from './utils/webhook-validators';

@Injectable()
export class LemonSqueezyService {
  private readonly apiUrl = 'https://api.lemonsqueezy.com/v1';
  private readonly apiKey: string;
  private readonly storeId: string;
  private readonly webhookSecret: string;

  constructor(
    private configService: ConfigService,
    @Inject(forwardRef(() => BookingsService))
    private bookingsService: BookingsService,
    @InjectRepository(LsWebhookEvent)
    private webhookEventRepository: Repository<LsWebhookEvent>,
    @InjectRepository(LsSubscriptionPlan)
    private subscriptionPlanRepository: Repository<LsSubscriptionPlan>,
    @InjectRepository(LsUserSubscription)
    private userSubscriptionRepository: Repository<LsUserSubscription>,
  ) {
    this.apiKey = this.configService.getOrThrow('LEMON_SQUEEZY_API_KEY');
    this.storeId = this.configService.getOrThrow('LEMON_SQUEEZY_STORE_ID');
    this.webhookSecret = this.configService.getOrThrow(
      'LEMON_SQUEEZY_WEBHOOK_SECRET',
    );
  }

  async createCheckout(
    bookingId: number,
    successUrl: string,
    cancelUrl: string,
  ): Promise<{ url: string }> {
    const booking = await this.bookingsService.findOne(bookingId);
    const tour = booking.tour;

    // Log the product and variant IDs being used
    const variantId = tour.lemonSqueezyVariantId;
    const productId = tour.lemonSqueezyProductId;

    if (!variantId || !productId) {
      throw new BadRequestException('Tour is missing Lemon Squeezy product or variant ID');
    }

    console.log(
      `Creating checkout for tour ${tour.id} (${tour.title}) with Lemon Squeezy Product ID: ${productId}, Variant ID: ${variantId}`,
    );

    try {
      const response = await axios.post(
        `${this.apiUrl}/checkouts`,
        {
          data: {
            type: 'checkouts',
            attributes: {
              product_options: {
                name: tour.title,
                description: `Tour booking for ${booking.numberOfPeople} people`,
                redirect_url: successUrl,
                receipt_button_text: 'Return to Tour Booking',
                receipt_link_url: successUrl,
                receipt_thank_you_note: 'Thank you for your booking!',
              },
              checkout_options: {
                embed: false,
                media: false,
                logo: true,
              },
              checkout_data: {
                email: booking.user?.email || '',
                custom: {
                  booking_id: booking.id.toString(),
                  tour_id: booking.tourId.toString(),
                  user_id: booking.userId.toString(),
                },
              },
              expires_at: this.getExpirationDate(),
              preview: false,
            },
            relationships: {
              store: {
                data: {
                  type: 'stores',
                  id: this.storeId,
                },
              },
              variant: {
                data: {
                  type: 'variants',
                  id: variantId, // Using the extracted variant ID
                },
              },
            },
          },
        },
        {
          headers: {
            'Content-Type': 'application/vnd.api+json',
            Accept: 'application/vnd.api+json',
            Authorization: `Bearer ${this.apiKey}`,
          },
        },
      );

      const checkoutUrl = response.data?.data?.attributes?.url;

      if (!checkoutUrl) {
        throw new BadRequestException(
          'Failed to create checkout: URL not returned',
        );
      }

      return { url: checkoutUrl };
    } catch (error) {
      console.error(
        'Lemon Squeezy checkout error:',
        error.response?.data || error.message,
      );

      if (error.response?.data) {
        const errorMessage =
          error.response.data.errors?.[0]?.detail ||
          error.response.data.message ||
          'Unknown API error';
        throw new BadRequestException(
          `Lemon Squeezy API error: ${errorMessage}`,
        );
      }

      throw new BadRequestException(
        `Error creating checkout: ${error.message}`,
      );
    }
  }

  /**
   * Handle webhook events from Lemon Squeezy
   */
  async handleWebhook(payload: any): Promise<{ message: string }> {
    // Store webhook event in database
    const eventName = payload?.meta?.event_name || 'unknown_event';

    const storedEvent = await this.webhookEventRepository.create({
      eventName,
      processed: false,
      body: payload || {}, // Ensure body is never null by providing an empty object as fallback
    });

    await this.webhookEventRepository.save(storedEvent);

    try {
      if (!eventName) {
        throw new BadRequestException(
          'Invalid webhook payload: missing event name',
        );
      }

      console.log(`Received webhook event: ${eventName}`);

      let processingError = '';

      // Handle order creation
      if (eventName === 'order_created') {
        await this.handleOrderCreated(payload);
      }
      // Handle subscription events
      else if (eventName.startsWith('subscription_')) {
        if (webhookHasMeta(payload) && webhookHasData(payload)) {
          await this.handleSubscriptionEvent(payload);
        } else {
          processingError = 'Invalid subscription webhook payload structure';
        }
      }
      // Handle subscription payment events
      else if (eventName.startsWith('subscription_payment_')) {
        console.log('Subscription payment event - not fully implemented');
        // Save subscription invoices logic would go here
      }
      // Handle license key events
      else if (eventName.startsWith('license_')) {
        console.log('License key event - not implemented');
      }

      // Update the webhook event in the database
      await this.webhookEventRepository.update(
        { id: storedEvent.id },
        {
          processed: true,
          processingError,
        },
      );

      return { message: 'Webhook processed successfully' };
    } catch (error) {
      console.error('Webhook processing error:', error);

      // Update the webhook event in the database with the error
      await this.webhookEventRepository.update(
        { id: storedEvent.id },
        {
          processed: true,
          processingError: error.message,
        },
      );

      throw new BadRequestException(`Webhook error: ${error.message}`);
    }
  }

  private async handleOrderCreated(payload: any): Promise<void> {
    const orderData = payload?.data;

    if (!orderData) {
      throw new BadRequestException('Invalid order data in webhook');
    }

    const customData =
      orderData.attributes?.first_order_item?.custom_data ||
      orderData.attributes?.custom_data ||
      payload.meta?.custom_data;

    if (!customData?.booking_id) {
      console.warn('No booking ID found in webhook custom data');
      return;
    }

    const bookingId = parseInt(customData.booking_id);
    const orderId = orderData.id;
    const orderStatus = orderData.attributes?.status;

    console.log(
      `Processing order ${orderId} for booking ${bookingId}, status: ${orderStatus}`,
    );

    // Only confirm payment if order is paid
    if (orderStatus === 'paid') {
      await this.bookingsService.confirmPayment(bookingId, orderId);
      console.log(`Payment confirmed for booking ${bookingId}`);
    } else {
      console.log(`Order ${orderId} not yet paid, status: ${orderStatus}`);
    }
  }

  /**
   * Verify a payment manually
   */
  async verifyPayment(bookingId: number, orderId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.apiUrl}/orders/${orderId}`, {
        headers: {
          Accept: 'application/vnd.api+json',
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      const order = response.data?.data;

      if (!order) {
        throw new BadRequestException('Order not found');
      }

      const orderStatus = order.attributes?.status;
      const orderTotal = order.attributes?.total;

      console.log(
        `Order ${orderId} status: ${orderStatus}, total: ${orderTotal}`,
      );

      if (orderStatus === 'paid') {
        // Confirm payment in our system
        const result = await this.bookingsService.confirmPayment(
          bookingId,
          orderId,
        );
        return {
          message: 'Payment verified and confirmed',
          order: {
            id: orderId,
            status: orderStatus,
            total: orderTotal,
          },
          booking: result,
        };
      } else {
        throw new BadRequestException(
          `Payment verification failed. Order status: ${orderStatus}`,
        );
      }
    } catch (error) {
      console.error(
        'Payment verification error:',
        error.response?.data || error.message,
      );

      if (error.response?.data) {
        const errorMessage =
          error.response.data.errors?.[0]?.detail ||
          error.response.data.message ||
          'Unknown API error';
        throw new BadRequestException(
          `Lemon Squeezy API error: ${errorMessage}`,
        );
      }

      throw new BadRequestException(
        `Error verifying payment: ${error.message}`,
      );
    }
  }

  /**
   * Get an expiration date 24 hours from now
   */
  private getExpirationDate(): string {
    const date = new Date();
    date.setHours(date.getHours() + 24);
    return date.toISOString();
  }

  /**
   * Get store information
   */
  async getStoreInfo(): Promise<any> {
    try {
      const response = await axios.get(
        `${this.apiUrl}/stores/${this.storeId}`,
        {
          headers: {
            Accept: 'application/vnd.api+json',
            Authorization: `Bearer ${this.apiKey}`,
          },
        },
      );

      return response.data?.data;
    } catch (error) {
      console.error(
        'Error fetching store info:',
        error.response?.data || error.message,
      );
      throw new BadRequestException('Failed to fetch store information');
    }
  }

  /**
   * Get product and variant IDs for a tour
   *
   * Note: Lemon Squeezy API does not support creating products programmatically.
   * Products must be created manually through the Lemon Squeezy dashboard.
   *
   * IMPORTANT: To make tours visible in the Lemon Squeezy dashboard, you need to:
   * 1. Create a product manually in the Lemon Squeezy dashboard for each tour
   * 2. Note the product ID and variant ID
   * 3. Update the tour in the database with these IDs using the admin panel or API
   */
  async createProduct(
    tour: any,
  ): Promise<{ productId: string; variantId: string }> {
    try {
      // We no longer provide default product and variant IDs
      // These must be specified when creating a tour
      throw new BadRequestException(
        'Lemon Squeezy product and variant IDs must be provided when creating a tour. ' +
        'Create a product manually in the Lemon Squeezy dashboard and provide the IDs.'
      );
    } catch (error) {
      console.error('Error getting Lemon Squeezy product IDs:', error.message);
      throw new BadRequestException(
        `Error getting product IDs: ${error.message}`,
      );
    }
  }

  /**
   * Generate a slug from a title
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with a single one
      .trim();
  }

  /**
   * Handle subscription events from Lemon Squeezy
   */
  private async handleSubscriptionEvent(payload: any): Promise<void> {
    const attributes = payload.data.attributes;
    const variantId = `${attributes.variant_id}`;
    const userId = payload.meta.custom_data.user_id;

    // Find the subscription plan
    let plan = await this.subscriptionPlanRepository.findOne({
      where: { variantId: parseInt(variantId, 10) },
    });

    if (!plan) {
      // If plan doesn't exist, try to get price data from Lemon Squeezy
      const priceId = attributes.first_subscription_item.price_id;

      try {
        const priceResponse = await axios.get(
          `${this.apiUrl}/prices/${priceId}`,
          {
            headers: {
              Accept: 'application/vnd.api+json',
              Authorization: `Bearer ${this.apiKey}`,
            },
          },
        );

        const priceData = priceResponse.data?.data;

        if (!priceData) {
          throw new Error(`Failed to get price data for ID ${priceId}`);
        }

        // Get product data
        const productId = attributes.product_id;
        const productResponse = await axios.get(
          `${this.apiUrl}/products/${productId}`,
          {
            headers: {
              Accept: 'application/vnd.api+json',
              Authorization: `Bearer ${this.apiKey}`,
            },
          },
        );

        const productData = productResponse.data?.data;

        if (!productData) {
          throw new Error(`Failed to get product data for ID ${productId}`);
        }

        // Create the subscription plan
        plan = this.subscriptionPlanRepository.create({
          productId: parseInt(productId, 10),
          productName: productData.attributes.name,
          variantId: parseInt(variantId, 10),
          name: priceData.attributes.name || 'Subscription Plan',
          description: productData.attributes.description,
          price:
            priceData.attributes.unit_price_decimal ||
            priceData.attributes.unit_price.toString(),
          isUsageBased: attributes.first_subscription_item.is_usage_based,
          interval: priceData.attributes.interval,
          intervalCount: priceData.attributes.interval_count,
        });

        await this.subscriptionPlanRepository.save(plan);
      } catch (error) {
        console.error('Error creating subscription plan:', error);
        throw new Error(
          `Plan with variantId ${variantId} not found and could not be created.`,
        );
      }
    }

    // Get the price data for the subscription
    const priceId = attributes.first_subscription_item.price_id;
    let price: string;

    try {
      const priceResponse = await axios.get(
        `${this.apiUrl}/prices/${priceId}`,
        {
          headers: {
            Accept: 'application/vnd.api+json',
            Authorization: `Bearer ${this.apiKey}`,
          },
        },
      );

      const priceData = priceResponse.data?.data;

      if (!priceData) {
        throw new Error(`Failed to get price data for ID ${priceId}`);
      }

      const isUsageBased = attributes.first_subscription_item.is_usage_based;
      price = isUsageBased
        ? priceData.attributes.unit_price_decimal
        : priceData.attributes.unit_price.toString();
    } catch (error) {
      console.error('Error getting price data:', error);
      price = '0.00'; // Default price if we can't get the actual price
    }

    // Create or update the user subscription
    const subscriptionData = {
      lemonSqueezyId: payload.data.id,
      orderId: attributes.order_id,
      name: attributes.user_name || '',
      email: attributes.user_email || '',
      status: attributes.status,
      statusFormatted: attributes.status_formatted,
      renewsAt: attributes.renews_at,
      endsAt: attributes.ends_at,
      trialEndsAt: attributes.trial_ends_at,
      price,
      isUsageBased: attributes.first_subscription_item.is_usage_based,
      isPaused: false,
      subscriptionItemId: `${attributes.first_subscription_item.id}`,
      userId: parseInt(userId, 10),
      planId: plan.id,
    };

    try {
      await this.userSubscriptionRepository.upsert(subscriptionData, {
        conflictPaths: ['lemonSqueezyId'],
      });
    } catch (error) {
      console.error('Error upserting user subscription:', error);
      throw new Error(
        `Failed to create/update subscription for user ${userId}`,
      );
    }
  }
}
