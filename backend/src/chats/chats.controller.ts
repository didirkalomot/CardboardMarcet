import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('chats')
@UseGuards(AuthGuard('jwt'))
export class ChatsController {
  constructor(private chatsService: ChatsService) {}

  @Get()
  async getUserChats(@Request() req) {
    return this.chatsService.getUserChats(req.user.userId);
  }

  @Post()
  async createChat(@Request() req, @Body() dto: CreateChatDto) {
    return this.chatsService.createChat(dto.sellerId, req.user.userId, dto.cardId);
  }

  @Get(':chatId/messages')
  async getMessages(@Param('chatId') chatId: string, @Request() req) {
    return this.chatsService.getMessages(chatId, req.user.userId);
  }

  @Post(':chatId/messages')
  async sendMessage(@Param('chatId') chatId: string, @Body() dto: SendMessageDto, @Request() req) {
    return this.chatsService.sendMessage(chatId, req.user.userId, dto.text);
  }

  @Post(':chatId/complete')
  async completeChat(@Param('chatId') chatId: string, @Request() req) {
    await this.chatsService.completeChat(chatId, req.user.userId);
    return { success: true };
  }
}