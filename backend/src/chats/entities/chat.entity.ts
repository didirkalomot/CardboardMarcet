import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Card } from '../../cards/entities/card.entity';
import { Message } from './message.entity';

@Entity('chats')
export class Chat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Card)
  card: Card;
  @Column()
  cardId: string;

  @ManyToOne(() => User)
  seller: User;
  @Column()
  sellerId: string;

  @ManyToOne(() => User)
  buyer: User;
  @Column()
  buyerId: string;

  @Column({ default: false })
  isCompleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Message, msg => msg.chat)
  messages: Message[];
}