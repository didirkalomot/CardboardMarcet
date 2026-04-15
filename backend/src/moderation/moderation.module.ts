import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Card } from '../cards/entities/card.entity';
import { VerificationRequest } from './entities/verification-request.entity';
import { User } from '../users/entities/user.entity'; // добавить
import { ModerationService } from './moderation.service';
import { ModerationController } from './moderation.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Card, VerificationRequest, User])],
  providers: [ModerationService],
  controllers: [ModerationController],
})
export class ModerationModule {}