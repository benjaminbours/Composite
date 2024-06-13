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
import { UpsertRatingDto } from './dto/upsert-rating.dto';
import { Rating } from './entities/rating.entity';

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

  @ApiOkResponse({
    description: 'The rating has been successfully upserted.',
    type: Rating,
  })
  @Roles(Role.USER)
  @Post(':id/rating')
  upsertRating(
    @Param('id') id: string,
    @GetUser() user: JWTUserPayload,
    @Body() upsertRatingDto: UpsertRatingDto,
  ) {
    return this.levelsService.upsertRating(+id, user, upsertRatingDto);
  }

  @ApiOkResponse({
    description: 'Get the ratings for this level.',
    type: [Rating],
  })
  @Roles(Role.USER)
  @Get(':id/rating')
  getRatings(@Param('id') id: string, @GetUser() user: JWTUserPayload) {
    return this.levelsService.findRatings(+id, user);
  }

  @ApiCreatedResponse({
    description: 'The level has been successfully created.',
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
  @ApiQuery({
    name: 'stats',
    description: 'Include level stats',
    type: 'string',
    required: false,
  })
  @Public()
  @Get()
  findAll(
    @Query('author') author: string | undefined,
    @Query('status') status: string | undefined,
    @Query('stats') stats: string | undefined, // boolean
  ) {
    return this.levelsService.findAll(
      author ? Number(author) : undefined,
      status,
      Boolean(stats),
    );
  }

  @ApiOkResponse({
    description: 'Receive level',
    type: Level,
  })
  @ApiQuery({
    name: 'stats',
    description: 'Include level stats',
    type: 'string',
    required: false,
  })
  @Public()
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Query('stats') stats: string | undefined, // boolean
  ) {
    console.log('find one dude');
    return this.levelsService.findOne(+id, Boolean(stats));
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
