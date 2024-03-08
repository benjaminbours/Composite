import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateLevelDto {
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  name: string;
  // array of LevelElement from type in level editor
  @ApiProperty({ type: Array })
  @IsArray()
  data: any[];
}
