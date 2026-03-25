import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auction } from './entities/auction.entity';
import { Bid } from './entities/bid.entity';
import { Card } from '../cards/entities/card.entity'; // импорт
import { AuctionsService } from './auctions.service';
import { AuctionsController } from './auctions.controller';
import { AuctionsGateway } from './auctions.gateway';
import { AuctionsCron } from './auctions.cron';
import { CardsModule } from '../cards/cards.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Auction, Bid, Card]), // добавили Card
    CardsModule,
  ],
  providers: [AuctionsService, AuctionsGateway, AuctionsCron],
  controllers: [AuctionsController],
})
export class AuctionsModule {}