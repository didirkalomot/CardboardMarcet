import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AuctionsService } from './auctions.service';

@Injectable()
export class AuctionsCron {
  constructor(private auctionsService: AuctionsService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleClosedAuctions() {
    await this.auctionsService.checkAndCloseEndedAuctions();
  }
}