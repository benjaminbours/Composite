import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UploadedFile,
  ParseFilePipeBuilder,
  HttpStatus,
  UseInterceptors,
} from '@nestjs/common';
import { LevelsService } from './levels.service';
import { CreateLevelDto } from './dto/create-level.dto';
import { UpdateLevelDto } from './dto/update-level.dto';
import { GetUser, Public, Roles } from '@project-common/decorators';
import { Role } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs';
import { JWTUserPayload } from '@project-common/types';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { Level } from './entities/level.entity';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiBearerAuth()
@Controller('levels')
export class LevelsController {
  constructor(private readonly levelsService: LevelsService) {}

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Upload thumbnail image for a level',
    type: String,
  })
  @Roles(Role.USER)
  @Post(':id/thumbnail')
  @UseInterceptors(FileInterceptor('file'))
  async uploadThumbnail(
    @GetUser() user: JWTUserPayload,
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: 'image/png',
        })
        .addMaxSizeValidator({
          maxSize: 1000000,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ) {
    await this.levelsService.checkUserHasAccessToLevel(+id, user);
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const fileName = `level_${id}_thumbnail.png`;
    fs.createWriteStream(path.join(uploadsDir, fileName)).write(file.buffer);
  }

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

  @ApiOkResponse({
    description: 'Receive level list',
    type: [Level],
  })
  @ApiQuery({
    name: 'status',
    description: 'Filter response by level status',
    type: 'string',
    enum: ['DRAFT', 'PUBLISHED'],
    required: false,
  })
  @ApiQuery({
    name: 'author',
    description: 'Filter response by author id',
    type: 'string',
    required: false,
  })
  @Public()
  @Get()
  findAll(
    @Query('author') author: string | undefined, // boolean
    @Query('status') status: string | undefined,
  ) {
    return this.levelsService.findAll(
      author ? Number(author) : undefined,
      status,
    );
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
  update(
    @Param('id') id: string,
    @GetUser() user: JWTUserPayload,
    @Body() updateLevelDto: UpdateLevelDto,
  ) {
    return this.levelsService.update(+id, updateLevelDto, user);
  }

  @ApiOkResponse({
    description: 'The level has been successfully deleted.',
    type: Level,
  })
  @Roles(Role.USER)
  @Delete(':id')
  remove(@Param('id') id: string, @GetUser() user: JWTUserPayload) {
    return this.levelsService.remove(+id, user);
  }
}
