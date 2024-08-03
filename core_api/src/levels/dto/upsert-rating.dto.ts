import { ApiProperty } from '@nestjs/swagger';
import { RatingType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';

export class UpsertRatingDto {
  @ApiProperty({ type: Number })
  @IsNumber()
  @IsNotEmpty()
  rating: number;

  @ApiProperty({ enum: RatingType })
  @IsEnum(RatingType)
  @IsNotEmpty()
  type: RatingType;
}
