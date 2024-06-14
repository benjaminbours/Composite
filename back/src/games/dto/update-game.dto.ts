import { ApiProperty } from '@nestjs/swagger';
import { GameStatus } from '@prisma/client';
import { IsEnum, IsNumber } from 'class-validator';

export class UpdateGameDto {
  @ApiProperty({ type: Number })
  @IsNumber()
  duration: number;

  @ApiProperty({ enum: GameStatus })
  @IsEnum(GameStatus)
  status: GameStatus;
}
