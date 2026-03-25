import { Controller, Post, Body, Param, UseGuards, Request, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import { AuctionsService } from './auctions.service';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { PlaceBidDto } from './dto/place-bid.dto';

@Controller('auctions')
export class AuctionsController {
  constructor(private auctionsService: AuctionsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('card/:cardId')
  async create(
    @Param('cardId') cardId: string,
    @Body() createAuctionDto: CreateAuctionDto,
    @Request() req,
  ) {
    return this.auctionsService.create(cardId, createAuctionDto, req.user.userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.auctionsService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/bid')
  async placeBid(
    @Param('id') id: string,
    @Body() placeBidDto: PlaceBidDto,
    @Request() req,
  ) {
    return this.auctionsService.placeBid(id, req.user.userId, placeBidDto);
  }
}