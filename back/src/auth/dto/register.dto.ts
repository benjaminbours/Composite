import {
  IsNotEmpty,
  IsString,
  // Length,
  // Validate,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateUserDto } from '../../users/dto/create-user.dto';

export class RegisterDto extends CreateUserDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  captcha: string;

  // @ApiProperty({ required: true })
  // @IsString()
  // @IsNotEmpty()
  // locale: string;
}
