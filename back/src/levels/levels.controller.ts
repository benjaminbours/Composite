import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { LevelsService } from './levels.service';
import { CreateLevelDto } from './dto/create-level.dto';
import { UpdateLevelDto } from './dto/update-level.dto';
import { GetUser, Public, Roles } from '@project-common/decorators';
import { Role } from '@prisma/client';
import { JWTUserPayload } from '@project-common/types';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { Level } from './entities/level.entity';

@ApiBearerAuth()
@Controller('levels')
export class LevelsController {
  constructor(private readonly levelsService: LevelsService) {}

  @ApiCreatedResponse({
    description: 'The purchase has been successfully created.',
    type: Level,
  })
  @Roles(Role.USER)
  @Post()
  create(
    @GetUser() user: JWTUserPayload,
    @Body() createLevelDto: CreateLevelDto,
  ) {
    return this.levelsService.create(user, createLevelDto);
  }

  @Public()
  @Get()
  findAll() {
    return this.levelsService.findAll();
  }

  @ApiOkResponse({
    description: 'Receive level',
    type: Level,
  })
  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.levelsService.findOne(+id);
  }

  @ApiOkResponse({
    description: 'The level has been successfully updated.',
    type: Level,
  })
  @Roles(Role.USER)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLevelDto: UpdateLevelDto) {
    return this.levelsService.update(+id, updateLevelDto);
  }

  @ApiOkResponse({
    description: 'The level has been successfully deleted.',
    type: Level,
  })
  @Roles(Role.USER)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.levelsService.remove(+id);
  }
}
