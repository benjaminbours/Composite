import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Length(8)
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  name: string;

  // @ApiProperty()
  // @IsNotEmpty()
  // roleId: number;
}
