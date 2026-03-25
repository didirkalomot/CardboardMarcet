import { IsNumber, Min, IsDateString, IsOptional } from 'class-validator';

export class CreateAuctionDto {
  @IsNumber()
  @Min(0)
  startPrice: number;

  @IsNumber()
  @Min(0.01)
  minBidStep: number;

  @IsDateString()
  endTime: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  buyNowPrice?: number;
}