import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateLevelDto } from './create-level.dto';
import { LevelStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateLevelDto extends PartialType(CreateLevelDto) {
  @ApiProperty({ enum: LevelStatus, required: false })
  @IsEnum(LevelStatus)
  @IsOptional()
  status?: LevelStatus;
}
