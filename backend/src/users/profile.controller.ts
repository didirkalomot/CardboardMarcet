import { Controller, Get, Patch, Body, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { AuctionsService } from '../auctions/auctions.service';
import { ChatsService } from '../chats/chats.service';
import { CardsService } from '../cards/cards.service';

@Controller() // без префикса, чтобы эндпоинты были /profile, /profile/auctions и т.д.
@UseGuards(AuthGuard('jwt'))
export class ProfileController {
  constructor(
    private readonly usersService: UsersService,
    private readonly auctionsService: AuctionsService,
    private readonly chatsService: ChatsService,
    private readonly cardsService: CardsService,
  ) {}

  @Get('profile')
  @UseGuards(AuthGuard('jwt')) 
  async getProfile(@Request() req) {
    const user = await this.usersService.findOneById(req.user.userId);
    if (!user) throw new Error('User not found');
    return {
      email: user.email,
      ratingBuyer: user.rating,
      ratingSeller: user.rating,
    };
  }

  @Patch('profile/password')
  async changePassword(@Request() req, @Body() body: { oldPassword: string; newPassword: string }) {
    await this.usersService.changePassword(req.user.userId, body.oldPassword, body.newPassword);
    return { success: true };
  }

  @Get('profile/auctions')
  @UseGuards(AuthGuard('jwt')) 
  async getUserAuctions(@Request() req) {
    return this.auctionsService.findUserBids(req.user.userId);
  }

  @Get('profile/chats')
  async getUserChats(@Request() req) {
    return this.chatsService.getUserChats(req.user.userId);
  }

  @Get('seller/cards')
  async getSellerCards(@Request() req) {
    return this.cardsService.findBySellerId(req.user.userId);
  }
}