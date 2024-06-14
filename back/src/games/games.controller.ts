import { Controller, Get, Param, Delete } from '@nestjs/common';
import { GamesService } from './games.service';
// import { CreateGameDto } from './dto/create-game.dto';
// import { UpdateGameDto } from './dto/update-game.dto';
// import { Game } from './entities/game.entity';
// import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
// import { Public } from '@project-common/decorators';

@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

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

  @Get()
  findAll() {
    return this.gamesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gamesService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.gamesService.remove(+id);
  }
}
