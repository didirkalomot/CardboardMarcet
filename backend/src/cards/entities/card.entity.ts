import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Auction } from '../../auctions/entities/auction.entity';

export enum CardStatus {
  DRAFT = 'draft',
  MODERATION = 'moderation',
  ACTIVE = 'active',
  SOLD = 'sold',
  REJECTED = 'rejected',
}

export enum CardCondition {
  MINT = 'Mint',
  EXCELLENT = 'Excellent',
  GOOD = 'Good',
}

@Entity('cards')
export class Card {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  year: number;

  @Column({ nullable: true })
  publisher: string;

  @Column({ type: 'enum', enum: CardCondition, default: CardCondition.GOOD })
  condition: CardCondition;

  @Column({ type: 'simple-array', nullable: true })
  images: string[];

  @Column({ type: 'enum', enum: CardStatus, default: CardStatus.DRAFT })
  status: CardStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number;

  @ManyToOne(() => User, user => user.cards)
  seller: User;

  @Column()
  sellerId: string;

  @OneToOne(() => Auction, auction => auction.card, { nullable: true })
  @JoinColumn()
  auction: Auction;
}