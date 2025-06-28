# Testing Stripe Payment Integration with Postman

This guide provides step-by-step instructions on how to test the Stripe payment integration in the tourism website backend using Postman.

## Prerequisites

1. [Postman](https://www.postman.com/downloads/) installed on your computer
2. The tourism website backend running locally or deployed
3. A Stripe account (you can use test mode)

## Authentication

Before testing the payment endpoints, you need to authenticate with the API to get a JWT token.

### 1. Register a User (if you don't have an account)

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

### 2. Login to Get JWT Token

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

## Testing Payment Flow

### Step 1: Create a Booking

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

### Step 2: Create a Payment Intent

**Endpoint:** `POST /api/payments/create-payment-intent/{bookingId}`

**Headers:**
- Authorization: Bearer YOUR_JWT_TOKEN

**URL Parameters:**
- Replace `{bookingId}` with the ID of the booking you created

**Response:**
```json
{
  "clientSecret": "pi_3NqKn2HDTjwg0hqN1gYvXkSm_secret_YourClientSecret"
}
```

Save the client secret from the response. You'll need it to confirm the payment.

### Step 3: Confirm Payment

**Endpoint:** `POST /api/payments/confirm-payment/{bookingId}`

**Headers:**
- Authorization: Bearer YOUR_JWT_TOKEN

**URL Parameters:**
- Replace `{bookingId}` with the ID of the booking you created

**Request Body:**
```json
{
  "paymentIntentId": "pi_3NqKn2HDTjwg0hqN1gYvXkSm"
}
```

Note: The payment intent ID is the first part of the client secret (before the `_secret_` part).

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
  "paymentId": "pi_3NqKn2HDTjwg0hqN1gYvXkSm",
  "specialRequests": "No special requests",
  "contactPhone": "+1234567890",
  "contactEmail": "test@example.com",
  "createdAt": "2023-07-01T12:00:00.000Z",
  "updatedAt": "2023-07-01T12:00:00.000Z"
}
```

### Alternative: Create a Checkout Session

Instead of using payment intents directly, you can create a checkout session that redirects to Stripe's hosted checkout page.

**Endpoint:** `POST /api/payments/create-checkout-session/{bookingId}`

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
  "url": "https://checkout.stripe.com/c/pay/cs_test_YourCheckoutSessionId"
}
```

You can open this URL in a browser to complete the payment using Stripe's hosted checkout page.

## Testing Stripe Webhooks

To test Stripe webhooks locally, you can use the Stripe CLI to forward webhook events to your local server.

1. Install the [Stripe CLI](https://stripe.com/docs/stripe-cli)
2. Login to your Stripe account: `stripe login`
3. Forward webhook events to your local server: `stripe listen --forward-to http://localhost:3005/api/payments/webhook`
4. In a separate terminal, trigger a webhook event: `stripe trigger payment_intent.succeeded`

## Using Stripe Test Cards

When testing payments, you can use Stripe's test cards:

- **Successful payment**: 4242 4242 4242 4242
- **Authentication required**: 4000 0025 0000 3155
- **Payment declined**: 4000 0000 0000 9995

For all test cards:
- Use any future date for the expiration date (MM/YY)
- Use any 3-digit CVC
- Use any postal code

## Troubleshooting

### Common Issues

1. **Authentication errors**: Make sure you're including the JWT token in the Authorization header with the format `Bearer YOUR_JWT_TOKEN`.
2. **Booking not found**: Make sure you're using the correct booking ID in the URL.
3. **Payment intent not found**: Make sure you're using the correct payment intent ID in the request body.
4. **Webhook signature verification failed**: Make sure you're using the correct webhook secret in your environment variables.

### Stripe Test Mode vs. Live Mode

Make sure your application is configured to use Stripe's test mode when testing. This is controlled by the `STRIPE_SECRET_KEY` environment variable, which should start with `sk_test_` for test mode.

## Additional Resources

- [Stripe API Documentation](https://stripe.com/docs/api)
- [Stripe Testing Documentation](https://stripe.com/docs/testing)
- [Postman Documentation](https://learning.postman.com/docs/getting-started/introduction/)