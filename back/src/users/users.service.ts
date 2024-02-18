// vendors
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
// project
import { handlePrismaError } from '@project-common/utils/handlePrismaError';
import { PrismaService } from '@project-common/services/prisma.service';
// local

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // async create(data: CreateUserDto): Promise<User> {
  //   const hash = await argon.hash(data.password);
  //   return this.prisma.user
  //     .create({
  //       data: {
  //         ...data,
  //         password: hash,
  //       },
  //     })
  //     .catch(handlePrismaError);
  // }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    // include?: Prisma.UserInclude;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.user
      .findMany({
        skip,
        take,
        cursor,
        where,
        orderBy,
        // include,
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          confirmationToken: true,
        },
      })
      .catch((err) => {
        throw handlePrismaError(err);
      });
  }

  async findOne(params: {
    where: Prisma.UserWhereUniqueInput;
    include?: Prisma.UserInclude;
  }) {
    const { where, include } = params;
    return this.prisma.user
      .findUniqueOrThrow({
        where,
        include,
      })
      .catch((err) => {
        throw handlePrismaError(err);
      });
  }

  // async update(params: {
  //   where: Prisma.UserWhereUniqueInput;
  //   data: Prisma.UserUpdateInput;
  // }): Promise<DeepPartial<User>> {
  //   const { data, where } = params;
  //   return this.prisma.user
  //     .update({
  //       data,
  //       where,
  //     })
  //     .then(cleanUser)
  //     .catch((err) => {
  //       throw handlePrismaError(err);
  //     });
  // }

  // async remove(where: Prisma.UserWhereUniqueInput): Promise<User> {
  //   return this.prisma.user
  //     .delete({
  //       where,
  //     })
  //     .catch(handlePrismaError);
  // }
}
