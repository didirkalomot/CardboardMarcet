import { IsOptional, IsString } from 'class-validator';

export class VerifyUserDto {
  @IsOptional()
  @IsString()
  comment?: string;
}