import { Controller, Get, Post, Body, Param, Put, Delete, Patch, UseGuards, Request, Query, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { SyncContactsDto } from './dto/sync-contacts.dto';
import { RegisterDeviceDto } from './dto/register-device.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.usersService.findAll();
  }

  @Get('search')
  @UseGuards(JwtAuthGuard)
  search(@Query('q') query: string) {
    return this.usersService.search(query);
  }

  @Get('totem/:id')
  @UseGuards(JwtAuthGuard)
  findByTotem(@Param('id') totemId: string) {
    return this.usersService.findByTotem(totemId);
  }

  @Post(':id/follow')
  @UseGuards(JwtAuthGuard)
  follow(@Param('id') id: string, @Request() req) {
    return this.usersService.follow(req.user.userId, id);
  }

  @Post(':id/unfollow')
  @UseGuards(JwtAuthGuard)
  unfollow(@Param('id') id: string, @Request() req) {
    return this.usersService.unfollow(req.user.userId, id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string, @Request() req) {
    // Pass current user ID to check isFollowing
    return this.usersService.findOne(id, req.user?.userId);
  }

  @Post('contacts/sync')
  @UseGuards(JwtAuthGuard)
  syncContacts(@Body() syncContactsDto: SyncContactsDto, @Request() req) {
    return this.usersService.syncContacts(syncContactsDto.hashes, req.user.userId);
  }

  @Post('devices/register')
  @UseGuards(JwtAuthGuard)
  registerDevice(@Body() registerDeviceDto: RegisterDeviceDto, @Request() req) {
    return this.usersService.registerDevice(req.user.userId, registerDeviceDto);
  }

  @Get('me/profile')
  @UseGuards(JwtAuthGuard)
  getMyProfile(@Request() req) {
    return this.usersService.findOne(req.user.userId);
  }

  @Patch('me/profile')
  @UseGuards(JwtAuthGuard)
  updateMyProfile(@Body() updateProfileDto: UpdateProfileDto, @Request() req) {
    return this.usersService.updateProfile(req.user.userId, updateProfileDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Request() req) {
    // Security: Ownership check - users can only update their own profile
    if (id !== req.user.userId) {
      throw new ForbiddenException('You can only update your own profile');
    }
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Request() req) {
    // Security: Ownership check - users can only delete their own account
    if (id !== req.user.userId) {
      throw new ForbiddenException('You can only delete your own account');
    }
    return this.usersService.remove(id);
  }
}
