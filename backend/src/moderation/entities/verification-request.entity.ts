import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Card } from '../../cards/entities/card.entity';
import { User } from '../../users/entities/user.entity';

export enum RequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('verification_requests')
export class VerificationRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Card)
  card: Card;

  @Column()
  cardId: string;

  @ManyToOne(() => User)
  moderator: User;

  @Column({ nullable: true })
  moderatorId: string;

  @Column({ type: 'enum', enum: RequestStatus, default: RequestStatus.PENDING })
  status: RequestStatus;

  @Column({ nullable: true })
  certificateNumber: string;

  @Column({ nullable: true })
  comment: string;
}