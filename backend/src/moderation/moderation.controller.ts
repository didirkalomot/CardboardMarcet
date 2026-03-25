import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ModerationService } from './moderation.service';
import { RolesGuard } from '../auth/roles.guard'; // мы его не создавали, можно пока пропустить
import { UserRole } from '../users/entities/user.entity';
import { Roles } from '../auth/roles.decorator';

@Controller('moderation')
@UseGuards(AuthGuard('jwt'))
export class ModerationController {
  constructor(private moderationService: ModerationService) {}

  @Get('pending')
  async getPendingCards() {
    return this.moderationService.getPendingCards();
  }

  @Post('cards/:cardId/approve')
  async approveCard(
    @Param('cardId') cardId: string,
    @Body() body: { certificateNumber?: string; comment?: string },
    @Request() req,
  ) {
    return this.moderationService.approveCard(cardId, req.user.userId, body.certificateNumber, body.comment);
  }

  @Post('cards/:cardId/reject')
  async rejectCard(
    @Param('cardId') cardId: string,
    @Body() body: { comment?: string },
    @Request() req,
  ) {
    return this.moderationService.rejectCard(cardId, req.user.userId, body.comment);
  }
}