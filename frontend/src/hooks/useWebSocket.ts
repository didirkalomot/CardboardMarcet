import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface BidData {
  id: string;
  amount: number;
  userId: string;
  createdAt: string;
  user?: { id: string; email: string };
}

export const useWebSocket = (auctionId: string) => {
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [bids, setBids] = useState<BidData[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io('http://localhost:3000', {
      transports: ['websocket'],
    });

    socketRef.current.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      socketRef.current?.emit('joinAuction', auctionId);
    });

    socketRef.current.on('newBid', (data: { currentPrice: number; bid: BidData }) => {
      setCurrentPrice(data.currentPrice);
      setBids((prev) => [data.bid, ...prev].slice(0, 20));
    });

    socketRef.current.on('auctionEnded', (data: { winnerId: string; winnerEmail: string; finalPrice: number }) => {
      console.log('Auction ended! Winner:', data.winnerEmail, 'Price:', data.finalPrice);
    });

    socketRef.current.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [auctionId]);

  return { currentPrice, bids, isConnected };
};