// User types
export interface User {
  id: string;
  email: string;
  role: 'collector' | 'verified_seller' | 'moderator' | 'admin';
  isVerified: boolean;
  rating: number;
  avatarUrl?: string;
}

// Card types
export type CardCondition = 'Mint' | 'Excellent' | 'Good';
export type CardStatus = 'draft' | 'moderation' | 'active' | 'sold' | 'rejected';

export interface Card {
  id: string;
  title: string;
  description?: string;
  year?: number;
  publisher?: string;
  condition: CardCondition;
  images: string[];
  status: CardStatus;
  price?: number;
  sellerId: string;
  seller?: User;
  auction?: Auction;
}

// Auction types
export type AuctionStatus = 'active' | 'closed' | 'cancelled';

export interface Auction {
  id: string;
  cardId: string;
  card?: Card;
  startPrice: number;
  currentPrice: number;
  minBidStep: number;
  startTime: string;
  endTime: string;
  status: AuctionStatus;
  buyNowPrice?: number;
  bids?: Bid[];
}

export interface Bid {
  id: string;
  auctionId: string;
  userId: string;
  amount: number;
  createdAt: string;
  user?: {
    id: string;
    email: string;
  };
}

// DTO types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
}

export interface CreateCardData {
  title: string;
  description?: string;
  year?: number;
  publisher?: string;
  condition?: CardCondition;
  price?: number;
}

export interface CreateAuctionData {
  startPrice: number;
  minBidStep: number;
  endTime: string;
  buyNowPrice?: number;
}

export interface PlaceBidData {
  amount: number;
}

// API Response types
export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface User {
  id: string;
  email: string;
  role: 'collector' | 'verified_seller' | 'moderator' | 'admin';
  isVerified: boolean;
  rating: number;
  avatarUrl?: string;
}