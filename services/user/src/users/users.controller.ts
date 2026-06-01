import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import {
  AuthenticatedRequest,
  Public,
  Roles,
  RolesGuard,
} from '@tikitu/common';
import { RegisterDto, UsersService } from './users.service';

@Controller('v1')
@UseGuards(RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post('register')
  async register(@Req() req: AuthenticatedRequest, @Body() body: RegisterDto) {
    return this.usersService.register(body, req.user);
  }

  @Get('profile')
  @Roles('user')
  async getProfile(@Req() req: AuthenticatedRequest) {
    return this.usersService.getProfile(req.user!.sub);
  }
}
