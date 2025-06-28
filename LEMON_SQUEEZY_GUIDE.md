# Lemon Squeezy Payment Integration Guide

This guide provides step-by-step instructions on how to set up and use the Lemon Squeezy payment integration in the tourism website backend.

## Prerequisites

1. [Lemon Squeezy](https://www.lemonsqueezy.com/) account
2. The tourism website backend running locally or deployed
3. [Postman](https://www.postman.com/downloads/) (for testing)

## Setting Up Lemon Squeezy

### 1. Create a Lemon Squeezy Account

If you don't already have a Lemon Squeezy account, sign up at [lemonsqueezy.com](https://www.lemonsqueezy.com/).

### 2. Create a Store

1. Log in to your Lemon Squeezy account
2. Go to the Dashboard
3. Click on "Stores" in the sidebar
4. Click "Create a store"
5. Follow the prompts to set up your store

### 3. Create a Product

1. In your store dashboard, click on "Products"
2. Click "Create a product"
3. Choose "Standard product"
4. Fill in the product details:
   - Name: "Tour Booking"
   - Description: "Book a tour with us"
   - Price: Set a base price (this will be overridden by the API)
5. Click "Create product"

### 4. Get Your API Keys

1. Go to your account settings
2. Click on "API" in the sidebar
3. Click "Generate API key"
4. Copy the API key and store it securely
5. Note your Store ID from the Stores page
6. Note your Variant ID from the product you created

### 5. Update Environment Variables

Update your `.env` file with the following variables:

```
LEMON_SQUEEZY_API_KEY=your_lemon_squeezy_api_key_here
LEMON_SQUEEZY_STORE_ID=your_lemon_squeezy_store_id_here
LEMON_SQUEEZY_VARIANT_ID=your_lemon_squeezy_variant_id_here
LEMON_SQUEEZY_PRODUCT_ID=your_lemon_squeezy_product_id_here
LEMON_SQUEEZY_WEBHOOK_SECRET=your_lemon_squeezy_webhook_secret_here
```

**Important Note**: The Lemon Squeezy API does not support creating products programmatically. Products must be created manually through the Lemon Squeezy dashboard. 

When a tour is created in the system, it will be associated with the default product ID and variant ID specified in the environment variables. This means that all tours will use the same product in Lemon Squeezy by default, and individual tours will not be visible as separate products in the Lemon Squeezy dashboard.

### Making Tours Visible in the Lemon Squeezy Dashboard

To make each tour visible as a separate product in the Lemon Squeezy dashboard, you need to:

1. Create a product manually in the Lemon Squeezy dashboard for each tour:
   - Name the product after the tour (e.g., "Paris City Tour")
   - Set the description to match the tour description
   - Set a price (this will be overridden by the API when creating checkouts)

2. Note the product ID and variant ID from the Lemon Squeezy dashboard:
   - Product ID can be found in the URL when viewing the product (e.g., `https://app.lemonsqueezy.com/products/12345` - the ID is `12345`)
   - Variant ID can be found in the URL when editing a variant (e.g., `https://app.lemonsqueezy.com/products/12345/variants/67890` - the variant ID is `67890`)

3. Update the tour in the database with these IDs:
   - Use the admin panel to edit the tour
   - Set the "Lemon Squeezy Product ID" field to the product ID
   - Set the "Lemon Squeezy Variant ID" field to the variant ID
   - Save the tour

After completing these steps, when customers book this tour, the checkout will be created using the specific product and variant IDs associated with the tour, and the booking will be visible in the Lemon Squeezy dashboard under that specific product.

## Subscription Management

The system now supports Lemon Squeezy subscriptions. When a subscription-related webhook event is received, the system will:

1. Store the webhook event in the database
2. Create or update the subscription plan if needed
3. Create or update the user subscription

### Database Tables

The following tables are used for subscription management:

- `ls_subscription_plans`: Stores information about subscription plans
- `ls_user_subscriptions`: Stores information about user subscriptions
- `ls_webhook_events`: Stores all webhook events received from Lemon Squeezy

### Webhook Events

The system handles the following webhook events:

- `subscription_created`: When a new subscription is created
- `subscription_updated`: When a subscription is updated
- `subscription_cancelled`: When a subscription is cancelled
- `subscription_resumed`: When a subscription is resumed
- `subscription_expired`: When a subscription expires
- `subscription_paused`: When a subscription is paused
- `subscription_unpaused`: When a subscription is unpaused
- `subscription_payment_success`: When a subscription payment succeeds
- `subscription_payment_failed`: When a subscription payment fails
- `subscription_payment_recovered`: When a subscription payment is recovered

## Using Lemon Squeezy for Payments

### Authentication

Before testing the payment endpoints, you need to authenticate with the API to get a JWT token.

#### 1. Register a User (if you don't have an account)

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "email": "test@example.com",
  "password": "Password123",
  "firstName": "Test",
  "lastName": "User",
  "phoneNumber": "+1234567890"
}
```

#### 2. Login to Get JWT Token

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "test@example.com",
  "password": "Password123"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User",
    "role": "tourist"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Save the token from the response. You'll need to include it in the Authorization header for all subsequent requests.

### Payment Flow

#### Step 1: Create a Booking

Before you can test the payment system, you need to create a booking.

**Endpoint:** `POST /api/bookings`

**Headers:**
- Authorization: Bearer YOUR_JWT_TOKEN

**Request Body:**
```json
{
  "tourId": 1,
  "numberOfPeople": 2,
  "contactPhone": "+1234567890",
  "contactEmail": "test@example.com",
  "specialRequests": "No special requests"
}
```

**Response:**
```json
{
  "id": 1,
  "userId": 1,
  "tourId": 1,
  "numberOfPeople": 2,
  "totalPrice": 599.98,
  "status": "pending",
  "isPaid": false,
  "specialRequests": "No special requests",
  "contactPhone": "+1234567890",
  "contactEmail": "test@example.com",
  "createdAt": "2023-07-01T12:00:00.000Z",
  "updatedAt": "2023-07-01T12:00:00.000Z"
}
```

Save the booking ID from the response. You'll need it for the payment endpoints.

#### Step 2: Create a Lemon Squeezy Checkout

**Endpoint:** `POST /api/lemon-squeezy/create-checkout/{bookingId}`

**Headers:**
- Authorization: Bearer YOUR_JWT_TOKEN

**URL Parameters:**
- Replace `{bookingId}` with the ID of the booking you created

**Request Body:**
```json
{
  "successUrl": "https://example.com/success",
  "cancelUrl": "https://example.com/cancel"
}
```

**Response:**
```json
{
  "url": "https://checkout.lemonsqueezy.com/checkout/buy/12345-abcde-67890"
}
```

Open this URL in a browser to complete the payment using Lemon Squeezy's hosted checkout page.

#### Step 3: Verify Payment (Optional)

After completing the payment, you can verify it using the following endpoint:

**Endpoint:** `POST /api/lemon-squeezy/verify-payment/{bookingId}`

**Headers:**
- Authorization: Bearer YOUR_JWT_TOKEN

**URL Parameters:**
- Replace `{bookingId}` with the ID of the booking you created

**Request Body:**
```json
{
  "orderId": "order_12345"
}
```

**Response:**
```json
{
  "id": 1,
  "userId": 1,
  "tourId": 1,
  "numberOfPeople": 2,
  "totalPrice": 599.98,
  "status": "confirmed",
  "isPaid": true,
  "paymentId": "order_12345",
  "specialRequests": "No special requests",
  "contactPhone": "+1234567890",
  "contactEmail": "test@example.com",
  "createdAt": "2023-07-01T12:00:00.000Z",
  "updatedAt": "2023-07-01T12:00:00.000Z"
}
```

### Setting Up Webhooks

Lemon Squeezy can send webhook events to your application when certain events occur, such as when a payment is completed.

1. Go to your Lemon Squeezy account settings
2. Click on "Webhooks" in the sidebar
3. Click "Add webhook"
4. Enter your webhook URL: `https://your-api-domain.com/api/lemon-squeezy/webhook`
5. Select the events you want to receive (at minimum, select "Order Created")
6. Click "Create webhook"

## Troubleshooting

### Common Issues

1. **Authentication errors**: Make sure you're including the JWT token in the Authorization header with the format `Bearer YOUR_JWT_TOKEN`.
2. **Booking not found**: Make sure you're using the correct booking ID in the URL.
3. **API key errors**: Ensure your Lemon Squeezy API key, Store ID, and Variant ID are correctly set in your environment variables.
4. **Webhook errors**: Check that your webhook URL is publicly accessible and correctly configured in Lemon Squeezy.

### Lemon Squeezy Test Mode

Lemon Squeezy provides a test mode for development and testing. To use test mode:

1. Go to your store settings
2. Toggle on "Test mode"
3. Use the test credit card number: `4242 4242 4242 4242`
4. Use any future date for the expiration date
5. Use any 3-digit CVC
6. Use any name and billing address

## Additional Resources

- [Lemon Squeezy API Documentation](https://docs.lemonsqueezy.com/api)
- [Lemon Squeezy Webhooks Documentation](https://docs.lemonsqueezy.com/api/webhooks)
- [Lemon Squeezy Testing Documentation](https://docs.lemonsqueezy.com/help/testing)
