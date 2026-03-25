import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card, CardStatus } from './entities/card.entity';
import { CreateCardDto } from './dto/create-card.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card)
    private cardsRepository: Repository<Card>,
  ) {}

  async create(createCardDto: CreateCardDto, seller: User, files: Express.Multer.File[]): Promise<Card> {
    const imagePaths = files.map(file => `/uploads/${file.filename}`);
    const card = this.cardsRepository.create({
      ...createCardDto,
      seller,
      images: imagePaths,
      status: CardStatus.MODERATION,
    });
    return this.cardsRepository.save(card);
  }

  async findAllActive(): Promise<Card[]> {
    return this.cardsRepository.find({
      where: { status: CardStatus.ACTIVE },
      relations: ['seller', 'auction'],
    });
  }

  async findOne(id: string): Promise<Card> {
    const card = await this.cardsRepository.findOne({
      where: { id },
      relations: ['seller', 'auction'],
    });
    if (!card) throw new NotFoundException('Card not found');
    return card;
  }

  async updateStatus(id: string, status: CardStatus): Promise<Card> {
    const card = await this.findOne(id);
    card.status = status;
    return this.cardsRepository.save(card);
  }
}