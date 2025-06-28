import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Contacts')
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new contact inquiry (Authenticated users only)' })
  @ApiResponse({ status: 201, description: 'Contact inquiry successfully created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Request() req, @Body() createContactDto: CreateContactDto) {
    return this.contactsService.create(req.user.id, createContactDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all contact inquiries (Admin only)' })
  @ApiResponse({ status: 200, description: 'Return all contact inquiries' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  findAll() {
    return this.contactsService.findAll();
  }

  @Get('my-inquiries')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all contact inquiries for the current user' })
  @ApiResponse({ status: 200, description: 'Return all contact inquiries for the current user' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findMyInquiries(@Request() req) {
    return this.contactsService.findByUser(req.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get contact inquiry by ID' })
  @ApiResponse({ status: 200, description: 'Return the contact inquiry' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Contact inquiry not found' })
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    // The service will check if the user has permission to view this contact inquiry
    return this.contactsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update contact inquiry by ID' })
  @ApiResponse({ status: 200, description: 'Contact inquiry successfully updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - You do not have permission to update this contact inquiry' })
  @ApiResponse({ status: 404, description: 'Contact inquiry not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateContactDto: UpdateContactDto,
    @Request() req,
  ) {
    return this.contactsService.update(id, req.user.id, req.user.role, updateContactDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete contact inquiry by ID' })
  @ApiResponse({ status: 200, description: 'Contact inquiry successfully deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - You do not have permission to delete this contact inquiry' })
  @ApiResponse({ status: 404, description: 'Contact inquiry not found' })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.contactsService.remove(id, req.user.id, req.user.role);
  }
}