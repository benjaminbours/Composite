import { ApiProperty } from '@nestjs/swagger';
import { GameDevice, GameMode } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';

export class CreateGameDto {
  @ApiProperty({ enum: GameMode })
  @IsEnum(GameMode)
  mode: GameMode;

  @ApiProperty({ type: Number })
  @IsNumber()
  levelId: number;

  @ApiProperty({ enum: GameDevice })
  @IsEnum(GameDevice)
  deviceType: GameDevice;

  @ApiProperty({ type: Number, required: false })
  @IsNumber()
  @IsOptional()
  userId?: number;
}
