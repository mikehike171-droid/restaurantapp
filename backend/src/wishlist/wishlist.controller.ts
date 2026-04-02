import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';

@ApiTags('Wishlist')
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post('toggle')
  @ApiOperation({ summary: 'Toggle item in user wishlist' })
  toggle(@Body() body: { publicUserId: number; foodItemId: number }) {
    return this.wishlistService.toggleWishlist(body.publicUserId, body.foodItemId);
  }

  @Get('user/:publicUserId')
  @ApiOperation({ summary: 'Get user wishlist' })
  getUserWishlist(@Param('publicUserId', ParseIntPipe) publicUserId: number) {
    return this.wishlistService.getUserWishlist(publicUserId);
  }

  @Get('check/:publicUserId/:foodItemId')
  @ApiOperation({ summary: 'Check if item is in wishlist' })
  check(
    @Param('publicUserId', ParseIntPipe) publicUserId: number,
    @Param('foodItemId', ParseIntPipe) foodItemId: number,
  ) {
    return this.wishlistService.isItemInWishlist(publicUserId, foodItemId);
  }
}
