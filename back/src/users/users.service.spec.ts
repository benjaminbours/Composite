import { Test, TestingModule } from '@nestjs/testing';
// import { faker } from '@faker-js/faker';
import { UsersService } from './users.service';
import { UsersModule } from './users.module';
import { PrismaService } from '../common/services/prisma.service';
// import { NotFoundException } from '@nestjs/common';
import { prismaClient } from '../../test/prismaClient';

describe('ClientsService', () => {
  let service: UsersService;
  // let prismaService: PrismaService;

  // const fakeUserPayload = {
  //   id: 1,
  //   email: faker.internet.email(),
  //   firstName: faker.name.firstName(),
  //   lastName: faker.name.lastName(),
  //   password: faker.internet.password(),
  //   organizationId: 1,
  //   roleId: 1,
  // };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [UsersModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaClient)
      .compile();

    service = module.get<UsersService>(UsersService);
    // prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // it('should create a new user', async () => {
  //   prismaService.user.create = jest
  //     .fn()
  //     .mockReturnValueOnce(Promise.resolve(fakeUserPayload));
  //   const client = await service.create(fakeUserPayload);
  //   expect(client).toEqual(fakeUserPayload);
  // });

  // it('should find all users', async () => {
  //   prismaService.user.findMany = jest
  //     .fn()
  //     .mockReturnValueOnce(Promise.resolve([]));
  //   const clients = await service.findAll({});
  //   expect(clients.length).toEqual(0);
  // });

  // it('should find one user', async () => {
  //   prismaService.user.findUnique = jest
  //     .fn()
  //     .mockReturnValueOnce(Promise.resolve(fakeUserPayload));
  //   const client = await service.findOne({ where: { id: fakeUserPayload.id } });
  //   expect(client.email).toEqual(fakeUserPayload.email);
  // });

  // it('should not find one user', async () => {
  //   prismaService.user.findUnique = jest
  //     .fn()
  //     .mockReturnValueOnce(Promise.resolve(null));
  //   try {
  //     await service.findOne({ where: { id: fakeUserPayload.id } });
  //   } catch (error) {
  //     expect(error).toBeInstanceOf(NotFoundException);
  //   }
  // });

  // it('should update one user', async () => {
  //   const firstName = faker.name.firstName();
  //   prismaService.user.update = jest.fn().mockReturnValueOnce(
  //     Promise.resolve({
  //       ...fakeUserPayload,
  //       firstName,
  //     }),
  //   );
  //   const client = await service.update({
  //     where: { id: fakeUserPayload.id },
  //     data: { firstName },
  //   });
  //   expect(client.firstName).toEqual(firstName);
  // });

  // it('should delete one users', async () => {
  //   prismaService.user.delete = jest
  //     .fn()
  //     .mockReturnValueOnce(Promise.resolve(fakeUserPayload));
  //   const client = await service.remove({ id: fakeUserPayload.id });
  //   expect(client.id).toEqual(fakeUserPayload.id);
  // });
});
