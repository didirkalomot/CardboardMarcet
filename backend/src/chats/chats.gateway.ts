import { WebSocketGateway, WebSocketServer, SubscribeMessage, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatsService } from './chats.service';
import { UseGuards } from '@nestjs/common';
//import { WsJwtGuard } from '../auth/ws-jwt.guard'; // или свой guard

@WebSocketGateway({ cors: { origin: 'http://localhost:3000' } })
export class ChatsGateway {
  @WebSocketServer()
  server: Server;

  constructor(private chatsService: ChatsService) {}

  @SubscribeMessage('joinChat')
  handleJoinChat(@ConnectedSocket() client: Socket, @MessageBody() chatId: string) {
    client.join(`chat-${chatId}`);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(@ConnectedSocket() client: Socket, @MessageBody() payload: { chatId: string; text: string; userId: string }) {
    const message = await this.chatsService.sendMessage(payload.chatId, payload.userId, payload.text);
    this.server.to(`chat-${payload.chatId}`).emit('newMessage', message);
  }
}