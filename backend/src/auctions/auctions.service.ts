import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Auction, AuctionStatus } from './entities/auction.entity';
import { Bid } from './entities/bid.entity';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { PlaceBidDto } from './dto/place-bid.dto';
import { Card } from '../cards/entities/card.entity';
import { User } from '../users/entities/user.entity';
import { AuctionsGateway } from './auctions.gateway';

@Injectable()
export class AuctionsService {
  constructor(
  @InjectRepository(Auction)
  private auctionsRepository: Repository<Auction>,
  @InjectRepository(Bid)
  private bidsRepository: Repository<Bid>,
  @InjectRepository(Card) // !!! здесь CardRepository
  private cardsRepository: Repository<Card>,
  private auctionsGateway: AuctionsGateway,
) {}

  async create(cardId: string, createAuctionDto: CreateAuctionDto, sellerId: string): Promise<Auction> {
    const card = await this.cardsRepository.findOne({ where: { id: cardId, sellerId } });
    if (!card) throw new NotFoundException('Card not found or not owned by you');
    if (card.auction) throw new BadRequestException('Card already has an auction');

    const auction = this.auctionsRepository.create({
      cardId,
      startPrice: createAuctionDto.startPrice,
      currentPrice: createAuctionDto.startPrice,
      minBidStep: createAuctionDto.minBidStep,
      endTime: new Date(createAuctionDto.endTime),
      buyNowPrice: createAuctionDto.buyNowPrice,
      startTime: new Date(),
    });
    await this.auctionsRepository.save(auction);

    card.auction = auction;
    await this.cardsRepository.save(card);

    return auction;
  }

  async findOne(id: string): Promise<Auction> {
    const auction = await this.auctionsRepository.findOne({
      where: { id },
      relations: ['card', 'bids', 'bids.user'],
    });
    if (!auction) throw new NotFoundException('Auction not found');
    return auction;
  }

  async placeBid(auctionId: string, userId: string, placeBidDto: PlaceBidDto): Promise<Bid> {
    const auction = await this.findOne(auctionId);
    if (auction.status !== AuctionStatus.ACTIVE) throw new BadRequestException('Auction is not active');
    if (auction.card.sellerId === userId) throw new ForbiddenException('You cannot bid on your own auction');
    if (new Date() > auction.endTime) throw new BadRequestException('Auction has ended');

    const amount = placeBidDto.amount;
    if (amount < auction.currentPrice + auction.minBidStep) {
      throw new BadRequestException(`Bid must be at least ${auction.currentPrice + auction.minBidStep}`);
    }
    if (auction.buyNowPrice && amount >= auction.buyNowPrice) {
      // Автоматическая победа по блиц-цене
      // Здесь можно сразу закрыть аукцион
    }

    // Анти-снайпинг: продление на 2 минуты, если ставка в последние 2 минуты
    const now = new Date();
    const twoMinutes = 2 * 60 * 1000;
    if (auction.endTime.getTime() - now.getTime() <= twoMinutes) {
      auction.endTime = new Date(now.getTime() + twoMinutes);
      await this.auctionsRepository.save(auction);
      this.auctionsGateway.notifyTimeExtended(auctionId, auction.endTime);
    }

    const bid = this.bidsRepository.create({
      auctionId,
      userId,
      amount,
    });
    await this.bidsRepository.save(bid);

    auction.currentPrice = amount;
    await this.auctionsRepository.save(auction);

    this.auctionsGateway.notifyNewBid(auctionId, bid);

    return bid;
  }

  async closeAuction(auctionId: string): Promise<void> {
    const auction = await this.findOne(auctionId);
    if (auction.status !== AuctionStatus.ACTIVE) return;

    const lastBid = await this.bidsRepository.findOne({
      where: { auctionId },
      order: { createdAt: 'DESC' },
    });
    if (lastBid) {
      // Здесь создаём заказ (orders) – можно добавить позже
      // ...
    }
    auction.status = AuctionStatus.CLOSED;
    await this.auctionsRepository.save(auction);
  }

  async checkAndCloseEndedAuctions(): Promise<void> {
    const endedAuctions = await this.auctionsRepository.find({
      where: {
        status: AuctionStatus.ACTIVE,
        endTime: LessThan(new Date()),
      },
    });
    for (const auction of endedAuctions) {
      await this.closeAuction(auction.id);
    }
  }
  async findUserBids(userId: string): Promise<any[]> {
  const bids = await this.bidsRepository.find({
    where: { userId },
    relations: ['auction', 'auction.card'],
    order: { createdAt: 'DESC' },
  });
  return bids.map(bid => ({
    id: bid.auction.id,
    cardTitle: bid.auction.card.title,
    currentPrice: bid.auction.currentPrice,
    status: bid.auction.status,
    endTime: bid.auction.endTime,
    myBid: bid.amount,
  }));
}
}