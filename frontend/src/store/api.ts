import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from './store';
import type { Card, Auction, Bid } from '../types';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:3000/api',
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
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),
    getCards: builder.query<Card[], { search?: string; condition?: string; status?: string }>({
      query: (params) => ({
        url: '/cards',
        params,
      }),
      providesTags: ['Cards'],
    }),
    getCard: builder.query<Card, string>({
      query: (id) => `/cards/${id}`,
      providesTags: ['Cards'],
    }),
    createCard: builder.mutation({
      query: (formData) => ({
        url: '/cards',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Cards'],
    }),
    getAuctions: builder.query<Auction[], void>({
      query: () => '/auctions',
      providesTags: ['Auctions'],
    }),
    getAuction: builder.query<Auction, string>({
      query: (id) => `/auctions/${id}`,
      providesTags: ['Auctions'],
    }),
    placeBid: builder.mutation<Bid, { auctionId: string; amount: number }>({
      query: ({ auctionId, amount }) => ({
        url: `/auctions/${auctionId}/bid`,
        method: 'POST',
        body: { amount },
      }),
      invalidatesTags: ['Auctions', 'Bids'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetCardsQuery,
  useGetCardQuery,
  useCreateCardMutation,
  useGetAuctionsQuery,
  useGetAuctionQuery,
  usePlaceBidMutation,
} = api;