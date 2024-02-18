// vendors
import {
  ForbiddenException,
  UnprocessableEntityException,
  Injectable,
  // ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon from 'argon2';
// import fetch from 'cross-fetch';
// import * as uuid from 'uuid';
// project
import { PrismaService, MailService } from '@project-common/services';
import { handlePrismaError } from '@project-common/utils/handlePrismaError';

import { jwtConstants } from './constants';
import { LoginDto, RegisterDto, TokensDto } from './dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
// import { ENVIRONMENT } from '@project-common/environment';

export interface CaptchaResponse {
  success: boolean;
  challenge_ts: string; // timestamp of the challenge load (ISO format yyyy-MM-dd'T'HH:mm:ssZZ)
  hostname: string; // the hostname of the site where the reCAPTCHA was solved
  'error-codes': any[]; // optional
}

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  /**
   * Called by /login
   */
  async signIn(dto: LoginDto): Promise<TokensDto> {
    const user = await this.prismaService.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new ForbiddenException('Access denied');
    }

    const isMatch = await argon.verify(user.password, dto.password);

    if (!isMatch) {
      throw new ForbiddenException('Access denied');
    }

    const tokens = this.getTokens(user.id, user.email);
    await this.updateRefreshTokenHash(user.id, (await tokens).refresh_token);
    return tokens;
  }

  /**
   * Called by /register
   */
  async register({ captcha, ...restDto }: RegisterDto) {
    // Ping the google recaptcha verify API to verify the captcha code you received
    const captchaValidation = await this.validateCaptcha(captcha);

    if (!captchaValidation.success) {
      throw new UnprocessableEntityException();
    }

    // check if user account already exist, and throw if it already exist
    const existingUser = await this.prismaService.user
      .findUnique({
        where: { email: restDto.email },
      })
      .catch((err) => {
        throw handlePrismaError(err);
      });

    // if user exist and already validated his email, send a reset password email
    if (existingUser && !existingUser.confirmationToken) {
      const resetPasswordToken = await this.getResetPasswordToken(
        restDto.email,
      );
      await this.updateResetPasswordTokenHash(
        restDto.email,
        resetPasswordToken,
      );
      this.mailService.sendResetPasswordEmail(
        restDto.email,
        resetPasswordToken,
      );
      return true;
    }

    // if user exist but has not validated his email yet, resent register confirmation email
    if (existingUser && existingUser.confirmationToken) {
      const confirmationToken = await this.getConfirmationToken(
        existingUser.email,
      );
      await this.updateConfirmationTokenHash(
        existingUser.email,
        confirmationToken,
      );
      await this.mailService.sendRegisterConfirmationEmail(
        existingUser.email,
        confirmationToken,
      );
      return true;
    }

    const hash = await argon.hash(restDto.password);
    const user = await this.prismaService.user
      .create({
        data: {
          ...restDto,
          password: hash,
        },
      })
      .catch((err) => {
        throw handlePrismaError(err);
      });

    const confirmationToken = await this.getConfirmationToken(user.email);
    await this.updateConfirmationTokenHash(user.email, confirmationToken);
    await this.mailService.sendRegisterConfirmationEmail(
      user.email,
      confirmationToken,
    );
    return true;
  }

  /**
   * Called by /reset-password
   */
  async resetPassword({ email }: ResetPasswordDto) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    // if no user, send a sign up email instead to not leak any info about existing email in our DB
    if (!user) {
      // await this.mailService.sendSignUpEmail(email);
      return true;
    }

    const resetPasswordToken = await this.getResetPasswordToken(email);
    await this.updateResetPasswordTokenHash(email, resetPasswordToken);

    await this.mailService.sendResetPasswordEmail(
      user.email,
      resetPasswordToken,
    );

    return true;
  }
  // TODO: A lot of duplicate code related to token validation
  /**
   * Called by /update-password/:resetPasswordToken
   */
  async updatePassword(
    resetPasswordToken: string,
    { password }: UpdatePasswordDto,
  ) {
    Logger.log(
      `start process update password, received token ${resetPasswordToken}`,
    );
    try {
      this.jwtService.verify(resetPasswordToken, {
        secret: jwtConstants.secret,
      });
    } catch (error) {
      Logger.error(
        'resetPasswordToken received has not been generated with our JWT secret or is out dated',
      );
      throw new ForbiddenException('Access denied');
    }

    const decoded = this.jwtService.decode(resetPasswordToken) as {
      email: string;
      isResetPassword: boolean;
    };

    if (!decoded.isResetPassword) {
      Logger.error(`${resetPasswordToken} is not a reset password token`);
      throw new ForbiddenException('Access denied');
    }

    const user = await this.prismaService.user
      .findUnique({
        where: {
          email: decoded.email,
        },
      })
      .catch((err) => {
        Logger.error(err);
        throw handlePrismaError(err);
      });

    if (!user) {
      Logger.error('User cannot be found');
      throw new ForbiddenException('Access denied');
    }

    if (!user.resetPasswordToken) {
      Logger.error('No reset password token found for user');
      throw new ForbiddenException('Access denied');
    }

    const isMatch = await argon.verify(
      user.resetPasswordToken,
      resetPasswordToken,
    );

    if (!isMatch) {
      Logger.error('resetPasswordToken do not match the one stored in DB');
      throw new ForbiddenException('Access denied');
    }

    const hash = await argon.hash(password);
    // clear confirmation token and update password
    await this.prismaService.user.update({
      where: {
        email: user.email,
      },
      data: {
        resetPasswordToken: null,
        password: hash,
      },
    });

    return true;
  }

  /**
   * Called by /confirm/:confirmationToken
   */
  async confirm(confirmationToken: string) {
    try {
      this.jwtService.verify(confirmationToken, {
        secret: jwtConstants.secret,
      });
    } catch (error) {
      // TODO: redirect to a specific page on the website to regenerate a new token in case of outdated for example
      Logger.error(
        'confirmationToken received has not been generated with our JWT secret or is out dated',
      );
      throw new ForbiddenException('Access denied');
    }

    const decoded = this.jwtService.decode(confirmationToken) as {
      email: string;
    };

    Logger.log(`Decoded from token: ${JSON.stringify(decoded, null, 2)}`);

    const user = await this.prismaService.user
      .findUnique({
        where: {
          email: decoded.email,
        },
      })
      .catch((err) => {
        Logger.error(err);
        throw handlePrismaError(err);
      });

    Logger.log(`user found ${JSON.stringify(user, null, 2)}`);

    if (!user) {
      Logger.error('User cannot be find');
      throw new ForbiddenException('Access denied');
    }

    if (!user.confirmationToken) {
      return user;
    }

    const isMatch = await argon.verify(
      user.confirmationToken,
      confirmationToken,
    );

    if (!isMatch) {
      Logger.error('confirmationToken do not match the one stored in DB');
      throw new ForbiddenException('Access denied');
    }

    const [updatedUser] = await this.prismaService.$transaction([
      // clear confirmation token
      this.prismaService.user.update({
        where: {
          email: user.email,
        },
        data: {
          confirmationToken: null,
        },
      }),
      // // TODO: add tests about it
      // // update purchases GHOST to pending now the user is confirmed
      // this.prismaService.purchase.updateMany({
      //   where: {
      //     client: {
      //       userId: user.id,
      //     },
      //     status: PurchaseStatus.GHOST,
      //   },
      //   data: {
      //     status: PurchaseStatus.PENDING,
      //   },
      // }),
    ]);

    return updatedUser;
  }

  /**
   * Called by /confirm/resend
   */
  async confirmResend(email: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    // if user doesn't exist, send a sign up email
    if (!user) {
      // await this.mailService.sendSignUpEmail(email);
      return true;
    }

    // if user already validated his email, send a reset password email
    if (!user.confirmationToken) {
      const resetPasswordToken = await this.getResetPasswordToken(email);
      await this.updateResetPasswordTokenHash(email, resetPasswordToken);
      await this.mailService.sendResetPasswordEmail(
        user.email,
        resetPasswordToken,
      );
      return true;
    }

    // if its a proper user that need to validate his email, resent register confirmation email
    const confirmationToken = await this.getConfirmationToken(user.email);
    await this.updateConfirmationTokenHash(user.email, confirmationToken);
    await this.mailService.sendRegisterConfirmationEmail(
      user.email,
      confirmationToken,
    );
    return true;
  }

  /**
   * Called by /logout
   */
  async logout(userId: number): Promise<boolean> {
    await this.prismaService.user.updateMany({
      where: {
        id: userId,
        hashedRefreshToken: {
          not: null,
        },
      },
      data: {
        hashedRefreshToken: null,
      },
    });
    return true;
  }

  /**
   * Called by /refresh
   */
  async refreshToken(userId: number, refreshToken: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user || !user.hashedRefreshToken) {
      throw new ForbiddenException('Access denied');
    }

    const isMatch = await argon.verify(user.hashedRefreshToken, refreshToken);

    if (!isMatch) {
      throw new ForbiddenException('Access denied');
    }

    const tokens = this.getTokens(user.id, user.email);
    await this.updateRefreshTokenHash(user.id, (await tokens).refresh_token);
    return tokens;
  }

  /**
   * @Utility function to generate a pair of tokens
   */
  async getTokens(
    userId: number,
    email: string,
    // roleId: number,
    // clientId?: number,
  ): Promise<TokensDto> {
    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(
        {
          username: email,
          sub: userId,
          // role: roleId,
          // clientId,
        },
        {
          secret: jwtConstants.secret,
          expiresIn: 60 * 15, // 15 mins
        },
      ),
      this.jwtService.signAsync(
        {
          username: email,
          sub: userId,
          // role: roleId,
          // clientId,
        },
        {
          secret: jwtConstants.refresh_secret,
          expiresIn: 60 * 60 * 24 * 7, // One week
        },
      ),
    ]);

    return { access_token, refresh_token };
  }

  /**
   * @Utility function to generate a confirmation token
   */
  async getResetPasswordToken(email: string): Promise<string> {
    return this.jwtService.signAsync(
      {
        email,
        isResetPassword: true,
      },
      {
        secret: jwtConstants.secret,
        expiresIn: 60 * 60, // One hour
      },
    );
  }

  /**
   * @Utility function to generate a confirmation token
   */
  async getConfirmationToken(email: string): Promise<string> {
    return this.jwtService.signAsync(
      {
        email,
      },
      {
        secret: jwtConstants.secret,
        expiresIn: 60 * 60 * 24, // One day
      },
    );
  }

  /**
   * @Utility function to update the refresh token hash in DB
   */
  async updateRefreshTokenHash(userId: number, refreshToken: string) {
    const hash = await argon.hash(refreshToken);
    await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        hashedRefreshToken: hash,
      },
    });
  }

  /**
   * @Utility function to update the reset password token hash in DB
   */
  async updateResetPasswordTokenHash(
    email: string,
    resetPasswordToken: string,
  ) {
    const hash = await argon.hash(resetPasswordToken);
    await this.prismaService.user.update({
      where: {
        email,
      },
      data: {
        resetPasswordToken: hash,
      },
    });
  }

  /**
   * @Utility function to update the confirmation token hash in DB
   */
  async updateConfirmationTokenHash(email: string, confirmationToken: string) {
    const hash = await argon.hash(confirmationToken);
    await this.prismaService.user.update({
      where: {
        email,
      },
      data: {
        confirmationToken: hash,
      },
    });
  }

  /**
   * @Utility function to validate captcha with google api
   */
  async validateCaptcha(captcha: string) {
    return fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captcha}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        },
        method: 'POST',
      },
    ).then((res) => res.json() as Promise<CaptchaResponse>);
  }
}
