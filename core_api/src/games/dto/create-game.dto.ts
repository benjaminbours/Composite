import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateSoloGameDto {
  @ApiProperty({ type: String })
  @IsString()
  region: string;
  // @ApiProperty({ enum: GameMode })
  // @IsEnum(GameMode)
  // mode: GameMode;
  // @ApiProperty({ type: Number })
  // @IsNumber()
  // levelId: number;
  // @ApiProperty({ enum: GameDevice })
  // @IsEnum(GameDevice)
  // deviceType: GameDevice;
  // @ApiProperty({ type: Number, required: false })
  // @IsNumber()
  // @IsOptional()
  // userId?: number;
}
