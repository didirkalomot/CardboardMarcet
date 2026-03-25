import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Card } from '../../cards/entities/card.entity';
import { Bid } from '../../auctions/entities/bid.entity';

export enum UserRole {
  COLLECTOR = 'collector',
  VERIFIED_SELLER = 'verified_seller',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.COLLECTOR })
  role: UserRole;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ type: 'float', default: 0 })
  rating: number;

  @Column({ nullable: true })
  avatarUrl: string;

  @OneToMany(() => Card, card => card.seller)
  cards: Card[];

  @OneToMany(() => Bid, bid => bid.user)
  bids: Bid[];
}