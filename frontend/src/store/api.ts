import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from './store';
import type {
  Card,
  Auction,
  Bid,
  LoginCredentials,
  RegisterData,
  CreateCardData,
  CreateAuctionData,
  PlaceBidData,
  AuthResponse,
  User
} from '../types';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:3000',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Cards', 'Auctions', 'Bids'],
  endpoints: (builder) => ({
    // Auth
    login: builder.mutation<AuthResponse, LoginCredentials>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation<AuthResponse, RegisterData>({
      query: (data) => ({
        url: '/auth/register',
        method: 'POST',
        body: data,
      }),
    }),
    getProfile: builder.query<User, void>({
      query: () => '/auth/profile',
    }),

    // Cards
    getCards: builder.query<Card[], void>({
      query: () => '/cards',
      providesTags: ['Cards'],
    }),
    getCard: builder.query<Card, string>({
      query: (id) => `/cards/${id}`,
      providesTags: ['Cards'],
    }),
    createCard: builder.mutation<Card, { data: CreateCardData; images: File[] }>({
      query: ({ data, images }) => {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, value.toString());
          }
        });
        images.forEach((img) => formData.append('images', img));
        return {
          url: '/cards',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Cards'],
    }),

    // Auctions
    getAuction: builder.query<Auction, string>({
      query: (id) => `/auctions/${id}`,
      providesTags: ['Auctions'],
    }),
    createAuction: builder.mutation<Auction, { cardId: string; data: CreateAuctionData }>({
      query: ({ cardId, data }) => ({
        url: `/auctions/card/${cardId}`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Auctions', 'Cards'],
    }),
    placeBid: builder.mutation<Bid, { auctionId: string; data: PlaceBidData }>({
      query: ({ auctionId, data }) => ({
        url: `/auctions/${auctionId}/bid`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Auctions', 'Bids'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetProfileQuery,
  useGetCardsQuery,
  useGetCardQuery,
  useCreateCardMutation,
  useGetAuctionQuery,
  useCreateAuctionMutation,
  usePlaceBidMutation,
} = api;