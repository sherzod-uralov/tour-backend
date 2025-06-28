import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from './entities/contact.entity';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact)
    private contactsRepository: Repository<Contact>,
  ) {}

  async create(userId: number, createContactDto: CreateContactDto): Promise<Contact> {
    const contact = this.contactsRepository.create({
      ...createContactDto,
      userId,
    });
    return this.contactsRepository.save(contact);
  }

  async findAll(): Promise<Contact[]> {
    return this.contactsRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Contact> {
    const contact = await this.contactsRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    
    if (!contact) {
      throw new NotFoundException(`Contact inquiry with ID ${id} not found`);
    }
    
    return contact;
  }

  async findByUser(userId: number): Promise<Contact[]> {
    return this.contactsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: number, userId: number, userRole: string, updateContactDto: UpdateContactDto): Promise<Contact> {
    const contact = await this.findOne(id);
    
    // Only allow the user who created the contact or an admin to update it
    if (contact.userId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('You do not have permission to update this contact inquiry');
    }
    
    // Update contact properties
    Object.assign(contact, updateContactDto);
    
    return this.contactsRepository.save(contact);
  }

  async remove(id: number, userId: number, userRole: string): Promise<void> {
    const contact = await this.findOne(id);
    
    // Only allow the user who created the contact or an admin to delete it
    if (contact.userId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('You do not have permission to delete this contact inquiry');
    }
    
    await this.contactsRepository.remove(contact);
  }
}