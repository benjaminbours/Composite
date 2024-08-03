import { ApiProperty } from '@nestjs/swagger';
import { GameStatus } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';

export class UpdateGameDto {
  @ApiProperty({ enum: Number, required: false })
  @IsNumber()
  @IsOptional()
  startTime?: number;

  @ApiProperty({ type: Number, required: false })
  @IsNumber()
  @IsOptional()
  duration?: number;

  @ApiProperty({ enum: GameStatus, required: false })
  @IsEnum(GameStatus)
  @IsOptional()
  status?: GameStatus;
}
