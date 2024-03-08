import { ApiProperty } from '@nestjs/swagger';
import { LevelStatus, Level as PrismaLevel } from '@prisma/client';

// export enum ElementType {
//   WALL = 'wall',
//   WALL_DOOR = 'wall_door',
//   DOOR_OPENER = 'door_opener',
//   ARCH = 'arch',
//   BOUNCE = 'bounce',
//   END_LEVEL = 'end_level',
//   FAT_COLUMN = 'fat_column',
// }

// export class LevelElement {
//   @ApiProperty({ type: String })
//   name: string;
//   @ApiProperty({ enum: ElementType })
//   type: ElementType;
//   @ApiProperty({ type: Object })
//   properties: any; // json
//   @ApiProperty({ type: Object })
//   mesh: any; // json
// }

export class Level implements PrismaLevel {
  @ApiProperty()
  id: number;
  @ApiProperty({ type: String })
  name: string;
  @ApiProperty({ type: Array })
  data: any; // json
  @ApiProperty()
  likes: number;
  @ApiProperty({ enum: LevelStatus })
  status: LevelStatus;
  @ApiProperty()
  userId: number;
  @ApiProperty({ type: String })
  createdAt: Date;
  @ApiProperty({ type: String })
  updatedAt: Date;
}
