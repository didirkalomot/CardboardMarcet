import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card, CardStatus } from '../cards/entities/card.entity';
import { VerificationRequest, RequestStatus } from './entities/verification-request.entity';

@Injectable()
export class ModerationService {
  constructor(
    @InjectRepository(Card)
    private cardsRepository: Repository<Card>,
    @InjectRepository(VerificationRequest)
    private verificationRequestsRepository: Repository<VerificationRequest>,
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
}