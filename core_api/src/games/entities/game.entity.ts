import { ApiProperty } from '@nestjs/swagger';
import {
  GameDevice,
  GameMode,
  GameStatus,
  PlayerSide,
  Game as PrismaGame,
} from '@prisma/client';
import { User } from '../../users/entity';

export class Player {
  @ApiProperty()
  id: number;

  @ApiProperty({ type: String })
  createdAt: Date;

  @ApiProperty({ type: String })
  updatedAt: Date;

  @ApiProperty({ enum: PlayerSide })
  side: PlayerSide;

  @ApiProperty()
  userId: number;

  @ApiProperty({ type: User, required: false })
  user?: User;
}

export class Game implements PrismaGame {
  @ApiProperty()
  id: number;

  @ApiProperty({ enum: GameStatus })
  status: GameStatus;

  @ApiProperty()
  duration: number;

  @ApiProperty()
  startTime: number;

  @ApiProperty({ enum: GameMode })
  mode: GameMode;

  @ApiProperty({ enum: GameDevice })
  device: GameDevice;

  @ApiProperty()
  levelId: number;

  @ApiProperty({ type: String })
  createdAt: Date;

  @ApiProperty({ type: String })
  updatedAt: Date;

  @ApiProperty({ type: String, required: false })
  endLevelToken: string | null;

  @ApiProperty({ type: [Player], required: false })
  players?: any[];
}

export class CreateGameResponse {
  @ApiProperty({ type: [Number] })
  additionalExposedPorts: any[];

  @ApiProperty({ type: String })
  status: string;

  @ApiProperty({ type: String })
  roomId: string;

  @ApiProperty({ type: String })
  processId: string;
}
