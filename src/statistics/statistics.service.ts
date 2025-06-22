import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Booking, BookingStatus } from '../bookings/entities/booking.entity';
import { User } from '../users/entities/user.entity';
import { Tour } from '../tours/entities/tour.entity';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Tour)
    private toursRepository: Repository<Tour>,
  ) {}

  /**
   * Get overall payment statistics
   */
  async getPaymentSummary() {
    // Get total number of bookings
    const totalBookings = await this.bookingsRepository.count();

    // Get total number of paid bookings
    const paidBookings = await this.bookingsRepository.count({
      where: { isPaid: true },
    });

    // Get total revenue
    const revenue = await this.bookingsRepository
      .createQueryBuilder('booking')
      .select('SUM(booking.totalPrice)', 'total')
      .where('booking.isPaid = :isPaid', { isPaid: true })
      .getRawOne();

    // Get total number of people booked
    const peopleBooked = await this.bookingsRepository
      .createQueryBuilder('booking')
      .select('SUM(booking.numberOfPeople)', 'total')
      .where('booking.isPaid = :isPaid', { isPaid: true })
      .getRawOne();

    // Get booking status counts
    const pendingBookings = await this.bookingsRepository.count({
      where: { status: BookingStatus.PENDING },
    });
    const confirmedBookings = await this.bookingsRepository.count({
      where: { status: BookingStatus.CONFIRMED },
    });
    const cancelledBookings = await this.bookingsRepository.count({
      where: { status: BookingStatus.CANCELLED },
    });
    const completedBookings = await this.bookingsRepository.count({
      where: { status: BookingStatus.COMPLETED },
    });

    return {
      totalBookings,
      paidBookings,
      revenue: revenue.total || 0,
      peopleBooked: peopleBooked.total || 0,
      bookingStatusCounts: {
        pending: pendingBookings,
        confirmed: confirmedBookings,
        cancelled: cancelledBookings,
        completed: completedBookings,
      },
    };
  }

  /**
   * Get payment statistics for a specific time period
   * @param startDate The start date of the period
   * @param endDate The end date of the period
   */
  async getPaymentStatsByPeriod(startDate: Date, endDate: Date) {
    // Get bookings in the period
    const bookings = await this.bookingsRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
    });

    // Get paid bookings in the period
    const paidBookings = bookings.filter((booking) => booking.isPaid);

    // Calculate revenue
    const revenue = paidBookings.reduce(
      (sum, booking) => sum + Number(booking.totalPrice),
      0,
    );

    // Calculate number of people booked
    const peopleBooked = paidBookings.reduce(
      (sum, booking) => sum + booking.numberOfPeople,
      0,
    );

    // Get unique users who made bookings
    const uniqueUserIds = [
      ...new Set(paidBookings.map((booking) => booking.userId)),
    ];

    return {
      totalBookings: bookings.length,
      paidBookings: paidBookings.length,
      revenue,
      peopleBooked,
      uniqueUsers: uniqueUserIds.length,
      period: {
        startDate,
        endDate,
      },
    };
  }

  /**
   * Get daily payment statistics
   * @param days Number of days to include (default: 7)
   */
  async getDailyPaymentStats(days: number = 7) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days + 1);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    const dailyStats = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayStart = new Date(currentDate);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);

      // Get bookings for the day
      const bookings = await this.bookingsRepository.find({
        where: {
          createdAt: Between(dayStart, dayEnd),
        },
      });

      // Get paid bookings for the day
      const paidBookings = bookings.filter((booking) => booking.isPaid);

      // Calculate revenue
      const revenue = paidBookings.reduce(
        (sum, booking) => sum + Number(booking.totalPrice),
        0,
      );

      // Calculate number of people booked
      const peopleBooked = paidBookings.reduce(
        (sum, booking) => sum + booking.numberOfPeople,
        0,
      );

      // Get unique users who made bookings
      const uniqueUserIds = [
        ...new Set(paidBookings.map((booking) => booking.userId)),
      ];

      // @ts-ignore
      dailyStats.push({
        date: new Date(currentDate),
        totalBookings: bookings.length,
        paidBookings: paidBookings.length,
        revenue,
        peopleBooked,
        uniqueUsers: uniqueUserIds.length,
      });

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return {
      dailyStats,
      period: {
        startDate,
        endDate,
      },
    };
  }

  /**
   * Get weekly payment statistics
   * @param weeks Number of weeks to include (default: 4)
   */
  async getWeeklyPaymentStats(weeks: number = 4) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - weeks * 7 + 1);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    const weeklyStats = [];
    const currentDate = new Date(startDate);

    for (let i = 0; i < weeks; i++) {
      const weekStart = new Date(currentDate);
      const weekEnd = new Date(currentDate);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      // Get bookings for the week
      const bookings = await this.bookingsRepository.find({
        where: {
          createdAt: Between(weekStart, weekEnd),
        },
      });

      // Get paid bookings for the week
      const paidBookings = bookings.filter((booking) => booking.isPaid);

      // Calculate revenue
      const revenue = paidBookings.reduce(
        (sum, booking) => sum + Number(booking.totalPrice),
        0,
      );

      // Calculate number of people booked
      const peopleBooked = paidBookings.reduce(
        (sum, booking) => sum + booking.numberOfPeople,
        0,
      );

      // Get unique users who made bookings
      const uniqueUserIds = [
        ...new Set(paidBookings.map((booking) => booking.userId)),
      ];

      // @ts-ignore
      weeklyStats.push({
        weekStart: new Date(weekStart),
        weekEnd: new Date(weekEnd),
        totalBookings: bookings.length,
        paidBookings: paidBookings.length,
        revenue,
        peopleBooked,
        uniqueUsers: uniqueUserIds.length,
      });

      // Move to next week
      currentDate.setDate(currentDate.getDate() + 7);
    }

    return {
      weeklyStats,
      period: {
        startDate,
        endDate,
      },
    };
  }

  /**
   * Get monthly payment statistics
   * @param months Number of months to include (default: 6)
   */
  async getMonthlyPaymentStats(months: number = 6) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months + 1);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    const monthlyStats = [];
    const currentDate = new Date(startDate);

    for (let i = 0; i < months; i++) {
      const monthStart = new Date(currentDate);
      const monthEnd = new Date(currentDate);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      monthEnd.setDate(0); // Last day of the month
      monthEnd.setHours(23, 59, 59, 999);

      // Get bookings for the month
      const bookings = await this.bookingsRepository.find({
        where: {
          createdAt: Between(monthStart, monthEnd),
        },
      });

      // Get paid bookings for the month
      const paidBookings = bookings.filter((booking) => booking.isPaid);

      // Calculate revenue
      const revenue = paidBookings.reduce(
        (sum, booking) => sum + Number(booking.totalPrice),
        0,
      );

      // Calculate number of people booked
      const peopleBooked = paidBookings.reduce(
        (sum, booking) => sum + booking.numberOfPeople,
        0,
      );

      const uniqueUserIds = [
        ...new Set(paidBookings.map((booking) => booking.userId)),
      ];
      // @ts-ignore
      monthlyStats.push({
        monthStart: new Date(monthStart),
        monthEnd: new Date(monthEnd),
        totalBookings: bookings.length,
        paidBookings: paidBookings.length,
        revenue,
        peopleBooked,
        uniqueUsers: uniqueUserIds.length,
      });

      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return {
      monthlyStats,
      period: {
        startDate,
        endDate,
      },
    };
  }

  /**
   * Get user payment statistics
   */
  async getUserPaymentStats() {
    // Get all users who have made bookings
    const bookings = await this.bookingsRepository.find({
      relations: ['user'],
    });

    // Group bookings by user
    const userBookings = {};
    bookings.forEach((booking) => {
      if (!userBookings[booking.userId]) {
        userBookings[booking.userId] = {
          userId: booking.userId,
          email: booking.user.email,
          firstName: booking.user.firstName,
          lastName: booking.user.lastName,
          totalBookings: 0,
          paidBookings: 0,
          totalSpent: 0,
          totalPeopleBooked: 0,
        };
      }

      userBookings[booking.userId].totalBookings++;

      if (booking.isPaid) {
        userBookings[booking.userId].paidBookings++;
        userBookings[booking.userId].totalSpent += Number(booking.totalPrice);
        userBookings[booking.userId].totalPeopleBooked +=
          booking.numberOfPeople;
      }
    });

    // Convert to array and sort by total spent
    const userStats = Object.values(userBookings).sort(
      (a: any, b: any) => b.totalSpent - a.totalSpent,
    );

    return {
      userStats,
      totalUsers: userStats.length,
    };
  }

  /**
   * Get tour booking statistics
   */
  async getTourBookingStats() {
    // Get all bookings with tour information
    const bookings = await this.bookingsRepository.find({
      relations: ['tour'],
    });

    // Group bookings by tour
    const tourBookings = {};
    bookings.forEach((booking) => {
      if (!tourBookings[booking.tourId]) {
        tourBookings[booking.tourId] = {
          tourId: booking.tourId,
          title: booking.tour.title,
          totalBookings: 0,
          paidBookings: 0,
          totalRevenue: 0,
          totalPeopleBooked: 0,
        };
      }

      tourBookings[booking.tourId].totalBookings++;

      if (booking.isPaid) {
        tourBookings[booking.tourId].paidBookings++;
        tourBookings[booking.tourId].totalRevenue += Number(booking.totalPrice);
        tourBookings[booking.tourId].totalPeopleBooked +=
          booking.numberOfPeople;
      }
    });

    // Convert to array and sort by total revenue
    const tourStats = Object.values(tourBookings).sort(
      (a: any, b: any) => b.totalRevenue - a.totalRevenue,
    );

    return {
      tourStats,
      totalTours: tourStats.length,
    };
  }
}
