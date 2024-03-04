// vendor
import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { Role } from '@prisma/client';
// project
import { SerializeService } from '@project-common/services/serialize.service';
import { Roles, GetUser } from '@project-common/decorators';
import { JWTUserPayload } from '@project-common/types';
// local
import { UsersService } from './users.service';
import { FindOneParams } from './dto/find-one.params';
import { User } from './entity';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly serializeService: SerializeService,
  ) {}

  @ApiOkResponse({
    description: 'Receive user profile',
    type: User,
  })
  @Roles(Role.ADMIN, Role.USER)
  @Get('profile')
  async getProfile(@GetUser() user: JWTUserPayload): Promise<User> {
    return this.usersService
      .findOne({
        where: {
          id: user.sub,
        },
      })
      .then(this.serializeService.serializeUser);
  }

  // @Roles(Role.Admin)
  // @Post()
  // create(@Body() userData: CreateUserDto) {
  //   // TODO: Check how to integrate EOSIO account creation here
  //   return this.usersService.create(userData);
  // }

  @ApiOkResponse({
    description: 'Receive user list',
    type: [User],
  })
  @Roles(Role.ADMIN)
  @Get()
  async findAll(): Promise<User[]> {
    return this.usersService
      .findAll({
        // include: response.locals.includeRelations || undefined,
      })
      .then((users) => users.map(this.serializeService.serializeUser));
  }

  @ApiOkResponse({
    description: 'Receive user',
    type: User,
  })
  @Roles(Role.ADMIN)
  @Get(':id')
  async findOne(@Param() params: FindOneParams): Promise<User> {
    return this.usersService
      .findOne({
        where: {
          id: Number(params.id),
        },
        // include: response.locals.includeRelations || undefined,
      })
      .then(this.serializeService.serializeUser);
  }

  // @Roles(Role.Admin)
  // @Patch(':id')
  // update(@Param() params: FindOneParams, @Body() updateUserDto: UpdateUserDto) {
  //   return this.usersService.update({
  //     where: {
  //       id: Number(params.id),
  //     },
  //     data: updateUserDto,
  //   });
  // }

  // @Roles(Role.Admin)
  // @Delete(':id')
  // remove(@Param() params: FindOneParams) {
  //   return this.usersService.remove({
  //     id: Number(params.id),
  //   });
  // }
}
