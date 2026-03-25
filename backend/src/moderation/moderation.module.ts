import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Card } from '../cards/entities/card.entity';
import { VerificationRequest } from './entities/verification-request.entity';
import { ModerationService } from './moderation.service';
import { ModerationController } from './moderation.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Card, VerificationRequest])],
  providers: [ModerationService],
  controllers: [ModerationController],
})
export class ModerationModule {}