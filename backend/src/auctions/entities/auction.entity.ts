import { Entity, Column, PrimaryGeneratedColumn, OneToOne, OneToMany, JoinColumn } from 'typeorm';
import { Card } from '../../cards/entities/card.entity';
import { Bid } from './bid.entity';

export enum AuctionStatus {
  ACTIVE = 'active',
  CLOSED = 'closed',
  CANCELLED = 'cancelled',
}

@Entity('auctions')
export class Auction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Card, card => card.auction)
  @JoinColumn()
  card: Card;

  @Column()
  cardId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  startPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  currentPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  minBidStep: number;

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp' })
  endTime: Date;

  @Column({ type: 'enum', enum: AuctionStatus, default: AuctionStatus.ACTIVE })
  status: AuctionStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  buyNowPrice: number;

  @OneToMany(() => Bid, bid => bid.auction)
  bids: Bid[];
}