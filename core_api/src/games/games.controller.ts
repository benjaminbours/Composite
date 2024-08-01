import { Controller, Post, Body } from '@nestjs/common';
import { GamesService } from './games.service';
import { Public } from '@project-common/decorators';
import { CreateSoloGameDto } from './dto/create-game.dto';
import { ApiOkResponse } from '@nestjs/swagger';
import { CreateGameResponse } from './entities/game.entity';

@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  // TODO: Add throttling to prevent spamming or I will pay a lot
  @ApiOkResponse({
    description: 'Create game room and return room connection data.',
    type: CreateGameResponse,
  })
  @Public()
  @Post('start')
  async createSoloGame(@Body() dto: CreateSoloGameDto) {
    return this.gamesService.createSoloGame(dto.region);
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

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.gamesService.remove(+id);
  // }
}
