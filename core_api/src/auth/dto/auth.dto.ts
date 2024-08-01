import { IsNotEmpty, IsString, IsEmail, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Length(8)
  password: string;
}

export class TokensDto {
  @ApiProperty({
    description:
      'An access token that should be use as a Bearer token in all subsequent requests',
  })
  access_token: string;

  @ApiProperty({
    description:
      'A refresh token that is used by front end app mechanism to refresh user sessions',
  })
  @ApiProperty()
  refresh_token: string;
}
