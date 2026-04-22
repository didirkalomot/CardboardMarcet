import { IsString, IsOptional, IsNumber, IsEnum, Min, IsBoolean, IsDateString } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { CardCondition } from '../entities/card.entity';

export class CreateCardDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  year?: number;

  @IsOptional()
  @IsString()
  publisher?: string;

  @IsOptional()
  @IsEnum(CardCondition)
  condition?: CardCondition;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price?: number;

  // Для аукциона – эти поля приходят из формы, но в бэкенде они обрабатываются отдельно
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  startPrice?: number;

  @IsOptional()
  @IsDateString()
  endTime?: string;

  @IsOptional()
  @IsBoolean()
  isAuction?: boolean;
}