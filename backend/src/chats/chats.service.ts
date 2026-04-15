import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from './entities/chat.entity';
import { Message } from './entities/message.entity';
import { User } from '../users/entities/user.entity';
import { Card } from '../cards/entities/card.entity';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(Chat)
    private chatRepo: Repository<Chat>,
    @InjectRepository(Message)
    private messageRepo: Repository<Message>,
  ) {}

  async getUserChats(userId: string): Promise<Chat[]> {
    return this.chatRepo.find({
      where: [{ sellerId: userId }, { buyerId: userId }],
      relations: ['card', 'seller', 'buyer', 'messages'],
      order: { createdAt: 'DESC' },
    });
  }

  async getChatById(chatId: string, userId: string): Promise<Chat> {
    const chat = await this.chatRepo.findOne({
      where: { id: chatId },
      relations: ['card', 'seller', 'buyer', 'messages'],
    });
    if (!chat) throw new NotFoundException('Chat not found');
    if (chat.sellerId !== userId && chat.buyerId !== userId)
      throw new ForbiddenException('Access denied');
    return chat;
  }

  async createChat(sellerId: string, buyerId: string, cardId: string): Promise<Chat> {
    const existing = await this.chatRepo.findOne({
      where: { sellerId, buyerId, cardId },
    });
    if (existing) return existing;
    const chat = this.chatRepo.create({ sellerId, buyerId, cardId });
    return this.chatRepo.save(chat);
  }

  async sendMessage(chatId: string, senderId: string, text: string, isSystem = false): Promise<Message> {
    const chat = await this.chatRepo.findOneBy({ id: chatId });
    if (!chat) throw new NotFoundException('Chat not found');
    const msg = this.messageRepo.create({ chatId, senderId, text, isSystem });
    return this.messageRepo.save(msg);
  }

  async getMessages(chatId: string, userId: string): Promise<Message[]> {
    await this.getChatById(chatId, userId); // проверка прав
    return this.messageRepo.find({
      where: { chatId },
      order: { createdAt: 'ASC' },
    });
  }

  async completeChat(chatId: string, userId: string): Promise<void> {
    const chat = await this.getChatById(chatId, userId);
    chat.isCompleted = true;
    await this.chatRepo.save(chat);
    await this.sendMessage(chatId, userId, 'Сделка завершена', true);
  }
}