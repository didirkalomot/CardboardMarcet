export interface Card {
  id: string;
  title: string;
  description: string;
  year: number;
  publisher?: string;
  condition: 'Mint' | 'Excellent' | 'Good';
  images: string[];
  price?: number;
  status: 'draft' | 'moderation' | 'active' | 'sold';
  sellerId: string;
  createdAt: string;
}

export interface Auction {
  id: string;
  cardId: string;
  card?: Card;
  startPrice: number;
  currentPrice: number;
  minBidStep: number;
  startTime: string;
  endTime: string;
  status: 'active' | 'closed' | 'cancelled';
  buyNowPrice?: number;
}

export interface Bid {
  id: string;
  auctionId: string;
  userId: string;
  amount: number;
  createdAt: string;
  user?: {
    email: string;
  };
}

export interface User {
  id: string;
  email: string;
  role: 'guest' | 'seller' | 'admin';
  rating: number;
  isVerified: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
}