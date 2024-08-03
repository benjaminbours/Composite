import { ElementType, LevelElement } from '@benjaminbours/composite-core';
import { ApiProperty } from '@nestjs/swagger';
import { LevelStatus, Level as PrismaLevel } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { Game } from '../../games/entities/game.entity';
import { Rating } from './rating.entity';

export class Element implements Omit<LevelElement, 'mesh' | 'id'> {
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  name: string;
  @ApiProperty({ enum: ElementType })
  @IsEnum(ElementType)
  type: ElementType;
  @ApiProperty({ type: Object })
  @IsObject()
  properties: any; // json
  @ApiProperty({ type: Boolean, required: false })
  @IsBoolean()
  @IsOptional()
  isLocked?: boolean;
}

class Author {
  @ApiProperty({ type: String })
  name: string;
}

export class Level implements PrismaLevel {
  @ApiProperty()
  id: number;
  @ApiProperty({ type: String })
  name: string;
  @ApiProperty({ type: [Element] })
  data: any; // json Element[]
  @ApiProperty({ type: [Number] })
  lightStartPosition: number[];
  @ApiProperty({ type: [Number] })
  shadowStartPosition: number[];
  @ApiProperty()
  likes: number;
  @ApiProperty({ enum: LevelStatus })
  status: LevelStatus;
  @ApiProperty()
  authorId: number;
  @ApiProperty({ type: String })
  createdAt: Date;
  @ApiProperty({ type: String })
  updatedAt: Date;
  @ApiProperty({ type: Author, required: false })
  author?: Author;
  @ApiProperty({ type: () => [Game], required: false })
  games?: Game[];
  @ApiProperty({ type: [Rating], required: false })
  ratings?: Rating[];
  @ApiProperty({ type: 'object', required: false })
  _count?: any;
  @ApiProperty({ type: String, required: false })
  thumbnail: string | null;
}
