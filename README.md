# Tourism API - NestJS Backend

A complete backend API for a tourism website designed to sell travel packages to foreign users visiting Uzbekistan. Built with NestJS, TypeORM, and PostgreSQL.

## Features

- **Authentication**
  - Tourist registration and login
  - Admin login (seeded)
  - JWT-based session management

- **User Management**
  - Tourist profile management
  - Admin dashboard user listing

- **Tour Packages**
  - CRUD operations for tour packages
  - Categories (historical, cultural, eco, luxury, etc.)
  - Tour availability based on dates

- **Booking System**
  - Book tours with specified number of people
  - Automatic seat availability management
  - Booking status tracking (pending, confirmed, cancelled, completed)

- **Payment Processing**
  - Integration with Stripe for payments
  - Integration with Lemon Squeezy for payments
  - Support for payment intents and checkout sessions
  - Invoice generation

- **Admin Dashboard**
  - View all users, tours, and bookings
  - Manage tour packages
  - Process payments and generate invoices
  - Access comprehensive payment and booking statistics

## Tech Stack

- **Backend**: NestJS, TypeORM
- **Database**: PostgreSQL
- **Authentication**: JWT, bcrypt
- **Payment**: Stripe API, Lemon Squeezy API
- **Documentation**: Swagger/OpenAPI

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL
- Stripe account (for Stripe payment processing)
- Lemon Squeezy account (for Lemon Squeezy payment processing)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/tourism-api.git
   cd tourism-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_USERNAME=postgres
   DATABASE_PASSWORD=postgres
   DATABASE_NAME=tourism_db
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRATION=1d

   # Stripe configuration
   STRIPE_SECRET_KEY=your_stripe_secret_key_here
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here

   # Lemon Squeezy configuration
   LEMON_SQUEEZY_API_KEY=your_lemon_squeezy_api_key_here
   LEMON_SQUEEZY_STORE_ID=your_lemon_squeezy_store_id_here
   LEMON_SQUEEZY_VARIANT_ID=your_lemon_squeezy_variant_id_here
   ```

4. Start the application:
   ```bash
   # development
   npm run start

   # watch mode
   npm run start:dev

   # production mode
   npm run start:prod
   ```

## Database Seeding

The application automatically seeds the database with:
- An admin user (email: admin@example.com, password: Admin123)
- Sample tour packages

## API Documentation

Once the application is running, you can access the Swagger documentation at:
```
http://localhost:3000/api/docs
```

## Payment Integration Guides

- **Stripe**: See the `STRIPE_TESTING_GUIDE.md` file for instructions on testing Stripe payments.
- **Lemon Squeezy**: See the `LEMON_SQUEEZY_GUIDE.md` file for instructions on setting up and testing Lemon Squeezy payments.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new tourist
- `POST /api/auth/login` - Login for tourists and admins

### Users
- `GET /api/users/profile` - Get current user profile
- `PATCH /api/users/profile` - Update current user profile
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/tourists` - Get all tourists (Admin only)
- `GET /api/users/:id` - Get user by ID (Admin only)
- `PATCH /api/users/:id` - Update user by ID (Admin only)
- `DELETE /api/users/:id` - Delete user by ID (Admin only)

### Tours
- `GET /api/tours` - Get all active tours
- `GET /api/tours/admin` - Get all tours including inactive ones (Admin only)
- `GET /api/tours/category/:category` - Get tours by category
- `GET /api/tours/available` - Get tours with available seats
- `GET /api/tours/date-range` - Get tours within a date range
- `GET /api/tours/:id` - Get tour by ID
- `POST /api/tours` - Create a new tour (Admin only)
- `PATCH /api/tours/:id` - Update tour by ID (Admin only)
- `DELETE /api/tours/:id` - Delete tour by ID (Admin only)

### Bookings
- `POST /api/bookings` - Create a new booking
- `GET /api/bookings/my-bookings` - Get current user bookings
- `GET /api/bookings` - Get all bookings (Admin only)
- `GET /api/bookings/tour/:tourId` - Get bookings by tour ID (Admin only)
- `GET /api/bookings/:id` - Get booking by ID
- `PATCH /api/bookings/:id` - Update booking by ID
- `DELETE /api/bookings/:id` - Delete booking by ID (Admin only)
- `POST /api/bookings/:id/cancel` - Cancel booking
- `POST /api/bookings/:id/complete` - Mark booking as completed (Admin only)

### Payments (Stripe)
- `POST /api/payments/create-payment-intent/:bookingId` - Create a payment intent
- `POST /api/payments/confirm-payment/:bookingId` - Confirm payment
- `POST /api/payments/create-checkout-session/:bookingId` - Create a checkout session
- `POST /api/payments/webhook` - Handle Stripe webhook events
- `POST /api/payments/generate-invoice/:bookingId` - Generate an invoice (Admin only)

### Payments (Lemon Squeezy)
- `POST /api/lemon-squeezy/create-checkout/:bookingId` - Create a Lemon Squeezy checkout
- `POST /api/lemon-squeezy/verify-payment/:bookingId` - Verify a Lemon Squeezy payment
- `POST /api/lemon-squeezy/webhook` - Handle Lemon Squeezy webhook events

### Statistics (Admin only)
- `GET /api/statistics/payments/summary` - Get overall payment statistics
- `GET /api/statistics/payments/daily` - Get daily payment statistics
- `GET /api/statistics/payments/weekly` - Get weekly payment statistics
- `GET /api/statistics/payments/monthly` - Get monthly payment statistics
- `GET /api/statistics/payments/period` - Get payment statistics for a specific period
- `GET /api/statistics/payments/users` - Get user payment statistics
- `GET /api/statistics/bookings/tours` - Get tour booking statistics

## License

This project is licensed under the MIT License - see the LICENSE file for details.
