import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking, BookingStatus } from './entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { ToursService } from '../tours/tours.service';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
    @Inject(forwardRef(() => ToursService))
    private toursService: ToursService,
  ) {}

  async create(
    userId: number,
    createBookingDto: CreateBookingDto,
  ): Promise<Booking> {
    // Get the tour to check availability and calculate price
    const tour = await this.toursService.findOne(createBookingDto.tourId);

    // Check if there are enough available seats
    if (tour.availableSeats < createBookingDto.numberOfPeople) {
      throw new BadRequestException('Not enough available seats for this tour');
    }

    // Calculate total price
    const totalPrice = tour.price * createBookingDto.numberOfPeople;

    // Create booking
    const booking = this.bookingsRepository.create({
      ...createBookingDto,
      userId,
      totalPrice,
      status: BookingStatus.PENDING,
      isPaid: false,
    });

    // Save booking
    const savedBooking = await this.bookingsRepository.save(booking);

    // Decrease available seats
    await this.toursService.decreaseAvailableSeats(
      tour.id,
      createBookingDto.numberOfPeople,
    );

    return savedBooking;
  }

  async findAll(): Promise<Booking[]> {
    return this.bookingsRepository.find();
  }

  async findByUser(userId: number): Promise<Booking[]> {
    return this.bookingsRepository.find({ where: { userId } });
  }

  async findByTour(tourId: number): Promise<Booking[]> {
    return this.bookingsRepository.find({ where: { tourId } });
  }

  async findOne(id: number): Promise<Booking> {
    const booking = await this.bookingsRepository.findOne({ where: { id } });
    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }
    return booking;
  }

  async update(
    id: number,
    updateBookingDto: UpdateBookingDto,
  ): Promise<Booking> {
    const booking = await this.findOne(id);

    // If number of people is being updated, adjust tour available seats
    if (
      updateBookingDto.numberOfPeople &&
      updateBookingDto.numberOfPeople !== booking.numberOfPeople
    ) {
      const tour = await this.toursService.findOne(booking.tourId);

      // Calculate the difference in number of people
      const diff = updateBookingDto.numberOfPeople - booking.numberOfPeople;

      if (diff > 0) {
        // More people are being added, check if there are enough seats
        if (tour.availableSeats < diff) {
          throw new BadRequestException(
            'Not enough available seats for this tour',
          );
        }

        // Decrease available seats
        await this.toursService.decreaseAvailableSeats(tour.id, diff);
      } else if (diff < 0) {
        // People are being removed, increase available seats
        await this.toursService.increaseAvailableSeats(tour.id, Math.abs(diff));
      }

      // Update total price
      updateBookingDto['totalPrice'] =
        tour.price * updateBookingDto.numberOfPeople;
    }

    // If status is being updated to CANCELLED, increase available seats
    if (
      updateBookingDto.status === BookingStatus.CANCELLED &&
      booking.status !== BookingStatus.CANCELLED
    ) {
      await this.toursService.increaseAvailableSeats(
        booking.tourId,
        booking.numberOfPeople,
      );
    }

    // Update booking properties
    Object.assign(booking, updateBookingDto);

    return this.bookingsRepository.save(booking);
  }

  async remove(id: number): Promise<void> {
    const booking = await this.findOne(id);

    // Prevent deletion of paid bookings
    if (booking.isPaid) {
      throw new BadRequestException('Paid bookings cannot be deleted');
    }

    // If booking is not cancelled, increase available seats
    if (booking.status !== BookingStatus.CANCELLED) {
      await this.toursService.increaseAvailableSeats(
        booking.tourId,
        booking.numberOfPeople,
      );
    }

    await this.bookingsRepository.remove(booking);
  }

  async confirmPayment(id: number, paymentId: string): Promise<Booking> {
    const booking = await this.findOne(id);

    booking.paymentId = paymentId;
    booking.isPaid = true;
    booking.status = BookingStatus.CONFIRMED;

    return this.bookingsRepository.save(booking);
  }

  async cancelBooking(id: number): Promise<Booking> {
    const booking = await this.findOne(id);

    // If booking is not already cancelled, increase available seats
    if (booking.status !== BookingStatus.CANCELLED) {
      await this.toursService.increaseAvailableSeats(
        booking.tourId,
        booking.numberOfPeople,
      );
    }

    booking.status = BookingStatus.CANCELLED;

    return this.bookingsRepository.save(booking);
  }

  async completeBooking(id: number): Promise<Booking> {
    const booking = await this.findOne(id);

    booking.status = BookingStatus.COMPLETED;

    return this.bookingsRepository.save(booking);
  }
}
