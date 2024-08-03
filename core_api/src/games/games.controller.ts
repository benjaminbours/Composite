import { Controller, Post, Body, Patch, Param } from '@nestjs/common';
import { GamesService } from './games.service';
import { Roles } from '@project-common/decorators';
import { CreateGameDto } from './dto/create-game.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { FinishGameResponse, Game } from './entities/game.entity';
import { Role } from '@prisma/client';
import { UpdateGameDto } from './dto/update-game.dto';
import { FinishGameDto } from './dto/finish-game.dto';

@ApiBearerAuth()
@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  // // TODO: Add throttling to prevent spamming or I will pay a lot
  // @ApiOkResponse({
  //   description: 'Create game room and return room connection data.',
  //   type: CreateGameResponse,
  // })
  // @Public()
  // @Post('start')
  // async createSoloGame(@Body() dto: CreateSoloGameDto) {
  //   return this.gamesService.createSoloGame(dto.region);
  // }

  @ApiCreatedResponse({
    description: 'The game has been successfully created.',
    type: Game,
  })
  @Roles(Role.ADMIN)
  @Post()
  create(@Body() createGameDto: CreateGameDto) {
    return this.gamesService.create(createGameDto);
  }

  // @ApiCreatedResponse({
  //   description: 'The game has been successfully created.',
  //   type: Game,
  // })
  // @Public()
  // @Post('start')
  // async startGame(@Body() createGameDto: CreateGameDto) {
  //   return this.gamesService.create(createGameDto);
  // }

  // @ApiOkResponse({
  //   description: 'Receive updated game.',
  //   type: Game,
  // })
  // @Public()
  // @Post('end')
  // endGame(@Param('endGameToken') endGameToken: string) {
  //   return this.gamesService.endGame(endGameToken);
  // }

  // @Get()
  // findAll() {
  //   return this.gamesService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.gamesService.findOne(+id);
  // }

  @ApiOkResponse({
    description: 'The game has been successfully updated.',
    type: Game,
  })
  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGameDto: UpdateGameDto) {
    return this.gamesService.update(+id, updateGameDto);
  }

  @ApiOkResponse({
    description: 'The game has been successfully finished.',
    type: FinishGameResponse,
  })
  @Roles(Role.ADMIN)
  @Post(':id/finish')
  finishGame(@Param('id') id: string, @Body() finishGameDto: FinishGameDto) {
    return this.gamesService.finishGame(+id, finishGameDto.endTime);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.gamesService.remove(+id);
  // }
}
