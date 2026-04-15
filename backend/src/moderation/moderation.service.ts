import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card, CardStatus } from '../cards/entities/card.entity';
import { VerificationRequest, RequestStatus } from './entities/verification-request.entity';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class ModerationService {
  constructor(
    @InjectRepository(Card)
    private cardsRepository: Repository<Card>,
    @InjectRepository(VerificationRequest)
    private verificationRequestsRepository: Repository<VerificationRequest>,
    @InjectRepository(User) 
    private usersRepository: Repository<User>
  ) {}

  async getPendingCards() {
    return this.cardsRepository.find({ where: { status: CardStatus.MODERATION }, relations: ['seller'] });
  }

  async approveCard(cardId: string, moderatorId: string, certificateNumber?: string, comment?: string) {
    const card = await this.cardsRepository.findOne({ where: { id: cardId } });
    if (!card) throw new Error('Card not found');
    card.status = CardStatus.ACTIVE;
    await this.cardsRepository.save(card);

    const request = this.verificationRequestsRepository.create({
      cardId,
      moderatorId,
      status: RequestStatus.APPROVED,
      certificateNumber,
      comment,
    });
    await this.verificationRequestsRepository.save(request);
    return card;
  }

  async rejectCard(cardId: string, moderatorId: string, comment?: string) {
    const card = await this.cardsRepository.findOne({ where: { id: cardId } });
    if (!card) throw new Error('Card not found');
    card.status = CardStatus.REJECTED;
    await this.cardsRepository.save(card);

    const request = this.verificationRequestsRepository.create({
      cardId,
      moderatorId,
      status: RequestStatus.REJECTED,
      comment,
    });
    await this.verificationRequestsRepository.save(request);
    return card;
  }
// 1. Получение заявок на верификацию
async getPendingVerifications(): Promise<VerificationRequest[]> {
  return this.verificationRequestsRepository.find({
    where: { status: RequestStatus.PENDING },
    relations: ['user'], // предполагаем, что есть связь с User
  });
}

// 2. Верификация продавца (обновляем роль пользователя)
async verifyUser(userId: string): Promise<void> {
  // Находим пользователя
  const user = await this.usersRepository.findOne({ where: { id: userId } });
  if (!user) throw new Error('User not found');
  
  // Меняем роль на verified_seller и устанавливаем флаг isVerified
  user.role = UserRole.VERIFIED_SELLER;  // или 'verified_seller'
  user.isVerified = true;
  await this.usersRepository.save(user);
  
  // Опционально: создаём запись в VerificationRequest об успешной верификации
  const request = this.verificationRequestsRepository.create({
    userId: userId,
    status: RequestStatus.APPROVED,
    comment: 'Seller verified by moderator',
  });
  await this.verificationRequestsRepository.save(request);
}
}