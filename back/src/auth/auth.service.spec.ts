import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import * as argon from 'argon2';
import { faker } from '@faker-js/faker';
import { AuthService } from './auth.service';
import { AuthModule } from './auth.module';
import { PrismaService } from '../common/services/prisma.service';
import { User } from '@prisma/client';

describe('AuthService', () => {
  let authService: AuthService;
  let prismaService: PrismaService;
  let user: Partial<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    prismaService.user.update = jest.fn().mockImplementation((params) => {
      user.hashedRefreshToken = params.data.hashedRefreshToken;
    });
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  // TODO: Some call are made to the database in these unit tests. It should not

  // getTokens

  it('should get tokens', async () => {
    const tokens = await authService.getTokens(
      faker.datatype.number(),
      faker.internet.email(),
    );
    expect(tokens).toHaveProperty('access_token');
    expect(tokens).toHaveProperty('refresh_token');
  });

  // updateRefreshToken

  // TODO: check this test
  // it('should update refresh token for user', async () => {
  //   const fakeToken = 'test-token';
  //   user = {
  //     hashedRefreshToken: null,
  //   };
  //   await authService.updateRefreshTokenHash(1, fakeToken);
  //   const isMatch = await argon.verify(user.hashedRefreshToken, fakeToken);
  //   expect(isMatch).toEqual(true);
  // });

  // signIn

  it('should sign in an existing user with correct password', async () => {
    const password = faker.internet.password();
    user = {
      id: faker.datatype.number({ precision: 1 }),
      email: faker.internet.email(),
      password: await argon.hash(password),
      hashedRefreshToken: null,
    };
    prismaService.user.findUnique = jest.fn().mockReturnValueOnce(user);
    const result = await authService.signIn({
      email: user.email as string,
      password: password,
    });
    expect(result).toHaveProperty('access_token');
    expect(result).toHaveProperty('refresh_token');
  });

  it('should not sign in an existing user with incorrect password', async () => {
    const password = faker.internet.password();
    const otherPassword = faker.internet.password();
    const user = {
      email: faker.internet.email(),
      password: await argon.hash(password),
      hashedRefreshToken: null,
    };
    prismaService.user.findUnique = jest.fn().mockReturnValueOnce(user);
    try {
      await authService.signIn({
        email: user.email,
        password: otherPassword,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(ForbiddenException);
    }
  });

  it('should not sign in an unknown user', async () => {
    user = {
      email: faker.internet.email(),
      password: faker.internet.password(),
    };
    prismaService.user.findUnique = jest.fn().mockReturnValueOnce(null);
    try {
      await authService.signIn({
        email: user.email as string,
        password: user.password as string,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(ForbiddenException);
    }
  });

  // logout

  it('should logout an existing user', async () => {
    const fakeToken = 'test-token';
    user = {
      email: faker.internet.email(),
      password: faker.internet.password(),
      hashedRefreshToken: fakeToken,
    };
    prismaService.user.updateMany = jest.fn().mockImplementation(() => {
      user.hashedRefreshToken = null;
    });
    await authService.logout(1);
    expect(user.hashedRefreshToken).toBeNull();
  });

  it('should do nothing while logging not logged in user', async () => {
    user = {
      email: faker.internet.email(),
      hashedRefreshToken: null,
    };
    prismaService.user.updateMany = jest.fn().mockImplementation(() => {
      user.hashedRefreshToken = null;
    });
    await authService.logout(1);
    expect(user.hashedRefreshToken).toBeNull();
  });

  // refreshToken

  it('should refresh token', async () => {
    const fakeToken = 'test-token';
    user = {
      id: faker.datatype.number({ precision: 1 }),
      email: faker.internet.email(),
      hashedRefreshToken: await argon.hash(fakeToken),
    };
    prismaService.user.findUnique = jest.fn().mockReturnValueOnce(user);
    const tokens = await authService.refreshToken(1, fakeToken);
    expect(tokens).toHaveProperty('access_token');
    expect(tokens).toHaveProperty('refresh_token');
  });

  it('should not refresh token', async () => {
    user = {
      email: faker.internet.email(),
      hashedRefreshToken: null,
    };
    prismaService.user.findUnique = jest.fn().mockReturnValueOnce(user);
    try {
      await authService.refreshToken(1, 'anything');
    } catch (error) {
      expect(error).toBeInstanceOf(ForbiddenException);
    }

    const fakeToken = 'test-token';
    user = {
      email: faker.internet.email(),
      hashedRefreshToken: await argon.hash(fakeToken),
    };
    prismaService.user.findUnique = jest.fn().mockReturnValueOnce(user);
    try {
      await authService.refreshToken(1, 'anything');
    } catch (error) {
      expect(error).toBeInstanceOf(ForbiddenException);
    }
  });
});
