import { ApiProperty } from '@nestjs/swagger';
import { Rating as PrismaRating, RatingType } from '@prisma/client';

export class Rating implements PrismaRating {
  @ApiProperty({ type: Number })
  value: number;
  @ApiProperty({ enum: RatingType })
  type: RatingType;

  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: String })
  createdAt: Date;

  @ApiProperty({ type: String })
  updatedAt: Date;

  @ApiProperty({ type: Number })
  userId: number;

  @ApiProperty({ type: Number })
  levelId: number;

  @ApiProperty({ type: String })
  userLevelId: string;
}
