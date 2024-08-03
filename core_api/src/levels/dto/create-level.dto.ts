import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsString,
  ValidateNested,
  ArrayMaxSize,
  ArrayMinSize,
} from 'class-validator';
import { Element } from '../entities/level.entity';
import { Type } from 'class-transformer';

export class CreateLevelDto {
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  name: string;
  // array of LevelElement from type in level editor
  @ApiProperty({ type: [Element] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Element)
  data: Element[];

  @ApiProperty({ type: [Number] })
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  lightStartPosition: number[];

  @ApiProperty({ type: [Number] })
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  shadowStartPosition: number[];
}
