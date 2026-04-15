import { IsUUID } from 'class-validator';

export class CreateChatDto {
  @IsUUID()
  sellerId: string;

  @IsUUID()
  cardId: string;
}