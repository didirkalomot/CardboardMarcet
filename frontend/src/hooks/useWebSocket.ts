import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface BidData {
  id: string;
  amount: number;
  userId: string;
  createdAt: string;
  user?: { email: string };
}

export const useWebSocket = (auctionId: string) => {
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [bids, setBids] = useState<BidData[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io('http://localhost:3000', {
      transports: ['websocket'],
    });

    socketRef.current.on('connect', () => {
      console.log('WebSocket connected');
      socketRef.current?.emit('joinAuction', auctionId);
    });

    socketRef.current.on('newBid', (data: { currentPrice: number; bid: BidData }) => {
      setCurrentPrice(data.currentPrice);
      setBids((prev) => [data.bid, ...prev].slice(0, 20)); // последние 20 ставок
    });

    socketRef.current.on('auctionEnded', (data: { winner: string; price: number }) => {
      console.log('Auction ended! Winner:', data.winner, 'Price:', data.price);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [auctionId]);

  return { currentPrice, bids };
};