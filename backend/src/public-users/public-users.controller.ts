import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { PublicUsersService } from './public-users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Public Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('public-users')
export class PublicUsersController {
  constructor(private readonly usersService: PublicUsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile & referral code' })
  getMe(@Request() req) {
    return this.usersService.getMe(req.user.userId);
  }

  @Get('coupons')
  @ApiOperation({ summary: 'Get users unused referral reward coupons' })
  getCoupons(@Request() req) {
    return this.usersService.getCoupons(req.user.userId);
  }
}
