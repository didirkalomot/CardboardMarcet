import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Inject } from '@nestjs/common';
import Redis from 'ioredis';

@WebSocketGateway({ cors: { origin: 'http://localhost:3000' } })
export class AuctionsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private redisSubscriber: Redis;
  private redisPublisher: Redis;

  constructor(@Inject('REDIS_CLIENT') private redisClient: Redis) {
    this.redisSubscriber = this.redisClient.duplicate();
    this.redisPublisher = this.redisClient.duplicate();

    this.redisSubscriber.subscribe('auction');
    this.redisSubscriber.on('message', (channel, message) => {
      if (channel === 'auction') {
        const data = JSON.parse(message);
        this.server.to(`auction-${data.auctionId}`).emit('newBid', data.bid);
      }
    });
  }

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }

  @SubscribeMessage('joinAuction')
  handleJoinAuction(@MessageBody() auctionId: string, @ConnectedSocket() client: Socket) {
    client.join(`auction-${auctionId}`);
  }

  @SubscribeMessage('leaveAuction')
  handleLeaveAuction(@MessageBody() auctionId: string, @ConnectedSocket() client: Socket) {
    client.leave(`auction-${auctionId}`);
  }

  notifyNewBid(auctionId: string, bid: any) {
    this.redisPublisher.publish(
      'auction',
      JSON.stringify({ auctionId, bid }),
    );
    this.server.to(`auction-${auctionId}`).emit('newBid', bid);
  }

  notifyTimeExtended(auctionId: string, newEndTime: Date) {
    this.redisPublisher.publish(
      'auction',
      JSON.stringify({ auctionId, type: 'timeExtended', newEndTime }),
    );
    this.server.to(`auction-${auctionId}`).emit('timeExtended', newEndTime);
  }
}