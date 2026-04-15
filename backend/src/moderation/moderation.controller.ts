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

   @Get('pending-cards')
  async getPendingCards() {
    return this.moderationService.getPendingCards();
  }

  
  @Post('cards/:cardId/approve')
async approveCard(@Param('cardId') cardId: string, @Body() body: any, @Request() req) {
  const moderatorId = req.user.userId; // или req.user.id – зависит от вашей стратегии
  return this.moderationService.approveCard(cardId, moderatorId, body.certificateNumber, body.comment);
}

  @Post('cards/:cardId/reject')
  async rejectCard(@Param('cardId') cardId: string, @Body() body, @Request() req) {
    return this.moderationService.rejectCard(cardId, req.user.userId, body.comment);
  }

  
  @Get('pending-verifications')
  async getPendingVerifications() {
    return this.moderationService.getPendingVerifications();
  }

  
  @Post('verify-user/:userId')
  async verifyUser(@Param('userId') userId: string) {
    await this.moderationService.verifyUser(userId);
    return { success: true };
  }
}