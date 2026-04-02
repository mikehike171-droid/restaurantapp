import { Controller, Post, Body } from '@nestjs/common';
import { PublicAuthService } from './public-auth.service';
import { RegisterDto, LoginDto } from './dto/public-auth.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Public Auth')
@Controller('public-auth')
export class PublicAuthController {
  constructor(private readonly authService: PublicAuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new public user' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login as a public user' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
