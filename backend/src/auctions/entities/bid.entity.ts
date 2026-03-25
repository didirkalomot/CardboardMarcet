import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Auction } from './auction.entity';
import { User } from '../../users/entities/user.entity';

@Entity('bids')
export class Bid {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Auction, auction => auction.bids)
  auction: Auction;

  @Column()
  auctionId: string;

  @ManyToOne(() => User)
  user: User;

  @Column()
  userId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}