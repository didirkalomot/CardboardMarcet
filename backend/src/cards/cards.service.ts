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

  async create(createCardDto: CreateCardDto, seller: any, files: Express.Multer.File[]): Promise<Card> {
   const imagePaths = files.map(file => `/uploads/${file.filename}`);
   const card = this.cardsRepository.create({
     ...createCardDto,
     seller: { id: seller.userId } as User,   // связываем по id
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

  async updateStatus(cardId: string, status: CardStatus): Promise<Card> {
    const card = await this.findOne(cardId);
    if (!card) throw new Error('Card not found');
    card.status = status;
    return this.cardsRepository.save(card);
  }
	
  async findBySellerId(sellerId: string): Promise<Card[]> {
   return this.cardsRepository.find({ where: { sellerId }, select: ['id', 'title', 'price', 'status'] });
 }
  async searchByTitle(title: string): Promise<Card[]> {
   return this.cardsRepository
     .createQueryBuilder('card')
     .where('card.title ILIKE :title', { title: `%${title}%` })
     .andWhere('card.status = :status', { status: 'active' })
     .leftJoinAndSelect('card.seller', 'seller')
     .getMany();
 }
}