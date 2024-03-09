import { ElementType, LevelElement } from '@benjaminbours/composite-core';
import { ApiProperty } from '@nestjs/swagger';
import { LevelStatus, Level as PrismaLevel } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsObject, IsString } from 'class-validator';

export class Element implements Omit<LevelElement, 'mesh'> {
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
}

export class Level implements PrismaLevel {
  @ApiProperty()
  id: number;
  @ApiProperty({ type: String })
  name: string;
  @ApiProperty({ type: [Element] })
  data: any; // json Element[]
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
}