import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class FinishGameDto {
  @ApiProperty({ enum: Number })
  @IsNumber()
  endTime: number;
}
